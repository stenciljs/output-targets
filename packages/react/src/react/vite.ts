import decamelize from 'decamelize'
import { parse, visit } from 'recast'
import { transformSync } from 'esbuild'
import { namedTypes, builders as b } from 'ast-types'
import { findStaticImports, parseStaticImport } from 'mlly'
import { Plugin } from 'vite'

interface HydrateStencilComponentsOptions {
  from: string
  module: Promise<any>
  hydrateModule: Promise<any>
}

export function hydrateStencilComponents(pluginOptions: HydrateStencilComponentsOptions) {
  return {
    name: 'stencil:vite:ssr',
    transform: (code, id, options) => transform(code, id, options, pluginOptions),
  } satisfies Plugin;
}

export async function transform (
  code: string,
  id: string,
  options: { ssr?: boolean } | undefined,
  { from, module, hydrateModule }: HydrateStencilComponentsOptions
) {
  /**
   * only run in SSR mode
   */
  if (!options?.ssr) {
    return
  }

  /**
   * Find all static imports of the component library used in the code
   */
  const staticImports = findStaticImports(code)
  const imports = staticImports.filter((importSpecifier) => {
    return importSpecifier.specifier === from
  }).map((importSpecifier) => ({
    ...importSpecifier,
    parsed: parseStaticImport(importSpecifier)
  }))

  /**
   * Check if the code uses the jsxDEV runtime
   */
  const hasJsxDevRuntimeImports = staticImports.filter((importSpecifier) => {
    return importSpecifier.specifier === 'react/jsx-dev-runtime'
  }).some((importSpecifier) => {
    const i = parseStaticImport(importSpecifier)
    return i.namedImports?.['jsxDEV']
  })

  /**
   * only proceed if the file contains JSX components and uses components from the
   * users component library
   */
  if (imports.length === 0 || !hasJsxDevRuntimeImports) {
    return
  }

  /**
   * Import Stencil primitives:
   * - the hydrate module which gives us the renderToString method
   * - the components from the user's component library
   */
  const importedHydrateModule = await hydrateModule
  const components = Object.keys(await module)
  const componentCalls: {
    identifier: string
    properties: namedTypes.ObjectExpression['properties']
  }[] = []

  /**
   * parse the code into an AST and visit all `jsxDEV` calls.
   * Identify if the `jsxDEV` call is rendering a component from the user's
   * component library and if so, extract the component's properties.
   */
  const ast = parse(code)
  visit(ast, {
    visitCallExpression(path) {
      const node = path.node
      /**
       * Only interested in `jsxDEV` calls
       */
      if (!namedTypes.Identifier.check(node.callee) || node.callee.name !== 'jsxDEV') {
        return this.traverse(path)
      }

      const args = node.arguments
      /**
       * Only interested in `jsxDEV` calls that render components from the user's
       * component library
       */
      if (!namedTypes.Identifier.check(args[0]) || !components.includes(args[0].name) || !namedTypes.ObjectExpression.check(args[1])) {
        return this.traverse(path)
      }

      componentCalls.push({
        identifier: args[0].name,
        properties: args[1].properties,
      })

      return this.traverse(path)
    }
  })

  /**
   * For each component call, render the component to a string and return the
   * component's identifier and the rendered HTML.
   */
  const declarations = await Promise.all(componentCalls.map(async ({ identifier, properties }) => {
    const tagName = decamelize(identifier, { separator: '-' })

    /**
     * parse serializable properties into a plain object
     */
    const propObject = parseSimpleObjectExpression(b.objectExpression(properties))
    const props = Object.entries(propObject).map(([key, value]) => `${key}="${value}"`).join(' ')

    /**
     * render the component to a string
     *
     * Note: we purposly don't parse in a light DOM as we can't evaluate the code during SSR.
     */
    const { html } = await importedHydrateModule.renderToString(`<${tagName} ${props} />`, {
      prettyHtml: true,
      fullDocument: false,
    })

    /**
     * return the component's identifier and the rendered HTML split into lines
     */
    return [identifier, html.split('\n')] as [string, string[]]
  }))

  /**
   * For each import of the user's component library, wrap the component's
   * identifier and the rendered HTML in a JSX component.
   */
  for (const cmpImport of imports) {
    const wrappedComponents = Object.entries(cmpImport.parsed.namedImports || []).filter(
      ([cmpName]) => declarations.some(([identifier]) => cmpName === identifier)
    ).reduce((acc, [cmpName, cmpImport]) => {
      const html = declarations.find(([identifier]) => cmpName === identifier)?.[1]
      if (!html) {
        return acc
      }

      /**
       * Let's reconstruct the rendered Stencil component into a JSX component
       */
      const cmpTag = html[0]
      const cmpEndTag = html[html.length - 1]
      const hydrateComment = html[html.length - 2]
      const __html = html.slice(2, -3).join('\n')
      return acc + `\nconst ${cmpImport} = ({ children }) => {
return (
${cmpTag}
  <template shadowrootmode="open" dangerouslySetInnerHTML={{ __html: \`${__html + hydrateComment}\` }}></template>
  {children}
${cmpEndTag}
)
}\n`
    }, '')

    /**
     * Transform the wrapped JSX components into a raw JavaScript string.
     */
    const result = transformSync(wrappedComponents, {
      loader: 'jsx',
      jsx: 'automatic', // Use React 17+ JSX transform
      jsxDev: true,     // Include debug info (like in your example)
      format: 'esm',
      target: ['esnext'],
      sourcemap: true,
      sourcefile: id,
    })

    /**
     * Replace the original import with the wrapped JSX components.
     */
    code = code.replace(cmpImport.code, result.code)
  }

  return code
}

/**
 * Parse serializable properties into a plain object.
 */
function parseSimpleObjectExpression(astNode: any): object {
  // Only handle ObjectExpressions at the top level
  if (!namedTypes.ObjectExpression.check(astNode)) {
    throw new Error('Not an ObjectExpression');
  }

  const result: Record<string, any> = {};

  for (const prop of astNode.properties) {
    // Only handle regular properties
    if (!namedTypes.Property.check(prop) || prop.kind !== 'init') {
      continue;
    }

    // Extract key (assuming identifier key)
    let key: string;
    if (namedTypes.Identifier.check(prop.key)) {
      key = prop.key.name;
    } else if (namedTypes.Literal.check(prop.key) || namedTypes.StringLiteral.check(prop.key)) {
      key = String(prop.key.value);
    } else {
      // Skip complex keys
      continue;
    }

    // Extract value
    let value: any;
    if (namedTypes.Literal.check(prop.value) ||
        namedTypes.StringLiteral.check(prop.value) ||
        namedTypes.NumericLiteral.check(prop.value) ||
        namedTypes.BooleanLiteral.check(prop.value)) {
      value = prop.value.value;
    } else if (namedTypes.ArrayExpression.check(prop.value)) {
      value = prop.value.elements
        .filter((el: any) => el !== null)
        .map((el: any) => {
          if (namedTypes.Literal.check(el) || namedTypes.StringLiteral.check(el) || namedTypes.NumericLiteral.check(el)) {
            return el.value;
          } else if (namedTypes.ObjectExpression.check(el)) {
            return parseSimpleObjectExpression(el);
          }
          return null;
        })
        .filter((v: any) => v !== null);
    } else if (namedTypes.ObjectExpression.check(prop.value)) {
      // Recursively parse nested objects
      value = parseSimpleObjectExpression(prop.value);
    } else {
      // Skip complex values
      value = null;
    }

    result[key] = value;
  }

  return result;
}

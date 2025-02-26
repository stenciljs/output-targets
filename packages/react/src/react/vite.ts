import decamelize from 'decamelize'
import { parse, visit } from 'recast'
import { namedTypes, builders as b } from 'ast-types'
import { findStaticImports, parseStaticImport } from 'mlly'
import { Plugin } from 'vite'

interface HydrateStencilComponentsOptions {
  from: string
  module: Promise<any>
  hydrateModule: Promise<any>
}

export function hydrateStencilComponents({ from, module, hydrateModule }: HydrateStencilComponentsOptions) {

  return {
    name: 'stencil:vite:ssr',
    async transform(code: string, _id: string, options: { ssr?: boolean } | undefined) {
      if (!options?.ssr) {
        return
      }

      const staticImports = findStaticImports(code)
      const imports = staticImports.filter((importSpecifier) => {
        return importSpecifier.specifier === from
      }).map((importSpecifier) => ({
        ...importSpecifier,
        parsed: parseStaticImport(importSpecifier)
      }))

      const hasJsxDevRuntimeImports = staticImports.filter((importSpecifier) => {
        return importSpecifier.specifier === 'react/jsx-dev-runtime'
      }).some((importSpecifier) => {
        const i = parseStaticImport(importSpecifier)
        return i.namedImports?.['jsxDEV']
      })

      if (imports.length === 0 || !hasJsxDevRuntimeImports) {
        return
      }

      const importedHydrateModule = await hydrateModule
      const components = Object.keys(await module)
      const ast = parse(code)
      const componentCalls: { identifier: string, properties: namedTypes.ObjectExpression['properties'] }[] = []
      visit(ast, {
        visitCallExpression(path) {
          const node = path.node
          if (!namedTypes.Identifier.check(node.callee) || node.callee.name !== 'jsxDEV') {
            return this.traverse(path)
          }

          const args = node.arguments
          if (!namedTypes.Identifier.check(args[0]) || !components.includes(args[0].name) || !namedTypes.ObjectExpression.check(args[1])) {
            return this.traverse(path)
          }

          componentCalls.push({
            identifier: args[0].name,
            properties: args[1].properties
          })

          return this.traverse(path)
        }
      })

      const declarations = await Promise.all(componentCalls.map(async ({ identifier, properties }) => {
        const tagName = decamelize(identifier, { separator: '-' })
        const propObject = parseSimpleObjectExpression(b.objectExpression(properties))
        const props = Object.entries(propObject).map(([key, value]) => `${key}="${value}"`).join(' ')
        const { html } = await importedHydrateModule.renderToString(`<${tagName} ${props} />`, {
          prettyHTML: true,
          fullDocument: false,
        })

        return [identifier, html]
      }))

      for (const cmpImport of imports) {
        const wrappedComponents = Object.entries(cmpImport.parsed.namedImports || []).filter(
          ([cmpName]) => declarations.some(([identifier]) => cmpName === identifier)
        ).reduce((acc, [cmpName, cmpImport]) => {
          const html = declarations.find(([identifier]) => cmpName === identifier)?.[1]
          return acc + `\nconst ${cmpImport} = () => { return \`${html}\` }\n`
        }, '')

        code = code.replace(cmpImport.code, wrappedComponents)
      }

      return code
    },
  } satisfies Plugin;
}

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

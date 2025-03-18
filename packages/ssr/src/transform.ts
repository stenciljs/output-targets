import decamelize from 'decamelize';
import { parse, visit, print } from 'recast';
import { transformSync } from 'esbuild';
import { namedTypes, builders as b } from 'ast-types';
import { findStaticImports, parseStaticImport } from 'mlly';

import type { StencilSSROptions } from './types.js';

export async function transform(
  code: string,
  sourcefile: string,
  { from, module, hydrateModule, serializeShadowRoot }: StencilSSROptions
) {
  /**
   * Find all static imports of the component library used in the code
   */
  const staticImports = findStaticImports(code);
  const imports = staticImports
    .filter((importSpecifier) => {
      return importSpecifier.specifier === from;
    })
    .map((importSpecifier) => ({
      ...importSpecifier,
      parsed: parseStaticImport(importSpecifier),
    }));

  /**
   * Check if the code uses the jsxDEV runtime to ensure we only do the transformation
   * after JSX is transformed.
   */
  const jsxImportReference = staticImports
    .filter((importSpecifier) => {
      return importSpecifier.specifier === 'react/jsx-dev-runtime';
    })
    .map((importSpecifier) => {
      const i = parseStaticImport(importSpecifier);
      return i.namedImports?.['jsxDEV'];
    })
    .filter(Boolean)
    .pop();

  /**
   * only proceed if the file contains JSX components and uses components from the
   * users component library
   */
  if (imports.length === 0 || !jsxImportReference) {
    return code;
  }

  /**
   * Import Stencil primitives:
   * - the hydrate module which gives us the renderToString method
   * - the components from the user's component library
   */
  const importedHydrateModule = await hydrateModule;
  const components = Object.keys(await module);
  const componentCalls: {
    identifier: string;
    tagName: string;
    properties: namedTypes.ObjectExpression['properties'];
  }[] = [];

  /**
   * parse the code into an AST and visit all `jsxDEV` calls.
   * Identify if the `jsxDEV` call is rendering a component from the user's
   * component library and if so, extract the component's properties.
   */
  const ast = parse(code);
  let index = 0;
  visit(ast, {
    visitImportDeclaration(path) {
      const node = path.node;
      if (node.source.value !== from) {
        return this.traverse(path);
      }

      /**
       * remove the import declaration
       */
      path.replace();
      return this.traverse(path);
    },
    visitCallExpression(path) {
      const node = path.node;
      /**
       * Only interested in `jsxDEV` calls
       */
      if (!namedTypes.Identifier.check(node.callee) || node.callee.name !== jsxImportReference) {
        return this.traverse(path);
      }

      const args = node.arguments;
      /**
       * Only interested in `jsxDEV` calls that render components from the user's
       * component library
       */
      if (
        !namedTypes.Identifier.check(args[0]) ||
        !components.includes(args[0].name) ||
        !namedTypes.ObjectExpression.check(args[1])
      ) {
        return this.traverse(path);
      }

      const identifier = `${args[0].name}$${index++}`;
      componentCalls.push({
        identifier,
        tagName: decamelize(args[0].name, { separator: '-' }),
        properties: args[1].properties,
      });

      path.get('arguments', 0).replace(b.identifier(identifier));
      path
        .get('arguments', 1)
        .replace(
          b.objectExpression([
            ...args[1].properties,
            b.property('init', b.identifier('suppressHydrationWarning'), b.booleanLiteral(true)),
          ])
        );
      return this.traverse(path);
    },
  });

  /**
   * For each component call, render the component to a string and return the
   * component's identifier and the rendered HTML.
   */
  const declarations = await Promise.all(
    componentCalls.map(async ({ identifier, tagName, properties }) => {
      /**
       * parse serializable properties into a plain object
       */
      const propObject = parseSimpleObjectExpression(b.objectExpression(properties));
      const props = Object.entries(propObject)
        .filter(([key]) => key !== 'children')
        .map(([key, value]) => `${key === 'className' ? 'class' : camelToKebab(key)}=${importedHydrateModule.serializeProperty(value)}`)
        .join(' ');

      /**
       * render the component to a string
       *
       * Note: we purposly don't parse in a light DOM as we can't evaluate the code during SSR.
       */
      const children = (propObject as Record<string, any>).children;
      const toRender =
        typeof children === 'string' ? `<${tagName} ${props}>${children}</${tagName}>` : `<${tagName} ${props} />`;
      console.log(11, toRender);

      const { html } = await importedHydrateModule.renderToString(toRender, {
        prettyHtml: true,
        fullDocument: false,
        serializeShadowRoot,
      });
      console.log(22, html);

      /**
       * return the component's identifier and the rendered HTML split into lines
       */
      return [identifier, tagName, html.split('\n')] as [string, string, string[]];
    })
  );

  /**
   * Create a stringified version of each component
   */
  const wrappedComponents = declarations.reduce((acc, [identifier, tagName, html]) => {
    /**
     * Determine if the component should be rendered in a scoped shadow root.
     */
    const isScoped =
      typeof serializeShadowRoot === 'string'
        ? serializeShadowRoot === 'scoped'
        : typeof serializeShadowRoot === 'object'
          ? serializeShadowRoot.default === 'scoped'
            ? true
            : serializeShadowRoot['scoped']?.includes(tagName)
          : false;

    /**
     * serialize scoped component
     */
    if (isScoped) {
      return acc + serializeScopedComponent(html, identifier);
    }

    /**
     * serialize shadow component
     */
    return acc + serializeShadowComponent(html, identifier);
  }, '');

  /**
   * Transform the wrapped JSX components into a raw JavaScript string.
   */
  const result = transformSync(wrappedComponents, {
    loader: 'jsx',
    jsx: 'automatic', // Use React 17+ JSX transform
    jsxDev: true, // Include debug info (like in your example)
    format: 'esm',
    target: ['esnext'],
    sourcemap: true,
    sourcefile,
  });

  return result.code + print(ast).code;
}

/**
 * Parse serializable properties into a plain object.
 */
function parseSimpleObjectExpression(astNode: any): object {
  if (!namedTypes.ObjectExpression.check(astNode)) {
    throw new Error('Not an ObjectExpression');
  }

  const result: Record<string, any> = {};

  for (const prop of astNode.properties) {
    if (!namedTypes.Property.check(prop) || prop.kind !== 'init') {
      continue;
    }

    let key = namedTypes.Identifier.check(prop.key)
      ? prop.key.name
      : (namedTypes.Literal.check(prop.key) || namedTypes.StringLiteral.check(prop.key))
        ? String(prop.key.value)
        : null;

    if (key === null) {
      console.error(`Invalid key: "${prop.key}", skipping property`);
      continue;
    };

    let value: any;
    if (namedTypes.NewExpression.check(prop.value)) {
      // Handle Map and Set
      if (namedTypes.Identifier.check(prop.value.callee) && prop.value.callee.name === 'Map') {
        const mapArgs = prop.value.arguments[0];
        if (namedTypes.ArrayExpression.check(mapArgs)) {
          value = new Map(mapArgs.elements
            .map((el: any) => {
              if (namedTypes.ArrayExpression.check(el) && el.elements.length === 2) {
                const [key, val] = el.elements;
                return [parseValue(key), parseValue(val)] as [unknown, unknown];
              }
              return null;
            })
            .filter((entry): entry is [unknown, unknown] => entry !== null)
          );
        }
      } else if (namedTypes.Identifier.check(prop.value.callee) && prop.value.callee.name === 'Set') {
        const setArgs = prop.value.arguments[0];
        if (namedTypes.ArrayExpression.check(setArgs)) {
          value = new Set(setArgs.elements.map((el: any) => parseValue(el)));
        }
      }
    } else if (
      /**
       * Handle Symbol
       */
      namedTypes.CallExpression.check(prop.value) &&
      namedTypes.Identifier.check(prop.value.callee) &&
      prop.value.callee.name === 'Symbol'
    ) {
      const symbolArg = prop.value.arguments[0];
      if (namedTypes.Literal.check(symbolArg) || namedTypes.StringLiteral.check(symbolArg)) {
        const symbolValue = symbolArg.value;
        if (typeof symbolValue === 'string' || typeof symbolValue === 'number') {
          value = Symbol(symbolValue);
        }
      }
    } else {
      value = parseValue(prop.value);
    }

    result[key] = value;
  }

  return result;
}

function parseValue(node: any): any {
  if (namedTypes.Literal.check(node) ||
      namedTypes.StringLiteral.check(node) ||
      namedTypes.NumericLiteral.check(node) ||
      namedTypes.BooleanLiteral.check(node)) {
    return node.value;
  } else if (namedTypes.ArrayExpression.check(node)) {
    return node.elements
      .filter((el: any) => el !== null)
      .map((el: any) => parseValue(el))
      .filter((v: any) => v !== null);
  } else if (namedTypes.ObjectExpression.check(node)) {
    return parseSimpleObjectExpression(node);
  } else if (namedTypes.Identifier.check(node) && node.name === 'Infinity') {
    return Infinity;
  } else if (namedTypes.Identifier.check(node) && node.name === 'null') {
    return null;
  }
  return null;
}

/**
 * Serialize a scoped component
 *
 * @param html - The HTML of the component retrieved via `renderToString`
 * @param identifier - The identifier of the component
 * @returns The serialized component
 */
function serializeScopedComponent(html: string[], identifier: string) {
  const cmpTag = html[0];
  const __html = html.slice(1, -1).join('\n');
  return `\nconst ${identifier} = ({ children }) => {
  return (
    ${cmpTag.slice(0, -1)} suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html: \`${__html}\` }} />
  );
}`;
}

/**
 * Serialize a shadow component
 *
 * @param html - The HTML of the component retrieved via `renderToString`
 * @param identifier - The identifier of the component
 * @returns The serialized component
 */
function serializeShadowComponent(html: string[], identifier: string) {
  const cmpTag = html[0];

  /**
   * Let's reconstruct the rendered Stencil component into a JSX component
   */
  const cmpEndTag = html[html.length - 1];
  const templateClosingIndex = html.findIndex((line) => line.includes('</template>'));
  const __html = html.slice(2, templateClosingIndex).join('\n');
  return `\nconst ${identifier} = ({ children }) => {
  return (
    ${cmpTag}
      <template shadowrootmode="open" suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html: \`${__html}\` }}></template>
      {children}
    ${cmpEndTag}
  )
}\n`;
}

function camelToKebab(str: string) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

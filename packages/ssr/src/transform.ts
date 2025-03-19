import decamelize from 'decamelize';
import { parse, visit, print } from 'recast';
import { transformSync } from 'esbuild';
import { namedTypes, builders as b } from 'ast-types';
import { findStaticImports, parseStaticImport } from 'mlly';

import { possibleStandardNames } from './constants.js';
import {
  styleObjectToPlain,
  serializeScopedComponent,
  serializeShadowComponent,
  parseSimpleObjectExpression,
  type StyleObject,
} from './utils.js';
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
      const style = properties.find((p) => 'key' in p && 'name' in p.key && p.key.name === 'style');
      let styleObject: StyleObject | undefined = undefined;
      if (namedTypes.Property.check(style) && namedTypes.ObjectExpression.check(style.value)) {
        styleObject = styleObjectToPlain(style.value);
      }

      const propObject = parseSimpleObjectExpression(b.objectExpression(properties));
      let props = Object.entries(propObject)
        /**
         * we don't want to serialize the children and style properties as we
         * will handle them separately
         */
        .filter(([key]) => !['children', 'style'].includes(key))
        .map(([key, value]) => {
          const propKey = possibleStandardNames[key as keyof typeof possibleStandardNames] || key;
          return `${propKey}="${importedHydrateModule.serializeProperty(value)}"`;
        })
        .join(' ');

      /**
       * render the component to a string
       *
       * Note: we purposly don't parse in a light DOM as we can't evaluate the code during SSR.
       */
      const children = (propObject as Record<string, any>).children;
      const toRender =
        typeof children === 'string' ? `<${tagName} ${props}>${children}</${tagName}>` : `<${tagName} ${props} />`;
      const { html } = await importedHydrateModule.renderToString(toRender, {
        prettyHtml: true,
        fullDocument: false,
        serializeShadowRoot,
      });

      /**
       * return the component's identifier and the rendered HTML split into lines
       */
      return [identifier, tagName, html.split('\n'), styleObject] as [
        string,
        string,
        string[],
        StyleObject | undefined,
      ];
    })
  );

  /**
   * Create a stringified version of each component
   */
  const wrappedComponents = declarations.reduce((acc, [identifier, tagName, html, styleObject]) => {
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
      return acc + serializeScopedComponent(html, identifier, styleObject);
    }

    /**
     * serialize shadow component
     */
    return acc + serializeShadowComponent(html, identifier, styleObject);
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

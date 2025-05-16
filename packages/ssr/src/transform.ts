import decamelize from 'decamelize';
import { parse, visit, print } from 'recast';
import { transform as esbuildTransform } from 'esbuild';
import { namedTypes, builders as b } from 'ast-types';
import { findStaticImports, parseStaticImport } from 'mlly';

import { getReactPropertyName } from './react.js';
import {
  styleObjectToPlain,
  serializeScopedComponent,
  serializeShadowComponent,
  parseSimpleObjectExpression,
  removeComments,
  type StyleObject,
} from './utils.js';
import type { StencilSSROptions, SerializeShadowRootOptions, TransformOptions } from './types.js';

const VALID_JSX_IMPORTS = ['jsxDEV', 'jsx', 'jsxs'];

interface HydrateModule {
  serializeProperty: (value: any) => string;
  renderToString: (
    tpl: string,
    options: { prettyHtml?: boolean; fullDocument?: boolean; serializeShadowRoot?: SerializeShadowRootOptions }
  ) => Promise<{ html: string }>;
}

export async function transform(
  code: string,
  sourcefile: string,
  { from, module, hydrateModule, serializeShadowRoot, strategy }: StencilSSROptions & TransformOptions
) {
  /**
   * Find all static imports of the component library used in the code
   */
  const staticImports = findStaticImports(removeComments(code));
  const imports = staticImports
    .filter((importSpecifier) => {
      return importSpecifier.specifier === from;
    })
    .map((importSpecifier) => ({
      ...importSpecifier,
      parsed: parseStaticImport(importSpecifier),
    }));

  /**
   * Check if the code uses the jsxDEV, jsx, or jsxs runtime functions to ensure we
   * only do the transformation after JSX is transformed.
   */
  const jsxImportReferences = staticImports
    .filter((importSpecifier) => {
      return (
        importSpecifier.specifier === 'react/jsx-dev-runtime' ||
        importSpecifier.specifier === 'react/jsx-runtime'
      );
    })
    .map((importSpecifier) => {
      const i = parseStaticImport(importSpecifier);
      return Object.entries(i.namedImports || {})
        .filter(([key]) => VALID_JSX_IMPORTS.includes(key))
        .map(([, importKey]) => importKey)
    })
    .flat() as string[];

  /**
   * only proceed if the file contains JSX components and uses components from the
   * users component library
   */
  if (imports.length === 0 || jsxImportReferences.length === 0) {
    return code;
  }

  /**
   * Import Stencil primitives:
   * - the hydrate module which gives us the renderToString method
   * - the components from the user's component library
   */
  const importedHydrateModule = (await hydrateModule) as HydrateModule;
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
      if (!namedTypes.Identifier.check(node.callee) || !jsxImportReferences.includes(node.callee.name)) {
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

      /**
       * Replace the actual component in the jsx call with the wrapped component
       */
      if (strategy === 'nextjs') {
        /**
         * for Next.js we pass in the children as an argument to the wrapped component
         * so we can server side render them properly, e.g.
         *
         * ```ts
         * const getMyComponent$1 = ({ children }) => dynamic(
         *   () => compImport.then((mod) => mod.MyComponent),
         *   {
         *     ssr: false,
         *     loading: () => jsx(Fragment, {
         *       children: jsxs("my-component", {
         *         first: 'some first name',
         *         last: 'some last name',
         *         children: [
         *           jsx("template", { shadowrootmode: "open", dangerouslySetInnerHTML: { __html: `...` } }),
         *           children
         *         ]
         *       })
         *     })
         *   }
         * );
         * ```
         */
        path.get('arguments', 0).replace(
          b.callExpression(
            b.identifier('get' + identifier),
            [
              b.objectExpression(args[1].properties
                .filter((p: any) => p.key.name === 'children') as namedTypes.ObjectProperty[]
              )
            ]
          )
        );
      } else {
        /**
         * for React we don't need to pass in the children directly:
         *
         * ```ts
         * const getMyComponent$1 = ({ children }) => jsxs("my-component", {
         *   first: 'some first name',
         *   last: 'some last name',
         *   children: [
         *     jsx("template", { shadowrootmode: "open", dangerouslySetInnerHTML: { __html: `...` } }),
         *     children
         *   ]
         * })
         * ```
         */
        path.get('arguments', 0).replace(b.identifier(identifier));
      }

      path
        .get('arguments', 1)
        .replace(b.objectExpression(args[1].properties));
      return this.traverse(path);
    },
  });

  /**
   * For each component call, render the component to a string and return the
   * component's identifier and the rendered HTML.
   */
  const componentDeclarations = await Promise.all(
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
        .map(([key, value]) => `${getReactPropertyName(key)}="${importedHydrateModule.serializeProperty(value)}"`)
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

      const isScopedComponent = !html.includes('<template shadowrootmode="open">');
      const isScoped =
        typeof serializeShadowRoot === 'string'
          ? serializeShadowRoot === 'scoped'
          : typeof serializeShadowRoot === 'object'
            ? serializeShadowRoot.default === 'scoped'
              ? true
              : serializeShadowRoot['scoped']?.includes(tagName)
            : false;

      const lines = html.split('\n')

      /**
       * serialize scoped component
       */
      if (isScoped || isScopedComponent) {
        return serializeScopedComponent(lines, identifier);
      }

      /**
       * serialize shadow component
       */
      return serializeShadowComponent(lines, identifier, styleObject, strategy);
    })
  );

  /**
   * Transform the wrapped JSX components into a raw JavaScript string.
   */
  const nextImports = strategy === 'nextjs'
    ? `import dynamic from 'next/dynamic';\nconst compImport = import('${from}');\n`
    : '';

  const result = await esbuildTransform(nextImports + componentDeclarations.join('\n'), {
    loader: 'jsx',
    jsx: 'automatic', // Use React 17+ JSX transform
    format: 'esm',
    target: ['esnext'],
    sourcemap: true,
    sourcefile,
  });

  const transformedCode = (result.code + '\n\n' + print(ast).code)
  return transformedCode;
}

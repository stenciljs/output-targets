import decamelize from 'decamelize';
import { parse, visit, print } from 'recast';
import typescriptParser from 'recast/parsers/typescript';
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
  resolveVariable,
  isPropertyNode,
  isIdentifierNode,
  isObjectExpression,
  mergeImports,
  findParentNode,
  cssPropertiesToString,
  type StyleObject,
} from './utils.js';
import type { StencilSSROptions, SerializeShadowRootOptions, TransformOptions } from './types.js';

const VALID_JSX_IMPORTS = ['jsxDEV', 'jsx', 'jsxs'];
const NEW_LINE = '\n';

interface HydrateModule {
  serializeProperty: (value: any) => string;
  renderToString: (
    tpl: string,
    options: { prettyHtml?: boolean; fullDocument?: boolean; serializeShadowRoot?: SerializeShadowRootOptions }
  ) => Promise<{ html: string; styles: { id?: string; content?: string; href?: string }[] }>;
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
      return importSpecifier.specifier === 'react/jsx-dev-runtime' || importSpecifier.specifier === 'react/jsx-runtime';
    })
    .map((importSpecifier) => {
      const i = parseStaticImport(importSpecifier);
      return Object.entries(i.namedImports || {})
        .filter(([key]) => VALID_JSX_IMPORTS.includes(key))
        .map(([, importKey]) => importKey);
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
  const ast = parse(code, {
    parser: typescriptParser,
  });

  /**
   * store Stencil component identifiers we already visited to
   * understand if we a parent node is a Stencil component.
   */
  const componentIdentifier = new Set<string>();

  const scopeStack: Record<string, any>[] = [];
  let index = 0;
  visit(ast, {
    visitFunctionDeclaration(path) {
      scopeStack.push({});
      this.traverse(path);
      scopeStack.pop();
    },
    visitVariableDeclarator(path) {
      if (!isIdentifierNode(path.node.id)) {
        return this.traverse(path);
      }
      const name = path.node.id.name;
      const value = path.node.init;
      if (scopeStack.length > 0) {
        scopeStack[scopeStack.length - 1][name] = value;
      }
      this.traverse(path);
    },
    visitImportDeclaration(path) {
      const node = path.node;
      if (node.source.value !== from) {
        return this.traverse(path);
      }

      /**
       * remove the import declaration
       */
      return this.traverse(path);
    },
    visitCallExpression(path) {
      const node = path.node;
      /**
       * Only interested in `jsxDEV` calls
       */
      if (!isIdentifierNode(node.callee) || !jsxImportReferences.includes(node.callee.name)) {
        return this.traverse(path);
      }

      const args = node.arguments;
      /**
       * Only interested in `jsxDEV` calls that render components from the user's
       * component library
       */
      if (!isIdentifierNode(args[0]) || !components.includes(args[0].name) || !isObjectExpression(args[1])) {
        return this.traverse(path);
      }

      const identifier = `${args[0].name}$${index++}`;
      componentIdentifier.add(args[0].name);
      componentCalls.push({
        identifier,
        tagName: decamelize(args[0].name, { separator: '-' }),
        properties: args[1].properties.map((p) => {
          /**
           * If the property is a variable, we need to resolve it
           */
          if (isPropertyNode(p) && isIdentifierNode(p.value)) {
            const resolvedValue = resolveVariable(scopeStack, p.value.name);
            if (resolvedValue) {
              // @ts-expect-error - type issues occur due to different versions of `recast` and `ast-types`
              p.value = resolvedValue;
            }
          }
          return p as namedTypes.Property;
        }),
      });

      /**
       * Pushes suppressHydrationWarning={true} to the arguments as scoped components
       * cause hydration errors due to the fact that Stencil removes attributes like `s-id`
       * or the hydrate flags on the elements.
       */
      const isFragment = isIdentifierNode(args[0]) && args[0].name.includes('Fragment');
      if (namedTypes.ObjectExpression.check(args[1]) && !isFragment) {
        args[1].properties.push(b.objectProperty(b.identifier('suppressHydrationWarning'), b.booleanLiteral(true)));
      }

      /**
       * Replace the original component identifier with the wrapped component identifier. We define
       * two different wrappers for the following cases:
       *
       * - simple wrapped component: in most cases we use this approach which wraps the component and renders
       *   it directly via `dangerouslySetInnerHTML`.
       * - dynamic wrapped component: when using Next.js and if the component is not rendered in the Light DOM
       *   of another Stencil component we can use `dynamic` to avoid hydration errors.
       */
      const isDirectStencilChildNode =
        /**
         * Find a direct parent node that is a Stencil component, e.g.
         */
        Boolean(
          findParentNode(path.parentPath, namedTypes.CallExpression, (exp) => {
            return (
              /**
               * Check if the parent node is already a wrapped Stencil component, e.g. find `getSelector$4`
               * in the following example:
               *
               * ```ts
               * _jsxDEV(getSelector$4({
               *   value: [...],
               *   filter: true,
               *   id: "filter-select-box",
               *   accessibleTitle: "Select Box + Filter",
               *   className: "single-select-filter",
               *   children: [
               *     _jsxDEV(MenuItem$5, { ... }, void 0, false, { ... }, this),
               *     _jsxDEV(MenuItem$6, { ... }, void 0, false, { ... }, this),
               *     _jsxDEV(MenuItem$7, { ... }, void 0, false, { ... }, this)
               *   ],
               * }), {
               *     value: [...],
               *     filter: true,
               *     id: "filter-select-box",
               *     accessibleTitle: "Select Box + Filter",
               *     className: "single-select-filter",
               *     children: [
               *         _jsxDEV(BricksMenuItem$5, { ... }, void 0, false, { ... }, this),
               *         _jsxDEV(BricksMenuItem$6, { ... }, void 0, false, { ... }, this),
               *         _jsxDEV(BricksMenuItem$7, { ... }, void 0, false, { ... }, this)
               *     ],
               * })
               * ```
               **/
              (isIdentifierNode(exp.callee) && componentIdentifier.has(exp.callee.name)) ||
              /**
               * However sometimes the node we are looking for is not wrapped by Recast, e.g.
               *
               * ```ts
               * _jsxDEV(Selector$4({
               *   value: [...],
               *   filter: true,
               *   id: "filter-select-box",
               *   accessibleTitle: "Select Box + Filter",
               *   className: "single-select-filter",
               *   children: [
               *     _jsxDEV(MenuItem$5, { ... }, void 0, false, { ... }, this),
               *     _jsxDEV(MenuItem$6, { ... }, void 0, false, { ... }, this),
               *     _jsxDEV(MenuItem$7, { ... }, void 0, false, { ... }, this)
               *   ],
               * })
               * ```
               */
              (isIdentifierNode(exp.arguments[0]) && componentIdentifier.has(exp.arguments[0].name))
            );
          })
        );
      if (strategy !== 'nextjs' || isDirectStencilChildNode) {
        /**
         * use simple wrapper, e.g. `MyComponent$0`, which is defined as following:
         *
         * ```ts
         * const MyComponent$0 = ({ children, ...props }) => {
         *   return (<my-component class="hydrated my-8 sc-my-component-h" ... {...props}>
         *     <template shadowrootmode="open" dangerouslySetInnerHTML={{ __html: `...` }}></template>
         *     {children}
         *   </my-component>)
         * }
         * ```
         */
        path.get('arguments', 0).replace(b.identifier(identifier));
      } else {
        /**
         * use advanced wrapper for Next.js, e.g. `getMyComponent$0`, which is defined as following:
         *
         * ```ts
         * let MyComponent$0Instance;
         * const getMyComponent$0 = ({ children, ...props }) => {
         *   if  (MyComponent$0Instance) {
         *     return MyComponent$0Instance;
         *   }
         *   MyComponent$0Instance = dynamic(
         *     () => componentImport.then(mod => mod.${cmpTagName}),
         *     {
         *       ssr: false,
         *       loading: () => {
         *         return (<>
         *           ${htmlToJsxWithStyleObject(cmpTag, styleObject).slice(0, -1)} suppressHydrationWarning={true} {...props}>
         *             <template shadowrootmode="open" suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html: \`${__html}\` }}></template>
         *             {children}
         *           ${htmlToJsxWithStyleObject(cmpEndTag)}
         *         </>)
         *       }
         *     }
         *   )
         *   return MyComponent$0Instance;
         * }
         * ```
         */
        const getIdentifier = `get${identifier}`;
        componentIdentifier.add(getIdentifier);
        path
          .get('arguments', 0)
          .replace(b.callExpression(b.identifier(getIdentifier), [b.objectExpression(args[1].properties)]));
      }

      path.get('arguments', 1).replace(b.objectExpression(args[1].properties));
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
      if (isPropertyNode(style) && isObjectExpression(style.value)) {
        styleObject = styleObjectToPlain(style.value);
      }

      const propObject = parseSimpleObjectExpression(b.objectExpression(properties));
      let props = Object.entries(propObject)
        /**
         * we don't want to serialize the children and style properties as we
         * will handle them separately
         */
        .filter(([key]) => !['children', 'suppressHydrationWarning'].includes(key))
        .map(([key, value]) => {
          if (key === 'style') {
            return `style="${cssPropertiesToString(value)}"`;
          }
          return `${getReactPropertyName(key)}="${importedHydrateModule.serializeProperty(value)}"`;
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
      const { html, styles } = await importedHydrateModule.renderToString(toRender, {
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

      const lines = html.split(NEW_LINE);

      /**
       * serialize scoped component
       */
      if (isScoped || isScopedComponent) {
        return serializeScopedComponent(
          lines,
          identifier,
          styles.map(({ content }) => content).filter(Boolean) as string[],
          strategy
        );
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
  const nextImports =
    strategy === 'nextjs'
      ? [`import dynamic from 'next/dynamic';`, `const componentImport = import('${from}');`].join(NEW_LINE)
      : '';

  const isDev = jsxImportReferences.some((ref) => ref.includes('jsxDEV'));
  const result = await esbuildTransform(nextImports + componentDeclarations.join(NEW_LINE), {
    loader: 'jsx',
    jsx: 'automatic', // Use React 17+ JSX transform
    format: 'esm',
    target: ['esnext'],
    sourcemap: true,
    jsxDev: isDev,
    sourcefile,
  });

  /**
   * Remove all imports from the transformed code and the original code and
   * merge them together so we avoid duplicate imports.
   */
  let transformedCode = result.code + NEW_LINE + NEW_LINE + print(ast).code;
  const allImports = findStaticImports(transformedCode).map(parseStaticImport);
  allImports.forEach((imp) => {
    transformedCode = transformedCode.replace(imp.code, '');
  });
  const mergedImports = mergeImports(allImports)
    .map((imp) => imp.code)
    .join(NEW_LINE);
  transformedCode = mergedImports + NEW_LINE + NEW_LINE + transformedCode;
  return transformedCode;
}

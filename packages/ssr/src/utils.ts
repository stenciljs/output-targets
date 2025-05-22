import { print } from 'recast';
import { namedTypes } from 'ast-types';
import type { ParsedStaticImport } from 'mlly';

import { STYLE_ATTR_REGEX } from './constants.js';
import type { TransformOptions } from './types.js';

export interface StyleObject {
  [key: string]: string | number | boolean | StyleObject | any;
}

const suppressHydrationWarning = 'suppressHydrationWarning={true}'

/**
 * Convert a style object expression to a plain JavaScript object
 * @param {Object} objectExpression - recast AST ObjectExpression node
 * @returns {StyleObject} - Plain object representation
 */
export function styleObjectToPlain(objectExpression: namedTypes.ObjectExpression): StyleObject {
  const result: StyleObject = {};

  objectExpression.properties.forEach((prop) => {
    if (!namedTypes.ObjectProperty.check(prop) && !namedTypes.Property.check(prop)) {
      return;
    }

    const key = namedTypes.Identifier.check(prop.key)
      ? prop.key.name
      : namedTypes.StringLiteral.check(prop.key) || namedTypes.Literal.check(prop.key)
        ? String(prop.key.value)
        : undefined;

    if (!key) {
      return;
    }

    /**
     * Handle different value types
     */
    if (
      namedTypes.StringLiteral.check(prop.value) ||
      (namedTypes.Literal.check(prop.value) && typeof prop.value.value === 'string')
    ) {
      result[key] = String(prop.value.value);
    } else if (
      namedTypes.NumericLiteral.check(prop.value) ||
      (namedTypes.Literal.check(prop.value) && typeof prop.value.value === 'number')
    ) {
      result[key] = Number(prop.value.value);
    } else if (
      namedTypes.BooleanLiteral.check(prop.value) ||
      (namedTypes.Literal.check(prop.value) && typeof prop.value.value === 'boolean')
    ) {
      result[key] = Boolean(prop.value.value);
    } else if (namedTypes.ObjectExpression.check(prop.value)) {
      // Recursively process nested objects
      result[key] = styleObjectToPlain(prop.value);
    } else {
      // For other types, just use the generated code
      result[key] = print(prop.value).code;
    }
  });

  return result;
}

// Helper type guards for AST node types supporting both namedTypes and type string
export function isPropertyNode(node: any): node is namedTypes.Property | namedTypes.ObjectProperty {
  return (
    namedTypes.Property.check(node) ||
    namedTypes.ObjectProperty.check(node) ||
    node?.type === 'Property' ||
    node?.type === 'ObjectProperty'
  );
}

export function isIdentifierNode(node: any): node is namedTypes.Identifier {
  return namedTypes.Identifier.check(node) || node?.type === 'Identifier';
}

export function isLiteralNode(
  node: any
): node is namedTypes.Literal | namedTypes.StringLiteral | namedTypes.NumericLiteral | namedTypes.BooleanLiteral {
  return (
    namedTypes.Literal.check(node) ||
    namedTypes.StringLiteral.check(node) ||
    namedTypes.NumericLiteral.check(node) ||
    namedTypes.BooleanLiteral.check(node) ||
    node?.type === 'Literal' ||
    node?.type === 'StringLiteral' ||
    node?.type === 'NumericLiteral' ||
    node?.type === 'BooleanLiteral'
  );
}

export function isArrayExpression(node: any): node is namedTypes.ArrayExpression {
  return namedTypes.ArrayExpression.check(node) || node?.type === 'ArrayExpression';
}

export function isFunctionNode(node: any): node is namedTypes.FunctionDeclaration | namedTypes.ArrowFunctionExpression {
  return (
    namedTypes.FunctionDeclaration.check(node) ||
    namedTypes.ArrowFunctionExpression.check(node) ||
    node?.type === 'FunctionDeclaration' ||
    node?.type === 'ArrowFunctionExpression'
  );
}

export function isNewExpression(node: any): node is namedTypes.NewExpression {
  return namedTypes.NewExpression.check(node) || node?.type === 'NewExpression';
}

export function isCallExpression(node: any): node is namedTypes.CallExpression {
  return namedTypes.CallExpression.check(node) || node?.type === 'CallExpression';
}

export function isObjectExpression(node: any): node is namedTypes.ObjectExpression {
  return namedTypes.ObjectExpression.check(node) || node?.type === 'ObjectExpression';
}

/**
 * Parse serializable properties into a plain object.
 */
export function parseSimpleObjectExpression(astNode: any): object {
  if (!isObjectExpression(astNode)) {
    throw new Error('Not an ObjectExpression');
  }

  const result: Record<string, any> = {};

  for (const prop of astNode.properties) {
    if (
      !isPropertyNode(prop) ||
      (isPropertyNode(prop) && 'kind' in prop && prop.kind !== 'init') ||
      isFunctionNode(prop.value)
    ) {
      continue;
    }

    // Key extraction
    let key: string | null = null;
    if (isIdentifierNode(prop.key)) {
      key = prop.key.name;
    } else if (isLiteralNode(prop.key)) {
      key = String(prop.key.value);
    }

    if (key === null) {
      console.error(`Invalid key: "${prop.key}", skipping property`);
      continue;
    }

    let value: any;
    if (isNewExpression(prop.value)) {
      const callee = prop.value.callee;
      if (isIdentifierNode(callee) && callee.name === 'Map') {
        const mapArgs = prop.value.arguments?.[0];
        if (isArrayExpression(mapArgs)) {
          value = new Map(
            mapArgs.elements
              .map((el: any) => {
                if (isArrayExpression(el) && el.elements.length === 2) {
                  const [k, v] = el.elements;
                  return [parseValueCompat(k), parseValueCompat(v)] as [unknown, unknown];
                }
                return null;
              })
              .filter((entry: any): entry is [unknown, unknown] => entry !== null)
          );
        }
      } else if (isIdentifierNode(callee) && callee.name === 'Set') {
        const setArgs = prop.value.arguments?.[0];
        if (isArrayExpression(setArgs)) {
          value = new Set(setArgs.elements.map((el: any) => parseValueCompat(el)));
        }
      }
    } else if (
      isCallExpression(prop.value) &&
      isIdentifierNode(prop.value.callee) &&
      prop.value.callee.name === 'Symbol'
    ) {
      const symbolArg = prop.value.arguments?.[0];
      if (isLiteralNode(symbolArg)) {
        const symbolValue = symbolArg.value;
        if (typeof symbolValue === 'string' || typeof symbolValue === 'number') {
          value = Symbol(symbolValue);
        }
      }
    } else {
      value = parseValueCompat(prop.value);
    }

    result[key] = value;
  }

  return result;
}

// Helper to parse value for both ESTree/Babel and TS AST nodes
function parseValueCompat(node: any): any {
  if (isLiteralNode(node)) {
    return node.value;
  } else if (isArrayExpression(node)) {
    return node.elements
      .filter((el: any) => el !== null)
      .map((el: any) => parseValueCompat(el))
      .filter((v: any) => v !== null);
  } else if (isObjectExpression(node)) {
    return parseSimpleObjectExpression(node);
  } else if (isIdentifierNode(node)) {
    if (node.name === 'Infinity') return Infinity;
    if (node.name === 'null') return null;
    return node.name;
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
export function serializeScopedComponent(html: string[], identifier: string, styles: string[] = [], strategy: TransformOptions['strategy'] = 'react') {
  /**
   * If the component has no child nodes, we can just return a React element
   * with the dangerouslySetInnerHTML prop set to the HTML of the component.
   */
  const cmpTag = html[0].slice(0, -1);
  const __html = html.slice(1, -1).join('\n').trim();

  /**
   * In most cases we directly render the component through a wrapper that injects the styles
   * tag into an extra container.
   */
  const directlyRenderedComponent = `\nconst ${identifier} = ({ children, ...props }) => {
    return (<div style={{ display: 'contents' }} ${suppressHydrationWarning}>
      <style>{\`
        ${styles.join('\n')}
      \`}</style>

      ${cmpTag} {...props} ${suppressHydrationWarning} dangerouslySetInnerHTML={{ __html: \`${__html}\` }} />
    </div>)
  }\n`

  if (strategy === 'react') {
    return directlyRenderedComponent;
  }

  /**
   * In case of Next.js we need to use dynamic import to ensure we hydrate the component
   * on the client as React wouldn't always re-render the component at runtime to transform
   * it into an interactive component.
   */
  return `
  ${directlyRenderedComponent}
  const get${identifier} = () => ${identifier}\n`;
}

/**
 * Serialize a shadow component.
 *
 * This process differs based on the framework used and strategy we take. We can differentiate between the following
 * two strategies:
 *
 * - `react`: basic SSR hydration via `dangerouslySetInnerHTML` used in Vite based Vue or React apps or Nuxt.
 * - `nextjs`: additional primitives required to avoid hydration errors in Next.js.
 *
 * This function registers a component wrapper, e.g. `MyComponent$0` and returns a serialized component to help
 * the framework render a Declarative Shadow DOM on the server and hydrate it on the client once the Stencil
 * runtime kicks in.
 *
 * This process may cause hydration issues as the framework may detect differences between the DSD and the runtime
 * component, mostly likely due to the fact that the `template` tag disappears as it gets transformed into a Shadow
 * Root. This function attempts to mitigate this issue by using the `suppressHydrationWarning` primitive as well
 * as `dynamic` to defer the component import until runtime. Latter is required to ensure that React re-renders the
 * component at runtime to ensure it becomes interactive.
 *
 * @param html - The HTML of the component retrieved via `renderToString`
 * @param identifier - The identifier of the component
 * @returns The serialized component
 */
export function serializeShadowComponent(
  html: string[],
  identifier: string,
  styleObject?: StyleObject,
  strategy: TransformOptions['strategy'] = 'react'
) {
  const cmpTagName = identifier.split('$')[0] as string;
  /**
   * this is the initial tag of the stringified component, e.g.
   * ```
   * <my-component class="my-class">
   * ```
   */
  const cmpTag = html[0];

  /**
   * get the closing tag of the component, including potential HTML content that could come after the closing tag
   */
  const cmpClosingTagIndex = html.findLastIndex((line) => line === getClosingTagFromOpeningTag(cmpTag));
  const cmpEndTag = cmpClosingTagIndex > -1 ? html.slice(cmpClosingTagIndex).join('\n') : html[html.length - 1];

  /**
   * Let's reconstruct the rendered Stencil component into a JSX component
   */
  const templateClosingIndex = html.findLastIndex((line) => line.includes('</template>'));
  const __html = html.slice(2, templateClosingIndex).join('\n').trim();

  /**
   * The default approach for SSR support with Stencil is to render the serialized version of the component
   * directly via `dangerouslySetInnerHTML`. We use this approach for all basic JSX scenarios when using Vite
   * or Nuxt. Some frameworks may still raise hydration errors which we can ignore.
   */
  if (strategy === 'react') {
    return `const ${identifier} = ({ children, ...props }) => {
      ${htmlToJsxWithStyleObject(cmpTag, styleObject).slice(0, -1)} {...props}>
        <template shadowrootmode="open" dangerouslySetInnerHTML={{ __html: \`${__html}\` }}></template>
        {children}
      ${htmlToJsxWithStyleObject(cmpEndTag)}
    }\n`;
  }

  /**
   * When serializing the component in Next.js we need to use `dynamic` to properly
   * server side render the component without causing a hydration error. Furthermore
   * this approach also forces React to re-render the component at runtime to ensure
   * it resolves properties passed to the component. For example, if a user passes a
   * dynamic variable as property, e.g.:
   *
   * ```ts
   * const myProp = getDynamicProp();
   * <my-component ${myProp} />
   * ```
   *
   * During the SSR process we don't know to what this variable resolves as we make changes
   * to the AST and don't have access to the runtime value of that variable. This is why we
   * are forced to use `dynamic` to ensure React re-renders the component at runtime to
   * resolve the dynamic property.
   */
  const dynamicRenderedComponent = `let ${identifier}Instance;
  const get${identifier} = ({ children, ...props }) => {
    if  (${identifier}Instance) {
      return ${identifier}Instance;
    }
    ${identifier}Instance = dynamic(
      () => componentImport.then(mod => mod.${cmpTagName}),
      {
        ssr: false,
        loading: () => (<>
          ${htmlToJsxWithStyleObject(cmpTag, styleObject).slice(0, -1)} ${suppressHydrationWarning} {...props}>
            <template shadowrootmode="open" ${suppressHydrationWarning} dangerouslySetInnerHTML={{ __html: \`${__html}\` }}></template>
            {children}
          ${htmlToJsxWithStyleObject(cmpEndTag)}
        </>)
      }
    )
    return ${identifier}Instance;
  }`;

  /**
   * An issue with `dynamic` is that it renders a `template` tag with an error message for React
   * to bail out of the hydration process, e.g.:
   *
   * ```html
   * <template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING" data-msg="Switched to client rendering because the server rendering errored: ..." />
   * ```
   *
   * This is problematic in cases where we render child nodes into components that rely on slots
   * as these template tags may be interpreted as slot node causing rendering issues. To avoid this
   * we still provide a fallback to render the component directly via `dangerouslySetInnerHTML`.
   *
   * Here we are wrapping the component into a new `div` with `display: contents` to ensure that
   * we can supress hydration warnings.
   */
  const directlyRenderedComponent = `const ${identifier} = ({ children, ...props }) => {
    if (typeof window !== 'undefined') {
      return <div style={{ display: 'contents' }} ${suppressHydrationWarning}>
        <${cmpTagName} ${suppressHydrationWarning} {...props}>
          {children}
        </${cmpTagName}>
      </div>
    }

    return (
      <div style={{ display: 'contents' }} ${suppressHydrationWarning}>
        ${htmlToJsxWithStyleObject(cmpTag, styleObject).slice(0, -1)} ${suppressHydrationWarning} {...props}>
          <template shadowrootmode="open" ${suppressHydrationWarning} dangerouslySetInnerHTML={{ __html: \`${__html}\` }}></template>
          {children}
        ${htmlToJsxWithStyleObject(cmpEndTag)}
      </div>
    )
  }`

  return `${directlyRenderedComponent}\n${dynamicRenderedComponent}`;
}

/**
 * Get the closing tag from the opening tag
 * @param cmpTag - The opening tag of the component
 * @returns The closing tag of the component
 */
function getClosingTagFromOpeningTag(cmpTag: string): string {
  // Match the tag name after the first '<' and before any space or '>'
  const match = cmpTag.match(/^<([a-zA-Z0-9\-]+)/);
  if (match) {
    return `</${match[1]}>`;
  }
  throw new Error('Invalid opening tag');
}

/**
 * Convert a style attribute to a JSX style object
 * @param html - The HTML of the component rendered to a string by `renderToString`
 * @param sourceStyles - The source styles of the component
 * @returns The JSX style object
 */
function htmlToJsxWithStyleObject(html: string, sourceStyles: StyleObject = {}): string {
  const match = html.match(STYLE_ATTR_REGEX);

  /**
   * no style attribute, return as-is
   */
  if (!match) {
    return html;
  }

  const styleString = match[1];

  /**
   * Parse CSS style string into a JS object
   */
  const styleObject = Object.fromEntries(
    styleString
      .split(';')
      .map((rule) => rule.trim())
      .filter(Boolean)
      .map((rule) => {
        const [prop, value] = rule.split(':').map((part) => part.trim());
        return [prop, value];
      })
  );

  /**
   * Format JS object as inline JSX style
   */
  const formattedStyle = JSON.stringify(sourceStyles || styleObject);

  /**
   * Replace the original style="..." with JSX style={{ ... }}
   */
  const jsxTag = html.replace(STYLE_ATTR_REGEX, `style={${formattedStyle}}`);

  return jsxTag;
}

/**
 * Remove comments from a string to properly parse the imports within
 * the given code.
 *
 * @see https://github.com/unjs/mlly/issues/279
 *
 * @param code - The string to remove comments from
 * @returns The string with comments removed
 */
export function removeComments(code: string) {
  return (
    code
      // Remove single-line comments
      .replace(/\/\/.*$/gm, '')
      // Remove multi-line (block) comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
  );
}

/**
 * Resolve a variable from the scope stack
 * @param stack - The scope stack
 * @param name - The name of the variable to resolve
 * @returns The resolved variable
 */
export function resolveVariable(stack: Record<string, any>[], name: string): namedTypes.Property['value'] | null {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i][name]) {
      return stack[i][name];
    }
  }
  return null;
}

/**
 * Merge imports together so we avoid duplicate imports.
 * @param imports - The imports to merge
 * @returns The merged imports
 */
export function mergeImports(imports: ParsedStaticImport[]): ParsedStaticImport[] {
  const mergedMap = new Map<string, ParsedStaticImport>();

  for (const imp of imports) {
    const existing = mergedMap.get(imp.specifier);

    if (existing) {
      // For named imports, we need to track both original and aliased versions
      if (imp.namedImports) {
        const existingNamedImports = { ...existing.namedImports };
        Object.entries(imp.namedImports).forEach(([orig, alias]) => {
          // If we already have this original name but with a different alias,
          // we want to keep both the original and all aliases
          if (orig === alias) {
            existingNamedImports[orig] = alias;
          } else {
            // Keep the original if it's not already there
            if (!existingNamedImports[orig]) {
              existingNamedImports[orig] = orig;
            }
            // Add the alias
            existingNamedImports[`${orig}_alias_${alias}`] = alias;
          }
        });
        existing.namedImports = existingNamedImports;
      }

      // Prefer first found default or namespaced import
      if (!existing.defaultImport && imp.defaultImport) {
        existing.defaultImport = imp.defaultImport;
      }
      if (!existing.namespacedImport && imp.namespacedImport) {
        existing.namespacedImport = imp.namespacedImport;
      }
    } else {
      // For new imports, process named imports to handle both original and aliased versions
      const processedNamedImports = { ...imp.namedImports };
      if (imp.namedImports) {
        Object.entries(imp.namedImports).forEach(([orig, alias]) => {
          if (orig !== alias) {
            processedNamedImports[orig] = orig;
            processedNamedImports[`${orig}_alias_${alias}`] = alias;
          }
        });
      }

      mergedMap.set(imp.specifier, {
        ...imp,
        namedImports: processedNamedImports,
      });
    }
  }

  // Reconstruct final import statements
  return Array.from(mergedMap.values())
    .map((imp) => {
      const parts: string[] = ['import '];

      if (imp.defaultImport) {
        parts.push(imp.defaultImport);
      }

      if (imp.namespacedImport) {
        if (imp.defaultImport) parts.push(', ');
        parts.push(`* as ${imp.namespacedImport}`);
      }

      const namedImports = imp.namedImports || {};
      const importParts = new Map<string, Set<string>>();

      // Group by original name (stripping _alias_ suffix)
      Object.entries(namedImports).forEach(([key, alias]) => {
        const orig = key.includes('_alias_') ? key.split('_alias_')[0] : key;
        if (!importParts.has(orig)) {
          importParts.set(orig, new Set());
        }
        importParts.get(orig)!.add(alias);
      });

      // Create sorted list of imports
      const namedList = Array.from(importParts.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([orig, aliases]) => {
          const parts = [orig];
          aliases.forEach((alias) => {
            if (alias !== orig) {
              parts.push(`${orig} as ${alias}`);
            }
          });
          return parts;
        })
        .flat()
        .join(', ');

      if (namedList) {
        if (imp.defaultImport || imp.namespacedImport) parts.push(', ');
        parts.push(`{ ${namedList} }`);
      }

      parts.push(` from "${imp.specifier}";\n`);

      const code = parts.join('');
      return {
        ...imp,
        code,
        imports: parts.slice(1, -1).join(''),
        start: 0,
        end: code.length,
      };
    })
    .sort((a, b) => {
      // Sort react/jsx-runtime first, then others alphabetically
      if (a.specifier === 'react/jsx-runtime') return -1;
      if (b.specifier === 'react/jsx-runtime') return 1;
      return a.specifier.localeCompare(b.specifier);
    });
}

/**
 * Convert a camelCase string to a kebab-case string
 * @param str - The string to convert
 * @returns The kebab-case string
 */
function camelToKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert a style object to a CSS string
 * @param style - The style object
 * @returns The CSS string
 */
export function cssPropertiesToString(style: Record<string, string | number | boolean>): string {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${camelToKebabCase(key)}: ${value};`)
    .join(' ');
}

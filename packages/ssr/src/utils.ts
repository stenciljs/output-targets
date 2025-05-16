import { print } from 'recast';
import { namedTypes } from 'ast-types';

import { STYLE_ATTR_REGEX } from './constants.js';

export interface StyleObject {
  [key: string]: string | number | boolean | StyleObject | any;
}

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

/**
 * Parse serializable properties into a plain object.
 */
export function parseSimpleObjectExpression(astNode: any): object {
  if (!namedTypes.ObjectExpression.check(astNode)) {
    throw new Error('Not an ObjectExpression');
  }

  const result: Record<string, any> = {};

  for (const prop of astNode.properties) {
    /**
     * skip if
     */
    if (
      /**
       * AST node is not a property
       */
      !namedTypes.Property.check(prop) ||
      prop.kind !== 'init' ||
      /**
       * property is a function
       */
      namedTypes.FunctionDeclaration.check(prop.value) ||
      namedTypes.ArrowFunctionExpression.check(prop.value)
    ) {
      continue;
    }

    let key = namedTypes.Identifier.check(prop.key)
      ? prop.key.name
      : namedTypes.Literal.check(prop.key) || namedTypes.StringLiteral.check(prop.key)
        ? String(prop.key.value)
        : null;

    if (key === null) {
      console.error(`Invalid key: "${prop.key}", skipping property`);
      continue;
    }

    let value: any;
    if (namedTypes.NewExpression.check(prop.value)) {
      // Handle Map and Set
      if (namedTypes.Identifier.check(prop.value.callee) && prop.value.callee.name === 'Map') {
        const mapArgs = prop.value.arguments[0];
        if (namedTypes.ArrayExpression.check(mapArgs)) {
          value = new Map(
            mapArgs.elements
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

export function parseValue(node: unknown): unknown {
  if (
    namedTypes.Literal.check(node) ||
    namedTypes.StringLiteral.check(node) ||
    namedTypes.NumericLiteral.check(node) ||
    namedTypes.BooleanLiteral.check(node)
  ) {
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
export function serializeScopedComponent(html: string[], identifier: string) {
  /**
   * If the component has no child nodes, we can just return a React element
   * with the dangerouslySetInnerHTML prop set to the HTML of the component.
   */
  const cmpTag = html[0].slice(0, -1);
  const __html = html.slice(1, -1).join('\n').trim();
  return `\nconst ${identifier} = ({ children, ...props }) => {
    return ${cmpTag} dangerouslySetInnerHTML={{ __html: \`${__html}\` }} />
  }\n`;
}

/**
 * Serialize a shadow component
 *
 * @param html - The HTML of the component retrieved via `renderToString`
 * @param identifier - The identifier of the component
 * @returns The serialized component
 */
export function serializeShadowComponent(html: string[], identifier: string, styleObject?: StyleObject, strategy?: 'nextjs' | 'react') {
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
  const cmpClosingTagIndex = html.findLastIndex((line) => line === getClosingTagFromOpeningTag(cmpTag))
  const cmpEndTag = cmpClosingTagIndex > -1 ? html.slice(cmpClosingTagIndex).join('\n') : html[html.length - 1];

  /**
   * Let's reconstruct the rendered Stencil component into a JSX component
   */
  const templateClosingIndex = html.findLastIndex((line) => line.includes('</template>'));
  const __html = html.slice(2, templateClosingIndex).join('\n').trim();

  return strategy === 'nextjs'
    ? `\nconst get${identifier} = ({ children }) => dynamic(
      () => compImport.then(mod => mod.${cmpTagName}),
      {
        ssr: false,
        loading: () => (<>
          ${htmlToJsxWithStyleObject(cmpTag, styleObject).slice(0, -1)} data-foo="${identifier}">
            <template shadowrootmode="open" shadowrootdelegatesfocus="true" data-foo="${identifier}" dangerouslySetInnerHTML={{ __html: \`${__html}\` }}></template>
            {children}
          ${htmlToJsxWithStyleObject(cmpEndTag)}
        </>)
      }
    )\n`
    : `\nconst ${identifier} = ({ children }) => {
      return (<>
        ${htmlToJsxWithStyleObject(cmpTag, styleObject).slice(0, -1)}>
          <template shadowrootmode="open" shadowrootdelegatesfocus="true" suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html: \`${__html}\` }}></template>
          {children}
        ${htmlToJsxWithStyleObject(cmpEndTag)}
      </>)
    }\n`;
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
      .map(rule => rule.trim())
      .filter(Boolean)
      .map(rule => {
        const [prop, value] = rule.split(':').map(part => part.trim());
        return [prop, value];
      })
  );

  /**
   * Format JS object as inline JSX style
   */
  const formattedStyle = JSON.stringify({...sourceStyles, ...styleObject});

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
export function removeComments (code: string) {
  return code
    // Remove single-line comments
    .replace(/\/\/.*$/gm, '')
    // Remove multi-line (block) comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
}

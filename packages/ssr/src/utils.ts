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

// Helper type guards for AST node types supporting both namedTypes and type string
export function isPropertyNode(
  node: any
): node is namedTypes.Property | namedTypes.ObjectProperty {
  return (
    namedTypes.Property.check(node) ||
    namedTypes.ObjectProperty.check(node) ||
    node?.type === 'Property' ||
    node?.type === 'ObjectProperty'
  );
}

export function isIdentifierNode(node: any): node is namedTypes.Identifier {
  return (
    namedTypes.Identifier.check(node) ||
    node?.type === 'Identifier'
  );
}

export function isLiteralNode(
  node: any
): node is
  | namedTypes.Literal
  | namedTypes.StringLiteral
  | namedTypes.NumericLiteral
  | namedTypes.BooleanLiteral {
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
  return (
    namedTypes.ArrayExpression.check(node) ||
    node?.type === 'ArrayExpression'
  );
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
  return (
    namedTypes.NewExpression.check(node) ||
    node?.type === 'NewExpression'
  );
}

export function isCallExpression(node: any): node is namedTypes.CallExpression {
  return (
    namedTypes.CallExpression.check(node) ||
    node?.type === 'CallExpression'
  );
}

export function isObjectExpression(node: any): node is namedTypes.ObjectExpression {
  return (
    namedTypes.ObjectExpression.check(node) ||
    node?.type === 'ObjectExpression'
  );
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

function getWrappedComponentVariableName (identifier: string, strategy?: 'nextjs' | 'react') {
  return strategy === 'nextjs' ? `get${identifier}` : identifier;
}

/**
 * Serialize a scoped component
 *
 * @param html - The HTML of the component retrieved via `renderToString`
 * @param identifier - The identifier of the component
 * @returns The serialized component
 */
export function serializeScopedComponent(html: string[], identifier: string, strategy?: 'nextjs' | 'react') {
  /**
   * If the component has no child nodes, we can just return a React element
   * with the dangerouslySetInnerHTML prop set to the HTML of the component.
   */
  const cmpTag = html[0].slice(0, -1);
  const variableName = getWrappedComponentVariableName(identifier, strategy);
  const __html = html.slice(1, -1).join('\n').trim();
  return `\nconst ${variableName} = () => ({ children, ...props }) => {
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
export function serializeShadowComponent(
  html: string[],
  identifier: string,
  styleObject?: StyleObject,
  strategy?: 'nextjs' | 'react'
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
  const variableName = getWrappedComponentVariableName(identifier, strategy);
  const __html = html.slice(2, templateClosingIndex).join('\n').trim();

  /**
   * When serializing the component in Next.js we need to use `dynamic` to properly
   * server side render the component without causing a hydration error (e.g. due to
   * the transforming the template tag into a shadow root when runtime kicks in).
   */
  return strategy === 'nextjs'
    ? `\nconst ${variableName} = ({ children }) => dynamic(
      () => compImport.then(mod => mod.${cmpTagName}),
      {
        ssr: false,
        loading: () => (<>
          ${htmlToJsxWithStyleObject(cmpTag, styleObject).slice(0, -1)}>
            <template shadowrootmode="open" shadowrootdelegatesfocus="true" dangerouslySetInnerHTML={{ __html: \`${__html}\` }}></template>
            {children}
          ${htmlToJsxWithStyleObject(cmpEndTag)}
        </>)
      }
    )\n`
    : `\nconst ${variableName} = () => {
      return ({ children }) => (<>
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
  const formattedStyle = JSON.stringify({ ...sourceStyles, ...styleObject });

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

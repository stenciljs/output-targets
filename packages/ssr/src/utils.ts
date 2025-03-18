import { print } from 'recast';
import { namedTypes } from 'ast-types';

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
        : undefined

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
    } else if (namedTypes.NumericLiteral.check(prop.value) ||
              (namedTypes.Literal.check(prop.value) && typeof prop.value.value === 'number')) {
      result[key] = Number(prop.value.value);
    } else if (namedTypes.BooleanLiteral.check(prop.value) ||
              (namedTypes.Literal.check(prop.value) && typeof prop.value.value === 'boolean')) {
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

export function parseValue(node: any): any {
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
export function serializeScopedComponent(html: string[], identifier: string, styleObject?: StyleObject) {
  const cmpTag = html[0];
  const __html = html.slice(1, -1).join('\n');
  const style = styleObject ? ` style={${JSON.stringify(styleObject)}}` : '';
  return `\nconst ${identifier} = ({ children }) => {
  return (
    ${cmpTag.slice(0, -1) + style} suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html: \`${__html}\` }} />
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
export function serializeShadowComponent(html: string[], identifier: string, styleObject?: StyleObject) {
  const cmpTag = html[0];
  const style = styleObject ? ` style={${JSON.stringify(styleObject)}}` : '';

  /**
   * Let's reconstruct the rendered Stencil component into a JSX component
   */
  const cmpEndTag = html[html.length - 1];
  const templateClosingIndex = html.findIndex((line) => line.includes('</template>'));
  const __html = html.slice(2, templateClosingIndex).join('\n');
  return `\nconst ${identifier} = ({ children }) => {
  return (
    ${cmpTag.slice(0, -1) + style}>
      <template shadowrootmode="open" suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html: \`${__html}\` }}></template>
      {children}
    ${cmpEndTag}
  )
}\n`;
}

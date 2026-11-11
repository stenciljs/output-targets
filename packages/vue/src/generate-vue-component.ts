import { dashToPascalCase } from './utils';
import { ComponentCompilerMeta } from '@stencil/core/internal';
import { OutputTargetVue } from './types';

/**
 * Stencil's own prop name to attribute name conversion (`prop1` -> `prop-1`).
 */
const toDashCase = (str: string): string =>
  str
    .replace(/([A-Z0-9])/g, (match) => ` ${match[0]}`)
    .trim()
    .split(' ')
    .join('-')
    .toLowerCase();

const LITERAL_ATTRIBUTE_TYPES: readonly string[] = ['string', 'number', 'boolean'];

/**
 * With `ssrPropModule` set, the `ssr` argument of `defineContainer()`: the props whose attribute
 * isn't the dash-cased prop name, and the props whose every value goes through `ssrProp()`.
 *
 * Stencil only converts an attribute for a prop typed exactly `string`, `number` or `boolean`. Any
 * other prop (`any`, which covers mixed unions like `string | boolean`, or `unknown`) gets the
 * attribute's string as it is, so it's a ref. So is a prop with no attribute, which Stencil never
 * reads.
 */
const createSsrArgument = (
  outputTarget: OutputTargetVue,
  properties: ComponentCompilerMeta['properties'] | undefined
): string | undefined => {
  if (!outputTarget.ssrPropModule || !properties?.length) return undefined;
  const attributes: string[] = [];
  const refs: string[] = [];
  for (const prop of properties) {
    if (!prop.attribute || !LITERAL_ATTRIBUTE_TYPES.includes(prop.type)) refs.push(`'${prop.name}'`);
    else if (prop.attribute !== toDashCase(prop.name)) attributes.push(`'${prop.name}': '${prop.attribute}'`);
  }
  const options = ['ssrProp'];
  if (attributes.length) options.push(`attributes: { ${attributes.join(', ')} }`);
  if (refs.length) options.push(`refs: [${refs.join(', ')}]`);
  return `{ ${options.join(', ')} }`;
};

export const createComponentDefinition =
  (importTypes: string, outputTarget: OutputTargetVue) =>
  (cmpMeta: Pick<ComponentCompilerMeta, 'properties' | 'tagName' | 'methods' | 'events'>) => {
    const tagNameAsPascal = dashToPascalCase(cmpMeta.tagName);
    const importAs = outputTarget.includeImportCustomElements ? 'define' + tagNameAsPascal : 'undefined';

    let props: string[] = [];
    let emits: string[] = [];
    let propMap: Record<string, [string, string | undefined]> = {};

    if (Array.isArray(cmpMeta.properties) && cmpMeta.properties.length > 0) {
      props = cmpMeta.properties.map((prop) => `'${prop.name}'`);

      cmpMeta.properties.forEach((prop) => {
        if (['boolean', 'string', 'number'].includes(prop.type)) {
          propMap[prop.name] = [prop.type[0].toUpperCase() + prop.type.slice(1), prop.attribute];
        }
      });
    }

    if (Array.isArray(cmpMeta.events) && cmpMeta.events.length > 0) {
      const events = (emits = cmpMeta.events.map((event) => `'${event.name}'`));
      props = [...props, ...events];
      emits = events;

      cmpMeta.events.forEach((event) => {
        const handlerName = `on${event.name[0].toUpperCase() + event.name.slice(1)}`;
        propMap[handlerName] = ['Function', undefined];
      });
    }

    const componentType = `${importTypes}.${tagNameAsPascal}`;
    const findModel = outputTarget.componentModels?.find((config) =>
      Array.isArray(config.elements) ? config.elements.includes(cmpMeta.tagName) : config.elements === cmpMeta.tagName
    );
    const modelType = findModel !== undefined ? `, ${componentType}["${findModel.targetAttr}"]` : '';
    const supportSSR = typeof outputTarget.hydrateModule === 'string';
    const ssrTernary = supportSSR ? ' globalThis.window ? ' : ' ';
    const transformTagArg = outputTarget.transformTag ? ', transformTag' : '';
    const ssrCondition = supportSSR
      ? ` : defineStencilSSRComponent<${componentType}${modelType}>({
  tagName: '${cmpMeta.tagName}',
  hydrateModule: import('${outputTarget.hydrateModule}'),
  props: {
    ${Object.entries(propMap)
      .map(([key, [type, attr]]) => (attr ? `'${key}': [${type}, "${attr}"]` : `'${key}': [${type}]`))
      .join(',\n    ')}
  }${outputTarget.transformTag ? ',\n  getTagTransformer: getTagTransformer' : ''}
})`
      : '';

    let templateString = `
export const ${tagNameAsPascal}: StencilVueComponent<${componentType}${modelType}> = /*@__PURE__*/${ssrTernary}defineContainer<${componentType}${modelType}>('${cmpMeta.tagName}', ${importAs}`;

    if (props.length > 0) {
      templateString += `, [
  ${props.length > 0 ? props.join(',\n  ') : ''}
]`;
      /**
       * If there are no props,
       * but v-model is still used,
       * make sure we pass in an empty array
       * otherwise all of the defineContainer properties
       * will be off by one space.
       * Note: If you are using v-model then
       * the props array should never be empty
       * as there must be a prop for v-model to update,
       * but this check is there so builds do not crash.
       */
    } else if (emits.length > 0 || findModel || outputTarget.transformTag) {
      // Add empty props array if we have emits, v-model, or transformTag
      templateString += `, []`;
    }

    if (emits.length > 0) {
      templateString += `, [
  ${emits.length > 0 ? emits.join(',\n  ') : ''}
]`;
      /**
       * If there are no Emits,
       * but v-model is still used,
       * make sure we pass in an empty array
       * otherwise all of the defineContainer properties
       * will be off by one space.
       * Note: If you are using v-model then
       * the props array should never be empty
       * as there must be a prop for v-model to update,
       * but this check is there so builds do not crash.
       */
    } else if (findModel || outputTarget.transformTag) {
      // Add empty emits array if we have v-model or transformTag
      templateString += `, []`;
    }

    if (findModel) {
      const targetProp = findModel.targetAttr;

      /**
       * If developer is trying to bind v-model support to a component's
       * prop, but that prop was not defined, warn them of this otherwise
       * v-model will not work as expected.
       */
      if (!props.includes(`'${targetProp}'`)) {
        console.warn(
          `Your '${cmpMeta.tagName}' component is configured to have v-model support bound to '${targetProp}', but '${targetProp}' is not defined as a property on the component. v-model integration may not work as expected.`
        );
      }

      const targetEventAttr = findModel.eventAttr !== undefined ? `'${findModel.eventAttr}'` : 'undefined';
      templateString += `,\n`;
      templateString += `'${targetProp}', '${findModel.event}', ${targetEventAttr}`;

      // Add transformTag parameter if enabled
      templateString += transformTagArg;
    } else if (outputTarget.transformTag) {
      // If transformTag is enabled but there's no v-model, we need to pass undefined for the model parameters
      templateString += `, undefined, undefined, undefined, transformTag`;
    }

    const ssrArgument = createSsrArgument(outputTarget, cmpMeta.properties);
    if (ssrArgument) {
      // fill the positional parameters before `ssr` that weren't passed
      if (emits.length === 0 && !findModel && !outputTarget.transformTag) {
        templateString += `, []`;
      }
      if (!findModel && !outputTarget.transformTag) {
        templateString += `, undefined, undefined, undefined, undefined`;
      } else if (!outputTarget.transformTag) {
        templateString += `, undefined`;
      }
      templateString += `, ${ssrArgument}`;
    }

    templateString += `)${ssrCondition};\n`;

    return templateString;
  };

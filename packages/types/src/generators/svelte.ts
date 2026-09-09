import {
  type BaseTypesOptions,
  filterComponents,
  extractComponentInfo,
  collectImportTypes,
  generateHeader,
} from './base.js';

export interface SvelteTypesOptions extends BaseTypesOptions {}

/**
 * Converts an event name to a Svelte event handler prop name.
 * Svelte uses "on:eventname" syntax in templates, but for type definitions
 * we use the "oneventname" format (lowercase).
 */
const toSvelteEventHandler = (eventName: string): string => {
  return `on${eventName.toLowerCase()}`;
};

/**
 * Creates a TypeScript declaration file (.d.ts) that provides type definitions
 * for using Stencil web components as native custom elements in Svelte.
 *
 * The generated file augments the `svelte/elements` module to provide proper
 * typing for custom elements when used in Svelte templates.
 */
export function createSvelteTypes({ components, stencilPackageName, excludeComponents }: SvelteTypesOptions): string {
  const filteredComponents = filterComponents(components, excludeComponents);

  if (filteredComponents.length === 0) {
    return '';
  }

  const lines: string[] = [];

  // Add header
  lines.push(generateHeader('Svelte', stencilPackageName, 'svelte-native-types'));

  // Add Svelte imports
  lines.push(`// @ts-ignore - Svelte types may not be available in all build contexts`);
  lines.push(`import type { HTMLAttributes } from 'svelte/elements';`);

  // Collect and add imports from Stencil package
  const importTypes = collectImportTypes(filteredComponents);
  if (importTypes.size > 0) {
    lines.push(`import type { ${Array.from(importTypes).sort().join(', ')} } from '${stencilPackageName}';`);
  }

  lines.push('');

  // Generate interface for each component
  for (const component of filteredComponents) {
    const info = extractComponentInfo(component);
    const interfaceProperties: string[] = [];

    // Add properties
    for (const prop of info.properties) {
      const docs = prop.docs ? `  /** ${prop.docs} */\n` : '';
      interfaceProperties.push(`${docs}  '${prop.name}'?: ${prop.type};`);
    }

    // Add events
    for (const event of info.events) {
      const docs = event.docs ? `  /** Event: ${event.name} - ${event.docs} */\n` : `  /** Event: ${event.name} */\n`;
      const handlerName = toSvelteEventHandler(event.name);
      interfaceProperties.push(`${docs}  '${handlerName}'?: (event: ${info.customEventType}<${event.type}>) => void;`);
    }

    // Generate the props interface
    if (interfaceProperties.length > 0) {
      lines.push(`interface ${info.propsInterfaceName} {`);
      lines.push(interfaceProperties.join('\n'));
      lines.push(`}`);
    } else {
      lines.push(`interface ${info.propsInterfaceName} {}`);
    }
    lines.push('');
  }

  // Generate module augmentation for svelte/elements
  lines.push(`declare module 'svelte/elements' {`);
  lines.push(`  interface SvelteHTMLElements {`);

  for (const component of filteredComponents) {
    const info = extractComponentInfo(component);
    lines.push(`    '${info.tagName}': HTMLAttributes<${info.elementType}> & ${info.propsInterfaceName};`);
  }

  lines.push(`  }`);
  lines.push(`}`);
  lines.push('');

  return lines.join('\n');
}

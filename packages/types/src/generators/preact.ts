import { type BaseTypesOptions, filterComponents, collectImportTypes, generateHeader } from './base.js';
import { kebabToPascalCase, normalizeTypeString } from '../utils/string-utils.js';

export interface PreactTypesOptions extends BaseTypesOptions {}

/**
 * Converts an event name to a Preact event handler prop name.
 * Preact follows a similar pattern to React with onEventName.
 */
const toPreactEventHandler = (eventName: string): string => {
  return `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
};

/**
 * Creates a TypeScript declaration file (.d.ts) that provides type definitions
 * for using Stencil web components as native custom elements in Preact.
 *
 * The generated file augments the `preact` module to provide proper
 * typing for custom elements when used in Preact JSX.
 */
export function createPreactTypes({ components, stencilPackageName, excludeComponents }: PreactTypesOptions): string {
  const filteredComponents = filterComponents(components, excludeComponents);

  if (filteredComponents.length === 0) {
    return '';
  }

  const lines: string[] = [];

  // Add header
  lines.push(generateHeader('Preact', stencilPackageName, 'preact-native-types'));

  // Add Preact imports
  lines.push(`// @ts-ignore - Preact types may not be available in all build contexts`);
  lines.push(`import 'preact';`);
  lines.push(`// @ts-ignore - Preact types may not be available in all build contexts`);
  lines.push(`import type { JSX } from 'preact';`);

  // Collect and add imports from Stencil package
  const importTypes = collectImportTypes(filteredComponents);
  if (importTypes.size > 0) {
    lines.push(`import type { ${Array.from(importTypes).sort().join(', ')} } from '${stencilPackageName}';`);
  }

  lines.push('');

  // Generate interface for each component
  for (const component of filteredComponents) {
    const tagName = component.tagName;
    const pascalName = kebabToPascalCase(tagName);
    const propsInterfaceName = `${pascalName}NativeProps`;
    const customEventType = `${pascalName}CustomEvent`;

    const interfaceProperties: string[] = [];

    // Add properties
    const publicProperties = (component.properties || []).filter((p) => !p.internal);
    for (const prop of publicProperties) {
      const propType = normalizeTypeString(prop.complexType?.original || 'any');
      const docs = prop.docs?.text?.trim();
      const docsComment = docs ? `  /** ${docs} */\n` : '';
      interfaceProperties.push(`${docsComment}  '${prop.name}'?: ${propType};`);
    }

    // Add events
    const publicEvents = (component.events || []).filter((e) => !e.internal);
    for (const event of publicEvents) {
      const eventType = normalizeTypeString(event.complexType?.original || 'void');
      const docs = event.docs?.text?.trim();
      const docsComment = docs ? `  /** Event: ${event.name} - ${docs} */\n` : `  /** Event: ${event.name} */\n`;
      const handlerName = toPreactEventHandler(event.name);
      interfaceProperties.push(`${docsComment}  '${handlerName}'?: (event: ${customEventType}<${eventType}>) => void;`);
    }

    // Generate the props interface
    if (interfaceProperties.length > 0) {
      lines.push(`interface ${propsInterfaceName} {`);
      lines.push(interfaceProperties.join('\n'));
      lines.push(`}`);
    } else {
      lines.push(`interface ${propsInterfaceName} {}`);
    }
    lines.push('');
  }

  // Generate module augmentation for Preact
  lines.push(`declare module 'preact' {`);
  lines.push(`  namespace JSX {`);
  lines.push(`    interface IntrinsicElements {`);

  for (const component of filteredComponents) {
    const tagName = component.tagName;
    const pascalName = kebabToPascalCase(tagName);
    const propsInterfaceName = `${pascalName}NativeProps`;
    const elementType = `HTML${pascalName}Element`;

    lines.push(`      '${tagName}': JSX.HTMLAttributes<${elementType}> & ${propsInterfaceName};`);
  }

  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push('');

  return lines.join('\n');
}

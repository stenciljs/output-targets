import { type BaseTypesOptions, filterComponents, collectImportTypes, generateHeader } from './base.js';
import { kebabToPascalCase, normalizeTypeString } from '../utils/string-utils.js';

export interface VueTypesOptions extends BaseTypesOptions {}

/**
 * Creates a TypeScript declaration file (.d.ts) that provides type definitions
 * for using Stencil web components as native custom elements in Vue 3.
 *
 * Vue uses kebab-case event names with @ prefix in templates (e.g., @my-event).
 * The generated file augments Vue's GlobalComponents interface.
 */
export function createVueTypes({ components, stencilPackageName, excludeComponents }: VueTypesOptions): string {
  const filteredComponents = filterComponents(components, excludeComponents);

  if (filteredComponents.length === 0) {
    return '';
  }

  const lines: string[] = [];

  // Add header
  lines.push(generateHeader('Vue 3', stencilPackageName, 'vue-native-types'));

  // Add Vue imports
  lines.push(`// @ts-ignore - Vue types may not be available in all build contexts`);
  lines.push(`import type { DefineComponent, HTMLAttributes } from 'vue';`);

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

    // Add events using Vue's onEventName convention
    const publicEvents = (component.events || []).filter((e) => !e.internal);
    for (const event of publicEvents) {
      const eventType = normalizeTypeString(event.complexType?.original || 'void');
      const docs = event.docs?.text?.trim();
      const docsComment = docs ? `  /** Event: ${event.name} - ${docs} */\n` : `  /** Event: ${event.name} */\n`;
      // Vue uses onEventName format for event handlers in props (onMyEvent for @my-event)
      const handlerName = `on${event.name.charAt(0).toUpperCase()}${event.name.slice(1)}`;
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

  // Generate module augmentation for Vue
  lines.push(`declare module 'vue' {`);
  lines.push(`  interface GlobalComponents {`);

  for (const component of filteredComponents) {
    const tagName = component.tagName;
    const pascalName = kebabToPascalCase(tagName);
    const propsInterfaceName = `${pascalName}NativeProps`;

    // Vue expects DefineComponent for GlobalComponents
    lines.push(`    '${tagName}': DefineComponent<${propsInterfaceName} & HTMLAttributes>;`);
  }

  lines.push(`  }`);
  lines.push(`}`);
  lines.push('');

  return lines.join('\n');
}

import { type BaseTypesOptions, filterComponents, collectImportTypes, generateHeader } from './base.js';
import { kebabToPascalCase, normalizeTypeString } from '../utils/string-utils.js';

export interface SolidTypesOptions extends BaseTypesOptions {}

/**
 * Creates a TypeScript declaration file (.d.ts) that provides type definitions
 * for using Stencil web components as native custom elements in Solid.
 *
 * Solid distinguishes between:
 * - Properties (prop:): Set via JavaScript property
 * - Attributes (attr:): Set via HTML attribute
 * - Events (on:): Custom event handlers
 *
 * The generated file augments the `solid-js` module to provide proper
 * typing for custom elements when used in Solid JSX.
 */
export function createSolidTypes({ components, stencilPackageName, excludeComponents }: SolidTypesOptions): string {
  const filteredComponents = filterComponents(components, excludeComponents);

  if (filteredComponents.length === 0) {
    return '';
  }

  const lines: string[] = [];

  // Add header
  lines.push(generateHeader('Solid', stencilPackageName, 'solid-native-types'));

  // Add Solid imports
  lines.push(`// @ts-ignore - Solid types may not be available in all build contexts`);
  lines.push(`import 'solid-js';`);
  lines.push(`// @ts-ignore - Solid types may not be available in all build contexts`);
  lines.push(`import type { JSX } from 'solid-js';`);

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

    // Add properties with both prop: and attr: prefixes where applicable
    const publicProperties = (component.properties || []).filter((p) => !p.internal);
    for (const prop of publicProperties) {
      const propType = normalizeTypeString(prop.complexType?.original || 'any');
      const docs = prop.docs?.text?.trim();
      const docsComment = docs ? `  /** ${docs} */\n` : '';

      // JavaScript property (always available)
      interfaceProperties.push(`${docsComment}  'prop:${prop.name}'?: ${propType};`);

      // HTML attribute (only if reflected to attribute)
      if (prop.attribute) {
        interfaceProperties.push(`${docsComment}  'attr:${prop.attribute}'?: string;`);
      }
    }

    // Add events using Solid's on: syntax
    const publicEvents = (component.events || []).filter((e) => !e.internal);
    for (const event of publicEvents) {
      const eventType = normalizeTypeString(event.complexType?.original || 'void');
      const docs = event.docs?.text?.trim();
      const docsComment = docs ? `  /** Event: ${event.name} - ${docs} */\n` : `  /** Event: ${event.name} */\n`;
      interfaceProperties.push(
        `${docsComment}  'on:${event.name}'?: (event: ${customEventType}<${eventType}>) => void;`
      );
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

  // Generate module augmentation for solid-js
  lines.push(`declare module 'solid-js' {`);
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

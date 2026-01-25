import {
  type BaseTypesOptions,
  filterComponents,
  extractComponentInfo,
  collectImportTypes,
  generateHeader,
} from './base.js';

export interface ReactTypesOptions extends BaseTypesOptions {}

/**
 * Converts an event name to a lowercase React 19 event handler prop name.
 * React 19 lowercases the prop name (minus "on") to get the event name.
 * So for event "myFocus", the handler prop should be "onmyfocus".
 */
const toLowercaseEventHandler = (eventName: string): string => {
  return `on${eventName.toLowerCase()}`;
};

/**
 * Creates a TypeScript declaration file (.d.ts) that provides type definitions
 * for using Stencil web components as native custom elements in React 19+.
 *
 * The generated file augments the `react/jsx-runtime` module to provide proper
 * typing for custom elements when used directly in JSX without wrapper components.
 */
export function createReactTypes({ components, stencilPackageName, excludeComponents }: ReactTypesOptions): string {
  const filteredComponents = filterComponents(components, excludeComponents);

  if (filteredComponents.length === 0) {
    return '';
  }

  const lines: string[] = [];

  // Add header
  lines.push(generateHeader('React 19+', stencilPackageName, 'react-native-types'));

  // Add React imports with @ts-ignore for non-React contexts
  lines.push(`// @ts-ignore - React types may not be available in all build contexts`);
  lines.push(`import 'react';`);
  lines.push(`// @ts-ignore - React types may not be available in all build contexts`);
  lines.push(`import type { DetailedHTMLProps, HTMLAttributes } from 'react';`);

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

    // Add events with lowercase naming (React 19 style)
    for (const event of info.events) {
      const docs = event.docs ? `  /** Event: ${event.name} - ${event.docs} */\n` : `  /** Event: ${event.name} */\n`;
      const handlerName = toLowercaseEventHandler(event.name);
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

  // Generate module augmentation for react/jsx-runtime's JSX namespace
  lines.push(`declare module 'react/jsx-runtime' {`);
  lines.push(`  namespace JSX {`);
  lines.push(`    interface IntrinsicElements {`);

  for (const component of filteredComponents) {
    const info = extractComponentInfo(component);
    lines.push(
      `      '${info.tagName}': DetailedHTMLProps<HTMLAttributes<${info.elementType}> & ${info.propsInterfaceName}, ${info.elementType}>;`
    );
  }

  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push('');

  return lines.join('\n');
}

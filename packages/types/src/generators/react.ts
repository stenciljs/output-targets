import {
  type BaseTypesOptions,
  filterComponents,
  extractComponentInfo,
  collectImportTypes,
  generateHeader,
} from './base.js';

export interface ReactTypesOptions extends BaseTypesOptions {}

/**
 * Converts an event name to a React 19 event handler prop name. On a custom element, React
 * listens for the prop name minus "on", as written (`addEventListener(key.slice(2))`), so the
 * case is kept: for event "myFocus", the handler prop is "onmyFocus".
 */
const toEventHandler = (eventName: string): string => {
  return `on${eventName}`;
};

/**
 * Creates a TypeScript declaration file (.d.ts) that provides type definitions
 * for using Stencil web components as native custom elements in React 19+.
 *
 * The generated file augments the `react/jsx-runtime` module to provide proper
 * typing for custom elements when used directly in JSX without wrapper components.
 */
export function createReactTypes({
  components,
  stencilPackageName,
  excludeComponents,
  importPath,
  typesFilePath,
}: ReactTypesOptions): string {
  const filteredComponents = filterComponents(components, excludeComponents);

  if (filteredComponents.length === 0) {
    return '';
  }

  const lines: string[] = [];

  // Add header
  lines.push(generateHeader('React 19+', stencilPackageName, importPath ?? 'react-native-types', typesFilePath));

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

    // React 19 listens for the name after `on` as written: `oncountChanged` for `countChanged`
    for (const event of info.events) {
      const docs = event.docs ? `  /** Event: ${event.name} - ${event.docs} */\n` : `  /** Event: ${event.name} */\n`;
      const handlerName = toEventHandler(event.name);
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

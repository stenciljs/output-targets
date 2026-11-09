import { type BaseTypesOptions, filterComponents, collectImportTypes, generateHeader } from './base.js';
import { kebabToPascalCase, normalizeTypeString } from '../utils/string-utils.js';

export interface AstroTypesOptions extends BaseTypesOptions {}

/**
 * Creates a TypeScript declaration file (.d.ts) that provides type definitions
 * for using Stencil web components as native custom elements in Astro templates.
 *
 * Astro templates render on the server only, so an element gets attributes, never properties or
 * event handlers. Each prop is keyed by its attribute name. A prop with no attribute (an object or
 * array) is keyed by its name: pass it with the library's `ssrProp()`, which the server render
 * turns back into the value.
 *
 * The generated file augments Astro's global `astroHTML.JSX` namespace.
 */
export function createAstroTypes({
  components,
  stencilPackageName,
  excludeComponents,
  importPath,
  typesFilePath,
}: AstroTypesOptions): string {
  const filteredComponents = filterComponents(components, excludeComponents);

  if (filteredComponents.length === 0) {
    return '';
  }

  const lines: string[] = [];

  lines.push(generateHeader('Astro', stencilPackageName, importPath ?? 'astro-native-types', typesFilePath));

  // no event handlers in Astro templates, so no CustomEvent types
  const importTypes = collectImportTypes(filteredComponents, false);
  if (importTypes.size > 0) {
    lines.push(`import type { ${Array.from(importTypes).sort().join(', ')} } from '${stencilPackageName}';`);
  }

  lines.push('');

  for (const component of filteredComponents) {
    const propsInterfaceName = `${kebabToPascalCase(component.tagName)}NativeProps`;
    const interfaceProperties: string[] = [];

    for (const prop of (component.properties || []).filter((p) => !p.internal)) {
      const propType = normalizeTypeString(prop.complexType?.original || 'any');
      const docs = prop.docs?.text?.trim();
      const docsComment = docs ? `  /** ${docs} */\n` : '';
      interfaceProperties.push(`${docsComment}  '${prop.attribute ?? prop.name}'?: ${propType};`);
    }

    if (interfaceProperties.length > 0) {
      lines.push(`interface ${propsInterfaceName} {`);
      lines.push(interfaceProperties.join('\n'));
      lines.push(`}`);
    } else {
      lines.push(`interface ${propsInterfaceName} {}`);
    }
    lines.push('');
  }

  lines.push(`declare global {`);
  lines.push(`  namespace astroHTML.JSX {`);
  lines.push(`    interface IntrinsicElements {`);

  for (const component of filteredComponents) {
    const propsInterfaceName = `${kebabToPascalCase(component.tagName)}NativeProps`;
    lines.push(`      '${component.tagName}': astroHTML.JSX.HTMLAttributes & ${propsInterfaceName};`);
  }

  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push('');

  return lines.join('\n');
}

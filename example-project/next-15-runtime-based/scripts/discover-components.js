import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { componentSSRConfig } from '../test/ssr-component-config.js';

/**
 * @typedef {Object} DiscoveredComponent
 * @property {string} name - Component directory name
 * @property {string} tag - Component tag name
 * @property {string} encapsulation - 'shadow' or 'scoped'
 * @property {string} expectedStatus - 'supported', 'unsupported', 'partial', or 'unknown'
 * @property {string|undefined} testPagePath - Path to test page
 * @property {string|undefined} notes - Notes about the component
 * @property {string} componentPath - Path to component file
 */

/**
 * Discover all components from component-library/src/components
 * @returns {DiscoveredComponent[]}
 */
export function discoverComponents(componentsDir) {
  const components = [];
  const resolvedDir = resolve(componentsDir);

  try {
    const entries = readdirSync(resolvedDir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip non-directories and special files
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'helpers' || entry.name === 'element-interface') {
        continue;
      }

      const componentName = entry.name;
      const componentDir = join(resolvedDir, componentName);
      
      // Look for all .tsx files in the component directory
      const files = readdirSync(componentDir).filter(f => f.endsWith('.tsx') && !f.includes('.test.') && !f.includes('.spec.'));
      
      // Skip directories with no .tsx files
      if (files.length === 0) {
        continue;
      }
      
      for (const file of files) {
        const componentFile = join(componentDir, file);
        try {
          const component = extractComponentMetadata(componentFile, componentName);
          if (component) {
            components.push(component);
          }
        } catch {
          // Skip files that can't be parsed
        }
      }
    }
  } catch (error) {
    console.error(`Error discovering components from ${resolvedDir}:`, error);
  }

  // Deduplicate by tag name
  // If multiple components have the same tag, prefer the one that matches the directory name
  const tagMap = new Map();
  
  for (const component of components) {
    const existing = tagMap.get(component.tag);
    
    if (!existing) {
      // First occurrence of this tag
      tagMap.set(component.tag, component);
    } else {
      // Prefer component where tag matches directory name (e.g., my-popover in my-popover directory)
      const tagMatchesDir = component.tag === component.name;
      const existingTagMatchesDir = existing.tag === existing.name;
      
      if (tagMatchesDir && !existingTagMatchesDir) {
        tagMap.set(component.tag, component);
      }
    }
  }
  
  return Array.from(tagMap.values());
}

/**
 * Extract component metadata from a component file
 */
function extractComponentMetadata(filePath, componentName) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Extract tag name from @Component decorator
    const tagMatch = content.match(/@Component\s*\(\s*\{[^}]*tag:\s*['"]([^'"]+)['"]/s);
    if (!tagMatch) {
      return null;
    }
    
    const tag = tagMatch[1];
    
    // Extract shadow/scoped from @Component decorator
    // Check for scoped: true first, then shadow: true
    const scopedMatch = content.match(/scoped:\s*(true|false)/);
    const shadowMatch = content.match(/shadow:\s*(true|false)/);
    
    let encapsulation = 'scoped'; // default
    if (scopedMatch && scopedMatch[1] === 'true') {
      encapsulation = 'scoped';
    } else if (shadowMatch && shadowMatch[1] === 'true') {
      encapsulation = 'shadow';
    } else if (scopedMatch && scopedMatch[1] === 'false') {
      // If scoped is explicitly false, check shadow
      if (shadowMatch && shadowMatch[1] === 'true') {
        encapsulation = 'shadow';
      }
    }
    
    // Merge with config if exists
    const config = componentSSRConfig[tag] || {};
    
    return {
      name: componentName,
      tag,
      encapsulation,
      expectedStatus: config.expectedStatus || 'supported',
      testPagePath: config.testPagePath,
      notes: config.notes,
      componentPath: filePath,
    };
  } catch (error) {
    console.error(`Error extracting metadata from ${filePath}:`, error);
    return null;
  }
}

/**
 * Get all discovered components
 */
export function getAllComponents() {
  // Path relative to this file location
  // In test environment, __dirname may not be available, so use process.cwd()
  const projectRoot = process.cwd();
  const componentsDir = resolve(projectRoot, '../component-library/src/components');
  const allComponents = discoverComponents(componentsDir);
  
  // Filter out components that should not be tested separately
  // my-radio should only be used as part of my-radio-group
  return allComponents.filter(component => component.tag !== 'my-radio');
}

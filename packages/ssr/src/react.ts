import { possibleStandardNames } from './constants.js';

/**
 * Get the React property name for a given Stencil property name
 * @param propName - The Stencil property name
 * @returns The React property name
 */
export function getReactPropertyName(propName: string) {
  return (
    /**
     * Either use a known standard name
     */
    possibleStandardNames[propName as keyof typeof possibleStandardNames] ||
    /**
     * or use the original name but transform camelCase to kebab-case as
     * Stencil only supports kebab-casing using HTML templates.
     */
    propName.replace(/([A-Z])/g, '-$1').toLowerCase()
  );
}

/**
 * Tag transformer configuration
 *
 * This function is called for each component tag at build time to patch
 * Angular selectors, and at runtime to transform actual DOM elements.
 */
export default (tag) => {
  // Transform test components to v1 prefix
  if (tag.startsWith('my-transform-')) {
    return `v1-${tag}`;
  }

  // Add more complex transformation logic here if needed
  // For example:
  // if (tag === 'legacy-button') return 'v2-button';
  // if (componentVersionMap[tag]) return componentVersionMap[tag];

  // Return unchanged for non-transformed components
  return tag;
};

/**
 * Lightweight configuration for components with known SSR limitations or special test page mappings.
 * 
 * Most components don't need entries here - they'll default to 'supported'.
 * Only add entries for:
 * - Components with known SSR limitations
 * - Components that need test page path mappings
 * - Components that need special notes
 */

export const componentSSRConfig = {
  // Components with known SSR limitations (hydration mismatch errors)
  'my-component-scoped': {
    expectedStatus: 'unsupported',
    testPagePath: '/single-no-child-scoped',
    notes: 'Hydration mismatch error when rendered'
  },
  'my-complex-props-scoped': {
    expectedStatus: 'unsupported',
    testPagePath: '/complex-props-scoped',
    notes: 'Hydration mismatch error when rendered'
  },
  'my-list-scoped': {
    expectedStatus: 'unsupported',
    testPagePath: '/nested-scoped',
    notes: 'Hydration mismatch error when rendered'
  },
  'my-list-item-scoped': {
    expectedStatus: 'unsupported',
    testPagePath: '/nested-scoped',
    notes: 'Hydration mismatch error when rendered'
  },
  
  // Test page mappings for existing test pages
  'my-button-scoped': {
    testPagePath: '/single-children-scoped',
  },
  'my-button': {
    testPagePath: '/single-children-shadow',
  },
  'my-component': {
    testPagePath: '/single-no-child-shadow',
  },
  'my-input': {
    testPagePath: '/input-shadow',
  },
  'my-input-scoped': {
    testPagePath: '/input-scoped',
  },
  'my-complex-props': {
    testPagePath: '/complex-props-shadow',
  },
  'my-transform-test': {
    testPagePath: '/transform-tag-test',
  },
  'my-list': {
    testPagePath: '/nested-shadow',
  },
  'my-list-item': {
    testPagePath: '/nested-shadow',
  },
  
  // Add more mappings as needed
};

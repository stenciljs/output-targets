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
  'my-popover': {
    expectedStatus: 'unsupported',
    testPagePath: '/my-popover',
    notes: 'Slot detection in componentWillLoad causes hydration mismatch'
  },
  'my-component-scoped': {
    expectedStatus: 'unsupported',
    testPagePath: '/single-no-child-scoped',
    notes: 'Hydration mismatch error when rendered'
  },
  'my-checkbox': {
    expectedStatus: 'unsupported',
    testPagePath: '/my-checkbox',
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
  'my-radio-group': {
    expectedStatus: 'unsupported',
    testPagePath: '/my-radio-group',
    notes: 'Hydration mismatch error when rendered'
  },
  
  // Test page mappings for existing test pages
  'my-button': {
    testPagePath: '/single-children-shadow',
  },
  'my-button-scoped': {
    testPagePath: '/single-children-scoped',
  },
  'my-component': {
    testPagePath: '/my-component',
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
  'my-range': {
    testPagePath: '/my-range',
  },
  'my-counter': {
    testPagePath: '/my-counter',
  },
  'my-toggle': {
    testPagePath: '/my-toggle',
  },
  'my-toggle-content': {
    testPagePath: '/my-toggle-content',
  },
  'my-data-table': {
    testPagePath: '/my-data-table',
  },
  'my-tooltip': {
    testPagePath: '/my-tooltip',
  },
  'my-list': {
    testPagePath: '/my-list',
  },
  
  // Add more mappings as needed
};

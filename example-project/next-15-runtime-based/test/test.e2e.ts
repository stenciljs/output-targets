import { runTestScenarios } from 'react-test-components/scenarios';

describe('Next 15 React 19 SSR Integration', () => {
  runTestScenarios({
    /**
     * Enable hydration error checking. Most components are now working,
     * but some still have known hydration issues.
     */
    assertClientSideErrors: true,
    /**
     * Components that are known to have hydration errors.
     * These are marked as known failures and won't cause the test to fail.
     * TODO: Fix these components and remove them from this list.
     */
    knownFailures: [
      // Components with known hydration errors
      'single-no-child-scoped',
      'single-no-child-shadow',
    ],
    exclude: ['transform-scoped-to-shadow'],
  })
})

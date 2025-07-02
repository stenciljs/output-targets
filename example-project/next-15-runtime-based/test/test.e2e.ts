import { runTestScenarios } from 'react-test-components/scenarios';

describe('Next 15 React 19 SSR Integration', () => {
  runTestScenarios({
    /**
     * We have to disable client side error checks as we
     * can't guarantee no hydration errors are logged using
     * the runtime based SSR approach.
     */
    assertClientSideErrors: false,
    exclude: ['transform-scoped-to-shadow'],
  })
})

import { runTestScenarios } from 'react-test-components/scenarios';

describe('Next 15 React 19 SSR Integration', () => {
  runTestScenarios({
    exclude: [
      'transform-scoped-to-shadow',
      /**
       * Next.js always deduplicates styles (even in React 18), so this test doesn't apply.
       * This test expects NO deduplication (React 18 behavior without Next.js framework),
       * but Next.js has its own style deduplication that works regardless of React version.
       */
      'style-no-deduplication-scoped',
      /**
       * Known hydration mismatch errors
       */
      'single-no-child-scoped',
      'single-no-child-shadow',
    ],
  })
})

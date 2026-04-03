import { runTestScenarios } from 'react-test-components/scenarios';

describe('Next.js 14 React 18 SSR Integration', () => {
  runTestScenarios({
    exclude: [
      /**
       * currently broken in Next.js
       *
       * Problem here is that React doesn't re-render the component at runtime to initate the event handlers.
       */
      'input-scoped',
      /**
       * Next.js always deduplicates styles (even in React 18), so this test doesn't apply.
       * This test expects NO deduplication (React 18 behavior without Next.js framework),
       * but Next.js has its own style deduplication that works regardless of React version.
       */
      'style-no-deduplication-scoped',
    ],
  });
});

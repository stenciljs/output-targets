import { runTestScenarios } from 'react-test-components/scenarios';

describe('Remix SSR Integration', () => {
  runTestScenarios({
    ignoreHydrationMismatchErrors: true,
    exclude: [
      'complex-props-scoped',
      'style-deduplication-scoped',
      /**
       * Known issue: updating a prop does not trigger a rerender.
       */
      'prop-update-shadow',
      /**
       * Relies on a runtime re-render (button click updates className), which
       * doesn't trigger here for the same reason as prop-update-shadow above.
       */
      'classname-merge-shadow',
    ],
  });
});

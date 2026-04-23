import { runTestScenarios } from 'react-test-components/scenarios';

describe('Remix SSR Integration', () => {
  runTestScenarios({
    exclude: [
      'complex-props-scoped',
      'style-deduplication-scoped',
      /**
       * Known issue: updating a prop does not trigger a rerender.
       */
      'single-no-child-shadow'],
  });
});

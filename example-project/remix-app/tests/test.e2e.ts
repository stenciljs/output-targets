import { runTestScenarios } from 'react-test-components/scenarios';

describe('Remix SSR Integration', () => {
  runTestScenarios({
    ignoreHydrationMismatchErrors: true,
    exclude: ['complex-props-scoped', 'style-deduplication-scoped'],
  });
});

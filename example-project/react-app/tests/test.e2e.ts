import { runTestScenarios } from 'react-test-components/scenarios';

describe('React Vite SSR Integration', () => {
  runTestScenarios({
    ignoreHydrationMismatchErrors: true,
    exclude: ['transform-scoped-to-shadow', 'style-no-deduplication-scoped'],
  });
});

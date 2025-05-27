import { runTestScenarios } from 'react-test-components/scenarios';

describe('React Vite SSR Integration', () => {
  runTestScenarios({
    exclude: ['transform-scoped-to-shadow']
  })
});

import { getTestScenarios } from 'react-test-components/scenarios';

describe('React Vite SSR Integration', () => {
  getTestScenarios().forEach(([name, test]) => {
    describe(name, test)
  })
});

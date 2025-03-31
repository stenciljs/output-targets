import { getTestScenarios } from 'react-test-components/scenarios';

describe('Remix SSR Integration', () => {
  getTestScenarios().forEach(([name, test]) => {
    describe(name, test)
  })
})
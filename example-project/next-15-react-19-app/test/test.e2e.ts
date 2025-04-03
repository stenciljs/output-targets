import { runTestScenarios } from 'react-test-components/scenarios';

describe('Next 15 React 19 SSR Integration', () => {
  runTestScenarios({
    exclude: [
      'complex-props-scoped',
      'complex-props-shadow',
      'single-children-shadow',
      'nested-shadow'
    ]
  })
})

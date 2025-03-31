import { runTestScenarios } from 'react-test-components/scenarios';

describe('Next.js 14 React 18 SSR Integration', () => {
  runTestScenarios({
    exclude: [
      'complex-props-scoped',
      'complex-props-shadow',
      'single-children-shadow',
      'nested-shadow'
    ]
  })
})

import { runTestScenarios } from 'react-test-components/scenarios';

describe('Next.js 14 React 18 SSR Integration', () => {
  runTestScenarios({
    exclude: [
      /**
       * currently broken in Next.js
       *
       * Problem here is that React doesn't re-render the component at runtime to initate the event handlers.
       */
      'input-scoped'
    ]
  })
})

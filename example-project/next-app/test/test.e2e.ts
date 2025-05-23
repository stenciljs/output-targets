import { runTestScenarios } from 'react-test-components/scenarios';

describe('Next.js 14 React 18 SSR Integration', () => {
  runTestScenarios({
    exclude: [
      /**
       * minor differences with how properties are rendered compared to Next.js v15, e.g.
       *
       * ```patch
       * +     baz="[object Map]"
       *       class="hydrated sc-my-complex-props-h"
       * -     grault="Infinity"
       * +     foo="[object Object]"
       * +     grault="Infinity"
       * +     quux="[object Set]"
       * ```
       */
      'complex-props-scoped',
      'complex-props-shadow',
      /**
       * currently broken in Next.js
       *
       * Problem here is that React doesn't re-render the component at runtime to initate the event handlers.
       */
      'input-scoped'
    ]
  })
})

import { runTestScenarios } from 'react-test-components/scenarios';

describe('React Vite SSR Integration', () => {
  runTestScenarios({
    ignoreHydrationMismatchErrors: true,
    exclude: [
      'transform-scoped-to-shadow',
      'style-no-deduplication-scoped',
      /**
       * The `@stencil/ssr` transform doesn't pass the children of scoped components to Stencil yet (see nested-scoped).
       */
      'nested-light-dom-scoped',
    ],
  });
});

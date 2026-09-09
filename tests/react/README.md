# React Test Components

This package provides primitives to unify tests across all React-based environments, verifying Stencil's integration with React in multiple scenarios—from event handling to server-side rendering. It ensures comprehensive validation of the component library's compatibility and performance.

Note: this package is not published to NPM and used as internal utility for this repository.

The package exports two primitives for test projects to consume:

- a Test Bed: a set of component compositions that allow to create a test scenario, e.g.:
    ```tsx
    import { TestStage } from "react-test-components";

    export default function InputScoped() {
      return (
        <div>
          <TestStage name="input-scoped" />
        </div>
      );
    }
    ```
- a Test Generator: a function that generates a set of tests we expect to work across all React environments
    ```ts
    import { runTestScenarios } from 'react-test-components/scenarios';

    describe('My Example Project', () => {
      runTestScenarios()
    });
    ```

## Add or Update Tests

This package defines a set of [scenarios](./tests/scenarios.ts) that contain one or multiple tests as well as a React component as test bed. If you want to add a test, do the following:

- add a test scenario name to the `testComponents` list in [TestComponent.tsx](./src/TestComponent.tsx)
- enhance the `TestComponent` component to render the appropiate scenario for your test
- add an entry to the `testScenarios` object that makes the test calls for your scenario

## Install

Within one of the [example projects](../../example-project/) add the following to the `devDependency` list:

```json
  "react-test-components": "workspace:*",
```

then run `pnpm install` to properly link the package.

## Setup

Every test scenario has to be rendered in a separate URL, so make sure the React framework renders the right component when opening the test, e.g. in Remix:

```tsx
// app/routes/nested-shadow.tsx
import { TestStage } from "react-test-components";

export default function SingleNoChildScoped() {
  return (
    <div>
      <TestStage name="nested-shadow" />
    </div>
  );
}
```

## Usage

To use this in an example project, make sure it contains a proper WebdriverIO test setup, then create a `test.e2e.tsx` file with the following contents:

```ts
import { runTestScenarios } from 'react-test-components/scenarios';

describe('My Example Project', () => {
  runTestScenarios()
})
```
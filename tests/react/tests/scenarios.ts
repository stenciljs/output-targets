import { assertClientSideErrors } from './helpers'
import { testScenarios as scopedTestScenarios } from './scenarios/scoped'
import { testScenarios as shadowTestScenarios } from './scenarios/shadow'
import { testScenarios as transformedTestScenarios } from './scenarios/transformed'
import type { TestComponent } from '../src/TestComponent'

const testScenarios: Record<TestComponent, () => void> = {
  ...scopedTestScenarios,
  ...shadowTestScenarios,
  ...transformedTestScenarios
}

interface TestScenarioOptions {
  /**
   * If provided, the test will only run the scenarios that are in the array
   * @default []
   */
  only?: TestComponent[]
  /**
   * If provided, the test will skip the scenarios that are in the array
   * @default []
   */
  exclude?: TestComponent[]
  /**
   * If false or unspecified, the test will assert that no hydration errors were logged
   * @default false
   */
  ignoreHydrationMismatchErrors?: boolean
}

export const runTestScenarios = ({ only, exclude, ...opts }: TestScenarioOptions = {}) => {
  const scenarions = (Object.entries(testScenarios) as [TestComponent, () => void][])
    .filter(([key]) => !only || only.includes(key))
    .filter(([key]) => !exclude || !exclude.includes(key))

  /**
   * track all errors that are logged during the tests and assert
   * that no errors were logged
   */
  assertClientSideErrors(!!opts.ignoreHydrationMismatchErrors);

  scenarions.forEach(([name, test]) => {
    describe(name, () => {
      // Set the current test component so assertClientSideErrors can identify known failures
      // We set it in beforeEach and keep it set so afterEach hooks can access it
      beforeEach(() => {
        ;(global as any).__currentTestComponent = name
      })
      test()
      // Note: We don't clear __currentTestComponent here because the afterEach
      // hook in helpers.ts needs to access it, and hooks run in reverse order
    })
  })
}

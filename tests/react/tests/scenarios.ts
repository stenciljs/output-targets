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
  const scenarios = (Object.entries(testScenarios) as [TestComponent, () => void][])
    .filter(([key]) => !only || only.includes(key))
    .filter(([key]) => !exclude || !exclude.includes(key))

  /**
   * track all errors that are logged during the tests and assert
   * that no errors were logged
   */
  assertClientSideErrors(!!opts.ignoreHydrationMismatchErrors)

  scenarios.forEach(([name, test]) => {
    describe(name, test)
  })
}

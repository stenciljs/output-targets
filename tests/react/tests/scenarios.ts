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
   * If true, the test will assert that no client side errors
   * e.g. hydration errors were logged
   * @default true
   */
  assertClientSideErrors?: boolean
}

export const runTestScenarios = ({ only, exclude, ...opts }: TestScenarioOptions = {}) => {
  const scenarions = (Object.entries(testScenarios) as [TestComponent, () => void][])
    .filter(([key]) => !only || only.includes(key))
    .filter(([key]) => !exclude || !exclude.includes(key))

  /**
   * track all errors that are logged during the tests and assert
   * that no errors were logged
   */
  if (typeof opts.assertClientSideErrors !== 'boolean' || opts.assertClientSideErrors) {
    assertClientSideErrors()
  }

  scenarions.forEach(([name, test]) => {
    describe(name, test)
  })
}

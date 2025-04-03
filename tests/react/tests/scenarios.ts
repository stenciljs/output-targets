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
  only?: TestComponent[]
  exclude?: TestComponent[]
}

export const runTestScenarios = ({ only, exclude }: TestScenarioOptions = {}) => {
  const scenarions = (Object.entries(testScenarios) as [TestComponent, () => void][])
    .filter(([key]) => !only || only.includes(key))
    .filter(([key]) => !exclude || !exclude.includes(key))

  /**
   * track all errors that are logged during the tests and assert
   * that no errors were logged
   */
  assertClientSideErrors()

  scenarions.forEach(([name, test]) => {
    describe(name, test)
  })
}

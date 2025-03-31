import type { TestComponent } from '../src/TestComponent'
import { testScenarios as scopedTestScenarios } from './scoped'
import { testScenarios as shadowTestScenarios } from './shadow'
import { testScenarios as transformedTestScenarios } from './transformed'

const testScenarios: Record<TestComponent, () => void> = {
  ...scopedTestScenarios,
  ...shadowTestScenarios,
  ...transformedTestScenarios
}

interface TestScenarioOptions {
  only?: TestComponent[]
  exclude?: TestComponent[]
}

export const getTestScenarios = ({ only, exclude }: TestScenarioOptions = {}) => {
  return (Object.entries(testScenarios) as [TestComponent, () => void][])
    .filter(([key]) => !only || only.includes(key))
    .filter(([key]) => !exclude || !exclude.includes(key))
}
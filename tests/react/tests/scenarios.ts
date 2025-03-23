import type { TestComponent } from '../src/TestComponent'
import { testScenarios as scopedTestScenarios } from './scoped'
import { testScenarios as shadowTestScenarios } from './shadow'

export const testScenarios: Record<TestComponent, () => void> = {
  ...scopedTestScenarios,
  ...shadowTestScenarios
}
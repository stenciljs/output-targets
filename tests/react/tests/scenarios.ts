import { browser } from '@wdio/globals'
import type { local } from 'webdriver'

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

export const runTestScenarios = ({ only, exclude }: TestScenarioOptions = {}) => {
  const scenarions = (Object.entries(testScenarios) as [TestComponent, () => void][])
    .filter(([key]) => !only || only.includes(key))
    .filter(([key]) => !exclude || !exclude.includes(key))

  /**
   * track all errors that are logged during the tests
   */
  const errors: string[] = []
  let removeLogHandler: undefined | (() => void)
  beforeEach(async () => {
    errors.length = 0

    if (removeLogHandler) {
      return
    }
    browser.sessionSubscribe({
      events: ['log.entryAdded']
    })
    const onLogEvent = (entry: local.LogEntry) => {
      if (entry.level === 'error' && entry.text && entry.text !== 'error') {
        errors.push(entry.text)
      }
    }
    browser.on('log.entryAdded', onLogEvent)
    removeLogHandler = () => browser.off('log.entryAdded', onLogEvent)
  })

  scenarions.forEach(([name, test]) => {
    describe(name, test)
  })

  /**
   * Verify that no errors were logged during the tests
   */
  afterEach(() => {
    /**
     * TODO: include all errors once we have fixed the hydration issues
     */
    const nonHydrationErrors = errors.filter((error) => (
      !error.toLowerCase().includes('hydration') &&
      !error.includes('hydrating') &&
      !error.includes('Expected server HTML to contain a matching') &&
      !error.includes('Did not expect server HTML to contain')
    ))
    if (nonHydrationErrors.length > 0) {
      throw new Error(`Errors were logged during the tests:\n  - ${nonHydrationErrors.join('\n  - ')}`)
    }
  })
}
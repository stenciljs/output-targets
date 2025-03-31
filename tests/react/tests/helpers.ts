import { browser } from '@wdio/globals'
import { parse } from 'node-html-parser'
import type { TestComponent } from '../src/TestComponent'

export async function fetchSourceCode (scenario: TestComponent) {
  const url = `${browser.options.baseUrl}/${scenario}`

  try {
    const response = await fetch(url)
    const html = await response.text()
    const root = parse(html)
    const testComponent = root.querySelector(`#${scenario}`)
    if (!testComponent) {
      throw new Error(`Test component ${scenario} not found in document: ${html}`)
    }
    return testComponent
      .toString()
      .replaceAll('\t', '    ')
      .split('\n')
        .map((l) => l.trimEnd())
        .filter((l) => l.length > 0)
        .join('\n');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    throw new Error(`Failed to fetch source code for ${scenario}: ${error.message}`)
  }
}
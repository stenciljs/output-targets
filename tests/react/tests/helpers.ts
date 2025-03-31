import { browser } from '@wdio/globals'
import toDiffableHtml from 'diffable-html'
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
    return toDiffableHtml(
      testComponent
        .toString()
        /**
         * replace parameter like `c-id="4.0.0.0"` to `c-id="x"`
         */
        .replaceAll(/c-id="[^"]*"/g, 'c-id="x"')
        .replaceAll(/s-id="[^"]*"/g, 's-id="x"')
    ).split('\n')
      .filter((l) => !l.includes('suppresshydrationwarning'))
      .join('\n')
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    throw new Error(`Failed to fetch source code for ${scenario}: ${error.message}`)
  }
}


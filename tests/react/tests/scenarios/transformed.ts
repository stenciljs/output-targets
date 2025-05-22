/// <reference types="webdriverio" />
import os from 'node:os'
import { browser, expect, $ } from '@wdio/globals'

import { fetchSourceCode } from '../helpers.js'
import type { TransformedComponents } from '../../src/TestComponent.js'

export const testScenarios: Record<TransformedComponents, () => void> = {
  'transform-scoped-to-shadow': () => {
    it('should server side render component as scoped component', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('transform-scoped-to-shadow')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="transform-scoped-to-shadow">
          <div style="display:contents">
            <style>
              /*!@:host button*/.sc-my-counter-h button.sc-my-counter{padding:5px 10px;font-size:20px;margin:0 10px}/*!@:host span*/.sc-my-counter-h span.sc-my-counter{font-size:20px;margin:0 10px}
            </style>
            <my-counter
              class="hydrated sc-my-counter-h"
              s-id="x"
              start-value="42"
              startvalue="42"
            >
              <div
                c-id="x"
                class="sc-my-counter"
              >
                <button
                  c-id="x"
                  class="sc-my-counter"
                >
                  -
                </button>
                <span
                  c-id="x"
                  class="sc-my-counter"
                >
                  42
                </span>
                <button
                  c-id="x"
                  class="sc-my-counter"
                >
                  +
                </button>
              </div>
            </my-counter>
          </div>
        </div>
        "
      `)
    })

    it('should transform scoped component to shadow component in runtime', async () => {
      await browser.url('/transform-scoped-to-shadow')
      await expect($('my-counter')).toBePresent()
      await expect($('my-counter *')).not.toBePresent()
      await expect($('my-counter').$('span')).toHaveText('42')
    })

    it('should have an interactive component', async () => {
      await browser.url('/transform-scoped-to-shadow')
      await expect($('my-counter').$('span')).toHaveText('42')

      const [minusButton, plusButton] = await $('my-counter').$$('button') as unknown as WebdriverIO.Element[]
      await plusButton.click()
      await plusButton.click()
      await plusButton.click()
      await expect($('my-counter').$('span')).toHaveText('45')
      await minusButton.click()
      await minusButton.click()
      await expect($('my-counter').$('span')).toHaveText('43')
    })
  }
}

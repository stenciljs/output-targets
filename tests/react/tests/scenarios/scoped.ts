/// <reference types="webdriverio" />
import os from 'node:os'
import { browser, expect, $ } from '@wdio/globals'

import { fetchSourceCode } from '../helpers.js'
import type { ScopedComponents } from '../../src/TestComponent.js'

export const testScenarios: Record<ScopedComponents, () => void | undefined> = {
  'single-no-child-scoped': () => {
    it('should correctly server side render', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('single-no-child-scoped')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="single-no-child-scoped">
          <div style="display:contents">
            <style>
              .sc-my-component-scoped-h{display:block;color:green}
            </style>
            <my-component-scoped
              class="hydrated sc-my-component-scoped-h"
              first="John"
              last="Doe"
              middle-name="William"
              s-id="x"
              middlename="William"
            >
              <div
                c-id="x"
                class="sc-my-component-scoped"
              >
                Hello, World! I'm John William Doe
              </div>
            </my-component-scoped>
          </div>
        </div>
        "
      `)
    })

    it('should have correctly hydrated component', async () => {
      await browser.url('/single-no-child-scoped')
      await expect($('my-component-scoped')).toBePresent()
      await expect($('my-component-scoped').$('div')).toHaveText('Hello, World! I\'m John William Doe')
    })

    it('has attached styles correctly', async () => {
      await browser.url('/single-no-child-scoped')
      await expect($('my-component-scoped')).toHaveStyle({ color: 'rgba(0,128,0,1)' })
    })
  },
  'single-children-scoped': () => {
    it('should correctly server side render', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('single-children-scoped')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="single-children-scoped">
          <div style="display:contents">
            <style>
              .sc-my-button-scoped-h{display:block;background-color:green;color:white;font-weight:bold;border-radius:5px;cursor:pointer}slot-fb{display:contents}slot-fb[hidden]{display:none}
            </style>
            <my-button-scoped
              class="button button-outline hydrated my-activatable my-focusable sc-my-button-scoped-h"
              fill="outline"
              s-id="x"
            >
              <button
                c-id="x"
                class="button-native sc-my-button-scoped"
                type="button"
              >
                <span
                  c-id="x"
                  class="button-inner sc-my-button-scoped sc-my-button-scoped-s"
                >
                  Test
                </span>
              </button>
            </my-button-scoped>
          </div>
        </div>
        "
      `)
    })

    it('has attached styles correctly', async () => {
      await browser.url('/single-children-scoped')
      await expect($('my-button-scoped')).toHaveStyle({ backgroundColor: 'rgba(0,128,0,1)' })
    })
  },
  'nested-scoped': () => {
    /**
     * ToDo(Christian): no support for scopped components with children
     *
     * Problem here is that we can't render a scoped content with JSX children, due to the fact that
     * we can't set `dangerouslySetInnerHTML` with JSX children together.
     */
    it.skip('should correctly server side render', async () => {
      const url = `${browser.options.baseUrl}/nested-scoped`
      const response = await fetch(url)
      const html = await response.text()
      expect(html).toContain(`tbd`)
    })
  },
  'complex-props-scoped': () => {
    it('should correctly server side render complex props', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('complex-props-scoped')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="complex-props-scoped">
          <div style="display:contents">
            <style>
            </style>
            <my-complex-props-scoped
              class="hydrated sc-my-complex-props-scoped-h"
              grault="Infinity"
              s-id="x"
            >
              <ul
                c-id="x"
                class="sc-my-complex-props-scoped"
              >
                <li
                  c-id="x"
                  class="sc-my-complex-props-scoped"
                >
                  this.foo.bar: baz
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props-scoped"
                >
                  this.foo.loo: 1, 2, 3
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props-scoped"
                >
                  this.foo.qux: symbol
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props-scoped"
                >
                  this.baz.get('foo'): symbol
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props-scoped"
                >
                  this.quux.has('foo'): true
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props-scoped"
                >
                  this.grault: true
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props-scoped"
                >
                  this.waldo: true
                </li>
              </ul>
            </my-complex-props-scoped>
          </div>
        </div>
        "
      `)
    })

    it('should correctly adopt complex props in runtime', async () => {
      await browser.url('/complex-props-shadow')
      await expect($('my-complex-props')).toBePresent()
      await expect($('my-complex-props').$('ul')).toBePresent()
      await expect($('my-complex-props').$('ul')).toHaveText([
        'this.foo.bar: baz',
        'this.foo.loo: 1, 2, 3',
        'this.foo.qux: symbol',
        'this.baz.get(\'foo\'): symbol',
        'this.quux.has(\'foo\'): true',
        'this.grault: true',
        'this.waldo: true',
      ].join('\n'))
    })
  },
  'input-scoped': () => {
    it('should support React state handler as component parameter', async () => {
      await browser.url('/input-scoped')
      await $('input').setValue('Hello World!')
      await expect($('.inputResult')).toHaveText([
        'Scoped Input Event: Hello World!',
        'Scoped Change Event: Hello World!',
      ].join('\n'))
    })
  }
}
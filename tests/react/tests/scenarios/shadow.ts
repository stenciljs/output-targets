/// <reference types="webdriverio" />
import os from 'os'
import { browser, expect, $ } from '@wdio/globals'

import { fetchSourceCode } from '../helpers.js'
import type { ShadowComponents } from '../../src/TestComponent.js'

export const testScenarios: Record<ShadowComponents, () => void> = {
  'single-no-child-shadow': () => {
    it('should correctly server side render', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('single-no-child-shadow')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="single-no-child-shadow">
          <template
            data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"
            data-msg="..."
          >
          </template>
          <my-component
            class="hydrated sc-my-component-h"
            first="John"
            last="Doe"
            middle-name="William"
            s-id="x"
            middlename="William"
          >
            <template shadowrootmode="open">
              <style>
                :host{display:block;color:green}
              </style>
              <div
                c-id="x"
                class="sc-my-component"
              >
                Hello, World! I'm John William Doe
              </div>
            </template>
          </my-component>
        </div>
        "
      `)
    })

    it('should have correctly hydrated component', async () => {
      await browser.url('/single-no-child-shadow')
      await expect($('my-component')).toBePresent()
      await expect($('my-component').$('div')).toHaveText('Hello, World! I\'m John William Doe')
    })

    it('has attached styles correctly', async () => {
      await browser.url('/single-no-child-scoped')
      await expect($('my-component-scoped')).toHaveStyle({ color: 'rgba(0,128,0,1)' })
    })
  },
  'single-children-shadow': () => {
    it('should correctly server side render', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('single-children-shadow')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="single-children-shadow">
          <template
            data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"
            data-msg="..."
          >
          </template>
          <my-button
            class="button button-outline hydrated my-activatable my-focusable sc-my-button-h"
            fill="outline"
            s-id="x"
          >
            <template shadowrootmode="open">
              <style>
                :host{display:block;background-color:green;color:white;font-weight:bold;border-radius:5px;cursor:pointer}
              </style>
              <button
                c-id="x"
                class="button-native sc-my-button"
                type="button"
              >
                <span
                  c-id="x"
                  class="button-inner sc-my-button"
                >
                  <slot
                    c-id="x"
                    class="sc-my-button"
                    name="icon-only"
                  >
                  </slot>
                  <slot
                    c-id="x"
                    class="sc-my-button"
                    name="start"
                  >
                  </slot>
                  <slot
                    c-id="x"
                    class="sc-my-button"
                  >
                  </slot>
                  <slot
                    c-id="x"
                    class="sc-my-button"
                    name="end"
                  >
                  </slot>
                </span>
              </button>
            </template>
            Test
          </my-button>
        </div>
        "
      `)
    })

    it('has attached styles correctly', async () => {
      await browser.url('/single-children-shadow')
      await expect($('my-button')).toHaveStyle({ backgroundColor: 'rgba(0,128,0,1)' })
    })
  },
  'nested-shadow': () => {
    it('should correctly server side render', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('nested-shadow')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="nested-shadow">
          <template
            data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"
            data-msg="..."
          >
          </template>
          <my-list
            class="hydrated sc-my-list-h"
            s-id="x"
          >
            <template shadowrootmode="open">
              <ul
                c-id="x"
                class="sc-my-list"
              >
                <slot
                  c-id="x"
                  class="sc-my-list"
                >
                </slot>
              </ul>
            </template>
            <template
              data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"
              data-msg="..."
            >
            </template>
            <my-list-item
              class="hydrated sc-my-list-item-h"
              s-id="x"
            >
              <template shadowrootmode="open">
                <li
                  c-id="x"
                  class="sc-my-list-item"
                >
                  <slot
                    c-id="x"
                    class="sc-my-list-item"
                  >
                  </slot>
                </li>
              </template>
              Foo Shadow
            </my-list-item>
            <template
              data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"
              data-msg="..."
            >
            </template>
            <my-list-item
              class="hydrated sc-my-list-item-h"
              s-id="x"
            >
              <template shadowrootmode="open">
                <li
                  c-id="x"
                  class="sc-my-list-item"
                >
                  <slot
                    c-id="x"
                    class="sc-my-list-item"
                  >
                  </slot>
                </li>
              </template>
              Bar Shadow
            </my-list-item>
            <template
              data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"
              data-msg="..."
            >
            </template>
            <my-list-item
              class="hydrated sc-my-list-item-h"
              s-id="x"
            >
              <template shadowrootmode="open">
                <li
                  c-id="x"
                  class="sc-my-list-item"
                >
                  <slot
                    c-id="x"
                    class="sc-my-list-item"
                  >
                  </slot>
                </li>
              </template>
              Loo Shadow
            </my-list-item>
          </my-list>
        </div>
        "
      `)
    })
  },
  'complex-props-shadow': () => {
    it('should correctly server side render complex props', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('complex-props-shadow')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="complex-props-shadow">
          <template
            data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"
            data-msg="..."
          >
          </template>
          <my-complex-props
            class="hydrated sc-my-complex-props-h"
            grault="Infinity"
            s-id="x"
          >
            <template shadowrootmode="open">
              <ul
                c-id="x"
                class="sc-my-complex-props"
              >
                <li
                  c-id="x"
                  class="sc-my-complex-props"
                >
                  this.foo.bar: baz
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props"
                >
                  this.foo.loo: 1, 2, 3
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props"
                >
                  this.foo.qux: symbol
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props"
                >
                  this.baz.get('foo'): symbol
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props"
                >
                  this.quux.has('foo'): true
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props"
                >
                  this.grault: true
                </li>
                <li
                  c-id="x"
                  class="sc-my-complex-props"
                >
                  this.waldo: true
                </li>
              </ul>
            </template>
          </my-complex-props>
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
  'input-shadow': () => {
    it('should support React state handler as component parameter', async () => {
      await browser.url('/input-shadow')
      await $('input').setValue('Hello World!')
      await expect($('.inputResult')).toHaveText([
        'Shadow Input Event: Hello World!',
        'Shadow Change Event: Hello World!',
      ].join('\n'))
    })
  }
}

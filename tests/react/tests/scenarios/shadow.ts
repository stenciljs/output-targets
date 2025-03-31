/// <reference types="webdriverio" />
import { browser, expect, $ } from '@wdio/globals'

import { fetchSourceCode } from '../helpers.js'
import type { ShadowComponents } from '../../src/TestComponent.js'

export const testScenarios: Record<ShadowComponents, () => void> = {
  'single-no-child-shadow': () => {
    it('should correctly server side render', async () => {
      const html = await fetchSourceCode('single-no-child-shadow')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="single-no-child-shadow">
          <my-component
            class="hydrated"
            first="John"
            last="Doe"
            middle-name="William"
            s-id="x"
          >
            <template shadowrootmode="open">
              <style>
                :host{display:block;color:green}
              </style>
              <div c-id="x">
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
    it('should correctly server side render', async () => {
      const html = await fetchSourceCode('single-children-shadow')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="single-children-shadow">
          <my-button
            class="button button-outline hydrated my-activatable my-focusable"
            fill="outline"
            s-id="x"
          >
            <template shadowrootmode="open">
              <style>
                :host{display:block;background-color:green;color:white;font-weight:bold;border-radius:5px;cursor:pointer}
              </style>
              <button
                c-id="x"
                class="button-native"
                type="button"
              >
                <span
                  c-id="x"
                  class="button-inner"
                >
                  <slot
                    c-id="x"
                    name="icon-only"
                  >
                  </slot>
                  <slot
                    c-id="x"
                    name="start"
                  >
                  </slot>
                  <slot c-id="x">
                  </slot>
                  <slot
                    c-id="x"
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
    it('should correctly server side render', async () => {
      const html = await fetchSourceCode('nested-shadow')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="nested-shadow">
          <my-list
            class="hydrated"
            s-id="x"
          >
            <template shadowrootmode="open">
              <ul c-id="x">
                <slot c-id="x">
                </slot>
              </ul>
            </template>
            <my-list-item
              class="hydrated"
              s-id="x"
            >
              <template shadowrootmode="open">
                <li c-id="x">
                  <slot c-id="x">
                  </slot>
                </li>
              </template>
              Foo Shadow
            </my-list-item>
            <my-list-item
              class="hydrated"
              s-id="x"
            >
              <template shadowrootmode="open">
                <li c-id="x">
                  <slot c-id="x">
                  </slot>
                </li>
              </template>
              Bar Shadow
            </my-list-item>
            <my-list-item
              class="hydrated"
              s-id="x"
            >
              <template shadowrootmode="open">
                <li c-id="x">
                  <slot c-id="x">
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
    it('should correctly server side render complex props', async () => {
      const html = await fetchSourceCode('complex-props-shadow')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="complex-props-shadow">
          <my-complex-props
            baz="serialized:eyJ0eXBlIjoibWFwIiwidmFsdWUiOltbeyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJmb28ifSx7InR5cGUiOiJvYmplY3QiLCJ2YWx1ZSI6W1sicXV4Iix7InR5cGUiOiJzeW1ib2wiLCJ2YWx1ZSI6InF1dXgifV1dfV1dfQ=="
            class="hydrated"
            foo="serialized:eyJ0eXBlIjoib2JqZWN0IiwidmFsdWUiOltbImJhciIseyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJiYXoifV0sWyJsb28iLHsidHlwZSI6ImFycmF5IiwidmFsdWUiOlt7InR5cGUiOiJudW1iZXIiLCJ2YWx1ZSI6MX0seyJ0eXBlIjoibnVtYmVyIiwidmFsdWUiOjJ9LHsidHlwZSI6Im51bWJlciIsInZhbHVlIjozfV19XSxbInF1eCIseyJ0eXBlIjoib2JqZWN0IiwidmFsdWUiOltbInF1dXgiLHsidHlwZSI6InN5bWJvbCIsInZhbHVlIjoicXV1eCJ9XV19XV19"
            grault="serialized:eyJ0eXBlIjoibnVtYmVyIiwidmFsdWUiOiJJbmZpbml0eSJ9"
            quux="serialized:eyJ0eXBlIjoic2V0IiwidmFsdWUiOlt7InR5cGUiOiJzdHJpbmciLCJ2YWx1ZSI6ImZvbyJ9LHsidHlwZSI6InN0cmluZyIsInZhbHVlIjoiYmFyIn0seyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJiYXoifV19"
            s-id="x"
            waldo="serialized:eyJ0eXBlIjoibnVsbCJ9"
          >
            <template shadowrootmode="open">
              <ul c-id="x">
                <li c-id="x">
                  this.foo.bar: baz
                </li>
                <li c-id="x">
                  this.foo.loo: 1, 2, 3
                </li>
                <li c-id="x">
                  this.foo.qux: symbol
                </li>
                <li c-id="x">
                  this.baz.get('foo'): symbol
                </li>
                <li c-id="x">
                  this.quux.has('foo'): true
                </li>
                <li c-id="x">
                  this.grault: true
                </li>
                <li c-id="x">
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

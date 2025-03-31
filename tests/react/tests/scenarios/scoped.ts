/// <reference types="webdriverio" />
import { browser, expect, $ } from '@wdio/globals'

import { fetchSourceCode } from '../helpers.js'
import type { ScopedComponents } from '../../src/TestComponent.js'

export const testScenarios: Record<ScopedComponents, () => void | undefined> = {
  'single-no-child-scoped': () => {
    it('should correctly server side render', async () => {
      const html = await fetchSourceCode('single-no-child-scoped')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="single-no-child-scoped">
          <my-component-scoped
            class="hydrated sc-my-component-scoped-h"
            first="John"
            last="Doe"
            middle-name="William"
            s-id="x"
          >
            <div
              c-id="x"
              class="sc-my-component-scoped"
            >
              Hello, World! I'm John William Doe
            </div>
          </my-component-scoped>
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
    it('should correctly server side render', async () => {
      const html = await fetchSourceCode('single-children-scoped')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="single-children-scoped">
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
     */
    it.skip('should correctly server side render', async () => {
      const url = `${browser.options.baseUrl}/nested-scoped`
      const response = await fetch(url)
      const html = await response.text()
      expect(html).toContain(`tbd`)
    })
  },
  'complex-props-scoped': () => {
    it('should correctly server side render complex props', async () => {
      const html = await fetchSourceCode('complex-props-scoped')
      expect(html).toMatchInlineSnapshot(`
        "
        <div id="complex-props-scoped">
          <my-complex-props-scoped
            baz="serialized:eyJ0eXBlIjoibWFwIiwidmFsdWUiOltbeyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJmb28ifSx7InR5cGUiOiJvYmplY3QiLCJ2YWx1ZSI6W1sicXV4Iix7InR5cGUiOiJzeW1ib2wiLCJ2YWx1ZSI6InF1dXgifV1dfV1dfQ=="
            class="hydrated sc-my-complex-props-scoped-h"
            foo="serialized:eyJ0eXBlIjoib2JqZWN0IiwidmFsdWUiOltbImJhciIseyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJiYXoifV0sWyJsb28iLHsidHlwZSI6ImFycmF5IiwidmFsdWUiOlt7InR5cGUiOiJudW1iZXIiLCJ2YWx1ZSI6MX0seyJ0eXBlIjoibnVtYmVyIiwidmFsdWUiOjJ9LHsidHlwZSI6Im51bWJlciIsInZhbHVlIjozfV19XSxbInF1eCIseyJ0eXBlIjoib2JqZWN0IiwidmFsdWUiOltbInF1dXgiLHsidHlwZSI6InN5bWJvbCIsInZhbHVlIjoicXV1eCJ9XV19XV19"
            grault="serialized:eyJ0eXBlIjoibnVtYmVyIiwidmFsdWUiOiJJbmZpbml0eSJ9"
            quux="serialized:eyJ0eXBlIjoic2V0IiwidmFsdWUiOlt7InR5cGUiOiJzdHJpbmciLCJ2YWx1ZSI6ImZvbyJ9LHsidHlwZSI6InN0cmluZyIsInZhbHVlIjoiYmFyIn0seyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJiYXoifV19"
            s-id="x"
            waldo="serialized:eyJ0eXBlIjoibnVsbCJ9"
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
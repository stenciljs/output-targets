/// <reference types="webdriverio" />
import { browser, expect, $ } from '@wdio/globals'
import type { ShadowComponents } from '../src/TestComponent'

export const testScenarios: Record<ShadowComponents, () => void> = {
  'single-no-child-shadow': () => {
    it('should correctly server side render', async () => {
      const url = `${browser.options.baseUrl}/single-no-child-shadow`
      const response = await fetch(url)
      const html = await response.text()
      expect(html).toContain(`<my-component class=\"hydrated\" first=\"John\" last=\"Doe\" middle-name=\"William\" s-id=\"1\"><template shadowrootmode=\"open\">    <style>
      :host{display:block;color:green}
    </style>
    <div c-id=\"1.0.0.0\">
      <!--t.1.1.1.0-->
      Hello, World! I'm John William Doe
    </div></template></my-component>`)
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
      const url = `${browser.options.baseUrl}/single-children-shadow`
      const response = await fetch(url)
      const html = await response.text()
      expect(html).toContain(`<my-button class=\"button button-outline hydrated my-activatable my-focusable\" fill=\"outline\" s-id=\"3\"><template shadowrootmode=\"open\">    <style>
      :host{display:block;background-color:green;color:white;font-weight:bold;border-radius:5px;cursor:pointer}
    </style>
    <button c-id=\"3.0.0.0\" class=\"button-native\" type=\"button\">
      <span c-id=\"3.1.1.0\" class=\"button-inner\">
        <slot c-id=\"3.2.2.0\" name=\"icon-only\"></slot>
        <slot c-id=\"3.3.2.1\" name=\"start\"></slot>
        <slot c-id=\"3.4.2.2\"></slot>
        <slot c-id=\"3.5.2.3\" name=\"end\"></slot>
      </span>
    </button></template>Test</my-button>`)
    })

    it('has attached styles correctly', async () => {
      await browser.url('/single-children-shadow')
      await expect($('my-button')).toHaveStyle({ backgroundColor: 'rgba(0,128,0,1)' })
    })
  },
  'nested-shadow': () => {
    it('should correctly server side render', async () => {
      const url = `${browser.options.baseUrl}/nested-shadow`
      const response = await fetch(url)
      const html = await response.text()
      expect(html).toContain(`<my-list class=\"hydrated\" s-id=\"5\"><template shadowrootmode=\"open\">    <ul c-id=\"5.0.0.0\">
      <slot c-id=\"5.1.1.0\"></slot>
    </ul></template><my-list-item class=\"hydrated\" s-id=\"6\"><template shadowrootmode=\"open\">    <li c-id=\"6.0.0.0\">
      <slot c-id=\"6.1.1.0\"></slot>
    </li></template>Foo Shadow</my-list-item><my-list-item class=\"hydrated\" s-id=\"7\"><template shadowrootmode=\"open\">    <li c-id=\"7.0.0.0\">
      <slot c-id=\"7.1.1.0\"></slot>
    </li></template>Bar Shadow</my-list-item><my-list-item class=\"hydrated\" s-id=\"8\"><template shadowrootmode=\"open\">    <li c-id=\"8.0.0.0\">
      <slot c-id=\"8.1.1.0\"></slot>`)
    })
  },
  'complex-props-shadow': () => {
    it('should correctly server side render complex props', async () => {
      const url = `${browser.options.baseUrl}/complex-props-shadow`
      const response = await fetch(url)
      const html = await response.text()
      expect(html).toContain(`<div id=\"complex-props-shadow\"><my-complex-props baz=\"serialized:eyJ0eXBlIjoibWFwIiwidmFsdWUiOltbeyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJmb28ifSx7InR5cGUiOiJvYmplY3QiLCJ2YWx1ZSI6W1sicXV4Iix7InR5cGUiOiJzeW1ib2wiLCJ2YWx1ZSI6InF1dXgifV1dfV1dfQ==\" class=\"hydrated\" foo=\"serialized:eyJ0eXBlIjoib2JqZWN0IiwidmFsdWUiOltbImJhciIseyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJiYXoifV0sWyJsb28iLHsidHlwZSI6ImFycmF5IiwidmFsdWUiOlt7InR5cGUiOiJudW1iZXIiLCJ2YWx1ZSI6MX0seyJ0eXBlIjoibnVtYmVyIiwidmFsdWUiOjJ9LHsidHlwZSI6Im51bWJlciIsInZhbHVlIjozfV19XSxbInF1eCIseyJ0eXBlIjoib2JqZWN0IiwidmFsdWUiOltbInF1dXgiLHsidHlwZSI6InN5bWJvbCIsInZhbHVlIjoicXV1eCJ9XV19XV19\" grault=\"serialized:eyJ0eXBlIjoibnVtYmVyIiwidmFsdWUiOiJJbmZpbml0eSJ9\" quux=\"serialized:eyJ0eXBlIjoic2V0IiwidmFsdWUiOlt7InR5cGUiOiJzdHJpbmciLCJ2YWx1ZSI6ImZvbyJ9LHsidHlwZSI6InN0cmluZyIsInZhbHVlIjoiYmFyIn0seyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJiYXoifV19\" s-id=\"14\" waldo=\"serialized:eyJ0eXBlIjoibnVsbCJ9\"><template shadowrootmode=\"open\">    <ul c-id=\"14.0.0.0\">
      <li c-id=\"14.1.1.0\">
        <!--t.14.2.2.0-->
        this.foo.bar: baz
      </li>
      <li c-id=\"14.3.1.1\">
        <!--t.14.4.2.0-->
        this.foo.loo: 1, 2, 3
      </li>
      <li c-id=\"14.5.1.2\">
        <!--t.14.6.2.0-->
        this.foo.qux: symbol
      </li>
      <li c-id=\"14.7.1.3\">
        <!--t.14.8.2.0-->
        this.baz.get('foo'): symbol
      </li>
      <li c-id=\"14.9.1.4\">
        <!--t.14.10.2.0-->
        this.quux.has('foo'): true
      </li>
      <li c-id=\"14.11.1.5\">
        <!--t.14.12.2.0-->
        this.grault: true
      </li>
      <li c-id=\"14.13.1.6\">
        <!--t.14.14.2.0-->
        this.waldo: true
      </li>
    </ul></template></my-complex-props></div>`)
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
  }
}
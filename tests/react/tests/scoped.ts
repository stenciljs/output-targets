/// <reference types="webdriverio" />
import { browser, expect, $ } from '@wdio/globals'
import type { ScopedComponents } from '../src/TestComponent'

export const testScenarios: Record<ScopedComponents, () => void | undefined> = {
  'single-no-child-scoped': () => {
    it('should correctly server side render', async () => {
      const url = `${browser.options.baseUrl}/single-no-child-scoped`
      const response = await fetch(url)
      const html = await response.text()
      expect(html).toContain(`<my-component-scoped class=\"hydrated sc-my-component-scoped-h\" first=\"John\" last=\"Doe\" middle-name=\"William\" s-id=\"2\"><!--r.2-->
  <div c-id=\"2.0.0.0\" class=\"sc-my-component-scoped\">
    <!--t.2.1.1.0-->
    Hello, World! I'm John William Doe
  </div></my-component-scoped>`)
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
      const url = `${browser.options.baseUrl}/single-children-scoped`
      const response = await fetch(url)
      const html = await response.text()
      expect(html).toContain(`<my-button-scoped class=\"button button-outline hydrated my-activatable my-focusable sc-my-button-scoped-h\" fill=\"outline\" s-id=\"4\"><!--r.4-->
  <!--o.0.1.c-->
  <button c-id=\"4.0.0.0\" class=\"button-native sc-my-button-scoped\" type=\"button\">
    <span c-id=\"4.1.1.0\" class=\"button-inner sc-my-button-scoped sc-my-button-scoped-s\">
      <!--s.4.2.2.0.icon-only-->
      <!--s.4.3.2.1.start-->
      <!--s.4.4.2.2.-->
      <!--t.0.1-->
      Test
      <!--s.4.5.2.3.end-->
    </span>
  </button></my-button-scoped>`)
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
      const url = `${browser.options.baseUrl}/complex-props-scoped`
      const response = await fetch(url)
      const html = await response.text()
      expect(html).toContain(`<div id=\"complex-props-scoped\"><my-complex-props-scoped baz=\"serialized:eyJ0eXBlIjoibWFwIiwidmFsdWUiOltbeyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJmb28ifSx7InR5cGUiOiJvYmplY3QiLCJ2YWx1ZSI6W1sicXV4Iix7InR5cGUiOiJzeW1ib2wiLCJ2YWx1ZSI6InF1dXgifV1dfV1dfQ==\" class=\"hydrated sc-my-complex-props-scoped-h\" foo=\"serialized:eyJ0eXBlIjoib2JqZWN0IiwidmFsdWUiOltbImJhciIseyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJiYXoifV0sWyJsb28iLHsidHlwZSI6ImFycmF5IiwidmFsdWUiOlt7InR5cGUiOiJudW1iZXIiLCJ2YWx1ZSI6MX0seyJ0eXBlIjoibnVtYmVyIiwidmFsdWUiOjJ9LHsidHlwZSI6Im51bWJlciIsInZhbHVlIjozfV19XSxbInF1eCIseyJ0eXBlIjoib2JqZWN0IiwidmFsdWUiOltbInF1dXgiLHsidHlwZSI6InN5bWJvbCIsInZhbHVlIjoicXV1eCJ9XV19XV19\" grault=\"serialized:eyJ0eXBlIjoibnVtYmVyIiwidmFsdWUiOiJJbmZpbml0eSJ9\" quux=\"serialized:eyJ0eXBlIjoic2V0IiwidmFsdWUiOlt7InR5cGUiOiJzdHJpbmciLCJ2YWx1ZSI6ImZvbyJ9LHsidHlwZSI6InN0cmluZyIsInZhbHVlIjoiYmFyIn0seyJ0eXBlIjoic3RyaW5nIiwidmFsdWUiOiJiYXoifV19\" s-id=\"15\" waldo=\"serialized:eyJ0eXBlIjoibnVsbCJ9\"><!--r.15-->
  <ul c-id=\"15.0.0.0\" class=\"sc-my-complex-props-scoped\">
    <li c-id=\"15.1.1.0\" class=\"sc-my-complex-props-scoped\">
      <!--t.15.2.2.0-->
      this.foo.bar: baz
    </li>
    <li c-id=\"15.3.1.1\" class=\"sc-my-complex-props-scoped\">
      <!--t.15.4.2.0-->
      this.foo.loo: 1, 2, 3
    </li>
    <li c-id=\"15.5.1.2\" class=\"sc-my-complex-props-scoped\">
      <!--t.15.6.2.0-->
      this.foo.qux: symbol
    </li>
    <li c-id=\"15.7.1.3\" class=\"sc-my-complex-props-scoped\">
      <!--t.15.8.2.0-->
      this.baz.get('foo'): symbol
    </li>
    <li c-id=\"15.9.1.4\" class=\"sc-my-complex-props-scoped\">
      <!--t.15.10.2.0-->
      this.quux.has('foo'): true
    </li>
    <li c-id=\"15.11.1.5\" class=\"sc-my-complex-props-scoped\">
      <!--t.15.12.2.0-->
      this.grault: true
    </li>
    <li c-id=\"15.13.1.6\" class=\"sc-my-complex-props-scoped\">
      <!--t.15.14.2.0-->
      this.waldo: true
    </li>
  </ul></my-complex-props-scoped>`)
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
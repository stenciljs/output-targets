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
  }
}
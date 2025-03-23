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
  }
}
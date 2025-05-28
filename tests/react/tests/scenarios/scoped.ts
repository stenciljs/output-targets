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
      expect(html).toMatchSnapshot()
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
      expect(html).toMatchSnapshot()
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
      expect(html).toMatchSnapshot()
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
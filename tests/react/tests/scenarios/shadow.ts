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
      expect(html).toMatchSnapshot()
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
      expect(html).toMatchSnapshot()
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
      expect(html).toMatchSnapshot()
    })
  },
  'complex-props-shadow': () => {
    it('should correctly server side render complex props', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('complex-props-shadow')
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
  'input-shadow': () => {
    it('should support React state handler as component parameter', async () => {
      await browser.url('/input-shadow')
      await $('input').setValue('Hello World!')
      await expect($('.inputResult')).toHaveText([
        'Shadow Input Event: Hello World!',
        'Shadow Change Event: Hello World!',
      ].join('\n'))
    })
  },
  'my-button-shadow': () => {
    it('should render without errors', async () => {
      await browser.url('/my-button-shadow')
      await expect($('my-button')).toBePresent()
    })
  },
  'my-checkbox-shadow': () => {
    it('should render without errors', async () => {
      await browser.url('/my-checkbox-shadow')
      await expect($('my-checkbox')).toBePresent()
    })
  },
  'my-component-shadow': () => {
    it('should render without errors', async () => {
      await browser.url('/my-component-shadow')
      await expect($('my-component')).toBePresent()
    })
  },
  'my-counter-shadow': () => {
    it('should render without errors', async () => {
      await browser.url('/my-counter-shadow')
      await expect($('my-counter')).toBePresent()
    })
  },
  'my-list-shadow': () => {
    it('should render without errors', async () => {
      await browser.url('/my-list-shadow')
      await expect($('my-list')).toBePresent()
    })
  },
  'my-range-shadow': () => {
    it('should render without errors', async () => {
      await browser.url('/my-range-shadow')
      await expect($('my-range')).toBePresent()
    })
  },
  'my-toggle-shadow': () => {
    it('should render without errors', async () => {
      await browser.url('/my-toggle-shadow')
      await expect($('my-toggle')).toBePresent()
    })
  },
}

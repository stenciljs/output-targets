/// <reference types="webdriverio" />
import os from 'node:os'
import { browser, expect, $ } from '@wdio/globals'

import { fetchSourceCode, fetchFullPageHtml } from '../helpers.js'
import type { TransformedComponents } from '../../src/TestComponent.js'

export const testScenarios: Record<TransformedComponents, () => void> = {
  'transform-scoped-to-shadow': () => {
    it('should server side render component as scoped component', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('transform-scoped-to-shadow')
      expect(html).toMatchSnapshot()
    })

    it('should transform scoped component to shadow component in runtime', async () => {
      await browser.url('/transform-scoped-to-shadow')
      await expect($('my-counter')).toBePresent()
      await expect($('my-counter *')).not.toBePresent()
      await expect($('my-counter').$('span')).toHaveText('42')
    })

    it('should have an interactive component', async () => {
      await browser.url('/transform-scoped-to-shadow')
      await expect($('my-counter').$('span')).toHaveText('42')

      const [minusButton, plusButton] = await $('my-counter').$$('button') as unknown as WebdriverIO.Element[]
      await plusButton.click()
      await plusButton.click()
      await plusButton.click()
      await expect($('my-counter').$('span')).toHaveText('45')
      await minusButton.click()
      await minusButton.click()
      await expect($('my-counter').$('span')).toHaveText('43')
    })
  },
  'transform-tag-test': () => {
    it('should transform tag names correctly', async () => {
      await browser.url('/transform-tag-test')

      // The my-transform-test component should be transformed to v1-my-transform-test
      const transformedElement = $('v1-my-transform-test')
      await expect(transformedElement).toBePresent()

      // Verify the original tag name is NOT in the DOM
      const originalElement = $('my-transform-test')
      await expect(originalElement).not.toBePresent()

      // Verify the component renders correctly with the transformed tag
      await expect(transformedElement).toHaveText(expect.stringContaining('Tag transformation test'))
    })

    it('should server side render with transformed tag', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('transform-tag-test')
      // Verify the SSR HTML contains the transformed tag
      expect(html).toContain('v1-my-transform-test')
      // Verify the SSR HTML does NOT contain the original tag
      expect(html).not.toContain('<my-transform-test')
    })
  },
  'style-deduplication-scoped': () => {
    it('should server side render component with style tags and precedence attributes', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('style-deduplication-scoped')
      expect(html).toMatchSnapshot()
    })

    it('should have precedence attributes in SSR HTML', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchFullPageHtml('style-deduplication-scoped')
      // Verify precedence attributes are present
      expect(html).toContain('precedence="stencil"')
    })

    it('should have stencil-prefixed href attributes', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchFullPageHtml('style-deduplication-scoped')
      // Verify href attributes are prefixed with stencil-
      expect(html).toMatch(/href="stencil-[^"]*"/)
    })

    it('should render as scoped component with style tags', async () => {
      await browser.url('/style-deduplication-scoped')
      const html = await fetchFullPageHtml('style-deduplication-scoped')

      const styleTagMatches = html.match(/<style[^>]*data-precedence="stencil"[^>]*>/gi)
      expect(styleTagMatches?.length).toBe(1)
    })

    it('should deduplicate styles for multiple component instances', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchFullPageHtml('style-deduplication-scoped')

      // All scoped styles should be combined into a single <style> tag
      const styleTagMatches = html.match(/<style[^>]*data-precedence="stencil"[^>]*>/gi)
      expect(styleTagMatches?.length).toBe(1)

      // The single style tag should reference all components in its data-href
      const components = ['my-counter', 'my-button', 'my-component', 'my-radio']
      const styleTag = styleTagMatches![0]
      for (const component of components) {
        expect(styleTag).toMatch(new RegExp(`stencil(-sc)?-${component}`))

        // Each component should still have 3 instances
        const componentMatches = html.match(new RegExp(`<${component}[^>]*s-id="\\d+"[^>]*>`, 'gi'))
        expect(componentMatches?.length).toBe(3)
      }
    })
  },
  'style-no-deduplication-scoped': () => {
    it('should server side render component with style tags and precedence attributes', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('style-no-deduplication-scoped')
      expect(html).toMatchSnapshot()
    })

    it('should NOT deduplicate styles in React 18 without Next.js', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchFullPageHtml('style-no-deduplication-scoped')
      const components = ['my-counter', 'my-button', 'my-component', 'my-radio']

      for (const component of components) {
        const styleTagMatches = html.match(
          new RegExp(
            `<style(?=[^>]*(?:data-)?href="stencil-${component}")(?=[^>]*(?:data-)?precedence="stencil")[^>]*>`,
            'gi'
          )
        )
        const styleTagCount = styleTagMatches ? styleTagMatches.length : 0

        const componentMatches = html.match(new RegExp(`<${component}[^>]*s-id="\\d+"[^>]*>`, 'gi'))
        const componentCount = componentMatches ? componentMatches.length : 0

        expect(styleTagCount).toBe(3)
        expect(componentCount).toBe(3)
      }
    })
  },
}

/// <reference types="webdriverio" />
import os from 'os'
import { browser, expect, $ } from '@wdio/globals'
import { parse, type HTMLElement as ParsedElement } from 'node-html-parser'

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
  'prop-update-shadow': () => {
    it('should update rendered text when prop changes', async () => {
      await browser.url('/single-no-child-shadow')
      await browser.execute((el: any) => { el.middleName = 'Test'; }, await $('my-component'))
      await expect($('my-component').$('div')).toHaveText("Hello, World! I'm John Test Doe")
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
  'checkbox-shadow': () => {
    it('should correctly server side render', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }

      const html = await fetchSourceCode('checkbox-shadow')
      expect(html).toMatchSnapshot()
    })

    it('should have correctly hydrated component', async () => {
      await browser.url('/checkbox-shadow')
      await expect($('my-checkbox')).toBePresent()
    })

    it('should focus the inner input when setFocus is called', async function () {
      if (os.platform() === 'win32') {
        return this.skip()
      }
      await browser.url('/checkbox-shadow')
      await browser.execute((el: any) => el.setFocus(), await $('my-checkbox'))
      const isFocused = await browser.execute(() => {
        const el = document.querySelector('my-checkbox') as any
        return el?.shadowRoot?.activeElement?.tagName.toLowerCase() === 'input'
      })
      expect(isFocused).toBe(true)
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
  'named-slot-shadow': () => {
    /**
     * A browser only assigns the direct children of a shadow host to a slot, so whatever carries
     * the `slot` attribute has to be a direct child of the host. These tests make sure this holds
     * for Stencil components passed to a named slot, not just for plain elements. The scenario
     * uses `my-component` (serialized as `scoped`) and `my-list-item` (serialized as declarative
     * shadow DOM), as both kinds of components are rendered through a different wrapper.
     */
    const getAssignedElements = () =>
      browser.execute(() => {
        const root = document.querySelector('my-card')!.shadowRoot!
        const describeSlot = (selector: string) =>
          (root.querySelector(selector) as HTMLSlotElement)
            .assignedElements()
            // the slotted component may be wrapped, so look for it inside the assigned element too
            .map((el) => {
              const component = el.matches('my-component, my-list-item') ? el : el.querySelector('my-component, my-list-item')
              return (component ?? el).tagName.toLowerCase()
            })
        return {
          start: describeSlot('slot[name="start"]'),
          default: describeSlot('slot:not([name])'),
          end: describeSlot('slot[name="end"]'),
        }
      })

    it('should server side render slotted children as direct children of the host', async () => {
      const response = await fetch(`${browser.options.baseUrl}/named-slot-shadow`)
      const host = parse(await response.text()).querySelector('my-card')
      const slots = (host?.childNodes ?? [])
        .filter((node) => node.nodeType === 1)
        .map((node) => (node as ParsedElement).getAttribute('slot'))
        .filter(Boolean)
        .sort()

      // `start` is used by the scoped component and the plain element, `end` by the shadow component
      expect(slots).toEqual(['end', 'start', 'start'])
    })

    it('should assign a scoped serialized Stencil component and a plain element to the named slot', async () => {
      await browser.url('/named-slot-shadow')
      await expect($('my-component')).toBePresent()
      expect((await getAssignedElements()).start).toEqual(['my-component', 'span'])
    })

    it('should assign a shadow serialized Stencil component to the named slot', async () => {
      await browser.url('/named-slot-shadow')
      await expect($('my-list-item')).toBePresent()
      expect((await getAssignedElements()).end).toEqual(['my-list-item'])
    })

    it('should only assign the default content to the default slot', async () => {
      await browser.url('/named-slot-shadow')
      await expect($('my-card')).toBePresent()
      expect((await getAssignedElements()).default).toEqual(['p'])
    })
  },
  'my-toggle-shadow': () => {
    it('should render without errors', async () => {
      await browser.url('/my-toggle-shadow')
      await expect($('my-toggle')).toBePresent()
    })
  },
  'classname-merge-shadow': () => {
    it('should merge app className with runtime-managed host classes', async () => {
      await browser.url('/classname-merge-shadow')
      const checkbox = $('my-checkbox')
      await expect(checkbox).toBePresent()

      // The Stencil runtime manages these classes on the host.
      await expect(checkbox).toHaveElementClass(expect.stringContaining('hydrated'))
      await expect(checkbox).toHaveElementClass(expect.stringContaining('interactive'))

      // Apply the validation classes the way a form library would (via className).
      await $('.apply-classes').click()
      await browser.waitUntil(async () => ((await checkbox.getAttribute('class')) ?? '').includes('ion-invalid'))

      // App-supplied classes coexist with the runtime-managed classes.
      const appliedClass = await checkbox.getAttribute('class')
      expect(appliedClass).toContain('ion-invalid')
      expect(appliedClass).toContain('ion-touched')
      expect(appliedClass).toContain('hydrated')
      expect(appliedClass).toContain('interactive')

      // Dropping the className removes only the app classes, not the runtime ones.
      await $('.remove-classes').click()
      await browser.waitUntil(async () => !((await checkbox.getAttribute('class')) ?? '').includes('ion-invalid'))

      const removedClass = await checkbox.getAttribute('class')
      expect(removedClass).not.toContain('ion-invalid')
      expect(removedClass).not.toContain('ion-touched')
      expect(removedClass).toContain('hydrated')
      expect(removedClass).toContain('interactive')
    })
  },
}

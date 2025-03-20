/// <reference types="webdriverio" />
import type { Browser as PuppeteerBrowser } from 'puppeteer-core';
import { $, browser, expect } from '@wdio/globals';

describe('Stencil NextJS Integration', () => {
  before(() => browser.url('/'));

  it.skip('should have hydrated the page', async () => {
    /**
     * to capture the response from the server we have
     * to use Puppeteer for now until this lands in WebDriver Bidi
     * @see https://github.com/w3c/webdriver-bidi/pull/856
     */
    const pptr = await browser.getPuppeteer() as PuppeteerBrowser
    const page = (await pptr.pages()).find((p) => p.url() === 'about:blank')
    if (!page) {
      throw new Error('Page not found')
    }
    const source = page.waitForResponse('http://localhost:5002/');
    await browser.url('/')
    const html = await (await source).text()
    expect(html).toContain(`Hello, World! I'm Don't 😉 call me a framework`)
    expect(html).toContain('Kids: John, Jane')
    expect(html).toContain('class="sc-my-counter"')
  });

  it('should allow to interact with input element', async () => {
    /**
     * Clicking on the body is required to trigger the hydration of the input element
     * This is a workaround for a bug in the Stencil SSR plugin
     */
    await $('body').click();

    await $('my-input').$('input').setValue('Hello World');
    await expect($('.inputResult')).toHaveText('Input Event: Hello World\nChange Event: Hello World');
  });

  it('should allow to interact with button element', async () => {
    await $('my-button').click();
    await $('my-button').click();
    await expect($('.buttonResult')).toHaveText('Input Event: 2');
  });

  it('should transform react properties into html attributes', async () => {
    await expect($('my-component.my-8')).toBePresent();
  });

  it('should transform camelCase into kebab-case', async () => {
    await expect($('my-component[favorite-kid-name="foobar"]')).toBePresent();
  });

  it('should propagate custom element styles', async () => {
    await expect($('my-component')).toHaveStyle({ backgroundColor: 'rgba(255,0,0,1)' });
  });
});

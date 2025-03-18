/// <reference types="webdriverio" />
import { expect, $, $$, browser } from '@wdio/globals';
import type { Browser as PuppeteerBrowser } from 'puppeteer-core';

describe('Stencil NextJS Integration', () => {
  it('should have hydrated component', async () => {
    /**
     * to capture the response from the server we have
     * to use Puppeteer for now until this lands in WebDriver Bidi
     * @see https://github.com/w3c/webdriver-bidi/pull/856
     */
    const pptr = await browser.getPuppeteer() as PuppeteerBrowser
    const page = (await pptr.pages()).find((p) => {
      console.log(p.url());
      return p.url() === 'about:blank'
    })
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
    await $('my-input').$('input').setValue('Hello World');
    await browser.pause(100);
    await expect(await $$('div[data-testid="inputCheck"] > p').map((p) => p.getText())).toEqual([
      'Input Event: Hello World',
      'Change Event: Hello World'
    ]);
  });

  /**
   * calling browser.getPageSource() will return the current `innerHTML` of the page. If the Stencil
   * runtime is properly able to convert the scoped component back to a shadow component, we should
   * see that it renders its children within the shadow root which is no accessible through `innerHTML`.
   */
  it('transforms shadow components rendered as scoped components back to shadow components', async () => {
    const pageSource = await browser.getPageSource()
    expect(pageSource).toContain('<my-counter class="hydrated"></my-counter>')
  });

  it('can interact with transformed components', async () => {
    const [minus, plus] = await $('my-counter').$$('button')
    await plus.click()
    await plus.click()
    await plus.click()
    await expect($('my-counter').$('span')).toHaveText('3')

    await minus.click()
    await minus.click()
    await minus.click()
    await expect($('my-counter').$('span')).toHaveText('0')
  })
});

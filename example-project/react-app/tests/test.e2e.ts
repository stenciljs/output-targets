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
    const source = page.waitForResponse('http://localhost:5173/');
    await browser.url('/')
    const html = await (await source).text()
    expect(html.slice(html.indexOf('<my-input '), html.lastIndexOf('<script'))).toMatchInlineSnapshot(`
      "<my-input class="hydrated sc-my-input-h" onmychange="null" onmyinput="null" s-id="2"><template shadowrootmode="open">  <input aria-labelledby="my-input-0-lbl" autocapitalize="off" autocomplete="off" autocorrect="off" c-id="2.0.0.0" class="native-input sc-my-input" name="my-input-0" placeholder="" type="text" value=""></template></my-input><div data-testid="inputCheck"><p>Input Event: </p><p>Change Event: </p></div><my-component class="hydrated" first="Don&#x27;t" kidsnames="John,Jane" last="call me a framework" middle="😉"><template shadowrootmode="open">    <style>
            :host{display:block;color:green}
          </style>  <!----></template></my-component><my-counter class="hydrated sc-my-counter-h" s-id="1">
        <!--r.1-->
        <div c-id="1.0.0.0" class="sc-my-counter">
          <button c-id="1.1.1.0" class="sc-my-counter">
            <!--t.1.2.2.0-->
            -
          </button>
          <span c-id="1.3.1.1" class="sc-my-counter">
            <!--t.1.4.2.0-->
            0
          </span>
          <button c-id="1.5.1.2" class="sc-my-counter">
            <!--t.1.6.2.0-->
            +
          </button>
        </div>
      </my-counter></div>
          "
    `)
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

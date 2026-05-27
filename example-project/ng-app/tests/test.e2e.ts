/// <reference types="@wdio/globals/types" />
/// <reference types="@wdio/mocha-framework" />
import os from 'node:os';
import { expect, $, browser } from '@wdio/globals';

describe('Stencil Angular Integration', () => {
  before(() => browser.url('/'));

  it('should render component with props', async () => {
    await expect($('my-component')).toHaveText("Hello, World! I'm not a framework");
  });

  it('should allow interaction with counter', async () => {
    const counter = $('my-counter');
    await expect(counter.$('span')).toHaveText('2277');

    const [minusButton, plusButton] = await counter.$$('button') as unknown as WebdriverIO.Element[];
    await plusButton.click();
    await plusButton.click();
    await expect(counter.$('span')).toHaveText('2279');
    await minusButton.click();
    await expect(counter.$('span')).toHaveText('2278');
  });

  it('should focus the inner input when setFocus is called', async function () {
    if (os.platform() === 'win32') {
      return this.skip()
    }
    await browser.execute(async () => await customElements.whenDefined('my-checkbox'));
    await browser.execute((el: any) => el.setFocus(), await $('my-checkbox'));
    const isFocused = await browser.execute(() => {
      const el = document.querySelector('my-checkbox') as any;
      return el?.shadowRoot?.activeElement?.tagName.toLowerCase() === 'input';
    });
    expect(isFocused).toBe(true);
  });

  it('should transform tag names correctly', async () => {
    // The my-transform-test component should be transformed to v1-my-transform-test
    const transformedElement = $('v1-my-transform-test');
    await expect(transformedElement).toExist();

    // Verify the original tag name is NOT in the DOM
    const originalElement = $('my-transform-test');
    await expect(originalElement).not.toExist();

    // Verify the component renders correctly with the transformed tag
    const message = await transformedElement.getText();
    await expect(message).toContain('This component\'s tag should be transformed');
  });
});

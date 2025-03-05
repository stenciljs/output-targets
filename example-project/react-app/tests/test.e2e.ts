/// <reference types="webdriverio" />
import { expect, $, $$, browser } from '@wdio/globals';

describe('Stencil NextJS Integration', () => {
  before(() => browser.url('/'));

  it('should allow to interact with input element', async () => {
    await $('my-input').$('input').setValue('Hello World');
    await expect(await $$('p').map((p) => p.getText())).toEqual([
      'Input Event: Hello World',
      'Change Event: Hello World'
    ]);
  });
});

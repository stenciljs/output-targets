/// <reference types="@wdio/globals/types" />
/// <reference types="@wdio/mocha-framework" />
import { expect, $, $$, browser } from '@wdio/globals';

describe('Stencil Vue Integration', () => {
  before(() => browser.url('/'));

  it('should allow to interact with input element', async () => {
    await $('my-input').$('input').setValue('Hello World');
    await expect(await $$('.inputResult p').map((p) => p.getText())).toEqual([
      'Input v-model: Hello World',
      'Change Event: Hello World'
    ]);
  });

  it('should listen to custom events', async () => {
    await $('my-component').$('div').click();
    await expect(await $('[data-testid="mycomponent-click"]').getText()).toEqual('MyComponent was clicked');
  });

  it('should render all properties correctly', async () => {
    await expect($('my-component')).toHaveText([
      'Hello, World! I\'m John Sir Doe',
      'Age: 20',
      'Kids: John, Jane',
      'Favorite kid: John'
    ].join('\n'));
  })
});

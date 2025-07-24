/// <reference types="@wdio/globals/types" />
/// <reference types="@wdio/mocha-framework" />
import { expect, $, $$, browser } from '@wdio/globals';

const scenarios = [{
  path: '/',
  title: 'Sfc Tests'
}, {
  path: '/legacy',
  title: 'Legacy Tests'
}]

describe('Stencil Vue Integration', () => {
  scenarios.forEach((scenario) => {
    describe(scenario.title, () => {
      before(() => browser.url(scenario.path));

      it('should allow to interact with input element', async () => {
        await $('my-input').$('input').setValue('Hello World');
        await expect(await $$('.inputResult p').map((p) => p.getText())).toEqual([
          'Input v-model: Hello World',
          'Change Event: Hello World'
        ]);
      });

      it('should allow to interact with checkbox element with custom v-model path', async () => {
        await $('my-checkbox').click();
        await expect(await $$('.inputResultCheckbox p').map((p) => p.getText())).toEqual([
          'Input v-model: true',
          'Change Event: true'
        ]);
      });

      it.skip('should listen to custom events', async () => {
        await $('my-component').$('div').click();
        await expect(await $('[data-testid="mycomponent-click"]').getText()).toEqual('MyComponent was clicked');
      });

      it('should render all properties correctly', async () => {
        await expect($('my-component')).toHaveText('Hello, World! I\'m John Sir Doe');
      });

      it('should render radio group value correctly', async () => {
        const radioBtns = $$('my-radio');
        const radioGroup = $('[data-testid="radio-group-value"]');
        await expect(await radioGroup.getText()).toEqual('Radio Group Value: option1');
        await radioBtns[1].click();
        await expect(await radioGroup.getText()).toEqual('Radio Group Value: option2');
        await radioBtns[2].click();
        await expect(await radioGroup.getText()).toEqual('Radio Group Value: option3');
      });
    })
  })
});

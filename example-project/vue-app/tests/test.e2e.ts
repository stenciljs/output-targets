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

      it('should allow interacting with input element', async () => {
        await $('my-input').$('input').setValue('Hello World');
        await expect(await $$('.inputResult p').map((p) => p.getText())).toEqual([
          'Input v-model: Hello World',
          'Change Event: Hello World'
        ]);
      });

      it('should allow interacting with checkbox element with custom v-model path', async () => {
        await $('my-checkbox').click();
        await expect(await $$('.inputResultCheckbox p').map((p) => p.getText())).toEqual([
          'Input v-model: true',
          'Change Event: true'
        ]);
      });

      it('should listen to custom events', async () => {
        await $('my-component').$('div').click();
        await expect(await $('[data-testid="mycomponent-click"]').getText()).toEqual('MyComponent was clicked');
      });

      it('should render all properties correctly', async () => {
        await expect($('my-component')).toHaveText('Hello, World! I\'m John Sir Doe');
      });

      it('should re-render after updating a property', async () => {
        await browser.execute((el: any) => { el.middleName = 'Test'; }, await $('my-component'))
        await expect($('my-component')).toHaveText('Hello, World! I\'m John Test Doe');
      });

      it('should re-render when a reactive Vue prop binding changes', async () => {
        await browser.url(scenario.path);
        await expect($('my-component')).toHaveText('Hello, World! I\'m John Sir Doe');
        await $('[data-testid="change-middle-name-btn"]').click();
        await expect($('my-component')).toHaveText('Hello, World! I\'m John Test Doe');
      });

      it('should bind array props to the underlying element as a property', async () => {
        const kidsNames = await browser.execute((el: any) => el.kidsNames, await $('my-component'));
        await expect(kidsNames).toEqual(['John', 'Jane']);
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

      it('should preserve hydrated and static classes when toggling a dynamic :class binding', async () => {
        const target = $('.hydrated-test my-component');
        const toggleBtn = $('[data-testid="toggle-class-btn"]');
        const status = $('[data-testid="class-status"] strong');

        await expect(target).toHaveElementClass('hydrated');
        await expect(target).toHaveElementClass('static-class');
        await expect(target).not.toHaveElementClass('highlighted');

        await toggleBtn.click();
        await expect(status).toHaveText('true');
        await expect(target).toHaveElementClass('highlighted');
        await expect(target).toHaveElementClass('hydrated');
        await expect(target).toHaveElementClass('static-class');

        await toggleBtn.click();
        await expect(status).toHaveText('false');
        await expect(target).not.toHaveElementClass('highlighted');
        await expect(target).toHaveElementClass('hydrated');
        await expect(target).toHaveElementClass('static-class');
      });
    })
  })
});

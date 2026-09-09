import { expect, $, browser } from '@wdio/globals';

describe('Stencil NuxtJS Integration', () => {
  it('should have hydrated the page', async () => {
    await browser.url('/');
    const input = await $('my-input').$('input');
    await input.setValue('test');
    await expect($('.inputResult').getText()).toMatchInlineSnapshot(`
      "Input Event: test
Change Event: test"
    `)
  });

  it('propagates style objects into string', async () => {
    await browser.url('/');
    const inputResult = await $('.inputResult p');
    await expect(inputResult).toHaveStyle({ color: 'rgba(255,0,0,1)' });
    await expect(inputResult).toHaveStyle({ fontSize: '30px' });
  });

  it('should trigger console.log when the checkbox is clicked', async () => {
    const logs: string[] = []

    await browser.url('/');
    await browser.sessionSubscribe({ events: ['log.entryAdded'] })
    browser.on('log.entryAdded', (entryAdded) => entryAdded.text && logs.push(entryAdded.text))

    const checkbox = await $('my-checkbox');
    await checkbox.click();
    await browser.pause(500)
    await browser.waitUntil(async () => logs.length > 0, {
      timeoutMsg: 'Expected log message not found'
    })
    await expect(logs).toContain('Checkbox changed: true');
    await expect(logs).not.toContain('Checkbox changed: false');
    await checkbox.click();
    await browser.pause(500);
    await expect(logs).toContain('Checkbox changed: true');
    await expect(logs).toContain('Checkbox changed: false');
  });
});

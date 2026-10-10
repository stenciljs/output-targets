import { browser, expect } from '@wdio/globals';

describe('React 18 SSR host attributes', () => {
  it('preserves class and style in the initial HTML and after custom elements initialize', async () => {
    const response = await fetch(`${browser.options.baseUrl}/ssr-host-attributes`);
    expect(response.status).toBe(200);
    const html = await response.text();
    const attributes = await browser.execute((source) => {
      const document = new DOMParser().parseFromString(source, 'text/html');
      return Array.from(document.querySelectorAll<HTMLElement>('#ssr-host-attributes > *')).map((host) => ({
        className: host.getAttribute('class'),
        invalidClassName: host.hasAttribute('classname'),
        color: host.style.color,
        tabIndex: host.getAttribute('tabindex'),
      }));
    }, html);

    expect(attributes).toEqual([
      { className: expect.stringContaining('scoped-host'), invalidClassName: false, color: 'red', tabIndex: '0' },
      { className: expect.stringContaining('shadow-host'), invalidClassName: false, color: 'red', tabIndex: '0' },
    ]);

    await browser.url('/ssr-host-attributes');
    // Scoped SSR has no shadow root until Stencil initializes the client component.
    // The hydrated class alone is insufficient because it is already present in the server HTML.
    await browser.waitUntil(
      () =>
        browser.execute(() =>
          Boolean(document.querySelector('#ssr-host-attributes > my-component')?.shadowRoot?.querySelector('div'))
        ),
      { timeoutMsg: 'Expected the scoped component to initialize its shadow root' }
    );
    for (const className of ['scoped-host', 'shadow-host']) {
      const host = browser.$(`#ssr-host-attributes > .${className}`);
      await expect(host).toHaveElementClass('hydrated');
    }
    const colors = await browser.execute(() =>
      Array.from(document.querySelectorAll<HTMLElement>('#ssr-host-attributes > *')).map((host) => host.style.color)
    );
    expect(colors).toEqual(['red', 'red']);
  });
});

import { $, browser, expect } from '@wdio/globals';

describe('Scoped SSR children', () => {
  const greeting = "Hello, World! I'm John William Doe";
  const errors: string[] = [];
  const onLogEntry = (entry: { level: string; text: string | null }) => {
    if (entry.level === 'error') {
      errors.push(entry.text ?? 'Unknown browser error');
    }
  };

  before(async () => {
    browser.on('log.entryAdded', onLogEntry);
    await browser.sessionSubscribe({ events: ['log.entryAdded'] });
  });

  beforeEach(() => {
    errors.length = 0;
  });

  afterEach(() => {
    expect(errors).toEqual([]);
  });

  after(() => {
    browser.off('log.entryAdded', onLogEntry);
  });

  it('server renders the nested component and the space before its text sibling', async () => {
    const response = await fetch(`${browser.options.baseUrl}/scoped-ssr-children`);
    expect(response.status).toBe(200);
    const html = await response.text();
    const content = await browser.execute((source) => {
      // Parse the actual markup without executing scripts or matching the Flight payload.
      const document = new DOMParser().parseFromString(source, 'text/html');
      const section = document.querySelector('#scoped-ssr-children');
      const button = section?.querySelector('my-button .button-inner');
      return {
        childCount: button?.querySelectorAll('my-component').length,
        childText: button?.querySelector('my-component div')?.textContent,
        text: button?.textContent,
        reactText: document.querySelector('#scoped-react-children .button-inner')?.textContent,
        returnedTitle: document.querySelector('#scoped-react-children .button-inner > span')?.getAttribute('title'),
      };
    }, html);

    expect(content).toEqual({
      childCount: 1,
      childText: greeting,
      text: `${greeting} Initial text`,
      reactText: 'Initial text inner',
      returnedTitle: 'returned',
    });
  });

  it('hydrates and updates the text sibling after direct navigation and refresh', async () => {
    const expectLabel = async (label: string) => {
      await browser.waitUntil(
        async () =>
          (await browser.execute(() => {
            const child = document.querySelector('#scoped-ssr-children my-component');
            return Array.from(child?.parentNode?.childNodes ?? [])
              .map((node) => {
                if (node.nodeType === Node.TEXT_NODE) return node.textContent;
                if (node.nodeType === Node.ELEMENT_NODE) return `<${(node as Element).localName}>`;
                return '';
              })
              .join('');
          })) === `<my-component> ${label}`,
        { timeoutMsg: `Expected the nested component followed by " ${label}"` }
      );
      const childContent = $('#scoped-ssr-children my-component').$('div');
      await expect(childContent).toBeDisplayed();
      expect(await childContent.getProperty('textContent')).toBe(greeting);
      await expect($('#scoped-react-children span[title="returned"]')).toHaveText(label);
      await expect($('#scoped-react-children b')).toHaveText('inner');
    };

    await browser.url('/scoped-ssr-children');
    await expectLabel('Initial text');
    await $('#update-label').click();
    await expectLabel('Updated text');

    await browser.refresh();
    await expectLabel('Initial text');
    await $('#update-label').click();
    await expectLabel('Updated text');
  });
});

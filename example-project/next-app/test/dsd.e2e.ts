import { browser, expect } from '@wdio/globals';
import prettier from 'prettier';

describe('Static Declarative Shadow DOM (DSD)', () => {
  for (const component of ['simple', 'nested', 'nested-with-react'/*, 'complex-use-client'*/]) {
    it(`should render DSD of '${component}' correctly`, async () => {
      await browser.url(`/dsd/${component}`);
      const page = await fetch(await browser.getUrl());
      const rawContent = await page.text();
      const componentHtml = rawContent.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1] ?? '';
      const formattedHtml = await prettier.format(componentHtml, { parser: 'html' });
      // Depeneding on the order the components are first rendered, the ids might be different
      const sanitizedHtml = formattedHtml
        .replaceAll(/r\.\d+/g, 'r.X')
        .replaceAll(/t\.\d+/g, 't.X')
        .replaceAll(/s-id="\d+/g, 's-id="X')
        .replaceAll(/c-id="\d+/g, 'c-id="X');

      expect(sanitizedHtml).toMatchSnapshot();
    });
  }
});

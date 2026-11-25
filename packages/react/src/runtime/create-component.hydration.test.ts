// @vitest-environment jsdom
import React, { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { createComponent } from './create-component';

class MyComponentElement extends HTMLElement {}

const MyComponent = createComponent({
  defineCustomElement: () => {
    if (!customElements.get('my-component')) {
      customElements.define('my-component', MyComponentElement);
    }
  },
  tagName: 'my-component',
  elementClass: MyComponentElement as any,
  react: React,
  events: {},
});

const renderOnServer = (element: React.ReactElement): string => {
  vi.stubGlobal('window', undefined);
  try {
    return renderToString(element);
  } finally {
    vi.unstubAllGlobals();
  }
};

describe('createComponent hydration', () => {
  let container: HTMLElement;
  let root: Root | undefined;

  beforeAll(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = undefined;
    container.remove();
  });

  const hydrate = async (element: React.ReactElement, prepareHost?: (host: Element) => void) => {
    container = document.createElement('div');
    container.innerHTML = renderOnServer(element);
    document.body.appendChild(container);
    prepareHost?.(container.querySelector('my-component')!);

    const errors: unknown[] = [];
    const consoleError = vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args));
    await act(async () => {
      root = hydrateRoot(container, element, { onRecoverableError: (error) => errors.push(error) });
    });
    consoleError.mockRestore();

    return { host: container.querySelector('my-component')!, errors };
  };

  it('keeps the server-rendered className without a hydration mismatch', async () => {
    const { host, errors } = await hydrate(React.createElement(MyComponent, { className: 'foo' }));

    expect(host.className).toBe('foo');
    expect(errors).toEqual([]);
  });

  it('keeps runtime-managed classes added before hydration', async () => {
    const { host, errors } = await hydrate(React.createElement(MyComponent, { className: 'foo' }), (el) =>
      el.classList.add('hydrated')
    );

    expect(host.className).toBe('foo hydrated');
    expect(errors).toEqual([]);
  });

  it('updates the className after hydration', async () => {
    const { host } = await hydrate(React.createElement(MyComponent, { className: 'foo' }), (el) =>
      el.classList.add('hydrated')
    );

    await act(async () => root!.render(React.createElement(MyComponent, { className: 'bar' })));

    expect(host.className).toBe('hydrated bar');
  });
});

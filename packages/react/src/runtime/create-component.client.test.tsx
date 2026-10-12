// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createComponent } from './create-component.js';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Stencil-like element: prop accessors on the prototype, attributes not reflected back.
class FakeElement extends HTMLElement {
  static observedAttributes = ['disabled', 'variant'];
  private _disabled = false;
  private _variant = '';
  get disabled() {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  get variant() {
    return this._variant;
  }
  set variant(value: string) {
    this._variant = value;
  }
}
customElements.define('fake-element', FakeElement);

const options = {
  tagName: 'fake-element',
  elementClass: FakeElement as any,
  react: React,
  events: {},
  defineCustomElement: () => {},
};

// `createComponent` picks the server or client wrapper when it is called, so build the server
// one while `window` is absent and the client one with the real jsdom window.
type Props = { children?: React.ReactNode; disabled?: boolean; variant?: string };

async function serverAndClient() {
  vi.stubGlobal('window', undefined);
  const Server = createComponent<HTMLElement, {}, Props>(options);
  vi.unstubAllGlobals();
  const Client = createComponent<HTMLElement, {}, Props>(options);
  return { Server, Client };
}

describe('createComponent hydration', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('hydrates server attributes without warnings and keeps them in sync with the props', async () => {
    const { Server, Client } = await serverAndClient();
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = renderToString(React.createElement(Server, { disabled: true, variant: 'outline' }, 'Save'));
    expect(container.innerHTML).toContain('disabled=""');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, React.createElement(Client, { disabled: true, variant: 'outline' }, 'Save'));
    });
    const element = container.querySelector('fake-element')!;
    expect(error.mock.calls.flat().join(' ')).not.toMatch(/hydrat/i);
    expect(element.getAttribute('variant')).toBe('outline');

    await act(async () => {
      root.render(React.createElement(Client, { disabled: false, variant: 'solid' }, 'Save'));
    });
    expect(element.hasAttribute('disabled')).toBe(false);
    expect(element.getAttribute('variant')).toBe('solid');
  });
  it('does not add attributes to client-rendered elements', async () => {
    const { Client } = await serverAndClient();
    const container = document.createElement('div');
    document.body.appendChild(container);
    await act(async () => {
      createRoot(container).render(React.createElement(Client, { disabled: true, variant: 'outline' }, 'Save'));
    });
    const element = container.querySelector('fake-element')!;
    // Under the `node` export condition `@lit/react` ships its SSR build, which never assigns
    // element properties, so only the attribute behaviour (ours) can be asserted here.
    expect(element.hasAttribute('disabled')).toBe(false);
    expect(element.hasAttribute('variant')).toBe(false);
  });
});

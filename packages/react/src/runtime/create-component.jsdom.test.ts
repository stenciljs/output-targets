// @vitest-environment jsdom

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createComponent } from './create-component';

const roots: Root[] = [];

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  for (const root of roots.splice(0)) {
    await act(async () => {
      root.unmount();
    });
  }
  document.body.innerHTML = '';
});

describe('createComponent (jsdom)', () => {
  it('forwards native props such as id to the rendered custom element', async () => {
    const tagName = 'x-runtime-id-forwarding-test';

    class RuntimeIdForwardingElement extends HTMLElement {}

    const Wrapped = createComponent<RuntimeIdForwardingElement>({
      defineCustomElement: () => {
        if (!customElements.get(tagName)) {
          customElements.define(tagName, RuntimeIdForwardingElement);
        }
      },
      tagName,
      elementClass: RuntimeIdForwardingElement,
      react: React,
      events: {},
      displayName: 'RuntimeIdForwardingElement',
    });

    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(React.createElement(Wrapped, { id: 'hello-button' }));
    });

    const element = container.querySelector(tagName);
    expect(element).not.toBeNull();
    expect((element as HTMLElement).id).toBe('hello-button');
  });

  it('forwards custom element prototype properties including object values', async () => {
    const tagName = 'x-runtime-prop-forwarding-test';
    const payload = { nested: { value: 7 } };

    class RuntimePropForwardingElement extends HTMLElement {
      private _payload: unknown;

      public get payload() {
        return this._payload;
      }

      public set payload(value: unknown) {
        this._payload = value;
      }
    }

    const Wrapped = createComponent<RuntimePropForwardingElement>({
      defineCustomElement: () => {
        if (!customElements.get(tagName)) {
          customElements.define(tagName, RuntimePropForwardingElement);
        }
      },
      tagName,
      elementClass: RuntimePropForwardingElement,
      react: React,
      events: {},
      displayName: 'RuntimePropForwardingElement',
    });

    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(React.createElement(Wrapped, { payload } as any));
    });

    const element = container.querySelector(tagName) as RuntimePropForwardingElement | null;
    expect(element).not.toBeNull();
    expect(element?.payload).toBe(payload);
  });
});

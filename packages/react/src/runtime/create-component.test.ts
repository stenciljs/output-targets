import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { createComponent, mergeClassNames } from './create-component';

describe('createComponent', () => {
  it('should call defineCustomElement if it is defined', () => {
    const defineCustomElement = vi.fn();

    createComponent({
      defineCustomElement,
      tagName: 'my-component',
      elementClass: class Foo {} as any,
      react: React,
      events: {},
      displayName: 'MyComponent',
    });

    expect(defineCustomElement).toHaveBeenCalled();
  });
});

describe('mergeClassNames', () => {
  it('keeps runtime-managed classes and appends new app classes', () => {
    const merged = mergeClassNames(['md', 'interactive', 'hydrated'], 'ion-invalid ion-touched', '');
    expect(merged).toBe('md interactive hydrated ion-invalid ion-touched');
  });

  it('adds app classes on first render when there was no previous value', () => {
    expect(mergeClassNames(['sc-my-input-h', 'hydrated'], 'ion-valid', undefined)).toBe(
      'sc-my-input-h hydrated ion-valid'
    );
  });

  it('removes only the app classes that were dropped since the previous render', () => {
    const merged = mergeClassNames(
      ['md', 'hydrated', 'ion-invalid', 'ion-touched'],
      'ion-invalid',
      'ion-invalid ion-touched'
    );
    expect(merged).toBe('md hydrated ion-invalid');
  });

  it('removes all app classes when className is cleared but keeps runtime classes', () => {
    expect(mergeClassNames(['md', 'hydrated', 'ion-invalid'], '', 'ion-invalid')).toBe('md hydrated');
  });

  it('does not duplicate a class the app sets that is already on the element', () => {
    expect(mergeClassNames(['foo', 'hydrated'], 'foo', '')).toBe('foo hydrated');
  });

  it('normalizes extra whitespace in the incoming class value', () => {
    expect(mergeClassNames(['hydrated'], '  ion-invalid   ion-touched ', '')).toBe('hydrated ion-invalid ion-touched');
  });

  it('preserves runtime classes when the app provides no className', () => {
    expect(mergeClassNames(['md', 'hydrated'], '', '')).toBe('md hydrated');
  });
});

describe('createComponent on the server', () => {
  // Shape of a Stencil custom-elements class in Node: prop accessors plus observedAttributes.
  class FakeElement {
    static observedAttributes = ['variant', 'icon-start', 'full-width', 'count'];
    get variant() {
      return '';
    }
    get iconStart() {
      return '';
    }
    get fullWidth() {
      return false;
    }
    get count() {
      return 0;
    }
    get items() {
      return [] as unknown[];
    }
  }

  const make = (elementClass: unknown = FakeElement) =>
    createComponent<HTMLElement, {}, Record<string, unknown>>({
      tagName: 'fake-element',
      elementClass: elementClass as any,
      react: React,
      events: {},
      defineCustomElement: vi.fn(),
    });

  it('renders Stencil props as kebab-case attributes', async () => {
    const { renderToString } = await import('react-dom/server');
    const Fake = make();

    const html = renderToString(
      React.createElement(Fake, { variant: 'tertiary', iconStart: 'home', fullWidth: true, count: 3 }, 'Open')
    );

    expect(html).toBe('<fake-element variant="tertiary" icon-start="home" full-width="" count="3">Open</fake-element>');
  });

  it('omits false, nullish, function and object-valued Stencil props', async () => {
    const { renderToString } = await import('react-dom/server');
    const Fake = make();

    const html = renderToString(
      React.createElement(Fake, {
        fullWidth: false,
        variant: undefined,
        iconStart: null,
        items: [{ label: 'a' }],
        onClick: () => undefined,
      })
    );

    expect(html).toBe('<fake-element></fake-element>');
  });

  it('passes non-Stencil props through untouched and maps className to class', async () => {
    const { renderToString } = await import('react-dom/server');
    const Fake = make();

    const html = renderToString(
      React.createElement(Fake, {
        className: 'a b',
        id: 'x',
        slot: 'footer',
        'aria-label': 'Open',
        'data-test': 'y',
        style: { color: 'red' },
      })
    );

    expect(html).toBe(
      '<fake-element class="a b" id="x" slot="footer" aria-label="Open" data-test="y" style="color:red"></fake-element>'
    );
  });

  it('prefers the generated properties map over the derived attribute name', async () => {
    const { renderToString } = await import('react-dom/server');
    const Fake = createComponent<HTMLElement, {}, Record<string, unknown>>({
      tagName: 'fake-element',
      elementClass: FakeElement as any,
      properties: { iconStart: 'data-icon', variant: 'variant' },
      react: React,
      events: {},
      defineCustomElement: vi.fn(),
    });

    const html = renderToString(React.createElement(Fake, { iconStart: 'home', variant: 'tertiary', count: 3 }));

    // `count` is a Stencil prop without an attribute in the map, so it stays client-side.
    expect(html).toBe('<fake-element data-icon="home" variant="tertiary"></fake-element>');
  });

  it('treats accessors inherited from HTMLElement as pass-through props', async () => {
    const { renderToString } = await import('react-dom/server');
    // Server DOM shims (jsdom, happy-dom) put id/title on HTMLElement.prototype.
    class HTMLElementStub {
      get id() {
        return '';
      }
      get title() {
        return '';
      }
    }
    vi.stubGlobal('HTMLElement', HTMLElementStub);
    try {
      class Fixture extends HTMLElementStub {
        static observedAttributes = ['variant'];
        get variant() {
          return '';
        }
      }
      const Fake = make(Fixture);

      const html = renderToString(React.createElement(Fake, { variant: 'tertiary', id: 'x', title: 'Open' }));

      expect(html).toBe('<fake-element variant="tertiary" id="x" title="Open"></fake-element>');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('renders only pass-through props when the element class exposes no attributes', async () => {
    const { renderToString } = await import('react-dom/server');
    const Fake = make(class Bare {});

    const html = renderToString(React.createElement(Fake, { variant: 'tertiary', id: 'x' }));

    expect(html).toBe('<fake-element variant="tertiary" id="x"></fake-element>');
  });
});

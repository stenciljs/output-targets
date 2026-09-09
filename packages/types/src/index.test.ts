import { describe, it, expect } from 'vitest';
import type { ComponentCompilerMeta } from '@stencil/core/internal';

import { createReactTypes } from './generators/react.js';
import { createSvelteTypes } from './generators/svelte.js';
import { createSolidTypes } from './generators/solid.js';
import { createVueTypes } from './generators/vue.js';
import { createPreactTypes } from './generators/preact.js';

const createMockComponent = (overrides: Partial<ComponentCompilerMeta> = {}): ComponentCompilerMeta =>
  ({
    tagName: 'my-button',
    componentClassName: 'MyButton',
    properties: [
      {
        name: 'disabled',
        attribute: 'disabled',
        internal: false,
        complexType: { original: 'boolean', resolved: 'boolean', references: {} },
        docs: { text: 'Whether the button is disabled', tags: [] },
      },
    ],
    events: [
      {
        name: 'myClick',
        internal: false,
        complexType: { original: 'void', resolved: 'void', references: {} },
        docs: { text: 'Emitted when the button is clicked', tags: [] },
      },
    ],
    internal: false,
    ...overrides,
  }) as ComponentCompilerMeta;

describe('createReactTypes', () => {
  it('should generate React 19+ native types', () => {
    const result = createReactTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`declare module 'react/jsx-runtime'`);
    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`'disabled'?: boolean;`);
    expect(result).toContain(`'onmyclick'?:`); // lowercase event handler
    expect(result).toContain(`'my-button': DetailedHTMLProps`);
  });

  it('should return empty string for no components', () => {
    const result = createReactTypes({
      components: [],
      stencilPackageName: 'my-package',
    });

    expect(result).toBe('');
  });

  it('should exclude internal components', () => {
    const result = createReactTypes({
      components: [createMockComponent({ internal: true })],
      stencilPackageName: 'my-package',
    });

    expect(result).toBe('');
  });
});

describe('createSvelteTypes', () => {
  it('should generate Svelte native types', () => {
    const result = createSvelteTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`declare module 'svelte/elements'`);
    expect(result).toContain(`interface SvelteHTMLElements`);
    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`'onmyclick'?:`);
  });
});

describe('createSolidTypes', () => {
  it('should generate Solid native types with prop: and attr: prefixes', () => {
    const result = createSolidTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`declare module 'solid-js'`);
    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`'prop:disabled'?: boolean;`);
    expect(result).toContain(`'attr:disabled'?: string;`);
    expect(result).toContain(`'on:myClick'?:`);
  });
});

describe('createVueTypes', () => {
  it('should generate Vue 3 native types', () => {
    const result = createVueTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`declare module 'vue'`);
    expect(result).toContain(`interface GlobalComponents`);
    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`'onMyClick'?:`); // Vue uses camelCase
  });
});

describe('createPreactTypes', () => {
  it('should generate Preact native types', () => {
    const result = createPreactTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`declare module 'preact'`);
    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`'onMyClick'?:`); // Preact uses camelCase
  });
});

describe('excludeComponents', () => {
  it('should exclude specified components', () => {
    const result = createReactTypes({
      components: [createMockComponent()],
      stencilPackageName: 'my-package',
      excludeComponents: ['my-button'],
    });

    expect(result).toBe('');
  });
});

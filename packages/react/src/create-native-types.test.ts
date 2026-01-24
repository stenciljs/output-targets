import { describe, it, expect } from 'vitest';
import type { ComponentCompilerMeta } from '@stencil/core/internal';

import { createNativeTypes } from './create-native-types.js';

describe('createNativeTypes', () => {
  it('should generate native types for a basic component', () => {
    const components: ComponentCompilerMeta[] = [
      {
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
        events: [],
        internal: false,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`// @ts-ignore`);
    expect(result).toContain(`import 'react';`);
    expect(result).toContain(`import type { DetailedHTMLProps, HTMLAttributes } from 'react';`);
    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`'disabled'?: boolean;`);
    expect(result).toContain(`declare module 'react/jsx-runtime'`);
    expect(result).toContain(
      `'my-button': DetailedHTMLProps<HTMLAttributes<HTMLMyButtonElement> & MyButtonNativeProps, HTMLMyButtonElement>;`
    );
  });

  it('should generate lowercase event handlers', () => {
    const components: ComponentCompilerMeta[] = [
      {
        tagName: 'my-button',
        componentClassName: 'MyButton',
        properties: [],
        events: [
          {
            name: 'myFocus',
            internal: false,
            complexType: {
              original: 'void',
              resolved: 'void',
              references: {},
            },
            docs: { text: 'Emitted when the button has focus.', tags: [] },
          },
          {
            name: 'myBlur',
            internal: false,
            complexType: {
              original: 'void',
              resolved: 'void',
              references: {},
            },
            docs: { text: 'Emitted when the button loses focus.', tags: [] },
          },
        ],
        internal: false,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
    });

    // Event handlers should be lowercase
    expect(result).toContain(`'onmyfocus'?: (event: MyButtonCustomEvent<void>) => void;`);
    expect(result).toContain(`'onmyblur'?: (event: MyButtonCustomEvent<void>) => void;`);
    // Should NOT contain PascalCase event handlers
    expect(result).not.toContain(`onMyFocus`);
    expect(result).not.toContain(`onMyBlur`);
    // Should import CustomEvent type
    expect(result).toContain(`MyButtonCustomEvent`);
  });

  it('should filter out internal components', () => {
    const components: ComponentCompilerMeta[] = [
      {
        tagName: 'my-public',
        componentClassName: 'MyPublic',
        properties: [],
        events: [],
        internal: false,
      } as any,
      {
        tagName: 'my-internal',
        componentClassName: 'MyInternal',
        properties: [],
        events: [],
        internal: true,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`'my-public':`);
    expect(result).not.toContain(`'my-internal':`);
  });

  it('should filter out excluded components', () => {
    const components: ComponentCompilerMeta[] = [
      {
        tagName: 'my-included',
        componentClassName: 'MyIncluded',
        properties: [],
        events: [],
        internal: false,
      } as any,
      {
        tagName: 'my-excluded',
        componentClassName: 'MyExcluded',
        properties: [],
        events: [],
        internal: false,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
      excludeComponents: ['my-excluded'],
    });

    expect(result).toContain(`'my-included':`);
    expect(result).not.toContain(`'my-excluded':`);
  });

  it('should import referenced types from events', () => {
    const components: ComponentCompilerMeta[] = [
      {
        tagName: 'my-component',
        componentClassName: 'MyComponent',
        properties: [],
        events: [
          {
            name: 'change',
            internal: false,
            complexType: {
              original: 'MyChangeDetail',
              resolved: '{ value: string }',
              references: {
                MyChangeDetail: {
                  location: 'import',
                  path: './types',
                  id: 'src/types.ts::MyChangeDetail',
                },
              },
            },
            docs: { text: '', tags: [] },
          },
        ],
        internal: false,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`MyChangeDetail`);
    expect(result).toContain(`'onchange'?: (event: MyComponentCustomEvent<MyChangeDetail>) => void;`);
  });

  it('should not import global type references', () => {
    const components: ComponentCompilerMeta[] = [
      {
        tagName: 'my-component',
        componentClassName: 'MyComponent',
        properties: [],
        events: [
          {
            name: 'click',
            internal: false,
            complexType: {
              original: 'MouseEvent',
              resolved: 'MouseEvent',
              references: {
                MouseEvent: {
                  location: 'global',
                  path: '',
                  id: '',
                },
              },
            },
            docs: { text: '', tags: [] },
          },
        ],
        internal: false,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
    });

    // Should NOT separately import MouseEvent as it's a global type
    // (it should only appear as part of the event type)
    expect(result).toContain(`'onclick'?: (event: MyComponentCustomEvent<MouseEvent>) => void;`);
  });

  it('should include JSDoc comments for events', () => {
    const components: ComponentCompilerMeta[] = [
      {
        tagName: 'my-button',
        componentClassName: 'MyButton',
        properties: [],
        events: [
          {
            name: 'myFocus',
            internal: false,
            complexType: { original: 'void', resolved: 'void', references: {} },
            docs: { text: 'Emitted when the button has focus.', tags: [] },
          },
        ],
        internal: false,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`/** Event: myFocus - Emitted when the button has focus. */`);
  });

  it('should include JSDoc comments for properties', () => {
    const components: ComponentCompilerMeta[] = [
      {
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
        events: [],
        internal: false,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`/** Whether the button is disabled */`);
  });

  it('should return empty string when all components are filtered out', () => {
    const components: ComponentCompilerMeta[] = [
      {
        tagName: 'my-internal',
        componentClassName: 'MyInternal',
        properties: [],
        events: [],
        internal: true,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
    });

    expect(result).toBe('');
  });

  it('should handle components with no properties or events', () => {
    const components: ComponentCompilerMeta[] = [
      {
        tagName: 'my-empty',
        componentClassName: 'MyEmpty',
        properties: [],
        events: [],
        internal: false,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`interface MyEmptyNativeProps {}`);
    expect(result).toContain(
      `'my-empty': DetailedHTMLProps<HTMLAttributes<HTMLMyEmptyElement> & MyEmptyNativeProps, HTMLMyEmptyElement>;`
    );
  });

  it('should import referenced types from properties', () => {
    const components: ComponentCompilerMeta[] = [
      {
        tagName: 'my-component',
        componentClassName: 'MyComponent',
        properties: [
          {
            name: 'color',
            attribute: 'color',
            internal: false,
            complexType: {
              original: 'Color',
              resolved: '"primary" | "secondary"',
              references: {
                Color: {
                  location: 'import',
                  path: './types',
                  id: 'src/types.ts::Color',
                },
              },
            },
            docs: { text: 'The color of the component', tags: [] },
          },
        ],
        events: [],
        internal: false,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`Color`);
    expect(result).toContain(`'color'?: Color;`);
  });

  it('should handle multiple components', () => {
    const components: ComponentCompilerMeta[] = [
      {
        tagName: 'my-button',
        componentClassName: 'MyButton',
        properties: [],
        events: [],
        internal: false,
      } as any,
      {
        tagName: 'my-input',
        componentClassName: 'MyInput',
        properties: [],
        events: [],
        internal: false,
      } as any,
    ];

    const result = createNativeTypes({
      components,
      stencilPackageName: 'my-package',
    });

    expect(result).toContain(`interface MyButtonNativeProps`);
    expect(result).toContain(`interface MyInputNativeProps`);
    expect(result).toContain(`'my-button':`);
    expect(result).toContain(`'my-input':`);
  });
});

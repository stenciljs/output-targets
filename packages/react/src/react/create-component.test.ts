import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import { createComponent } from './create-component';

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

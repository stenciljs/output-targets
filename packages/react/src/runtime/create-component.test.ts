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

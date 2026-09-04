import { describe, it, expect } from 'vitest';

import { nullableBooleanAttribute } from '../angular-component-lib/boolean-attribute';

describe('nullableBooleanAttribute()', () => {
  it('coerces attribute strings the same way Angular booleanAttribute does', () => {
    // A bare attribute (e.g. `<my-component disabled>`) resolves to the empty string.
    expect(nullableBooleanAttribute('')).toBe(true);
    expect(nullableBooleanAttribute('false')).toBe(false);
    expect(nullableBooleanAttribute('true')).toBe(true);
    expect(nullableBooleanAttribute('anything')).toBe(true);
  });

  it('passes booleans through untouched', () => {
    expect(nullableBooleanAttribute(true)).toBe(true);
    expect(nullableBooleanAttribute(false)).toBe(false);
  });

  it('passes null and undefined through rather than coercing them to false', () => {
    /**
     * This is the one behavior that differs from Angular's `booleanAttribute`. Components treat
     * these as a state distinct from `false`, e.g. `detail !== undefined ? detail : default` and
     * `handle !== false`, and both values reach inputs from the `async` pipe and form values.
     */
    expect(nullableBooleanAttribute(undefined)).toBeUndefined();
    expect(nullableBooleanAttribute(null)).toBeNull();
  });
});

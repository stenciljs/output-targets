import { describe, it, expect, vi } from 'vitest';

/**
 * `angular-component-lib/utils.ts` is copied into the consumer's project rather than compiled
 * here, so `rxjs` is not a dependency of this package. Only `proxyOutputs` uses it.
 */
vi.mock('rxjs', () => ({ fromEvent: () => undefined }));

const { nullableBooleanAttribute } = await import('../angular-component-lib/utils');

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

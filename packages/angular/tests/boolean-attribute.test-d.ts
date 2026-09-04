import { describe, it, expectTypeOf } from 'vitest';

import { nullableBooleanAttribute } from '../angular-component-lib/boolean-attribute';

/**
 * Angular derives `ngAcceptInputType_*` from this parameter type, so the parameter type is what
 * decides which template bindings compile. Building the example app only ever proves that valid
 * bindings still work, so widening this back to `unknown` would leave every other check green.
 * These assertions are what pin it down.
 */
describe('nullableBooleanAttribute()', () => {
  it('accepts the values a template binding can produce', () => {
    expectTypeOf(nullableBooleanAttribute).parameter(0).toEqualTypeOf<boolean | string | null | undefined>();
  });

  it('rejects values that are not valid boolean bindings', () => {
    // @ts-expect-error a number is not a valid binding for a transformed boolean input
    nullableBooleanAttribute(42);
  });
});

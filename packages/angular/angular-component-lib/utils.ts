/* eslint-disable */
/* tslint:disable */
import { fromEvent } from 'rxjs';

export const proxyInputs = (Cmp: any, inputs: string[]) => {
  const Prototype = Cmp.prototype;
  inputs.forEach((item) => {
    Object.defineProperty(Prototype, item, {
      get() {
        return this.el[item];
      },
      set(val: any) {
        this.z.runOutsideAngular(() => (this.el[item] = val));
      },
      /**
       * In the event that proxyInputs is called
       * multiple times re-defining these inputs
       * will cause an error to be thrown. As a result
       * we set configurable: true to indicate these
       * properties can be changed.
       */
      configurable: true,
    });
  });
};

export const proxyMethods = (Cmp: any, methods: string[]) => {
  const Prototype = Cmp.prototype;
  methods.forEach((methodName) => {
    Prototype[methodName] = function () {
      const args = arguments;
      return this.z.runOutsideAngular(() => this.el[methodName].apply(this.el, args));
    };
  });
};

export const proxyOutputs = (instance: any, el: any, events: string[]) => {
  events.forEach((eventName) => (instance[eventName] = fromEvent(el, eventName)));
};

export const defineCustomElement = (tagName: string, customElement: any) => {
  if (customElement !== undefined && typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, customElement);
  }
};

/**
 * Transforms a value to a boolean so that boolean properties can be set by attribute presence,
 * e.g. `<my-component disabled>` instead of `<my-component [disabled]="true">`.
 *
 * Strings are coerced the same way Angular's `booleanAttribute` coerces them, so `''` (a bare
 * attribute) becomes `true` and `'false'` becomes `false`.
 *
 * Unlike Angular's `booleanAttribute`, `null` and `undefined` are passed through rather than
 * coerced to `false`. Components frequently treat them as a state distinct from `false`:
 *
 * ```tsx
 * // `undefined` means "decide based on the mode", which is not the same as `false`
 * const showDetail = detail !== undefined ? detail : mode === 'ios';
 *
 * // a strict comparison also behaves differently for `null` than it does for `false`
 * const showHandle = handle !== false;
 * ```
 *
 * Both values reach inputs routinely in Angular templates, from the `async` pipe before its
 * first emission and from form control values, so coercing them would change the behavior of
 * bindings that work today.
 *
 * This is implemented here rather than imported from `@angular/core` so that consumers on
 * Angular versions without `booleanAttribute` are unaffected by this file being generated.
 *
 * Declared as a function rather than an arrow constant because Angular has to resolve input
 * transforms statically when compiling a library in partial compilation mode.
 */
export function nullableBooleanAttribute(
  value: boolean | string | null | undefined
): boolean | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }
  return typeof value === 'boolean' ? value : value !== 'false';
}

// tslint:disable-next-line: only-arrow-functions
export function ProxyCmp(opts: { defineCustomElementFn?: () => void; inputs?: any; methods?: any }) {
  const decorator = function (cls: any) {
    const { defineCustomElementFn, inputs, methods } = opts;

    if (defineCustomElementFn !== undefined) {
      defineCustomElementFn();
    }

    if (inputs) {
      proxyInputs(cls, inputs);
    }
    if (methods) {
      proxyMethods(cls, methods);
    }
    return cls;
  };
  return decorator;
}

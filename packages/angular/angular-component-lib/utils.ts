/* eslint-disable */
/* tslint:disable */
import { inject, PLATFORM_ID } from '@angular/core';
import { fromEvent } from 'rxjs';

/**
 * Server rendering options (the output target's `ssrPropModule`).
 */
interface SsrOptions {
  /** The component library's `ssrProp()`, which hands a value to Stencil's server render. */
  ssrProp: (value: any) => any;
  /** Inputs whose attribute isn't Stencil's dash-cased prop name. */
  attributes?: Record<string, string>;
  /** Inputs with no attribute: every value goes through `ssrProp()`. */
  refs?: string[];
}

const serverInstances = new WeakSet<object>();

/**
 * Records a wrapper created during server rendering. Call from the constructor.
 */
export const markServer = (instance: object) => {
  // what `isPlatformServer()` from `@angular/common` checks
  if (inject(PLATFORM_ID) === 'server') {
    serverInstances.add(instance);
  }
};

/**
 * Stencil's own prop name to attribute name conversion (`prop1` -> `prop-1`).
 */
const toDashCase = (str: string): string =>
  str
    .replace(/([A-Z0-9])/g, (match) => ` ${match[0]}`)
    .trim()
    .split(' ')
    .join('-')
    .toLowerCase();

/**
 * Angular's server DOM never writes properties to the HTML, so on the server an input becomes an
 * attribute, which Stencil's `renderToString()` reads:
 * - a string or number as itself, and `true` as an empty attribute, so the component's first
 *   render in the browser sees them too;
 * - `false`, anything that isn't a primitive, and any value for a prop with no attribute through
 *   `ssrProp()`, which gives the server render the exact value and leaves no attribute behind.
 */
const setServerAttribute = (el: any, item: string, val: any, ssr: SsrOptions) => {
  const name = ssr.attributes?.[item] ?? toDashCase(item);
  if (val == null) {
    el.removeAttribute(name);
  } else if (
    ssr.refs?.includes(item) ||
    val === false ||
    (typeof val !== 'string' && typeof val !== 'number' && val !== true)
  ) {
    el.setAttribute(name, ssr.ssrProp(val));
  } else {
    el.setAttribute(name, val === true ? '' : String(val));
  }
};

export const proxyInputs = (Cmp: any, inputs: string[], ssr?: SsrOptions) => {
  const Prototype = Cmp.prototype;
  inputs.forEach((item) => {
    Object.defineProperty(Prototype, item, {
      get() {
        return this.el[item];
      },
      set(val: any) {
        if (ssr && serverInstances.has(this)) {
          // kept on the element too, so reading the input back on the server works
          this.el[item] = val;
          setServerAttribute(this.el, item, val, ssr);
          return;
        }
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

// tslint:disable-next-line: only-arrow-functions
export function ProxyCmp(opts: { defineCustomElementFn?: () => void; inputs?: any; methods?: any; ssr?: SsrOptions }) {
  const decorator = function (cls: any) {
    const { defineCustomElementFn, inputs, methods, ssr } = opts;

    if (defineCustomElementFn !== undefined) {
      defineCustomElementFn();
    }

    if (inputs) {
      proxyInputs(cls, inputs, ssr);
    }
    if (methods) {
      proxyMethods(cls, methods);
    }
    return cls;
  };
  return decorator;
}

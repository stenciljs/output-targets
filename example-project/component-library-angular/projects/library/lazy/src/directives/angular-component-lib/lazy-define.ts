/* eslint-disable */
/* tslint:disable */
import { ErrorHandler, PendingTasks, inject } from '@angular/core';

import { proxyInputs } from './utils';

/**
 * Loads a component's custom elements module, e.g. `() => import('my-lib/components/my-button.js')`.
 */
export type CustomElementLoader = () => Promise<{ defineCustomElement: () => void }>;

/**
 * Loads that are in flight or have finished, keyed by tag name. A failed load is removed so that
 * the next wrapper created for the tag tries again.
 *
 * Created on first use so that importing this module has no side effects.
 */
let loads: Map<string, Promise<void>> | undefined;

/**
 * Upgrades the elements of the wrappers that are waiting for a tag, keyed by tag name.
 */
let waiting: Map<string, Set<() => void>> | undefined;

/**
 * Resolves once the wrapper's element is defined and upgraded, or rejects when loading it failed.
 * Method calls made before then wait for it.
 */
const ready = /*@__PURE__*/ new WeakMap<object, Promise<void>>();

/**
 * Defines the wrapper's element the first time a wrapper for its tag is created, instead of when
 * the wrapper module is evaluated.
 *
 * Must be called from the wrapper's constructor, after `this.el` is set, since it uses `inject()`.
 *
 * @param instance The Angular wrapper instance.
 * @param inputs The names of the inputs the wrapper proxies to the element.
 * @param load Imports the element's custom elements module.
 */
export const defineOnCreate = (instance: any, inputs: string[], load: CustomElementLoader) => {
  const el: HTMLElement = instance.el;
  const tagName = el.localName;

  // `customElements` is undefined in Angular's server-side DOM, which matches what
  // `defineCustomElement` does there. Once a tag is defined, its elements are upgraded on creation.
  if (typeof customElements === 'undefined' || customElements.get(tagName) !== undefined) {
    return;
  }

  const restoreInputs = holdInputs(el, inputs);

  // Keeps `ApplicationRef.whenStable()`, `fixture.whenStable()` and server-side rendering waiting
  // until the element has been defined.
  const removeTask = inject(PendingTasks).add();
  const errorHandler = inject(ErrorHandler);

  let upgraded = false;
  const upgrade = () => {
    if (upgraded) {
      return;
    }
    upgraded = true;
    waiting!.get(tagName)!.delete(upgrade);
    customElements.upgrade(el);
    restoreInputs();
    // Later method calls go straight to the element, as they do without lazy loading.
    ready.delete(instance);
  };

  waiting ??= new Map();
  if (!waiting.has(tagName)) {
    waiting.set(tagName, new Set());
  }
  waiting.get(tagName)!.add(upgrade);

  instance.z.runOutsideAngular(() => {
    // The tag can also be defined by another component's `defineCustomElement`, which defines
    // the components it renders, or by a later wrapper retrying a failed load.
    const defined = customElements.whenDefined(tagName).then(upgrade);

    const elementReady = Promise.race([loadTag(tagName, load, errorHandler), defined]).finally(removeTask);

    // A failed load has already been reported to the ErrorHandler, so it only needs to reach
    // method calls that are waiting on it.
    elementReady.catch(() => {});
    ready.set(instance, elementReady);
  });
};

const loadTag = (tagName: string, load: CustomElementLoader, errorHandler: ErrorHandler) => {
  loads ??= new Map();

  let loading = loads.get(tagName);
  if (loading === undefined) {
    loading = load()
      .then((module) => {
        module.defineCustomElement();

        // Hand the inputs to the upgraded elements before Stencil's first render, which defining
        // the element has already scheduled. `whenDefined()` would only resolve after it.
        if (customElements.get(tagName) !== undefined) {
          [...waiting!.get(tagName)!].forEach((upgrade) => upgrade());
        }
      })
      .catch((cause) => {
        loads!.delete(tagName);
        // Not `new Error(message, { cause })`: ng-packagr's default compiler options don't
        // include the ES2022 lib that declares it.
        const error = Object.assign(new Error(`Failed to load the custom element <${tagName}>`), { cause });
        errorHandler.handleError(error);
        throw error;
      });
    loads.set(tagName, loading);
  }
  return loading;
};

/**
 * Holds the values Angular and value accessors set on the element's inputs until it is upgraded,
 * and returns a function that sets them on the upgraded element.
 *
 * They can't be left on the element as own properties: the upgrade runs the component's
 * constructor, whose class fields redefine every property, so those values would be lost.
 */
const holdInputs = (el: any, inputs: string[]) => {
  const values = new Map<string, unknown>();
  const notUpgraded = Object.getPrototypeOf(el);
  const getters = new Map<string, () => unknown>();

  for (const name of inputs) {
    if (Object.prototype.hasOwnProperty.call(el, name)) {
      values.set(name, el[name]);
      delete el[name];
    }

    const get = () => values.get(name);
    getters.set(name, get);
    Object.defineProperty(el, name, {
      get,
      set(value: unknown) {
        if (Object.getPrototypeOf(el) === notUpgraded) {
          values.set(name, value);
          return;
        }
        // The upgraded element's constructor is assigning a default: hand the property back to it.
        delete el[name];
        el[name] = value;
      },
      configurable: true,
      enumerable: true,
    });
  }

  return () => {
    for (const [name, get] of getters) {
      if (Object.getOwnPropertyDescriptor(el, name)?.get === get) {
        delete el[name];
      }
    }
    for (const [name, value] of values) {
      el[name] = value;
    }
  };
};

export const proxyLazyMethods = (Cmp: any, methods: string[]) => {
  const Prototype = Cmp.prototype;
  methods.forEach((methodName) => {
    Prototype[methodName] = function () {
      const args = arguments;
      const call = () => this.z.runOutsideAngular(() => this.el[methodName].apply(this.el, args));
      const elementReady: Promise<void> | undefined = ready.get(this);

      // Stencil methods return a Promise, so callers already await the result.
      return elementReady === undefined ? call() : elementReady.then(call);
    };
  });
};

// tslint:disable-next-line: only-arrow-functions
export function LazyProxyCmp(opts: { inputs?: any; methods?: any }) {
  const decorator = function (cls: any) {
    const { inputs, methods } = opts;

    if (inputs) {
      proxyInputs(cls, inputs);
    }
    if (methods) {
      proxyLazyMethods(cls, methods);
    }
    return cls;
  };
  return decorator;
}

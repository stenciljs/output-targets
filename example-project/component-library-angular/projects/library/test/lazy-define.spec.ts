import { ChangeDetectorRef, Component, ElementRef, ErrorHandler, NgZone, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
  CustomElementLoader,
  LazyProxyCmp,
  defineOnCreate,
} from '../lazy/src/directives/angular-component-lib/lazy-define';
import { MyComponent, MyInput, TextValueAccessor } from '../lazy/src/public-api';

/**
 * An element that behaves like a Stencil custom elements build: its constructor redefines every
 * property as a class field does, so values set on the element before it was upgraded are lost
 * unless the wrapper holds on to them.
 */
const createElementClass = () =>
  class extends HTMLElement {
    received: unknown[] = [];
    #value: unknown;

    constructor() {
      super();
      Object.defineProperty(this, 'value', { value: undefined, writable: true, configurable: true, enumerable: true });
      delete (this as any).value;
    }

    get value() {
      return this.#value;
    }
    set value(value: unknown) {
      this.#value = value;
      this.received.push(value);
    }

    async focusInner(arg: string) {
      return `focused ${arg}`;
    }
  };

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

let tagCount = 0;

/**
 * Creates a wrapper shaped like the ones `lazyDefine` generates, for a fresh tag, with a loader the
 * test controls.
 */
const createWrapper = () => {
  const tagName = `lazy-test-${++tagCount}`;
  const ElementClass = createElementClass();
  const load = jest.fn<ReturnType<CustomElementLoader>, []>();
  const define = () => customElements.define(tagName, ElementClass);

  @LazyProxyCmp({ inputs: ['value'], methods: ['focusInner'] })
  @Component({ selector: tagName, template: '<ng-content></ng-content>', inputs: ['value'] })
  class Wrapper {
    protected el: HTMLElement;
    constructor(
      c: ChangeDetectorRef,
      r: ElementRef,
      protected z: NgZone
    ) {
      c.detach();
      this.el = r.nativeElement;
      defineOnCreate(this, ['value'], load);
    }
  }

  return { tagName, ElementClass, Wrapper, load, define };
};

const createHost = (wrapper: Type<unknown>, template: string) => {
  @Component({ template, imports: [wrapper] })
  class Host {
    value = 'bound';
  }
  return Host;
};

/** Lets pending promise callbacks run. */
const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('lazyDefine', () => {
  it('passes inputs bound before the element is defined to the upgraded element', async () => {
    const { tagName, ElementClass, Wrapper, load, define } = createWrapper();
    const loaded = deferred<{ defineCustomElement: () => void }>();
    load.mockReturnValue(loaded.promise);

    const fixture = TestBed.createComponent(createHost(Wrapper, `<${tagName} [value]="value"></${tagName}>`));
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector(tagName);

    expect(customElements.get(tagName)).toBeUndefined();
    expect(el.value).toBe('bound');

    loaded.resolve({ defineCustomElement: define });
    await fixture.whenStable();

    expect(el).toBeInstanceOf(ElementClass);
    expect(el.value).toBe('bound');
    expect(el.received).toContain('bound');
    expect(Object.getOwnPropertyDescriptor(el, 'value')).toBeUndefined();
  });

  it('passes values a value accessor writes before the element is defined', async () => {
    const fixture = TestBed.createComponent(
      (() => {
        @Component({
          template: `<my-input type="text" [(ngModel)]="text"></my-input>`,
          imports: [MyInput, TextValueAccessor, FormsModule],
        })
        class Host {
          text = 'from ngModel';
        }
        return Host;
      })()
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.debugElement.query(By.css('my-input')).nativeElement;
    expect(customElements.get('my-input')).toBeDefined();
    expect(el.value).toBe('from ngModel');
  });

  it('keeps the application unstable until the element is defined', async () => {
    const { tagName, Wrapper, load, define } = createWrapper();
    const loaded = deferred<{ defineCustomElement: () => void }>();
    load.mockReturnValue(loaded.promise);

    const fixture = TestBed.createComponent(createHost(Wrapper, `<${tagName}></${tagName}>`));
    fixture.detectChanges();

    let stable = false;
    fixture.whenStable().then(() => (stable = true));
    await flush();
    expect(stable).toBe(false);

    loaded.resolve({ defineCustomElement: define });
    await fixture.whenStable();
    expect(stable).toBe(true);
    expect(customElements.get(tagName)).toBeDefined();
  });

  it('makes method calls wait until the element is defined', async () => {
    const { tagName, Wrapper, load, define } = createWrapper();
    const loaded = deferred<{ defineCustomElement: () => void }>();
    load.mockReturnValue(loaded.promise);

    const fixture = TestBed.createComponent(createHost(Wrapper, `<${tagName}></${tagName}>`));
    fixture.detectChanges();
    const wrapper = fixture.debugElement.query(By.directive(Wrapper)).componentInstance;

    const result = wrapper.focusInner('early');
    loaded.resolve({ defineCustomElement: define });

    await expect(result).resolves.toBe('focused early');
    await expect(wrapper.focusInner('later')).resolves.toBe('focused later');
  });

  it('loads each tag once, however many wrappers are created', async () => {
    const { tagName, ElementClass, Wrapper, load, define } = createWrapper();
    load.mockResolvedValue({ defineCustomElement: define });

    const fixture = TestBed.createComponent(
      createHost(Wrapper, `<${tagName} [value]="value"></${tagName}><${tagName} value="static"></${tagName}>`)
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const [first, second] = fixture.nativeElement.querySelectorAll(tagName);
    expect(load).toHaveBeenCalledTimes(1);
    expect(first).toBeInstanceOf(ElementClass);
    expect(first.value).toBe('bound');
    expect(second).toBeInstanceOf(ElementClass);
  });

  it('reports a failed load once, rejects waiting method calls, and retries with the next wrapper', async () => {
    const { tagName, ElementClass, Wrapper, load, define } = createWrapper();
    const handleError = jest.fn();
    TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useValue: { handleError } }] });
    const cause = new Error('chunk failed');
    load.mockRejectedValueOnce(cause);

    const failed = TestBed.createComponent(
      createHost(Wrapper, `<${tagName} [value]="value"></${tagName}><${tagName}></${tagName}>`)
    );
    failed.detectChanges();
    const wrapper = failed.debugElement.query(By.directive(Wrapper)).componentInstance;
    const call = wrapper.focusInner('early');
    await failed.whenStable();

    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError.mock.calls[0][0].message).toBe(`Failed to load the custom element <${tagName}>`);
    expect(handleError.mock.calls[0][0].cause).toBe(cause);
    await expect(call).rejects.toThrow(`Failed to load the custom element <${tagName}>`);
    expect(customElements.get(tagName)).toBeUndefined();

    load.mockResolvedValue({ defineCustomElement: define });
    const retried = TestBed.createComponent(createHost(Wrapper, `<${tagName}></${tagName}>`));
    retried.detectChanges();
    await retried.whenStable();

    expect(load).toHaveBeenCalledTimes(2);
    expect(retried.nativeElement.querySelector(tagName)).toBeInstanceOf(ElementClass);
    // Wrappers created before the retry are upgraded too, and keep the inputs they were given.
    const earlier = failed.nativeElement.querySelector(tagName);
    await flush();
    expect(earlier).toBeInstanceOf(ElementClass);
    expect(earlier.value).toBe('bound');
  });

  it('does not load anything when the tag is already defined', async () => {
    const { tagName, ElementClass, Wrapper, load, define } = createWrapper();
    define();

    const fixture = TestBed.createComponent(createHost(Wrapper, `<${tagName} [value]="value"></${tagName}>`));
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector(tagName);
    const wrapper = fixture.debugElement.query(By.directive(Wrapper)).componentInstance;

    expect(load).not.toHaveBeenCalled();
    expect(el).toBeInstanceOf(ElementClass);
    expect(el.value).toBe('bound');
    // Nothing to wait for: this would time out if a pending task had been added.
    await fixture.whenStable();
    await expect(wrapper.focusInner('now')).resolves.toBe('focused now');
  });

  it('does not load anything without a custom elements registry, as on the server', async () => {
    const { tagName, Wrapper, load } = createWrapper();
    const registry = Object.getOwnPropertyDescriptor(window, 'customElements')!;
    Object.defineProperty(window, 'customElements', { value: undefined, configurable: true });

    try {
      const fixture = TestBed.createComponent(createHost(Wrapper, `<${tagName} [value]="value"></${tagName}>`));
      fixture.detectChanges();

      expect(load).not.toHaveBeenCalled();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector(tagName).value).toBe('bound');
    } finally {
      Object.defineProperty(window, 'customElements', registry);
    }
  });

  it('renders a Stencil component with the inputs bound before it was loaded', async () => {
    @Component({
      template: `<my-component first="John" [middleName]="middleName" last="Doe"></my-component>`,
      imports: [MyComponent],
    })
    class Host {
      middleName = 'William';
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('my-component');
    expect(customElements.get('my-component')).toBeUndefined();

    await fixture.whenStable();

    expect(customElements.get('my-component')).toBeDefined();
    expect(el.middleName).toBe('William');

    // This custom elements build has no `componentOnReady()`, so wait for the first render. It
    // has to show the bound value: rendering `undefined` first would be visible, and components
    // that require an input may throw without it.
    for (let i = 0; i < 50 && !el.shadowRoot?.textContent; i++) {
      await flush();
    }
    expect(el.shadowRoot.textContent).toContain("Hello, World! I'm John William Doe");
  });
});

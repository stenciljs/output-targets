import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { htmlToDOM } from 'html-react-parser';
import { createComponent, splitRenderedComponent } from './ssr.js';
import type { HydrateModule } from './ssr.js';

// Type for the options passed to createComponent
type CreateComponentForSSROptions<I extends HTMLElement> = {
  tagName: string;
  properties: Record<string, string>;
  hydrateModule: Promise<HydrateModule>;
  transformTag?: (tag: string) => string;
  getTagTransformer?: () => ((tag: string) => string) | undefined;
};

// Mock dependencies
vi.mock('react-dom/server', () => ({
  renderToString: vi.fn(() => '<div>mocked children</div>'),
}));

vi.mock('html-react-parser', async (importOriginal) => ({
  ...(await importOriginal<typeof import('html-react-parser')>()),
  default: vi.fn(() => React.createElement('div', { 'data-testid': 'parsed' }, 'parsed content')),
}));

vi.mock('react-style-stringify', () => ({
  stringifyCSSProperties: vi.fn((styles) =>
    Object.entries(styles)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ')
  ),
}));

vi.mock('./constants.js', () => ({
  possibleStandardNames: {
    className: 'class',
    htmlFor: 'for',
  },
}));

describe('SSR Boolean attributes & shadowrootdelegatesfocus', () => {
  let mockHydrateModule: HydrateModule;
  let originalProcess: any;
  let originalWindow: any;
  let capturedRenderToStringArgs: [string, any][] = [];

  beforeEach(() => {
    // Reset captured args
    capturedRenderToStringArgs = [];

    // Mock server environment
    originalProcess = (globalThis as any).process;
    originalWindow = (globalThis as any).window;

    (globalThis as any).process = { env: {} };
    (globalThis as any).window = undefined;

    // Create mock hydrate module with proper argument capture
    mockHydrateModule = {
      renderToString: vi.fn().mockImplementation((html: string, options: any) => {
        capturedRenderToStringArgs.push([html, options]);
        // render whichever component was serialized
        const tagName = /^<([\w-]+)/.exec(html)![1];
        return Promise.resolve({
          html: `<${tagName}>
  <template shadowrootmode="open">
    <div>Shadow content</div>
  </template>
  <div>mocked children</div>
</${tagName}>`,
        });
      }),
      transformTag: vi.fn((tag) => tag),
      setTagTransformer: vi.fn(),
    };
  });

  afterEach(() => {
    (globalThis as any).process = originalProcess;
    (globalThis as any).window = originalWindow;
    vi.clearAllMocks();
  });

  it('should skip false boolean attributes but include true ones', async () => {
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'test-component',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };

    const Component = createComponent(options);
    const props = {
      disabled: false, // Should be skipped
      hidden: false, // Should be skipped
      required: true, // Should be included
      readonly: true, // Should be included
      title: 'Test', // Should be included (non-boolean)
    };

    await Component(props);

    expect(capturedRenderToStringArgs).toHaveLength(1);
    const [htmlArg] = capturedRenderToStringArgs[0];

    // Should NOT contain false boolean attributes
    expect(htmlArg).not.toContain('disabled="false"');
    expect(htmlArg).not.toContain('hidden="false"');

    // Should contain true boolean attributes and other props
    expect(htmlArg).toContain('required="true"');
    expect(htmlArg).toContain('readonly="true"');
    expect(htmlArg).toContain('title="Test"');
  });

  it('should include shadowrootdelegatesfocus when present in Stencil output', async () => {
    // Mock hydrate module that returns HTML with shadowrootdelegatesfocus
    const mockWithDelegatesFocus = {
      ...mockHydrateModule,
      renderToString: vi.fn().mockImplementation((html: string, options: any) => {
        capturedRenderToStringArgs.push([html, options]);
        return Promise.resolve({
          html: `<test-component>
  <template shadowrootmode="open" shadowrootdelegatesfocus>
    <div>Shadow content with focus delegation</div>
  </template>
  <div>mocked children</div>
</test-component>`,
        });
      }),
    };

    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'test-component',
      properties: {},
      hydrateModule: Promise.resolve(mockWithDelegatesFocus),
    };

    const Component = createComponent(options);
    const result = await Component({});

    // Verify the component was created successfully
    expect(result).toBeDefined();
    expect(capturedRenderToStringArgs).toHaveLength(1);
  });

  it('should not include shadowrootdelegatesfocus when absent from Stencil output', async () => {
    // Use default mock (without shadowrootdelegatesfocus)
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'test-component',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };

    const Component = createComponent(options);
    const result = await Component({});

    // Verify the component was created successfully
    expect(result).toBeDefined();
    expect(capturedRenderToStringArgs).toHaveLength(1);
  });

  it('should serialize children that are React.forwardRef components without throwing', async () => {
    // React.forwardRef components (e.g. those created by @lit/react) use hooks internally.
    // resolveComponentTypes must NOT call their render() directly — that violates hook rules.
    // They should be returned as-is for react-dom/server to handle natively.
    const ForwardRefChild = React.forwardRef<HTMLElement, { slot?: string }>((_props, _ref) =>
      React.createElement('my-counter', {})
    );
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const Component = createComponent(options);
    await expect(
      Component({ children: React.createElement(ForwardRefChild, { slot: 'icon' }) })
    ).resolves.toBeDefined();
  });

  it('should serialize children that are React.memo components without throwing', async () => {
    // React.memo wraps a component in { $$typeof, type, compare }. The 'type' property
    // would trigger the bottom recursive unwrap in resolveType, calling the inner function
    // with hooks directly. The exotic guard must prevent this.
    const MemoChild = React.memo((_props: { slot?: string }) => React.createElement('my-input', {}));
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const Component = createComponent(options);
    await expect(Component({ children: React.createElement(MemoChild, { slot: 'icon' }) })).resolves.toBeDefined();
  });

  it('should serialize a nested Stencil SSR component as a slot child without throwing', async () => {
    // When a Stencil SSR async component is used as a child (e.g. in a named slot),
    // resolveComponentTypes must return the already-rendered element as-is, not try
    // to use it as a `type` — which would cause renderToString to fail with
    // "Objects are not valid as a React child".
    const { renderToString } = await import('react-dom/server');
    const realRenderToString = (await vi.importActual<typeof import('react-dom/server')>('react-dom/server'))
      .renderToString;

    // Parent component
    const parentOptions: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const ParentComponent = createComponent(parentOptions);

    // Child Stencil SSR component (async function)
    const childOptions: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-component',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const ChildComponent = createComponent(childOptions);

    // Use the real renderToString for children so the async issue would surface
    vi.mocked(renderToString).mockImplementationOnce((element) => {
      try {
        return realRenderToString(element as React.ReactElement);
      } catch {
        // If the old (broken) code ran, it would produce "Objects are not valid as a React child"
        // We re-throw so the test catches it
        throw new Error('renderToString failed on nested Stencil SSR child');
      }
    });

    await expect(
      ParentComponent({
        children: React.createElement(ChildComponent as any, { slot: 'start', first: 'Icon', last: 'Test' }),
      })
    ).resolves.toBeDefined();
  });

  it('should handle mixed prop types correctly', async () => {
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'test-component',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };

    const Component = createComponent(options);
    const props = {
      disabled: false, // Boolean false - should be skipped
      required: true, // Boolean true - should be included
      title: 'Test Title', // String - should be included
      maxLength: 0, // Number (even zero) - should be included
      onClick: () => {}, // Function - should be skipped
      emptyString: '', // Empty string - should be included
    };

    await Component(props);

    expect(capturedRenderToStringArgs).toHaveLength(1);
    const [htmlArg] = capturedRenderToStringArgs[0];

    expect(htmlArg).not.toContain('disabled="false"');
    expect(htmlArg).not.toContain('onClick');
    expect(htmlArg).toContain('required="true"');
    expect(htmlArg).toContain('title="Test Title"');
    expect(htmlArg).toContain('maxLength="0"');
    expect(htmlArg).toContain('emptyString=""');
  });

  it('should resolve React.lazy wrapping a React.forwardRef component without calling render directly', async () => {
    const ForwardRefChild = React.forwardRef<HTMLElement, { slot?: string }>((_props, _ref) =>
      React.createElement('my-counter', {})
    );
    const LazyForwardRef = React.lazy(() => Promise.resolve({ default: ForwardRefChild }));
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const Component = createComponent(options);
    await expect(
      Component({ children: React.createElement(LazyForwardRef as any, { slot: 'icon' }) })
    ).resolves.toBeDefined();
  });

  it('should resolve React.lazy wrapping a React.memo component without calling inner render directly', async () => {
    const MemoChild = React.memo((_props: { slot?: string }) => React.createElement('my-input', {}));
    const LazyMemo = React.lazy(() => Promise.resolve({ default: MemoChild }));
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const Component = createComponent(options);
    await expect(
      Component({ children: React.createElement(LazyMemo as any, { slot: 'icon' }) })
    ).resolves.toBeDefined();
  });

  it('should return React.memo wrapping a React.forwardRef component as-is without unwrapping', async () => {
    const ForwardRefChild = React.forwardRef<HTMLElement, { slot?: string }>((_props, _ref) =>
      React.createElement('my-counter', {})
    );
    const MemoForwardRef = React.memo(ForwardRefChild);
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const Component = createComponent(options);
    await expect(
      Component({ children: React.createElement(MemoForwardRef as any, { slot: 'icon' }) })
    ).resolves.toBeDefined();
  });

  it('should serialize a nested Stencil SSR child shallowly instead of rendering it', async () => {
    // The parent's light DOM pass must not run the child's hydrate render;
    // that doubled the cost at every nesting level.
    const { renderToString } = await import('react-dom/server');
    const realRenderToString = (await vi.importActual<typeof import('react-dom/server')>('react-dom/server'))
      .renderToString;
    vi.mocked(renderToString).mockImplementationOnce((element) => realRenderToString(element as React.ReactElement));

    const ParentComponent = createComponent({
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    });
    const ChildComponent = createComponent({
      tagName: 'my-component',
      properties: { iconName: 'icon-name' },
      hydrateModule: Promise.resolve(mockHydrateModule),
    });

    await ParentComponent({
      children: React.createElement(
        ChildComponent as any,
        { slot: 'start', iconName: 'home', disabled: false },
        'Label'
      ),
    });

    // Only the parent went through the hydrate module.
    expect(capturedRenderToStringArgs).toHaveLength(1);
    const [lightDom] = capturedRenderToStringArgs[0];
    expect(lightDom).toContain('<my-component slot="start" icon-name="home">Label</my-component>');
    expect(lightDom).not.toContain('<template');
  });

  it('should resolve deeply nested async Stencil SSR grandchild without error', async () => {
    const grandchildOptions: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-counter',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const GrandchildComponent = createComponent(grandchildOptions);

    const childOptions: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-component',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const ChildComponent = createComponent(childOptions);

    const parentOptions: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const ParentComponent = createComponent(parentOptions);

    await expect(
      ParentComponent({
        children: React.createElement(
          ChildComponent as any,
          { slot: 'start' },
          React.createElement(GrandchildComponent as any, { slot: 'icon' })
        ),
      })
    ).resolves.toBeDefined();
  });

  it('should pass through falsy children (null, undefined, false, 0) without throwing', async () => {
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-component',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const Component = createComponent(options);
    await expect(Component({ children: null })).resolves.toBeDefined();
    await expect(Component({ children: undefined })).resolves.toBeDefined();
    await expect(Component({ children: false as any })).resolves.toBeDefined();
    await expect(Component({ children: 0 as any })).resolves.toBeDefined();
  });

  it('should resolve an array of mixed children (forwardRef, string, Stencil SSR, null) correctly', async () => {
    const ForwardRefChild = React.forwardRef<HTMLElement, { slot?: string }>((_props, _ref) =>
      React.createElement('my-counter', {})
    );
    const stencilOptions: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-component',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const StencilChild = createComponent(stencilOptions);

    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const Component = createComponent(options);
    await expect(
      Component({
        children: [
          React.createElement(ForwardRefChild, { slot: 'icon' }),
          'plain text',
          React.createElement(StencilChild as any, { slot: 'start' }),
          null,
        ] as any,
      })
    ).resolves.toBeDefined();
  });

  it('should render a class component slot child without crashing', async () => {
    class ClassChild extends React.Component<{ slot?: string }> {
      render() {
        return React.createElement('span', {}, 'hello');
      }
    }
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const Component = createComponent(options);
    await expect(Component({ children: React.createElement(ClassChild, { slot: 'label' }) })).resolves.toBeDefined();
  });

  it('should not throw when a function component slot child returns null', async () => {
    const NullChild = (_props: { slot?: string }) => null;
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const Component = createComponent(options);
    await expect(Component({ children: React.createElement(NullChild, { slot: 'icon' }) })).resolves.toBeDefined();
  });

  it('should not treat a plain object with a render key as a forwardRef exotic', async () => {
    // isNativelyRenderedExotic must check $$typeof, not just the presence of 'render'.
    // A plain object { render: fn } that is NOT a React exotic must not be short-circuited —
    // it should fall through to normal resolution and be called as a function component.
    const spy = vi.fn((_props: { slot?: string }) => React.createElement('span', {}, 'ok'));
    const NotExotic = Object.assign(spy, {
      render: () => React.createElement('span', {}, 'should not be called via render key'),
    });
    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };
    const Component = createComponent(options);
    await expect(Component({ children: React.createElement(NotExotic, { slot: 'icon' }) })).resolves.toBeDefined();
    expect(spy).toHaveBeenCalled();
  });
});

describe('SSR reuseWindow', () => {
  let originalProcess: any;
  let originalWindow: any;

  beforeEach(() => {
    originalProcess = (globalThis as any).process;
    originalWindow = (globalThis as any).window;
    (globalThis as any).process = { env: {} };
    (globalThis as any).window = undefined;
    // `ssr.js` caches the first SSR module it loads, so each test needs a fresh copy
    vi.resetModules();
  });

  afterEach(() => {
    (globalThis as any).process = originalProcess;
    (globalThis as any).window = originalWindow;
    vi.clearAllMocks();
  });

  const mockSsrModule = (extra: Partial<HydrateModule> = {}) => {
    const calls: any[] = [];
    const module: HydrateModule = {
      renderToString: vi.fn().mockImplementation((_html: string, options: any) => {
        calls.push(options);
        return Promise.resolve({
          html: `<test-component>
  <template shadowrootmode="open">
    <div>Shadow content</div>
  </template>
</test-component>`,
          styles: [],
        });
      }),
      transformTag: vi.fn((tag) => tag),
      setTagTransformer: vi.fn(),
      ...extra,
    };
    return { module, calls };
  };

  const renderWith = async (module: HydrateModule) => {
    const { createComponent: create } = await import('./ssr.js');
    const Component = create({
      tagName: 'test-component',
      properties: {},
      hydrateModule: Promise.resolve(module),
    });
    await (Component as any)({});
  };

  it('passes reuseWindow to SSR modules that support it (Stencil v5+)', async () => {
    const { module, calls } = mockSsrModule({ resetReusableWindows: vi.fn() });
    await renderWith(module);
    expect(calls).toHaveLength(1);
    expect(calls[0].reuseWindow).toBe(true);
  });

  it("doesn't pass reuseWindow to SSR modules without it (Stencil v4)", async () => {
    const { module, calls } = mockSsrModule();
    await renderWith(module);
    expect(calls).toHaveLength(1);
    expect('reuseWindow' in calls[0]).toBe(false);
  });
});

describe('SSR fragment handling', () => {
  let originalProcess: any;
  let originalWindow: any;

  beforeEach(() => {
    originalProcess = (globalThis as any).process;
    originalWindow = (globalThis as any).window;
    (globalThis as any).process = { env: {} };
    (globalThis as any).window = undefined;
    vi.resetModules();
  });

  afterEach(() => {
    (globalThis as any).process = originalProcess;
    (globalThis as any).window = originalWindow;
    vi.clearAllMocks();
  });

  const render = async (html: string, props: Record<string, unknown> = {}) => {
    const inputs: string[] = [];
    const module: HydrateModule = {
      renderToString: vi.fn().mockImplementation((input: string) => {
        inputs.push(input);
        return Promise.resolve({ html, styles: [] });
      }),
      transformTag: vi.fn((tag) => tag),
      setTagTransformer: vi.fn(),
    };
    const { createComponent: create } = await import('./ssr.js');
    const Component = create({ tagName: 'test-component', properties: {}, hydrateModule: Promise.resolve(module) });
    const element = await (Component as any)(props);
    // render the returned element so `html-react-parser` (mocked) receives the parsed HTML
    const { default: parse } = await import('html-react-parser');
    (element.type as () => unknown)();
    const [parsed, parseOptions] = vi.mocked(parse as unknown as typeof parse.default).mock.calls.at(-1)!;
    // what the component renders as: the transform `html-react-parser` would apply to the host
    const host = () =>
      (parseOptions as any).transform({ props: {} }, { name: 'test-component' }) as React.ReactElement<any>;
    return { inputs, parsed: parsed as string, host };
  };

  const shadowRootOf = (host: React.ReactElement<any>) => {
    const template = React.Children.toArray(host.props.children)[0] as React.ReactElement<any>;
    return template.props.dangerouslySetInnerHTML.__html as string;
  };

  it('escapes attribute values', async () => {
    const { inputs } = await render(
      `<test-component>
  <template shadowrootmode="open">
    <div>Shadow content</div>
  </template>
</test-component>`,
      { label: 'Tom & "Jerry"', data: '[{"a":"<b>"}]' }
    );
    expect(inputs[0]).toContain('label="Tom &amp; &quot;Jerry&quot;"');
    expect(inputs[0]).toContain('data="[{&quot;a&quot;:&quot;<b>&quot;}]"');
  });

  it('skips the styles Stencil v5 puts before the component in a fragment', async () => {
    // a scoped component in the light DOM: v5 writes its styles at the start of the fragment
    const { parsed } = await render(`<style sty-id="sc-scoped-child">
  .sc-scoped-child-h{display:block}
</style>
<test-component>
  <template shadowrootmode="open">
    <div>Shadow content</div>
  </template>
  <scoped-child class="sc-scoped-child-h"></scoped-child>
</test-component>`);
    expect(parsed.startsWith('<test-component>')).toBe(true);
    expect(parsed).not.toContain('sc-scoped-child-h{');
  });

  it('adds the hydration marker to the shadow root', async () => {
    const { host } = await render(
      '<test-component><template shadowrootmode="open"><slot></slot></template></test-component>'
    );
    expect(shadowRootOf(host())).toBe('<!--r.1--><slot></slot>');
  });
});

describe('splitRenderedComponent', () => {
  it("keeps a light DOM component's whitespace exactly", () => {
    const { lightDom, template } = splitRenderedComponent(
      '<my-note s-id="1"><!--r.1--><strong>Note:</strong><!--t.1.2.0.1--> <!--s.1.3.0.2.-->Hi</my-note>',
      ['my-note'],
      htmlToDOM
    );
    expect(template).toBeUndefined();
    expect(lightDom).toBe('<!--r.1--><strong>Note:</strong><!--t.1.2.0.1--> <!--s.1.3.0.2.-->Hi');
  });

  it('finds the matching </template> past nested shadow roots, and the light DOM after it', () => {
    const { template, lightDom } = splitRenderedComponent(
      '<my-card s-id="1"><template shadowrootmode="open" shadowrootdelegatesfocus><my-inner s-id="2"><template shadowrootmode="open"><b>in</b></template></my-inner><slot></slot></template><p>light</p></my-card>',
      ['my-card'],
      htmlToDOM
    );
    expect(template?.delegatesFocus).toBe(true);
    expect(template?.content).toBe(
      '<my-inner s-id="2"><template shadowrootmode="open"><b>in</b></template></my-inner><slot></slot>'
    );
    expect(lightDom).toBeUndefined();
  });

  it('skips leading styles and handles `>` in attribute values', () => {
    const { html, lightDom } = splitRenderedComponent(
      '<style sty-id="sc-x">.x{}</style><my-list items="[{&quot;a&quot;:&quot;<b>&quot;}]" data-x=\'a>b\'>text</my-list>',
      ['my-list'],
      htmlToDOM
    );
    expect(html.startsWith('<my-list')).toBe(true);
    expect(lightDom).toBe('text');
  });

  it("throws when the component isn't in the fragment, and doesn't match by prefix", () => {
    expect(() => splitRenderedComponent('<my-card-header>x</my-card-header>', ['my-card'], htmlToDOM)).toThrow(
      'Could not find <my-card>'
    );
  });

  it('accepts any of the given tag names', () => {
    const { lightDom } = splitRenderedComponent('<my-card-v2>x</my-card-v2>', ['my-card-v2', 'my-card'], htmlToDOM);
    expect(lightDom).toBe('x');
  });

  it('ignores `<template>` and `</template>` in attribute values and comments of the shadow root', () => {
    const { template } = splitRenderedComponent(
      '<my-card><template shadowrootmode="open"><my-code code="</template><template>"></my-code><!-- </template> --><slot></slot></template><p>light</p></my-card>',
      ['my-card'],
      htmlToDOM
    );
    expect(template?.content).toBe('<my-code code="</template><template>"></my-code><!-- </template> --><slot></slot>');
  });
});

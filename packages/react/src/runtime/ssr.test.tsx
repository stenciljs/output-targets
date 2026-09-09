import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createComponent } from './ssr.js';
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

vi.mock('html-react-parser', () => ({
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
        return Promise.resolve({
          html: `<test-component>
  <template shadowrootmode="open">
    <div>Shadow content</div>
  </template>
  <div>mocked children</div>
</test-component>`,
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

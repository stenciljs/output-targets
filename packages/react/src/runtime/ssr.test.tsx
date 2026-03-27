import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createComponent } from './ssr.js';
import type { HydrateModule } from './ssr.js';

type CreateComponentForSSROptions<I extends HTMLElement> = {
  tagName: string;
  properties: Record<string, string>;
  hydrateModule: Promise<HydrateModule>;
  transformTag?: (tag: string) => string;
  getTagTransformer?: () => ((tag: string) => string) | undefined;
};

const findStyleElements = (element: any): any[] => {
  if (!React.isValidElement(element)) {
    return [];
  }

  const styles: any[] = [];
  const queue = [element];

  while (queue.length > 0) {
    const current = queue.shift();

    if (React.isValidElement(current)) {
      if (current.type === 'style') {
        styles.push(current);
      }

      if (current.props?.children) {
        const children = React.Children.toArray(current.props.children);
        queue.push(...children);
      }
    } else if (Array.isArray(current)) {
      queue.push(...current);
    }
  }

  return styles;
};

// Mock dependencies
vi.mock('react-dom/server', () => ({
  renderToString: vi.fn(() => '<div>mocked children</div>'),
}));

vi.mock('html-react-parser', () => ({
  default: vi.fn((html: string, options?: any) => {
    if (!options?.transform) {
      return React.createElement('div', { 'data-testid': 'parsed' }, 'parsed content');
    }

    const parseHtml = (htmlStr: string): React.ReactNode => {
      const regex = /<(\w+)([^>]*)>/g;
      let match;
      const elements: React.ReactNode[] = [];

      while ((match = regex.exec(htmlStr)) !== null) {
        const tagName = match[1];
        const element = React.createElement(tagName, { key: match.index });

        const domNode = {
          name: tagName,
          type: 'tag',
          attribs: {},
        };

        const transformed = options.transform(element, domNode);
        if (transformed !== undefined) {
          elements.push(transformed);
        }
      }

      return elements.length === 1 ? elements[0] : elements;
    };

    return parseHtml(html);
  }),
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
      serializeProperty: vi.fn((value) => `"${JSON.stringify(value)}"`),
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
});

describe('Style Deduplication for Scoped Components', () => {
  let originalProcess: any;
  let originalWindow: any;

  beforeEach(async () => {
    vi.resetModules();

    originalProcess = (globalThis as any).process;
    originalWindow = (globalThis as any).window;
    (globalThis as any).process = { env: {} };
    (globalThis as any).window = undefined;
  });

  afterEach(() => {
    (globalThis as any).process = originalProcess;
    (globalThis as any).window = originalWindow;
    vi.mock('html-react-parser', () => ({
      default: vi.fn(() => React.createElement('div', { 'data-testid': 'parsed' }, 'parsed content')),
    }));
    vi.clearAllMocks();
  });

  it('should render all styles with React precedence props', async () => {
    vi.resetModules();
    vi.unmock('html-react-parser');

    const { createComponent: createComponentFresh } = await import('./ssr.js');

    const styleId = 'my-counter-style';
    const styleContent = '.my-counter { color: blue; }';
    const mockRenderToString = vi.fn().mockImplementation((html: string, options: any) => {
      return Promise.resolve({
        html: `<my-counter>
   <div>Shadow content</div>
</my-counter>`,
        styles: [{ id: styleId, content: styleContent }],
      });
    });

    const mockHydrateModule: HydrateModule = {
      renderToString: mockRenderToString,
      serializeProperty: vi.fn((value) => `"${JSON.stringify(value)}"`),
      transformTag: vi.fn((tag) => tag),
      setTagTransformer: vi.fn(),
    };

    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-counter',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };

    const Component = createComponentFresh(options);
    const result = await Component({});

    expect(result).toBeDefined();
    expect(React.isValidElement(result)).toBe(true);

    const stencilElement = result as any;
    const renderedContent = stencilElement.type({});

    const styleElements = findStyleElements(renderedContent);
    expect(styleElements.length).toBeGreaterThan(0);

    const styleElement = styleElements[0];
    expect(styleElement.props.href).toBe('stencil-my-counter');
    expect(styleElement.props.precedence).toBe('stencil');
    expect(styleElement.props.suppressHydrationWarning).toBe(true);
    expect(styleElement.props.dangerouslySetInnerHTML.__html).toBe('.my-counter { color: blue; }');
  });

  it('should render different styles with different IDs', async () => {
    vi.unmock('html-react-parser');
    vi.unmock('react-dom/server');
    const { createComponent: createComponentFresh } = await import('./ssr.js');

    const mockRenderToString = vi.fn().mockImplementation((html: string, options: any) => {
      return Promise.resolve({
        html: `<my-counter>
  <div>Counter content</div>
</my-counter>`,
        styles: [{ id: 'my-counter', content: '.counter { color: blue; }' }],
      });
    });

    const mockHydrateModule: HydrateModule = {
      renderToString: mockRenderToString,
      serializeProperty: vi.fn((value) => `"${JSON.stringify(value)}"`),
      transformTag: vi.fn((tag) => tag),
      setTagTransformer: vi.fn(),
    };

    const counterOptions: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-counter',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };

    const CounterComponent = createComponentFresh(counterOptions);
    await CounterComponent({});

    expect(mockRenderToString).toHaveBeenCalledTimes(1);
  });

  it('should handle empty styles array', async () => {
    vi.unmock('html-react-parser');
    vi.unmock('react-dom/server');
    const { createComponent: createComponentFresh } = await import('./ssr.js');

    const mockRenderToString = vi.fn().mockImplementation((html: string, options: any) => {
      return Promise.resolve({
        html: `<my-component>
  <div>Content</div>
</my-component>`,
        styles: [],
      });
    });

    const mockHydrateModule: HydrateModule = {
      renderToString: mockRenderToString,
      serializeProperty: vi.fn((value) => `"${JSON.stringify(value)}"`),
      transformTag: vi.fn((tag) => tag),
      setTagTransformer: vi.fn(),
    };

    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-component',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };

    const Component = createComponentFresh(options);
    const result = await Component({});

    expect(result).toBeDefined();
    expect(mockRenderToString).toHaveBeenCalledTimes(1);
  });

  it('should render multiple style tags for multiple instances', async () => {
    vi.resetModules();
    vi.unmock('html-react-parser');
    const { createComponent: createComponentFresh } = await import('./ssr.js');

    const mockRenderToString = vi.fn().mockImplementation((html: string, options: any) => {
      return Promise.resolve({
        html: `<my-component>
   <div>Content</div>
</my-component>`,
        styles: [
          { id: 'style-1', content: '.component { display: block; }' },
          { id: 'style-2', content: '.valid { color: green; }' },
        ],
      });
    });

    const mockHydrateModule: HydrateModule = {
      renderToString: mockRenderToString,
      serializeProperty: vi.fn((value) => `"${JSON.stringify(value)}"`),
      transformTag: vi.fn((tag) => tag),
      setTagTransformer: vi.fn(),
    };

    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-component',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };

    const Component = createComponentFresh(options);
    const result = await Component({});

    expect(result).toBeDefined();

    const stencilElement = result as any;
    const renderedContent = stencilElement.type({});

    const styleElements = findStyleElements(renderedContent);
    expect(styleElements.length).toBe(2);

    expect(styleElements[0].props.href).toBe('stencil-my-component');
    expect(styleElements[0].props.precedence).toBe('stencil');
    expect(styleElements[0].props.dangerouslySetInnerHTML.__html).toBe('.component { display: block; }');

    expect(styleElements[1].props.href).toBe('stencil-my-component');
    expect(styleElements[1].props.precedence).toBe('stencil');
    expect(styleElements[1].props.dangerouslySetInnerHTML.__html).toBe('.valid { color: green; }');
  });

  it('should handle styles with empty content', async () => {
    vi.resetModules();
    vi.unmock('html-react-parser');
    const { createComponent: createComponentFresh } = await import('./ssr.js');

    const mockRenderToString = vi.fn().mockImplementation((html: string, options: any) => {
      return Promise.resolve({
        html: `<my-component>
   <div>Content</div>
</my-component>`,
        styles: [
          { id: 'empty', content: '' },
          { id: 'valid', content: '.component { margin: 0; }' },
        ],
      });
    });

    const mockHydrateModule: HydrateModule = {
      renderToString: mockRenderToString,
      serializeProperty: vi.fn((value) => `"${JSON.stringify(value)}"`),
      transformTag: vi.fn((tag) => tag),
      setTagTransformer: vi.fn(),
    };

    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-component',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };

    const Component = createComponentFresh(options);
    const result = await Component({});

    expect(result).toBeDefined();

    const stencilElement = result as any;
    const renderedContent = stencilElement.type({});

    const styleElements = findStyleElements(renderedContent);
    expect(styleElements.length).toBe(2);

    expect(styleElements[0].props.dangerouslySetInnerHTML.__html).toBe('');
    expect(styleElements[1].props.href).toBe('stencil-my-component');
    expect(styleElements[1].props.precedence).toBe('stencil');
    expect(styleElements[1].props.dangerouslySetInnerHTML.__html).toBe('.component { margin: 0; }');
  });

  it('should handle multiple component types with their own styles', async () => {
    vi.unmock('html-react-parser');
    const { createComponent: createComponentFresh } = await import('./ssr.js');

    const counterMockRenderToString = vi.fn().mockImplementation((html: string, options: any) => {
      return Promise.resolve({
        html: `<my-counter>
  <div>Counter</div>
</my-counter>`,
        styles: [{ id: 'counter-style', content: '.counter { color: blue; }' }],
      });
    });

    const counterMockHydrate: HydrateModule = {
      renderToString: counterMockRenderToString,
      serializeProperty: vi.fn((value) => `"${JSON.stringify(value)}"`),
      transformTag: vi.fn((tag) => tag),
      setTagTransformer: vi.fn(),
    };

    const counterOptions: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-counter',
      properties: {},
      hydrateModule: Promise.resolve(counterMockHydrate),
    };

    const CounterComponent = createComponentFresh(counterOptions);
    await CounterComponent({});

    vi.resetModules();

    const { createComponent: createComponentFresh2 } = await import('./ssr.js');

    const buttonMockRenderToString = vi.fn().mockImplementation((html: string, options: any) => {
      return Promise.resolve({
        html: `<my-button>
  <div>Button</div>
</my-button>`,
        styles: [{ id: 'button-style', content: '.button { color: red; }' }],
      });
    });

    const buttonMockHydrate: HydrateModule = {
      renderToString: buttonMockRenderToString,
      serializeProperty: vi.fn((value) => `"${JSON.stringify(value)}"`),
      transformTag: vi.fn((tag) => tag),
      setTagTransformer: vi.fn(),
    };

    const buttonOptions: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-button',
      properties: {},
      hydrateModule: Promise.resolve(buttonMockHydrate),
    };

    const ButtonComponent = createComponentFresh2(buttonOptions);
    await ButtonComponent({});

    expect(counterMockRenderToString).toHaveBeenCalledTimes(1);
    expect(buttonMockRenderToString).toHaveBeenCalledTimes(1);
  });

  it('should set correct href and precedence attributes on style tags', async () => {
    vi.unmock('html-react-parser');
    const { createComponent: createComponentFresh } = await import('./ssr.js');
    const { renderToStaticMarkup } = await vi.importActual<typeof import('react-dom/server')>('react-dom/server');

    const styleContent = '.component { padding: 10px; }';
    const mockRenderToString = vi.fn().mockImplementation((html: string, options: any) => {
      return Promise.resolve({
        html: `<my-component>
   <div>Content</div>
</my-component>`,
        styles: [{ id: 'scoped-style', content: styleContent }],
      });
    });

    const mockHydrateModule: HydrateModule = {
      renderToString: mockRenderToString,
      serializeProperty: vi.fn((value) => `"${JSON.stringify(value)}"`),
      transformTag: vi.fn((tag) => tag),
      setTagTransformer: vi.fn(),
    };

    const options: CreateComponentForSSROptions<HTMLElement> = {
      tagName: 'my-component',
      properties: {},
      hydrateModule: Promise.resolve(mockHydrateModule),
    };

    const Component = createComponentFresh(options);
    const result = await Component({});

    expect(result).toBeDefined();

    const html = renderToStaticMarkup(result);
    expect(html).toContain('href="stencil-my-component"');
    expect(html).toContain('precedence="stencil"');
    expect(html).toContain('.component { padding: 10px; }');
  });
});

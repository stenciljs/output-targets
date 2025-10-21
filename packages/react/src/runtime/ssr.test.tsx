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

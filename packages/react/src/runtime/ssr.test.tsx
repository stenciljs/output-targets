/* @jsxRuntime automatic */
import { createCompiler, loadConfig } from '@stencil/core/compiler';
import { createDocument } from '@stencil/core/mock-doc';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToReadableStream } from 'react-dom/server.browser';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createComponent, type HydrateModule, type SerializeShadowRootOptions } from './ssr.js';

async function render(node: React.ReactNode) {
  const stream = await renderToReadableStream(node);
  await stream.allReady;
  return new Response(stream).text();
}

describe('React and Stencil SSR integration', () => {
  let directory: string;
  let hydrateModule: Promise<HydrateModule>;

  beforeEach(() => {
    vi.stubEnv('STENCIL_SSR_DEBUG', '1');
    vi.spyOn(console, 'error');
    vi.spyOn(console, 'warn');
  });

  afterEach(() => {
    try {
      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    } finally {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
    }
  });

  beforeAll(async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'stencil-react-ssr-'));
    const fixture = fileURLToPath(new URL('../../test/ssr-fixture/', import.meta.url));
    const { config } = await loadConfig({
      config: {
        rootDir: fixture,
        tsconfig: path.join(fixture, 'tsconfig.json'),
        srcDir: fixture,
        namespace: 'ReactSsrTests',
        devMode: true,
        enableCache: false,
        maxConcurrentWorkers: 0,
        outputTargets: [{ type: 'dist-hydrate-script', dir: directory }],
      },
    });
    const compiler = await createCompiler(config!);
    try {
      const result = await compiler.build();
      expect(result?.diagnostics.filter((item) => item.level === 'error')).toEqual([]);
    } finally {
      await compiler.destroy();
    }
    const require = createRequire(import.meta.url);
    const entry = path.join(directory, 'index.js');
    hydrateModule = Promise.resolve(require(entry));
  }, 30_000);

  afterAll(async () => {
    if (directory) await rm(directory, { recursive: true, force: true });
  });

  function components(serializeShadowRoot: SerializeShadowRootOptions = 'scoped') {
    const options = { hydrateModule, serializeShadowRoot };
    return {
      Parent: createComponent({ ...options, tagName: 'ssr-parent', properties: {} }),
      Child: createComponent<HTMLElement & { displayLabel: string; data: { label: string } }>({
        ...options,
        tagName: 'ssr-child',
        properties: { displayLabel: 'display-label', data: 'data' },
      }),
    };
  }

  it('preserves a scoped child and adjacent space and text nodes', async () => {
    const { Parent, Child } = components();
    const html = await render(
      <Parent>
        <Child /> {'date'}
      </Parent>
    );
    const document = createDocument(html);
    const parent = document.querySelector('ssr-parent')!;
    expect(parent.querySelector('ssr-child span')?.textContent).toBe('default');
    expect(parent.textContent).toBe('default date');
    expect(parent.querySelector('template')).toBeNull();
    expect(parent.querySelector('style')).toBeNull();
    expect(html).toContain('</ssr-child> ');
  });

  it('applies mapped and complex properties to each nested child', async () => {
    const { Parent, Child } = components();
    const html = await render(
      <Parent>
        <Child displayLabel={'A "quoted" & label'} />
        <Child data={{ label: 'object value' }} />
      </Parent>
    );
    const document = createDocument(html);
    const children = Array.from(document.querySelectorAll('ssr-child'));
    expect(children.map((child) => child.textContent)).toEqual(['A "quoted" & label', 'object value']);
  });

  it('keeps concurrent renders and their complex properties separate', async () => {
    const { Parent, Child } = components();
    const values = ['first', 'second'];
    const output = await Promise.all(
      values.map((label) =>
        render(
          <Parent>
            <Child data={{ label }} />
          </Parent>
        )
      )
    );
    expect(output.map((html) => createDocument(html).querySelector('ssr-parent')?.textContent)).toEqual(values);
  });

  it('preserves a separate space after a native element', async () => {
    const { Parent } = components();
    const html = await render(
      <Parent>
        <span>before</span> {'after'}
      </Parent>
    );
    expect(createDocument(html).querySelector('ssr-parent')?.textContent).toBe('before after');
  });

  describe.each(['scoped', 'declarative-shadow-dom'] as const)('%s slot content', (mode) => {
    it.each([' leading', 'trailing ', 'two  spaces', 'line\n  indent'])(
      'preserves significant whitespace in %j',
      async (text) => {
        const { Parent } = components(mode);
        const document = createDocument(
          await render(
            <Parent>
              <span>{text}</span>
            </Parent>
          )
        );
        expect(document.querySelector('ssr-parent span')?.textContent).toBe(text);
      }
    );

    it.each(['\ttab\t', '\u00a0nonbreaking\u00a0'])('preserves whitespace-sensitive content in %j', async (text) => {
      const { Parent } = components(mode);
      const document = createDocument(
        await render(
          <Parent>
            <code>{text}</code>
          </Parent>
        )
      );
      expect(document.querySelector('ssr-parent code')?.textContent).toBe(text);
    });

    it('preserves named-slot placement and complex properties', async () => {
      const { Parent, Child } = components(mode);
      const document = createDocument(
        await render(
          <Parent>
            {' default'}
            <Child slot="start" data={{ label: 'named' }} />
          </Parent>
        )
      );
      const parent = document.querySelector('ssr-parent')!;
      const child = parent.querySelector('ssr-child')!;
      const template = child.querySelector<HTMLTemplateElement>('template');
      expect(child.getAttribute('slot')).toBe('start');
      expect((template?.content ?? child).querySelector('span')?.textContent).toBe('named');
      if (mode === 'scoped') expect(parent.textContent).toBe('named default');
      expect(document.querySelector('[data-stencil-react-props]')).toBeNull();
    });
  });

  it('retains scoped child styles under a DSD parent', async () => {
    const { Parent, Child } = components({ default: 'declarative-shadow-dom', scoped: ['ssr-child'] });
    const document = createDocument(
      await render(
        <Parent>
          <Child />
        </Parent>
      )
    );
    const styles = Array.from(document.querySelectorAll('style')).filter((style) =>
      style.getAttribute('data-href')?.includes('stencil-sc-ssr-child')
    );
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toContain('.sc-ssr-child-h');
  });

  it('preserves resource links emitted while serializing children', async () => {
    const { Parent } = components();
    const document = createDocument(
      await render(
        <Parent>
          <link rel="stylesheet" href="/example.css" precedence="default" />
          <img src="/example.png" alt="" />
        </Parent>
      )
    );
    expect(document.querySelector('link[rel="stylesheet"][href="/example.css"]')).not.toBeNull();
    expect(document.querySelector('link[rel="preload"][href="/example.png"]')).not.toBeNull();
    expect(document.querySelector('ssr-parent img')?.getAttribute('src')).toBe('/example.png');
  });

  it.each([
    ['declarative-shadow-dom', true, true],
    [{ default: 'scoped', 'declarative-shadow-dom': ['ssr-child'] }, false, true],
    [{ default: 'declarative-shadow-dom', scoped: ['ssr-child'] }, true, false],
  ] as const)('preserves each host serialization mode with %j', async (mode, parentDSD, childDSD) => {
    const { Parent, Child } = components(mode as SerializeShadowRootOptions);
    const html = await render(
      <Parent>
        <Child displayLabel="nested" />
        {' date'}
      </Parent>
    );
    const parent = createDocument(html).querySelector('ssr-parent')!;
    const child = parent.querySelector('ssr-child')!;
    const parentTemplate = Array.from(parent.children).find((element) => element.tagName === 'TEMPLATE');
    const childTemplate = Array.from(child.children).find((element) => element.tagName === 'TEMPLATE');
    expect(Boolean(parentTemplate)).toBe(parentDSD);
    expect(Boolean(childTemplate)).toBe(childDSD);
    const childContent = childTemplate ? (childTemplate as HTMLTemplateElement).content : child;
    expect(childContent.querySelector('span')?.textContent).toBe('nested');
    expect(parent.textContent).toBe(childDSD ? ' date' : 'nested date');
    expect(parent.querySelectorAll('ssr-child')).toHaveLength(1);
    expect(html).not.toContain('data-stencil-react-props');
  });

  it('deduplicates scoped styles across repeated nested components', async () => {
    const { Parent, Child } = components();
    const html = await render(
      <>
        {[0, 1, 2].map((key) => (
          <Parent key={key}>
            <Child />
          </Parent>
        ))}
      </>
    );
    const document = createDocument(html);
    expect(document.querySelectorAll('ssr-child')).toHaveLength(3);
    const styles = Array.from(document.querySelectorAll('style'));
    expect(styles.filter((style) => style.getAttribute('data-href')?.includes('stencil-sc-ssr-parent'))).toHaveLength(
      1
    );
    expect(styles.filter((style) => style.getAttribute('data-href')?.includes('stencil-sc-ssr-child'))).toHaveLength(1);
  });

  it('hydrates a scoped subtree in one Stencil pass', async () => {
    const hydrate = vi.spyOn(await hydrateModule, 'renderToString');
    const { Parent, Child } = components();
    const html = await render(
      <Parent>
        <Child>
          <Child />
        </Child>
        <Child />
      </Parent>
    );
    expect(createDocument(html).querySelectorAll('ssr-child')).toHaveLength(3);
    expect(hydrate).toHaveBeenCalledTimes(1);
  });

  it('serializes boolean, numeric, style and escaped attributes', async () => {
    const { Parent } = components();
    const html = await render(
      <Parent hidden={false} title={'"quoted" & <text>'} tabIndex={0} style={{ marginTop: 2 }} onClick={() => {}}>
        {'text'}
      </Parent>
    );
    const host = createDocument(html).querySelector<HTMLElement>('ssr-parent')!;
    expect(host.hasAttribute('hidden')).toBe(false);
    expect(host.getAttribute('title')).toBe('"quoted" & <text>');
    expect(host.getAttribute('tabindex')).toBe('0');
    expect(host.style.getPropertyValue('margin-top')).toBe('2px');
    expect(host.hasAttribute('onclick')).toBe(false);
    expect(html).not.toContain('data-stencil-react-props');
  });

  describe.each(['scoped', 'declarative-shadow-dom'] as const)('%s host attributes', (mode) => {
    it('accepts string styles on hosts and nested wrappers', async () => {
      const { Parent, Child } = components(mode);
      // JavaScript callers and spread props can supply a string despite React's style type.
      const props = { style: 'color:red;--label:example' } as unknown as { style: React.CSSProperties };
      const document = createDocument(
        await render(
          <Parent {...props}>
            <Child {...props} />
          </Parent>
        )
      );
      for (const selector of ['ssr-parent', 'ssr-child']) {
        const host = document.querySelector<HTMLElement>(selector)!;
        expect(host.style.getPropertyValue('color')).toBe('red');
        expect(host.style.getPropertyValue('--label')).toBe('example');
      }
    });

    it('preserves custom-element attribute names and values', async () => {
      const { Parent } = components(mode);
      const html = await render(<Parent className="app-class" tabIndex={0} hidden title="host" data-empty="" />);
      const host = createDocument(html).querySelector('ssr-parent')!;
      expect(host.classList.contains('app-class')).toBe(true);
      expect(host.classList.contains('hydrated')).toBe(true);
      expect(host.getAttribute('hidden')).toBe('true');
      expect(host.getAttribute('data-empty')).toBe('');
      expect(html).toContain(' tabindex="0"');
      expect(html).not.toMatch(/\sclassName=/i);
      expect(html).not.toContain('suppresshydrationwarning');
    });
  });

  describe.each(['scoped', 'declarative-shadow-dom'] as const)('%s child compatibility', (mode) => {
    const ForwardRef = React.forwardRef<HTMLSpanElement, { children?: React.ReactNode }>(function Content(props, ref) {
      const [label] = React.useState('child');
      return <span ref={ref}>{props.children ?? label}</span>;
    });
    const Memo = React.memo(function Content() {
      const [label] = React.useState('child');
      return <span>{label}</span>;
    });

    it.each([
      ['forwardRef', ForwardRef],
      ['memo', Memo],
      ['memo(forwardRef)', React.memo(ForwardRef)],
      ['lazy(forwardRef)', React.lazy(() => Promise.resolve({ default: ForwardRef }))],
      ['lazy(memo)', React.lazy(() => Promise.resolve({ default: Memo }))],
    ] as const)('renders %s through React, including hooks', async (_name, Content) => {
      const { Parent } = components(mode);
      const html = await render(
        <Parent>
          <Content />
        </Parent>
      );
      expect(createDocument(html).querySelector('ssr-parent span')?.textContent).toBe('child');
    });

    it('renders a lazy generated wrapper with complex properties', async () => {
      const { Parent, Child } = components(mode);
      const LazyChild = React.lazy(() => Promise.resolve({ default: Child }));
      const document = createDocument(
        await render(
          <Parent>
            <LazyChild data={{ label: 'lazy child' }} />
          </Parent>
        )
      );
      const child = document.querySelector('ssr-child')!;
      const template = child.querySelector<HTMLTemplateElement>('template');
      expect((template?.content ?? child).querySelector('span')?.textContent).toBe('lazy child');
    });

    it('preserves a generated grandchild in mixed and nested arrays', async () => {
      const { Parent, Child } = components(mode);
      const document = createDocument(
        await render(
          <Parent>
            {[
              <ForwardRef key="react">before</ForwardRef>,
              ' ',
              [
                <Child key="outer" displayLabel="outer">
                  <Child displayLabel="inner" />
                </Child>,
                null,
                undefined,
                false,
                0,
                ' after',
              ],
            ]}
          </Parent>
        )
      );
      const parent = document.querySelector('ssr-parent')!;
      expect(parent.querySelector('span')?.textContent).toBe('before');
      expect(parent.querySelectorAll('ssr-child')).toHaveLength(2);
      expect(parent.textContent).toBe(mode === 'scoped' ? 'before outerinner0 after' : 'before 0 after');
    });

    it('preserves falsy children without discarding numeric zero', async () => {
      const { Parent } = components(mode);
      const document = createDocument(await render(<Parent>{[null, undefined, false, '', 0]}</Parent>));
      expect(document.querySelector('ssr-parent')?.textContent).toBe('0');
    });

    it('preserves children passed through a class component', async () => {
      class Content extends React.Component<{ children?: React.ReactNode }> {
        render() {
          return <span>{this.props.children}</span>;
        }
      }
      const { Parent } = components(mode);
      const document = createDocument(
        await render(
          <Parent>
            <Content>class child</Content>
          </Parent>
        )
      );
      expect(document.querySelector('ssr-parent span')?.textContent).toBe('class child');
    });

    it('does not mistake a function with a render property for an exotic component', async () => {
      const Content = Object.assign(({ children }: { children?: React.ReactNode }) => <span>{children}</span>, {
        render: () => <b>wrong</b>,
      });
      const { Parent } = components(mode);
      const document = createDocument(
        await render(
          <Parent>
            <Content>function child</Content>
          </Parent>
        )
      );
      expect(document.querySelector('ssr-parent span')?.textContent).toBe('function child');
    });
  });

  it.each(['scoped', 'declarative-shadow-dom'] as const)(
    'preserves siblings of a null-returning component in %s mode',
    async (mode) => {
      const { Parent } = components(mode);
      const Content = () => null;
      const document = createDocument(
        await render(
          <Parent>
            <Content />
            after
          </Parent>
        )
      );
      expect(document.querySelector('ssr-parent')?.textContent).toBe('after');
    }
  );

  describe.each(['scoped', 'declarative-shadow-dom'] as const)('%s returned content', (mode) => {
    it.each([
      [
        'function',
        () => (
          <span title="returned">
            <b>inner</b>
          </span>
        ),
      ],
      [
        'class',
        class Content extends React.Component {
          render() {
            return (
              <span title="returned">
                <b>inner</b>
              </span>
            );
          }
        },
      ],
    ] as const)('preserves props and children returned by a %s component', async (_name, Content) => {
      const { Parent } = components(mode);
      const document = createDocument(
        await render(
          <Parent>
            <Content />
          </Parent>
        )
      );
      expect(document.querySelector('ssr-parent b')?.textContent).toBe('inner');
      expect(document.querySelector('ssr-parent span')?.getAttribute('title')).toBe('returned');
    });
  });

  it.each(['scoped', 'declarative-shadow-dom'] as const)(
    'preserves Fragment content and adjacent text in %s mode',
    async (mode) => {
      const { Parent } = components(mode);
      const Content = () => (
        <>
          <b>inner</b>
        </>
      );
      const document = createDocument(
        await render(
          <Parent>
            {'before '}
            <>
              <Content />
              {' after'}
            </>
          </Parent>
        )
      );
      expect(document.querySelector('ssr-parent b')?.textContent).toBe('inner');
      expect(document.querySelector('ssr-parent')?.textContent).toBe('before inner after');
    }
  );

  it('resolves generated descendants in an array returned by a component', async () => {
    const { Parent, Child } = components();
    const Label = () => 'after';
    const Content = () => [<Child key="child" data={{ label: 'nested' }} />, ' ', <Label key="label" />];
    const document = createDocument(
      await render(
        <Parent>
          <Content />
        </Parent>
      )
    );
    expect(document.querySelector('ssr-child span')?.textContent).toBe('nested');
    expect(document.querySelector('ssr-parent')?.textContent).toBe('nested after');
  });

  it.each(['native', 'generated'] as const)('preserves a promised %s child in nested arrays', async (kind) => {
    const { Parent, Child } = components();
    const child = kind === 'native' ? <span>async</span> : <Child data={{ label: 'async' }} />;
    const document = createDocument(await render(<Parent>{['before ', [Promise.resolve(child), ' after']]}</Parent>));
    expect(document.querySelector('ssr-parent span')?.textContent).toBe('async');
    expect(document.querySelector('ssr-parent')?.textContent).toBe('before async after');
  });

  it('retains the debug warning when a child throws during serialization', async () => {
    const warning = vi.mocked(console.warn).mockImplementation(() => {});
    const { Parent } = components();
    const Content = () => {
      throw new Error('child render failed');
    };
    await render(
      <Parent>
        <Content />
      </Parent>
    );
    expect(warning).toHaveBeenCalledOnce();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('child render failed'));
    warning.mockClear();
  });

  it('omits delegatesFocus when the component does not request it', async () => {
    const { Parent } = components('declarative-shadow-dom');
    const document = createDocument(await render(<Parent />));
    expect(document.querySelector('template')?.hasAttribute('shadowrootdelegatesfocus')).toBe(false);
  });

  it('only extracts the outer host when the same component is nested', async () => {
    const { Child } = components();
    const html = await render(
      <Child displayLabel="outer">
        <Child displayLabel="inner" />
        {' tail'}
      </Child>
    );
    const document = createDocument(html);
    expect(document.querySelectorAll('ssr-child')).toHaveLength(2);
    expect(document.querySelector('ssr-child')?.textContent).toBe('outerinner tail');
  });

  it('retains the default DSD mode and delegatesFocus', async () => {
    const Child = createComponent({ hydrateModule, tagName: 'ssr-child', properties: {} });
    const html = await render(<Child />);
    expect(html).toContain('shadowrootmode="open"');
    expect(html).toContain('shadowrootdelegatesfocus=""');
    expect(html).toContain('default');
  });

  it('reports a missing server hydrate module', async () => {
    const Parent = createComponent({ hydrateModule: undefined, tagName: 'ssr-parent', properties: {} });
    await expect(Parent({})).rejects.toThrow('`hydrateModule` is required');
  });

  it('preserves light DOM when shadow serialization is disabled', async () => {
    const { Parent, Child } = components(false);
    const html = await render(
      <Parent>
        <Child />
        {' date'}
      </Parent>
    );
    const parent = createDocument(html).querySelector('ssr-parent')!;
    expect(parent.querySelector('ssr-child')).not.toBeNull();
    expect(parent.querySelector('template')).toBeNull();
    expect(parent.textContent).toBe(' date');
  });
});

import { describe, expect, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import type { ComponentCompilerMeta } from '@stencil/core/internal';
import { defineContainer } from './runtime';
import { createComponentDefinition } from './generate-vue-component';
import { generateProxies } from './output-vue';
import type { OutputTargetVue } from './types';

const ssrProp = vi.fn((value: unknown) => `__ref:${JSON.stringify(value) ?? typeof value}`);

const MyComponent = defineContainer<any>(
  'my-component',
  undefined,
  [
    'label',
    'count',
    'disabled',
    'pill',
    'open',
    'selected',
    'hidden',
    'items',
    'firstName',
    'item2',
    'custom',
    'data',
    'changed',
  ],
  ['changed'],
  undefined,
  undefined,
  undefined,
  undefined,
  { ssrProp, attributes: { custom: 'data-custom' }, refs: ['data'] }
);

const props = {
  label: 'Hello',
  count: 5,
  disabled: false,
  pill: false,
  open: true,
  selected: { id: 1 },
  hidden: 'until-found',
  items: [1, 2],
  firstName: 'Ada',
  item2: 'b',
  custom: 'x',
  data: 'plain',
};

describe('defineContainer() with ssr options', () => {
  it('writes props under their attribute names when server rendering', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(MyComponent, props) }));

    expect(html).toContain('label="Hello"');
    expect(html).toContain('count="5"');
    // a string "false" would read as true: Stencil treats any present attribute as true
    expect(html).toContain('pill="__ref:false"');
    // HTML boolean attribute names, capitalised: Vue would render them by presence alone
    expect(html).toContain('Disabled="__ref:false"');
    // an empty value renders bare, the same as `Open=""`
    expect(html).toMatch(/\sOpen[\s>]/);
    expect(html).toContain('Selected="__ref:{&quot;id&quot;:1}"');
    expect(html).toContain('Hidden="until-found"');
    expect(html).not.toMatch(/\s(disabled|open|selected|hidden)[\s>=]/);
    expect(html).toContain('items="__ref:[1,2]"');
    // not `firstName`, which parses as `firstname`
    expect(html).toContain('first-name="Ada"');
    expect(html).toContain('item-2="b"');
    expect(html).toContain('data-custom="x"');
    // no attribute: Stencil never reads a plain value from it
    expect(html).toContain('data="__ref:&quot;plain&quot;"');
    expect(html).not.toMatch(/\b(firstName|firstname|item2)=/);
  });

  it('sets props as before in the browser', () => {
    // defined, so its props are properties Vue can set
    customElements.define(
      'my-component',
      class extends HTMLElement {
        items = undefined;
        firstName = undefined;
      }
    );
    const container = document.createElement('div');
    createApp({ render: () => h(MyComponent, props) }).mount(container);
    const el = container.querySelector('my-component') as any;

    expect(el.items).toEqual([1, 2]);
    expect(el.firstName).toBe('Ada');
    expect(el.hasAttribute('first-name')).toBe(false);
  });
});

describe('hydrating server-rendered markup', () => {
  it("keeps classes Vue didn't render, such as Stencil's", async () => {
    const isActive = ref(false);
    const App = defineComponent({
      render: () => h(MyComponent, { class: ['user', isActive.value && 'active'] }),
    });

    const html = await renderToString(createSSRApp(App));
    // what Stencil's renderToString() adds to the host
    const container = document.createElement('div');
    container.innerHTML = html.replace('class="user"', 'class="user sc-my-component-h hydrated"');
    const el = container.querySelector('my-component')!;

    createSSRApp(App).mount(container);
    expect([...el.classList].sort()).toEqual(['hydrated', 'sc-my-component-h', 'user']);

    isActive.value = true;
    await Promise.resolve();
    expect([...el.classList].sort()).toEqual(['active', 'hydrated', 'sc-my-component-h', 'user']);
  });
});

const cmpMeta = (properties: Partial<ComponentCompilerMeta['properties'][number]>[], events: string[] = []) =>
  ({
    tagName: 'my-component',
    properties: properties.map((p) => ({ internal: false, ...p })),
    methods: [],
    events: events.map((name) => ({ name, internal: false })),
  }) as unknown as ComponentCompilerMeta;

const outputTarget = (extra: Partial<OutputTargetVue> = {}): OutputTargetVue => ({
  proxiesFile: '../component-library-vue/src/proxies.ts',
  componentCorePackage: 'component-library',
  includeImportCustomElements: true,
  ssrPropModule: 'component-library/ssr-prop',
  ...extra,
});

describe('createComponentDefinition() with ssrPropModule', () => {
  const properties = [
    { name: 'firstName', type: 'string' as const, attribute: 'first-name' },
    { name: 'label', type: 'string' as const, attribute: 'data-label' },
    { name: 'items', type: 'unknown' as const },
    // `any`: a mixed union such as `string | boolean`, whose attribute Stencil doesn't convert
    { name: 'flag', type: 'any' as const, attribute: 'flag' },
  ];
  const ssr = `{ ssrProp, attributes: { 'label': 'data-label' }, refs: ['items', 'flag'] }`;

  it('passes the ssr argument after the parameters it skips', () => {
    const output = createComponentDefinition('Components', outputTarget())(cmpMeta(properties));
    expect(output).toContain(`'flag'\n], [], undefined, undefined, undefined, undefined, ${ssr})`);
  });

  it('passes it after the emits', () => {
    const output = createComponentDefinition('Components', outputTarget())(cmpMeta(properties, ['changed']));
    expect(output).toContain(`'changed'\n], undefined, undefined, undefined, undefined, ${ssr})`);
  });

  it('passes it after v-model and transformTag', () => {
    const models = [{ elements: 'my-component', event: 'changed', targetAttr: 'label' }];
    const withModel = createComponentDefinition(
      'Components',
      outputTarget({ componentModels: models })
    )(cmpMeta(properties, ['changed']));
    expect(withModel).toContain(`'label', 'changed', undefined, undefined, ${ssr})`);

    const withTransform = createComponentDefinition(
      'Components',
      outputTarget({ transformTag: true })
    )(cmpMeta(properties));
    expect(withTransform).toContain(`, undefined, undefined, undefined, transformTag, ${ssr})`);
  });

  it('adds nothing for a component without props, or without the option', () => {
    expect(createComponentDefinition('Components', outputTarget())(cmpMeta([]))).not.toContain('ssrProp');
    expect(
      createComponentDefinition('Components', outputTarget({ ssrPropModule: undefined }))(cmpMeta(properties))
    ).not.toContain('ssrProp');
  });

  it('imports ssrProp in the proxies file', () => {
    const config = { outputTargets: [], rootDir: '' } as any;
    const output = generateProxies(
      config,
      [cmpMeta(properties)],
      { types: 'dist/types/index.d.ts' },
      outputTarget(),
      ''
    );
    expect(output).toContain(`import { ssrProp } from 'component-library/ssr-prop';`);

    const without = generateProxies(
      config,
      [cmpMeta(properties)],
      { types: 'dist/types/index.d.ts' },
      outputTarget({ ssrPropModule: undefined }),
      ''
    );
    expect(without).not.toContain('ssrProp');
  });
});

import { describe, it, expect, vi } from 'vitest';

// the runtime is copied into Angular projects; only its imports' names matter here
vi.mock('rxjs', () => ({ fromEvent: vi.fn() }));
const platform = vi.hoisted(() => ({ id: 'browser' }));
vi.mock('@angular/core', () => ({ inject: () => platform.id, PLATFORM_ID: {} }));

import { markServer, proxyInputs } from '../angular-component-lib/utils';

const createElement = () => {
  const attributes = new Map<string, string>();
  return {
    attributes,
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    removeAttribute: (name: string) => attributes.delete(name),
  } as any;
};

const INPUTS = ['label', 'count', 'disabled', 'open', 'items', 'firstName', 'item2', 'custom', 'data', 'onPick'];

const createWrapper = (ssrProp: (value: any) => any) => {
  class Wrapper {
    el = createElement();
    z = { runOutsideAngular: (fn: () => void) => fn() };
    constructor() {
      markServer(this);
    }
  }
  proxyInputs(Wrapper, INPUTS, { ssrProp, attributes: { custom: 'data-custom' }, refs: ['data'] });
  return Wrapper as any;
};

const onServer = <T>(fn: () => T): T => {
  platform.id = 'server';
  try {
    return fn();
  } finally {
    platform.id = 'browser';
  }
};

describe('proxyInputs() with ssr options', () => {
  it('writes inputs as attributes when rendering on the server', () => {
    const ssrProp = vi.fn((value: any) => `__ref:${JSON.stringify(value)}`);
    const Wrapper = createWrapper(ssrProp);
    const wrapper = onServer(() => new Wrapper());
    const onPick = () => {};

    wrapper.label = 'Hello';
    wrapper.count = 5;
    wrapper.disabled = false;
    wrapper.open = true;
    wrapper.items = [1, 2];
    wrapper.firstName = 'Ada';
    wrapper.item2 = 'b';
    wrapper.custom = 'x';
    wrapper.data = 'plain';
    wrapper.onPick = onPick;

    expect(Object.fromEntries(wrapper.el.attributes)).toEqual({
      label: 'Hello',
      count: '5',
      // a string "false" would read as true: Stencil treats any present attribute as true
      disabled: '__ref:false',
      open: '',
      items: '__ref:[1,2]',
      'first-name': 'Ada',
      // Stencil's dash-case, as for its generated attribute names
      'item-2': 'b',
      'data-custom': 'x',
      // no attribute: Stencil never reads a plain value from it, so it goes through ssrProp()
      data: '__ref:"plain"',
      'on-pick': '__ref:undefined',
    });
    expect(ssrProp).toHaveBeenCalledWith(onPick);
  });

  it('can read an input back on the server', () => {
    const Wrapper = createWrapper((v) => v);
    const wrapper = onServer(() => new Wrapper());

    wrapper.items = [1, 2];

    expect(wrapper.items).toEqual([1, 2]);
  });

  it('removes the attribute for null and undefined', () => {
    const Wrapper = createWrapper((v) => v);
    const wrapper = onServer(() => new Wrapper());

    wrapper.label = 'Hello';
    wrapper.label = null;

    expect(wrapper.el.attributes.has('label')).toBe(false);
  });

  it('sets properties in the browser', () => {
    const ssrProp = vi.fn();
    const Wrapper = createWrapper(ssrProp);
    const wrapper = new Wrapper();

    wrapper.items = [1, 2];
    wrapper.count = 5;

    expect(wrapper.el.items).toEqual([1, 2]);
    expect(wrapper.el.count).toBe(5);
    expect(wrapper.el.attributes.size).toBe(0);
    expect(ssrProp).not.toHaveBeenCalled();
  });
});

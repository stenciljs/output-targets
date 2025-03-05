import { mount } from '@vue/test-utils';
import { MyComponent } from './index.js';
import { expect, it, describe, vi } from 'vitest';

describe('MyComponent', () => {
  it('should be rendered by Vue', () => {
    const wrapper = mount(MyComponent);
    expect(wrapper.element.tagName.toLowerCase()).toEqual('my-component');
  });

  it('should get attributes assigned to the component', () => {
    const wrapper = mount(MyComponent, {
      attrs: {
        id: 'one',
      },
    });
    expect((wrapper.element as HTMLElement).getAttribute('id')).toEqual('one');
  });

  it('should get strings as props', () => {
    const wrapper = mount(MyComponent, {
      props: {
        first: 'blue',
      },
    });
    expect(wrapper.props().first).toEqual('blue');
  });

  it('should get numbers as props', () => {
    const wrapper = mount(MyComponent, {
      props: {
        age: 39,
      },
    });
    expect(wrapper.props().age).toEqual(39);
  });

  it('should get arrays as props', () => {
    const wrapper = mount(MyComponent, {
      props: {
        kidsNames: ['billy', 'jane'],
      },
    });
    expect(wrapper.props().kidsNames).toEqual(['billy', 'jane']);
  });

  it('should get emits', async () => {
    const wrapper = mount(MyComponent);
    wrapper.vm.$emit('myCustomEvent');
    expect(wrapper.emitted()).toHaveProperty('myCustomEvent');
  });

  it('should not emits on unknown event', async () => {
    console.warn = vi.fn();
    const wrapper = mount(MyComponent);
    wrapper.vm.$emit('notMyCustomEvent');
    expect(wrapper.emitted()).toHaveProperty('notMyCustomEvent');
    expect(console.warn).toHaveBeenCalledWith(
      '[Vue warn]: Component emitted event "notMyCustomEvent" but it is neither declared in the emits option nor as an "onNotMyCustomEvent" prop.'
    );
  });
});

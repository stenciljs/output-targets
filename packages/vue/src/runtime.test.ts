import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineContainer } from './runtime';
import { defineComponent, h, ref } from 'vue';

describe('defineContainer', () => {
  it('should render a basic web component', () => {
    const MyComponent = defineContainer('my-component', undefined as any);
    const wrapper = mount(MyComponent);
    expect(wrapper.element.tagName.toLowerCase()).toBe('my-component');
  });

  it('should apply static classes', () => {
    const MyComponent = defineContainer('my-component', undefined as any);
    const wrapper = mount(MyComponent, {
      attrs: {
        class: 'static-class',
      },
    });
    expect(wrapper.element.classList.contains('static-class')).toBe(true);
  });

  describe('hydrated class preservation (issue #708)', () => {
    it('should preserve external classes like "hydrated" when Vue re-renders', async () => {
      const MyComponent = defineContainer('my-component', undefined as any);

      // Create a wrapper component that uses reactive :class binding
      const WrapperComponent = defineComponent({
        components: { MyComponent },
        setup() {
          const isActive = ref(false);
          return { isActive };
        },
        render() {
          return h(MyComponent, {
            class: this.isActive ? 'active' : '',
          });
        },
      });

      const wrapper = mount(WrapperComponent);
      const myComponentEl = wrapper.find('my-component').element as HTMLElement;

      // Simulate Stencil adding the hydrated class (this happens outside Vue)
      myComponentEl.classList.add('hydrated');
      expect(myComponentEl.classList.contains('hydrated')).toBe(true);

      // Trigger a re-render by toggling the reactive class
      wrapper.vm.isActive = true;
      await wrapper.vm.$nextTick();

      // The hydrated class should still be present
      expect(myComponentEl.classList.contains('hydrated')).toBe(true);
      expect(myComponentEl.classList.contains('active')).toBe(true);

      // Toggle again
      wrapper.vm.isActive = false;
      await wrapper.vm.$nextTick();

      // The hydrated class should still be present
      expect(myComponentEl.classList.contains('hydrated')).toBe(true);
    });

    it('should preserve multiple external classes when Vue re-renders', async () => {
      const MyComponent = defineContainer('my-component', undefined as any);

      const WrapperComponent = defineComponent({
        components: { MyComponent },
        setup() {
          const condition = ref(false);
          return { condition };
        },
        render() {
          return h(MyComponent, {
            class: { dynamic: this.condition },
          });
        },
      });

      const wrapper = mount(WrapperComponent);
      const myComponentEl = wrapper.find('my-component').element as HTMLElement;

      // Simulate external code adding multiple classes
      myComponentEl.classList.add('hydrated');
      myComponentEl.classList.add('stencil-ready');
      myComponentEl.classList.add('custom-external');

      // Trigger re-render
      wrapper.vm.condition = true;
      await wrapper.vm.$nextTick();

      // All external classes should be preserved
      expect(myComponentEl.classList.contains('hydrated')).toBe(true);
      expect(myComponentEl.classList.contains('stencil-ready')).toBe(true);
      expect(myComponentEl.classList.contains('custom-external')).toBe(true);
      expect(myComponentEl.classList.contains('dynamic')).toBe(true);
    });

    it('should handle combined static and reactive classes without losing external classes', async () => {
      const MyComponent = defineContainer('my-component', undefined as any);

      const WrapperComponent = defineComponent({
        components: { MyComponent },
        setup() {
          const toggle = ref(false);
          return { toggle };
        },
        render() {
          // This mimics: <MyComponent class="static" :class="{ 'dynamic': toggle }" />
          return h(MyComponent, {
            class: ['static', { dynamic: this.toggle }],
          });
        },
      });

      const wrapper = mount(WrapperComponent);
      const myComponentEl = wrapper.find('my-component').element as HTMLElement;

      // Add hydrated class externally
      myComponentEl.classList.add('hydrated');

      expect(myComponentEl.classList.contains('static')).toBe(true);
      expect(myComponentEl.classList.contains('hydrated')).toBe(true);

      // Toggle the dynamic class on
      wrapper.vm.toggle = true;
      await wrapper.vm.$nextTick();

      expect(myComponentEl.classList.contains('static')).toBe(true);
      expect(myComponentEl.classList.contains('dynamic')).toBe(true);
      expect(myComponentEl.classList.contains('hydrated')).toBe(true);

      // Toggle the dynamic class off
      wrapper.vm.toggle = false;
      await wrapper.vm.$nextTick();

      expect(myComponentEl.classList.contains('static')).toBe(true);
      expect(myComponentEl.classList.contains('dynamic')).toBe(false);
      expect(myComponentEl.classList.contains('hydrated')).toBe(true);
    });
  });

  describe('reactive class removal (issue #835)', () => {
    // Passing children keeps the slots object unstable, so Vue re-renders the child on every
    // parent update even when its props haven't changed
    const mountList = (ids: string[]) => {
      const MyComponent = defineContainer('my-component', undefined as any);
      const WrapperComponent = defineComponent({
        setup() {
          const selected = ref(ids[0]);
          return { selected };
        },
        render() {
          return h(
            'div',
            ids.map((id) =>
              h(
                MyComponent,
                { id: `item-${id}`, class: { 'is-active': this.selected === id } },
                { default: () => `item ${id}` }
              )
            )
          );
        },
      });

      const wrapper = mount(WrapperComponent);
      const elementFor = (id: string) => wrapper.element.querySelector(`#item-${id}`) as HTMLElement;
      // Simulate Stencil adding its own class outside of Vue
      ids.forEach((id) => elementFor(id).classList.add('hydrated'));

      const activeIds = () => ids.filter((id) => elementFor(id).classList.contains('is-active'));
      const select = async (id: string) => {
        wrapper.vm.selected = id;
        await wrapper.vm.$nextTick();
      };

      return { activeIds, select, elementFor };
    };

    it('should keep a conditional class removed on later re-renders', async () => {
      const { activeIds, select } = mountList(['a', 'b', 'c']);

      expect(activeIds()).toEqual(['a']);

      await select('b');
      expect(activeIds()).toEqual(['b']);

      // Item 'a' is no longer bound but its class string is unchanged, so Vue skips patching it
      await select('c');
      expect(activeIds()).toEqual(['c']);

      await select('a');
      expect(activeIds()).toEqual(['a']);
    });

    it('should not drop runtime managed classes while removing a conditional class', async () => {
      const { select, elementFor } = mountList(['a', 'b', 'c']);

      await select('b');
      await select('c');

      expect(elementFor('a').classList.contains('hydrated')).toBe(true);
      expect(elementFor('c').classList.contains('hydrated')).toBe(true);
    });

    it('should swap between two conditional classes', async () => {
      const MyComponent = defineContainer('my-component', undefined as any);
      const WrapperComponent = defineComponent({
        setup() {
          const isOn = ref(true);
          return { isOn };
        },
        render() {
          return h(MyComponent, { class: this.isOn ? 'on' : 'off' }, { default: () => 'content' });
        },
      });

      const wrapper = mount(WrapperComponent);
      const element = wrapper.find('my-component').element as HTMLElement;
      element.classList.add('hydrated');

      expect(element.classList.contains('on')).toBe(true);

      wrapper.vm.isOn = false;
      await wrapper.vm.$nextTick();
      expect(element.classList.contains('on')).toBe(false);
      expect(element.classList.contains('off')).toBe(true);

      // A re-render that leaves the class binding untouched must not resurrect 'on'
      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();
      expect(element.classList.contains('on')).toBe(false);
      expect(element.classList.contains('off')).toBe(true);
      expect(element.classList.contains('hydrated')).toBe(true);
    });

    it('should not track an empty class binding as a class', async () => {
      const MyComponent = defineContainer('my-component', undefined as any);
      const WrapperComponent = defineComponent({
        setup() {
          const isActive = ref(false);
          return { isActive };
        },
        render() {
          return h(MyComponent, { class: { active: this.isActive } }, { default: () => 'content' });
        },
      });

      const wrapper = mount(WrapperComponent);
      const element = wrapper.find('my-component').element as HTMLElement;

      expect(element.getAttribute('class')).toBe('');

      wrapper.vm.isActive = true;
      await wrapper.vm.$nextTick();
      expect(element.classList.contains('active')).toBe(true);

      wrapper.vm.isActive = false;
      await wrapper.vm.$nextTick();
      expect(element.classList.contains('active')).toBe(false);
      expect(Array.from(element.classList)).toEqual([]);
    });
  });

  describe('class attribute tokenization (issue ionic-framework#31393)', () => {
    it('should tokenize a class attribute that spans several lines', async () => {
      const MyComponent = defineContainer('my-component', undefined as any);
      const wrapper = mount(MyComponent, {
        attrs: {
          class: '\n      first-class\n      second-class\n    ',
        },
      });

      // The render that syncs the classes to the element only runs once the ref is set
      await wrapper.vm.$nextTick();

      expect(Array.from(wrapper.element.classList).sort()).toEqual(['first-class', 'second-class']);
    });

    it('should not tokenize on whitespace the DOM does not split on', async () => {
      // A non-breaking space is whitespace to `\s` but not to `DOMTokenList`. Splitting on it would
      // record `foo` and `bar`, neither of which matches the element's real token, so nothing
      // would ever remove it
      const MyComponent = defineContainer('my-component', undefined as any);
      const WrapperComponent = defineComponent({
        setup() {
          const isActive = ref(true);
          return { isActive };
        },
        render() {
          return h(MyComponent, { class: this.isActive ? 'foo\u00a0bar' : '' }, { default: () => 'content' });
        },
      });

      const wrapper = mount(WrapperComponent);
      const element = wrapper.find('my-component').element as HTMLElement;
      element.classList.add('hydrated');
      await wrapper.vm.$nextTick();

      expect(element.classList.contains('foo\u00a0bar')).toBe(true);
      expect(element.classList.contains('foo')).toBe(false);

      wrapper.vm.isActive = false;
      await wrapper.vm.$nextTick();

      expect(Array.from(element.classList)).toEqual(['hydrated']);
    });

    it('should remove a multi-line class once the binding stops producing it', async () => {
      const MyComponent = defineContainer('my-component', undefined as any);
      const WrapperComponent = defineComponent({
        setup() {
          const isActive = ref(true);
          return { isActive };
        },
        render() {
          return h(
            MyComponent,
            { class: this.isActive ? '\n  first-class\n  second-class\n' : '' },
            { default: () => 'content' }
          );
        },
      });

      const wrapper = mount(WrapperComponent);
      const element = wrapper.find('my-component').element as HTMLElement;
      element.classList.add('hydrated');

      wrapper.vm.isActive = false;
      await wrapper.vm.$nextTick();

      expect(element.classList.contains('first-class')).toBe(false);
      expect(element.classList.contains('second-class')).toBe(false);
      expect(element.classList.contains('hydrated')).toBe(true);
    });
  });

  describe('routerLink modifier key clicks (issue FW-7149)', () => {
    const mountWithRouter = (routerLink: string | undefined) => {
      const navigate = vi.fn();
      const MyComponent = defineContainer('my-component', undefined as any, ['routerLink']);

      const wrapper = mount(MyComponent, {
        props: { routerLink } as any,
        global: {
          provide: {
            navManager: { navigate },
          },
        },
      });
      return { wrapper, navigate };
    };

    it('should preventDefault and navigate on a normal click', () => {
      const { wrapper, navigate } = mountWithRouter('/target');
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      wrapper.find('my-component').element.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(navigate).toHaveBeenCalledTimes(1);
    });

    it('should not preventDefault or navigate on meta+click', () => {
      const { wrapper, navigate } = mountWithRouter('/target');
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true });
      wrapper.find('my-component').element.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('should not preventDefault or navigate on ctrl+click', () => {
      const { wrapper, navigate } = mountWithRouter('/target');
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
      wrapper.find('my-component').element.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('should not preventDefault or navigate on shift+click', () => {
      const { wrapper, navigate } = mountWithRouter('/target');
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, shiftKey: true });
      wrapper.find('my-component').element.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });
  });
});

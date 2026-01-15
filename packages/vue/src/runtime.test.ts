import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineContainer } from './runtime';
import { defineComponent, h, ref } from 'vue';

describe('defineContainer', () => {
  it('should render a basic web component', () => {
    const MyComponent = defineContainer('my-component', {} as any);
    const wrapper = mount(MyComponent);
    expect(wrapper.element.tagName.toLowerCase()).toBe('my-component');
  });

  it('should apply static classes', () => {
    const MyComponent = defineContainer('my-component', {} as any);
    const wrapper = mount(MyComponent, {
      attrs: {
        class: 'static-class',
      },
    });
    expect(wrapper.element.classList.contains('static-class')).toBe(true);
  });

  describe('hydrated class preservation (issue #708)', () => {
    it('should preserve external classes like "hydrated" when Vue re-renders', async () => {
      const MyComponent = defineContainer('my-component', {} as any);

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
      const MyComponent = defineContainer('my-component', {} as any);

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
      const MyComponent = defineContainer('my-component', {} as any);

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
});

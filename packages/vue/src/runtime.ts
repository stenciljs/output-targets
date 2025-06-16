import {
  defineComponent,
  getCurrentInstance,
  ComponentObjectPropsOptions,
  h,
  inject,
  onMounted,
  PropType,
  ref,
  withDirectives,
} from 'vue';

export { defineStencilSSRComponent } from './ssr';
import { InputProps } from './types';

const UPDATE_VALUE_EVENT = 'update:modelValue';
const MODEL_VALUE = 'modelValue';
const ROUTER_LINK_VALUE = 'routerLink';
const NAV_MANAGER = 'navManager';
const ROUTER_PROP_PREFIX = 'router';
const ARIA_PROP_PREFIX = 'aria';

/**
 * Starting in Vue 3.1.0, all properties are
 * added as keys to the props object, even if
 * they are not being used. In order to correctly
 * account for both value props and v-model props,
 * we need to check if the key exists for Vue <3.1.0
 * and then check if it is not undefined for Vue >= 3.1.0.
 * See https://github.com/vuejs/vue-next/issues/3889
 */
const EMPTY_PROP = Symbol();
const DEFAULT_EMPTY_PROP = { default: EMPTY_PROP };

interface NavManager<T = any> {
  navigate: (options: T) => void;
}

const getComponentClasses = (classes: unknown) => {
  return (classes as string)?.split(' ') || [];
};

const getElementClasses = (
  el: HTMLElement | undefined,
  componentClasses: Set<string>,
  defaultClasses: string[] = []
) => {
  const combinedClasses = new Set([
    ...Array.from(el?.classList || []),
    ...Array.from(componentClasses),
    ...defaultClasses,
  ]);

  return Array.from(combinedClasses);
};

/**
 * Create a callback to define a Vue component wrapper around a Web Component.
 *
 * @prop name - The component tag name (i.e. `ion-button`)
 * @prop componentProps - An array of properties on the
 * component. These usually match up with the @Prop definitions
 * in each component's TSX file.
 * @prop emitProps - An array of for event listener on the Component.
 * these usually match up with the @Event definitions
 * in each compont's TSX file.
 * @prop customElement - An option custom element instance to pass
 * to customElements.define. Only set if `includeImportCustomElements: true` in your config.
 * @prop modelProp - The prop that v-model binds to (i.e. value)
 * @prop modelUpdateEvent - The event that is fired from your Web Component when the value changes (i.e. ionChange)
 */
export const defineContainer = <Props, VModelType = string | number | boolean>(
  name: string,
  defineCustomElement: () => void,
  componentProps: string[] = [],
  emitProps: string[] = [],
  modelProp?: string,
  modelUpdateEvent?: string
) => {
  /**
   * Create a Vue component wrapper around a Web Component.
   * Note: The `props` here are not all properties on a component.
   * They refer to whatever properties are set on an instance of a component.
   */

  if (defineCustomElement !== undefined) {
    defineCustomElement();
  }

  const emits: string[] = emitProps;
  const props = [ROUTER_LINK_VALUE, ...componentProps].reduce(
    (acc, prop) => {
      acc[prop] = DEFAULT_EMPTY_PROP;
      return acc;
    },
    {} as Record<string, { type?: PropType<any>; default: Symbol }>
  ) as ComponentObjectPropsOptions<Props & InputProps<VModelType>>;
  if (modelProp) {
    emits.push(UPDATE_VALUE_EVENT);
    props[MODEL_VALUE] = DEFAULT_EMPTY_PROP as unknown as PropType<any>;
  }

  return defineComponent<Props & InputProps<VModelType>>(
    (props, { attrs, slots, emit }) => {
      let modelPropValue = modelProp ? props[modelProp as keyof InputProps<VModelType>] : undefined;
      const containerRef = ref<HTMLElement>();
      const classes = new Set(getComponentClasses(attrs.class));

      onMounted(() => {
        /**
         * we register the event emmiter for @Event definitions
         * so we can use @event
         */
        emitProps.forEach((eventName) => {
          containerRef.value?.addEventListener(eventName, (e) => {
            emit(eventName, e);
          });
        });
      });

      /**
       * This directive is responsible for updating any reactive
       * reference associated with v-model on the component.
       * This code must be run inside of the "created" callback.
       * Since the following listener callbacks as well as any potential
       * event callback defined in the developer's app are set on
       * the same element, we need to make sure the following callbacks
       * are set first so they fire first. If the developer's callback fires first
       * then the reactive reference will not have been updated yet.
       */
      const vModelDirective = {
        created: (el: HTMLElement) => {
          const eventsNames = Array.isArray(modelUpdateEvent) ? modelUpdateEvent : [modelUpdateEvent];
          eventsNames.forEach((eventName: string) => {
            el.addEventListener(eventName, (e: Event) => {
              /**
               * Only update the v-model binding if the event's target is the element we are
               * listening on. For example, Component A could emit ionChange, but it could also
               * have a descendant Component B that also emits ionChange. We only want to update
               * the v-model for Component A when ionChange originates from that element and not
               * when ionChange bubbles up from Component B.
               */
              if ((e.target as HTMLElement).tagName === el.tagName && modelProp) {
                modelPropValue = (e?.target as any)[modelProp];
                emit(UPDATE_VALUE_EVENT, modelPropValue);
              }
            });
          });
        },
      };

      const currentInstance = getCurrentInstance();
      const hasRouter = currentInstance?.appContext?.provides[NAV_MANAGER];
      const navManager: NavManager | undefined = hasRouter ? inject(NAV_MANAGER) : undefined;
      const elBeforeHydrate = <HTMLElement>currentInstance?.vnode.el;

      const handleRouterLink = (ev: Event) => {
        const { routerLink } = props;
        if (routerLink === EMPTY_PROP) return;

        if (navManager !== undefined) {
          /**
           * This prevents the browser from
           * performing a page reload when pressing
           * an Ionic component with routerLink.
           * The page reload interferes with routing
           * and causes ion-back-button to disappear
           * since the local history is wiped on reload.
           */
          ev.preventDefault();

          let navigationPayload: any = { event: ev };
          for (const key in props) {
            const value = props[key as keyof InputProps<VModelType>];
            if (props.hasOwnProperty(key) && key.startsWith(ROUTER_PROP_PREFIX) && value !== EMPTY_PROP) {
              navigationPayload[key] = value;
            }
          }

          navManager.navigate(navigationPayload);
        } else {
          console.warn('Tried to navigate, but no router was found. Make sure you have mounted Vue Router.');
        }
      };

      return () => {
        modelPropValue = props[modelProp as keyof InputProps<VModelType>];

        getComponentClasses(attrs.class).forEach((value) => {
          classes.add(value);
        });

        // @ts-expect-error
        const oldClick = props.onClick;
        const handleClick = (ev: Event) => {
          if (oldClick !== undefined) {
            oldClick(ev);
          }
          if (!ev.defaultPrevented) {
            handleRouterLink(ev);
          }
        };

        const propsToAdd: Record<string, unknown> = {
          ref: containerRef,
          class: getElementClasses(elBeforeHydrate, classes),
          onClick: handleClick,
        };

        /**
         * We can use Object.entries here
         * to avoid the hasOwnProperty check,
         * but that would require 2 iterations
         * where as this only requires 1.
         */
        for (const key in props) {
          const value = props[key as keyof InputProps<VModelType>];
          if ((props.hasOwnProperty(key) && value !== EMPTY_PROP) || key.startsWith(ARIA_PROP_PREFIX)) {
            propsToAdd[key as 'ariaLabel'] = value as string;
          }

          /**
           * register event handlers on the component
           */
          const eventHandlerKey = 'on' + key.slice(0, 1).toUpperCase() + key.slice(1);
          const eventHandler = attrs[eventHandlerKey] as EventListenerOrEventListenerObject;
          if (containerRef.value && attrs.hasOwnProperty(eventHandlerKey) && 'addEventListener' in containerRef.value) {
            containerRef.value.addEventListener(key, eventHandler);
          }
        }

        if (modelProp) {
          /**
           * If form value property was set using v-model
           * then we should use that value.
           * Otherwise, check to see if form value property
           * was set as a static value (i.e. no v-model).
           */
          if (props[MODEL_VALUE] !== EMPTY_PROP) {
            propsToAdd[modelProp] = props[MODEL_VALUE];
          } else if (modelPropValue !== EMPTY_PROP) {
            propsToAdd[modelProp] = modelPropValue;
          }
        }

        // If router link is defined, add href to props
        // in order to properly render an anchor tag inside
        // of components that should become activatable and
        // focusable with router link.
        if (ROUTER_LINK_VALUE in props && props[ROUTER_LINK_VALUE] !== EMPTY_PROP) {
          propsToAdd.href = props[ROUTER_LINK_VALUE];
        }

        /**
         * vModelDirective is only needed on components that support v-model.
         * As a result, we conditionally call withDirectives with v-model components.
         */
        const node = h(name, propsToAdd, slots.default && slots.default());
        return modelProp === undefined ? node : withDirectives(node, [[vModelDirective]]);
      };
    },
    {
      name,
      props,
      emits,
    }
  );
};

export * from './types';

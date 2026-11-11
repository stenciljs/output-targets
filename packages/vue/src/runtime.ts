import {
  ComponentObjectPropsOptions,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onMounted,
  PropType,
  Ref,
  ref,
  ssrContextKey,
  withDirectives,
} from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import type { InputProps } from './types';

export { defineStencilSSRComponent } from './ssr';

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

/**
 * Server rendering options (the output target's `ssrPropModule`).
 */
interface SsrOptions {
  /** The component library's `ssrProp()`, which hands a value to Stencil's server render. */
  ssrProp: (value: any) => any;
  /** Props whose attribute isn't Stencil's dash-cased prop name. */
  attributes?: Record<string, string>;
  /** Props whose every value goes through `ssrProp()`: no attribute, or not a primitive type. */
  refs?: string[];
}

/**
 * Stencil's own prop name to attribute name conversion (`prop1` -> `prop-1`).
 */
const toDashCase = (str: string): string =>
  str
    .replace(/([A-Z0-9])/g, (match) => ` ${match[0]}`)
    .trim()
    .split(' ')
    .join('-')
    .toLowerCase();

/**
 * HTML's boolean attributes, as Vue's server renderer lists them (`isBooleanAttr` in
 * `@vue/shared`). It renders any of these by presence alone, even on a custom element: a truthy
 * value as a bare attribute, and `false` not at all. Its check is case-sensitive, though, and it
 * keeps a custom element's attribute names as written, so `Selected` gets past it. HTML attribute
 * names aren't case-sensitive: Stencil's parser (and the browser) read it as `selected`.
 */
const HTML_BOOLEAN_ATTRIBUTES = new Set(
  (
    'itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly,async,autofocus,autoplay,' +
    'controls,default,defer,disabled,hidden,inert,loop,open,required,reversed,scoped,seamless,checked,muted,' +
    'multiple,selected'
  ).split(',')
);

/**
 * The attribute a prop is server-rendered as, for Stencil's `renderToString()` to read. Vue's
 * server renderer drops objects and keeps a custom element's prop names as written (`firstName`
 * parses as `firstname`), so each prop is written under its attribute name:
 * - a string or number as itself, and `true` as an empty attribute, so the component's first
 *   render in the browser sees them too;
 * - `false`, anything that isn't a primitive, and any value for a prop in `refs` through
 *   `ssrProp()`, which gives the server render the exact value and leaves no attribute behind.
 *   (Stencil reads any attribute on a boolean prop as `true`.)
 *
 * An HTML boolean attribute name such as `selected` is written capitalised (`Selected`), so Vue
 * renders its value instead of only its presence.
 *
 * @returns `[name, value]`, or `undefined` to leave the attribute off
 */
const toServerAttribute = (prop: string, value: unknown, ssr: SsrOptions): [string, string] | undefined => {
  if (value == null) return undefined;
  let name = ssr.attributes?.[prop] ?? toDashCase(prop);
  if (HTML_BOOLEAN_ATTRIBUTES.has(name)) name = name[0].toUpperCase() + name.slice(1);
  if (
    ssr.refs?.includes(prop) ||
    value === false ||
    (typeof value !== 'string' && typeof value !== 'number' && value !== true)
  ) {
    return [name, ssr.ssrProp(value)];
  }
  return [name, value === true ? '' : String(value)];
};

interface NavManager<T = any> {
  navigate: (options: T) => void;
}

/**
 * Split a class attribute value into tokens the way `DOMTokenList` does, on runs of ASCII
 * whitespace. A single-space split leaves whitespace inside the tokens of a multi-line class
 * attribute, and `classList` rejects those. The token set has to match the DOM's exactly: one
 * we record that the DOM never produced can never be removed again.
 *
 * React's `splitClassName` gets away with a looser `\s+` because it rewrites the whole `class`
 * attribute, so its own tokens become the truth. We mutate individual tokens on an element the
 * DOM already tokenized, so the two regexes are deliberately different.
 */
const getComponentClasses = (classes: unknown) => {
  return ((classes as string)?.split(/[ \t\n\f\r]+/) || []).filter((className) => className.length > 0);
};

/**
 * Sync the classes Vue supplied onto the host element, and return the ones it didn't supply
 * (Stencil's `hydrated` and `sc-*` scope classes, plus anything added imperatively) so Vue's
 * class patch doesn't wipe them. Vue merges that return value back with `attrs.class`.
 *
 * We read `previousVueClasses` for last render's Vue classes, then rewrite it with this
 * render's.
 *
 * Classes Vue has stopped supplying have to come off the element before that return value is
 * computed, or a stale one gets reported back as a class Vue never supplied and rewritten on
 * every later render. Deleting the removal loop reintroduces issue #835.
 */
const syncElementClasses = (
  ref: Ref<HTMLElement | undefined>,
  previousVueClasses: Set<string>,
  vueClasses: unknown,
  defaultClasses: string[] = []
) => {
  const nextClasses = new Set(getComponentClasses(vueClasses));

  if (ref?.value) {
    const element = ref.value;
    // drops the vue classes that are no longer bound
    previousVueClasses.forEach((c) => {
      if (!nextClasses.has(c)) {
        element.classList.remove(c);
      }
    });
    // makes sure vue classes are on the actual element
    nextClasses.forEach((c) => {
      if (!element.classList.contains(c)) {
        element.classList.add(c);
      }
    });
  }

  previousVueClasses.clear();
  nextClasses.forEach((c) => previousVueClasses.add(c));

  return [...Array.from(ref.value?.classList || []), ...defaultClasses].filter((c: string, i, self) => {
    return !nextClasses.has(c) && self.indexOf(c) === i;
  });
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
 * @prop modelUpdateEventAttribute - Property to read value from when the value changes.
 * @prop transformTagFn - Transforms the tag name at render time.
 * @prop ssr - Set when the output target's `ssrPropModule` is: how to write the props during
 * server rendering, for Stencil's `renderToString()`.
 */
export const defineContainer = <Props, VModelType = string | number | boolean>(
  name: string,
  defineCustomElement?: () => void,
  componentProps: string[] = [],
  emitProps: string[] = [],
  modelProp?: string,
  modelUpdateEvent?: string,
  modelUpdateEventAttribute?: string,
  transformTagFn?: (tagName: string) => string,
  ssr?: SsrOptions
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
      const previousVueClasses = new Set<string>();
      const currentInstance = getCurrentInstance();

      /**
       * While Vue hydrates, the vnode already points at the server-rendered element. Read its
       * classes from the first render (Stencil's `hydrated` and scope classes, which aren't
       * Vue's), or Vue's hydration replaces the element's classes with only its own.
       */
      if (currentInstance?.vnode.el) {
        containerRef.value = currentInstance.vnode.el as HTMLElement;
      }

      // Vue's `renderToString()` provides the SSR context: only set while server rendering
      const isServer = ssr !== undefined && inject(ssrContextKey, null) != null;

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
                const resolvePath = (object: any, path: string): any => {
                  return path.split('.').reduce((value, key) => (value !== undefined ? value[key] : undefined), object);
                };

                const path = (modelUpdateEventAttribute ?? `target.${modelProp}`) as string;
                const modelPropValue = resolvePath(e, path);

                emit(UPDATE_VALUE_EVENT, modelPropValue);
              }
            });
          });
        },
      };

      const hasRouter = currentInstance?.appContext?.provides[NAV_MANAGER];
      const navManager: NavManager | undefined = hasRouter ? inject(NAV_MANAGER) : undefined;
      // Read from globalProperties since vue-router is an optional peer and can't be imported here.
      const router = currentInstance?.appContext?.config.globalProperties.$router;

      const handleRouterLink = (ev: Event) => {
        const { routerLink } = props;
        if (routerLink === EMPTY_PROP) return;

        /**
         * Allow modifier key clicks (ctrl/cmd/shift) to open the link in a
         * new tab/window without triggering SPA navigation on the current page.
         */
        const mouseEv = ev as MouseEvent;
        if (mouseEv.metaKey || mouseEv.ctrlKey || mouseEv.shiftKey) {
          return;
        }

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
          class: syncElementClasses(containerRef, previousVueClasses, attrs.class),
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
          // A route object would stringify to "[object Object]"; it's rendered as the href below instead.
          if (key === ROUTER_LINK_VALUE && typeof value !== 'string') continue;
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
          const routerLink = props[ROUTER_LINK_VALUE];
          const isLocation = typeof routerLink === 'string' || (typeof routerLink === 'object' && routerLink !== null);
          if (router && isLocation) {
            /**
             * resolve throws for an unknown route or a missing param. Leave the href
             * off rather than fail the render; navigating still surfaces the error.
             */
            try {
              propsToAdd.href = router.resolve(routerLink as RouteLocationRaw).href;
            } catch {}
          } else if (typeof routerLink === 'string') {
            propsToAdd.href = routerLink;
          }
        }

        if (isServer) {
          for (const prop of componentProps) {
            // event names are in the prop list too
            if (emitProps.includes(prop) || !(prop in propsToAdd)) continue;
            const value = propsToAdd[prop];
            delete propsToAdd[prop];
            if (value === EMPTY_PROP) continue;
            const attribute = toServerAttribute(prop, value, ssr!);
            if (attribute) propsToAdd[attribute[0]] = attribute[1];
          }
        }

        /**
         * vModelDirective is only needed on components that support v-model.
         * As a result, we conditionally call withDirectives with v-model components.
         */
        const tagName = transformTagFn ? transformTagFn(name) : name;
        const node = h(tagName, propsToAdd, slots.default && slots.default());
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

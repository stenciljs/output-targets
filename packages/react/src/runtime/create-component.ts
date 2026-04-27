import type { EventName, Options } from '@lit/react';

// A key value map matching React prop names to event names.
type EventNames = Record<string, EventName | string>;

// Type that's compatible with both React 18 and 19
type StencilProps<Element extends HTMLElement, Events extends EventNames, Props> = Omit<
  React.HTMLAttributes<Element>,
  keyof Events
> &
  Partial<{ [K in keyof Events]: Events[K] extends EventName<infer T> ? (event: T) => void : (event: any) => void }> &
  Props &
  React.RefAttributes<Element>;

export type StencilReactComponent<
  Element extends HTMLElement,
  Events extends EventNames = {},
  Props = {},
> = React.FunctionComponent<StencilProps<Element, Events, Props>>;

// Props derived from custom element class.
type ElementProps<I> = Partial<Omit<I, keyof HTMLElement>>;

// Event listener props for mapped custom events.
type EventListeners<R extends EventNames> = {
  [K in keyof R]?: R[K] extends EventName<infer T> ? (e: T) => void : (e: Event) => void;
};

// Runtime props accepted by the generated wrapper component.
type ComponentProps<I, E extends EventNames = {}> = Omit<React.HTMLAttributes<I>, keyof E | keyof ElementProps<I>> &
  EventListeners<E> &
  ElementProps<I>;

const reservedReactProperties = new Set(['children', 'localName', 'ref', 'style', 'className']);
const listenedEvents = new WeakMap<Element, Map<string, EventListenerObject>>();

const addOrUpdateEventListener = (node: Element, event: string, listener: (event?: Event) => void) => {
  let events = listenedEvents.get(node);
  if (events === undefined) {
    listenedEvents.set(node, (events = new Map()));
  }

  let handler = events.get(event);
  if (listener !== undefined) {
    if (handler === undefined) {
      events.set(event, (handler = { handleEvent: listener }));
      node.addEventListener(event, handler);
    } else {
      handler.handleEvent = listener;
    }
  } else if (handler !== undefined) {
    events.delete(event);
    node.removeEventListener(event, handler);
  }
};

const setProperty = <E extends Element>(node: E, name: string, value: unknown, old: unknown, events?: EventNames) => {
  const event = events?.[name];
  if (event !== undefined) {
    if (value !== old) {
      addOrUpdateEventListener(node, event, value as (e?: Event) => void);
    }
    return;
  }

  node[name as keyof E] = value as E[keyof E];

  if ((value === undefined || value === null) && name in HTMLElement.prototype) {
    node.removeAttribute(name);
  }
};

/**
 * Temporary compatibility shim.
 *
 * Why this exists:
 * - In Vitest/jsdom, package export resolution can select @lit/react's `node` entry.
 * - That entry intentionally skips browser-side element prop application.
 * - Stencil React wrappers then drop element/native props (e.g. `id`) in tests.
 *
 * What this is:
 * - A local copy of @lit/react browser create-component behavior (verified against v1.0.8)
 *   so runtime behavior is deterministic for consumers.
 *
 * Removal criteria:
 * - Remove this shim and delegate to @lit/react once @lit/react provides a stable path that
 *   preserves browser prop forwarding in Vitest/jsdom-like environments.
 *
 * Tracking:
 * - stenciljs/output-targets#791
 */
const createComponentCompatibilityShim = <I extends HTMLElement, E extends EventNames = {}>({
  react: React,
  tagName,
  elementClass,
  events,
  displayName,
}: Options<I, E>) => {
  const eventProps = new Set(Object.keys(events ?? {}));

  const ReactComponent = React.forwardRef<I, ComponentProps<I, E>>((props, ref) => {
    const prevElemPropsRef = React.useRef(new Map<string, unknown>());
    const elementRef = React.useRef<I | null>(null);

    const reactProps: Record<string, unknown> = {};
    const elementProps: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(props)) {
      if (reservedReactProperties.has(key)) {
        reactProps[key === 'className' ? 'class' : key] = value;
        continue;
      }

      if (eventProps.has(key) || key in elementClass.prototype) {
        elementProps[key] = value;
        continue;
      }

      reactProps[key] = value;
    }

    React.useLayoutEffect(() => {
      if (elementRef.current === null) {
        return;
      }

      const newElemProps = new Map<string, unknown>();
      for (const key in elementProps) {
        setProperty(
          elementRef.current,
          key,
          (props as unknown as Record<string, unknown>)[key],
          prevElemPropsRef.current.get(key),
          events
        );
        prevElemPropsRef.current.delete(key);
        newElemProps.set(key, (props as unknown as Record<string, unknown>)[key]);
      }

      for (const [key, value] of prevElemPropsRef.current) {
        setProperty(elementRef.current, key, undefined, value, events);
      }
      prevElemPropsRef.current = newElemProps;
    });

    React.useLayoutEffect(() => {
      elementRef.current?.removeAttribute('defer-hydration');
    }, []);

    reactProps['suppressHydrationWarning'] = true;

    return React.createElement(tagName, {
      ...reactProps,
      ref: React.useCallback(
        (node: I | null) => {
          elementRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref !== null) {
            (ref as React.MutableRefObject<I | null>).current = node;
          }
        },
        [ref]
      ),
    });
  });

  ReactComponent.displayName = displayName ?? elementClass.name;
  return ReactComponent;
};

/**
 * Defines a custom element and creates a React component.
 * @public
 */
export const createComponent = <Element extends HTMLElement, Events extends EventNames = {}, Props = {}>({
  defineCustomElement,
  tagName,
  transformTag,
  ...options
}: Options<Element, Events> & {
  defineCustomElement: () => void;
  transformTag?: (tagName: string) => string;
}): StencilReactComponent<Element, Events, Props> => {
  if (typeof defineCustomElement !== 'undefined') {
    defineCustomElement();
  }
  const finalTagName = transformTag ? transformTag(tagName) : tagName;
  return createComponentCompatibilityShim<Element, Events>({
    ...options,
    tagName: finalTagName,
  }) as unknown as StencilReactComponent<Element, Events, Props>;
};

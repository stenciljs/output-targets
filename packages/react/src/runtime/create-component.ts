import type { EventName, Options } from '@lit/react';
import { createComponent as createComponentWrapper } from '@lit/react';
import React from 'react';

// A key value map matching React prop names to event names.
type EventNames = Record<string, EventName | string>;

// Type that's compatible with both React 18 and 19
type StencilProps<I extends HTMLElement, E extends EventNames, C, R extends keyof C = never> = Omit<
  React.HTMLAttributes<I>,
  keyof E
> &
  Partial<{ [K in keyof E]: E[K] extends EventName<infer T> ? (event: T) => void : (event: any) => void }> &
  Required<Pick<C, R>> &
  Partial<Omit<C, R>> &
  React.RefAttributes<I>;

export type StencilReactComponent<
  I extends HTMLElement,
  E extends EventNames = {},
  C = Omit<I, keyof HTMLElement>,
  R extends keyof C = never,
> = React.FunctionComponent<StencilProps<I, E, C, R>>;

const splitClassName = (className: string | undefined): string[] =>
  className ? className.split(/\s+/).filter(Boolean) : [];

/**
 * Merge the app's `className`/`class` with the classes the Stencil runtime
 * manages on the host. `@lit/react` maps `className` to `class` and rewrites it
 * wholesale on every render, which wipes runtime-added classes like `hydrated`,
 * `sc-*` scope classes, and state classes a design system relies on.
 */
export const mergeClassNames = (
  currentClasses: Iterable<string>,
  newClassName: string | undefined,
  oldClassName: string | undefined
): string => {
  const incoming = new Set(splitClassName(newClassName));
  const previous = new Set(splitClassName(oldClassName));
  const finalClassNames: string[] = [];

  for (const className of currentClasses) {
    if (incoming.has(className)) {
      finalClassNames.push(className);
      incoming.delete(className);
    } else if (!previous.has(className)) {
      // Runtime-managed class the app never set, so keep it.
      finalClassNames.push(className);
    }
    // Anything else was set by the app last render and dropped now, so drop it.
  }

  // Whatever's left in `incoming` isn't on the element yet.
  for (const className of incoming) {
    finalClassNames.push(className);
  }

  return finalClassNames.join(' ');
};

// `useLayoutEffect` warns during server rendering and the reconciliation is
// client-only anyway, so fall back to `useEffect` on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/**
 * Defines a custom element and creates a React component.
 * @public
 */
export const createComponent = <
  I extends HTMLElement,
  E extends EventNames = {},
  C = Omit<I, keyof HTMLElement>,
  R extends keyof C = never,
>({
  defineCustomElement,
  tagName,
  transformTag,
  ...options
}: Options<I, E> & {
  defineCustomElement: () => void;
  transformTag?: (tagName: string) => string;
}): StencilReactComponent<I, E, C, R> => {
  if (typeof defineCustomElement !== 'undefined') {
    defineCustomElement();
  }
  const finalTagName = transformTag ? transformTag(tagName) : tagName;
  const ReactComponent = createComponentWrapper<I, E>({ ...options, tagName: finalTagName });

  /**
   * Withhold `className`/`class` from `@lit/react` so React never writes the
   * `class` attribute, then reconcile it against the live host in a layout
   * effect. See `mergeClassNames`.
   */
  const WrappedComponent = React.forwardRef<I, StencilProps<I, E, C, R>>((props, ref) => {
    const {
      className,
      class: classProp,
      ...restProps
    } = props as StencilProps<I, E, C, R> & {
      className?: string;
      class?: string;
    };
    const incomingClassName = className ?? classProp ?? '';

    const elementRef = React.useRef<I | null>(null);
    const previousClassName = React.useRef<string>('');

    useIsomorphicLayoutEffect(() => {
      const element = elementRef.current;
      if (element === null || incomingClassName === previousClassName.current) {
        return;
      }
      element.className = mergeClassNames(Array.from(element.classList), incomingClassName, previousClassName.current);
      previousClassName.current = incomingClassName;
    });

    const setRef = React.useCallback(
      (node: I | null) => {
        elementRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref !== null && ref !== undefined) {
          (ref as React.MutableRefObject<I | null>).current = node;
        }
      },
      [ref]
    );

    return React.createElement(ReactComponent, { ...restProps, ref: setRef } as any);
  });

  WrappedComponent.displayName = options.displayName ?? finalTagName;

  return WrappedComponent as unknown as StencilReactComponent<I, E, C, R>;
};

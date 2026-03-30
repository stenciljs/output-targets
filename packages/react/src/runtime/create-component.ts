import type { EventName, Options } from '@lit/react';
import { createComponent as createComponentWrapper } from '@lit/react';
import { ComponentInterface } from '@stencil/core';

// A key value map matching React prop names to event names.
type EventNames = Record<string, EventName | string>;

// Type that's compatible with both React 18 and 19
type StencilProps<I extends HTMLElement, C extends ComponentInterface, E extends EventNames> = Omit<
  React.HTMLAttributes<I>,
  keyof E
> &
  Partial<{ [K in keyof E]: E[K] extends EventName<infer T> ? (event: T) => void : (event: any) => void }> &
  Partial<C> &
  React.RefAttributes<I> & { autofocus?: boolean };

export type StencilReactComponent<
  I extends HTMLElement,
  C extends ComponentInterface,
  E extends EventNames = {},
> = React.FunctionComponent<StencilProps<I, C, E>>;

/**
 * Defines a custom element and creates a React component.
 * @public
 */
export const createComponent = <I extends HTMLElement, C extends ComponentInterface, E extends EventNames = {}>({
  defineCustomElement,
  tagName,
  transformTag,
  ...options
}: Options<I, E> & {
  defineCustomElement: () => void;
  transformTag?: (tagName: string) => string;
}): StencilReactComponent<I, C, E> => {
  if (typeof defineCustomElement !== 'undefined') {
    defineCustomElement();
  }
  const finalTagName = transformTag ? transformTag(tagName) : tagName;
  return createComponentWrapper<I, E>({ ...options, tagName: finalTagName }) as unknown as StencilReactComponent<
    I,
    C,
    E
  >;
};

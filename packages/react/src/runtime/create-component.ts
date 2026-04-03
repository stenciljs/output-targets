import type { EventName, Options } from '@lit/react';
import { createComponent as createComponentWrapper } from '@lit/react';
import type { ComponentInterface } from '@stencil/core';

// A key value map matching React prop names to event names.
type EventNames = Record<string, EventName | string>;

// Type that's compatible with both React 18 and 19
type StencilProps<I extends HTMLElement, E extends EventNames, C extends ComponentInterface> = Omit<
  React.HTMLAttributes<I>,
  keyof E
> &
  Partial<{ [K in keyof E]: E[K] extends EventName<infer T> ? (event: T) => void : (event: any) => void }> &
  Partial<C> &
  React.RefAttributes<I>;

export type StencilReactComponent<
  I extends HTMLElement,
  E extends EventNames = {},
  C extends ComponentInterface = ComponentInterface,
> = React.FunctionComponent<StencilProps<I, E, C>>;

/**
 * Defines a custom element and creates a React component.
 * @public
 */
export const createComponent = <I extends HTMLElement, E extends EventNames = {}, C extends ComponentInterface = ComponentInterface>({
  defineCustomElement,
  tagName,
  transformTag,
  ...options
}: Options<I, E> & {
  defineCustomElement: () => void;
  transformTag?: (tagName: string) => string;
}): StencilReactComponent<I, E, C> => {
  if (typeof defineCustomElement !== 'undefined') {
    defineCustomElement();
  }
  const finalTagName = transformTag ? transformTag(tagName) : tagName;
  return createComponentWrapper<I, E>({ ...options, tagName: finalTagName }) as unknown as StencilReactComponent<
    I,
    E,
    C
  >;
};

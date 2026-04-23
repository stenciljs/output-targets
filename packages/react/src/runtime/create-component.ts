import type { EventName, Options } from '@lit/react';
import { createComponent as createComponentWrapper } from '@lit/react';

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
  return createComponentWrapper<Element, Events>({
    ...options,
    tagName: finalTagName,
  }) as unknown as StencilReactComponent<Element, Events, Props>;
};

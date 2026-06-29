import type { EventName, Options } from './index.js';
import { createLitComponent } from './index.js';

// @types-begin
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
// @types-end

// @create-component-begin
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
  return createLitComponent<I, E>({ ...options, tagName: finalTagName }) as unknown as StencilReactComponent<
    I,
    E,
    C,
    R
  >;
};
// @create-component-end

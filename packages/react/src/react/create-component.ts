import type { EventName, Options } from '@lit/react';
import { createComponent as createComponentWrapper, type ReactWebComponent, WebComponentProps } from '@lit/react';

import type { RenderToString } from './ssr';
import { tagNameTransformer } from './tagNameTransformer';

// A key value map matching React prop names to event names.
type EventNames = Record<string, EventName | string>;
export type StencilReactComponent<I extends HTMLElement, E extends EventNames = {}> = ReactWebComponent<I, E>;

/**
 * Defines a custom element and creates a React component.
 * @public
 */
export const createComponent = <I extends HTMLElement, E extends EventNames = {}>({
  defineCustomElement,
  ...options
}: Options<I, E> & { defineCustomElement: () => void }) => {
  if (typeof defineCustomElement !== 'undefined') {
    defineCustomElement();
  }

  if (typeof tagNameTransformer === 'function') {
    options.tagName = tagNameTransformer(options.tagName);
  }

  return createComponentWrapper<I, E>(options);
};

/**
 * Defines a custom element and creates a React component for server side rendering.
 * @public
 */
export const createSSRComponent = <I extends HTMLElement, E extends EventNames = {}>({
  hydrateModule,
  properties,
  tagName,
}: {
  hydrateModule: Promise<{ renderToString: RenderToString }>;
  properties: Record<string, string>;
  tagName: string;
}): ReactWebComponent<I, E> => {
  /**
   * IIFE to lazy load the `createComponentForServerSideRendering` function while allowing
   * to return the correct type for the `ReactWebComponent`.
   *
   * Note: we want to lazy load the `./ssr` and `hydrateModule` modules to avoid
   * bundling them in the runtime and serving them in the browser.
   */
  return (async (props: WebComponentProps<I>) => {
    const { createComponentForServerSideRendering } = await import('./ssr');
    return createComponentForServerSideRendering<I, E>({
      tagName,
      properties,
      renderToString: (await hydrateModule).renderToString,
    })(props as any);
  }) as unknown as ReactWebComponent<I, E>;
};

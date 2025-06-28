import type { EventName, Options, ReactWebComponent, WebComponentProps } from '@lit/react';
import React, { Component, JSXElementConstructor, ReactNode } from 'react';
import { stringifyCSSProperties } from 'react-style-stringify';
// @ts-expect-error
import dynamic from 'next/dynamic';

import { createComponent as createComponentWrapper } from './create-component.js';
import { possibleStandardNames } from './constants.js';

const LOG_PREFIX = '[react-output-target]';

// A key value map matching React prop names to event names.
type EventNames = Record<string, EventName | string>;

export type { ReactWebComponent, WebComponentProps } from '@lit/react';

export type SerializeShadowRootOptions =
  | 'declarative-shadow-dom'
  | 'scoped'
  | {
      'declarative-shadow-dom'?: string[];
      scoped?: string[];
      default: 'declarative-shadow-dom' | 'scoped';
    }
  | boolean;

/**
 * Type that emulates Next.js dynamic import functionality without importing Next.js types
 */
export type DynamicImport<T = any> = () => Promise<T>;
export type DynamicOptions = {
  loading?: () => ReactNode;
  ssr?: boolean;
  suspense?: boolean;
};
export type DynamicFunction = <T = any>(
  dynamicImport: DynamicImport<T>,
  options?: DynamicOptions
) => React.ComponentType<any>;

/**
 * these types are defined by a Stencil hydrate app so we have to copy the minimal types here
 */
export interface RenderToStringOptions {
  fullDocument?: boolean;
  prettyHtml?: boolean;
  /**
   * Configure how Stencil serializes the components shadow root.
   * - If set to `declarative-shadow-dom` the component will be rendered within a Declarative Shadow DOM.
   * - If set to `scoped` Stencil will render the contents of the shadow root as a `scoped: true` component
   *   and the shadow DOM will be created during client-side hydration.
   * - Alternatively you can mix and match the two by providing an object with `declarative-shadow-dom` and `scoped` keys,
   * the value arrays containing the tag names of the components that should be rendered in that mode.
   *
   * Examples:
   * - `{ 'declarative-shadow-dom': ['my-component-1', 'another-component'], default: 'scoped' }`
   * Render all components as `scoped` apart from `my-component-1` and `another-component`
   * -  `{ 'scoped': ['an-option-component'], default: 'declarative-shadow-dom' }`
   * Render all components within `declarative-shadow-dom` apart from `an-option-component`
   * - `'scoped'` Render all components as `scoped`
   * - `false` disables shadow root serialization
   *
   * *NOTE* `true` has been deprecated in favor of `declarative-shadow-dom` and `scoped`
   * @default 'declarative-shadow-dom'
   */
  serializeShadowRoot?: SerializeShadowRootOptions;
}
interface HydrateStyle {
  href: string | null;
  id: string;
  content: string;
}
type RenderToString = (
  html: string,
  options: RenderToStringOptions
) => Promise<{ html: string | null; styles: HydrateStyle[] }>;

export type HydrateModule = {
  renderToString: RenderToString;
  serializeProperty: (value: any) => string;
};
interface CreateComponentForServerSideRenderingOptions {
  tagName: string;
  properties: Record<string, string>;
  renderToString: RenderToString;
  serializeProperty: (value: any) => string;
  serializeShadowRoot?: SerializeShadowRootOptions;
  // dynamic: DynamicFunction;
  clientModule: Promise<Record<string, ReactWebComponent<any, any>>>;
}

type StencilProps<I extends HTMLElement> = WebComponentProps<I>;

// Definition comes from React but is not exported or part of the types package
// see https://github.com/facebook/react/blob/372ec00c0384cd2089651154ea7c67693ee3f2a5/packages/react/src/ReactLazy.js#L46
type LazyComponent<T, P> = {
  $$typeof: symbol | number;
  _payload: P;
  _init: (payload: P) => T;
};

type ReactNodeExtended =
  | ReactNode
  | Component<any, any, any>
  | LazyComponent<any, any>
  | ((props: any, deprecatedLegacyContext?: any) => ReactNode);

/**
 * returns true if the value is a primitive, e.g. string, number, boolean
 * @param value - the value to check
 * @returns true if the value is a primitive, false otherwise
 */
const isPrimitive = (value: unknown): value is string | number | boolean =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

/**
 * returns true if the value is empty, e.g. null or undefined
 * @param value - the value to check
 * @returns true if the value is empty, false otherwise
 */
const isEmpty = (value: unknown): value is null | undefined => value === null || value === undefined;

/**
 * returns true if the value is iterable, e.g. an array
 * @param value - the value to check
 * @returns true if the value is iterable, false otherwise
 */
const isIterable = (value: unknown): value is Iterable<ReactNode> => Array.isArray(value);

/**
 * returns true if the value is a JSX class element constructor
 * @param value - the value to check
 * @returns true if the value is a JSX class element constructor, false otherwise
 */
const isJSXClassElementConstructor = (
  value: unknown
): value is Exclude<JSXElementConstructor<any>, (props: any, legacyContext: any) => any> =>
  !!value && /^\s*class\s+/.test(value.toString());

/**
 * returns true if the value is a lazy exotic component
 * @param value - the value to check
 * @returns true if the value is a lazy exotic component, false otherwise
 */
const isLazyExoticComponent = (value: unknown): value is LazyComponent<any, any> =>
  !!value && typeof value === 'object' && '_payload' in value;

/**
 * Transform a React component into a Stencil component for server side rendering. This logic is executed
 * by a React framework e.g. Next.js in an Node.js environment. The function will:
 *
 *   - serialize the component (including the Light DOM) into a string (see `toSerializeWithChildren`)
 *   - transform the string with the Stencil component into a Declarative Shadow DOM component
 *   - parse the declarative shadow DOM component back into a React component
 *   - return the React component
 *
 * Note: this code should only be loaded on the server side, as it uses heavy Node.js dependencies,
 * e.g. `react-dom/server`, `html-react-parser` as well as the hydrate module, that when loaded on
 * the client side would increase the bundle size.
 */
const createComponentForServerSideRendering = <I extends HTMLElement, E extends EventNames = {}>(
  options: CreateComponentForServerSideRenderingOptions
) => {
  return (async ({ children, ...props }: StencilProps<I> = {}) => {
    /**
     * ensure we only run on server
     */
    if (!('process' in globalThis) || typeof window !== 'undefined') {
      throw new Error('`createComponent` can only be run on the server');
    }

    /**
     * compose element props into a string
     */
    let stringProps = '';
    for (const [key, value] of Object.entries(props)) {
      let propValue = isPrimitive(value)
        ? `"${value}"`
        : typeof value !== 'function'
          ? options.serializeProperty(value)
          : undefined;

      /**
       * parse the style object into a string
       */
      if (key === 'style' && typeof value === 'object' && value) {
        propValue = `"${stringifyCSSProperties(value)}"`;
      }

      if (!propValue) {
        continue;
      }

      const propName =
        possibleStandardNames[key as keyof typeof possibleStandardNames] || options.properties[key] || key;
      stringProps += ` ${propName}=${propValue}`;
    }

    /**
     * Attempt to serialize the components light DOM as it may have an impact on how the Stencil
     * component is being serialized. For example a Stencil component may render certain elements
     * if its light DOM contains other elements.
     */
    let serializedChildren = '';
    const toSerialize = `<${options.tagName}${stringProps} suppressHydrationWarning="true">`;
    const originalConsoleError = console.error;
    try {
      // Ignore potential console errors during serialization (for example if a hook is used, which
      // is not allowed in SSR) as they are not relevant for the user and may cause confusion
      if (!process.env.STENCIL_SSR_DEBUG) {
        console.error = () => {};
      }

      // Pre-resolve all async components before rendering
      const resolvedChildren = await resolveComponentTypes(children);
      const ReactDOMServer = await import('react-dom/server');
      serializedChildren = ReactDOMServer.renderToString(resolvedChildren);
    } catch (err: unknown) {
      /**
       * if rendering the light DOM fails, we log a warning and continue to render the component
       */
      if (process.env.STENCIL_SSR_DEBUG) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.warn(
          `${LOG_PREFIX} Failed to serialize light DOM for ${toSerialize.slice(0, -1)} />: ${
            error.stack
          } - this may impact the hydration of the component`
        );
      }
    } finally {
      console.error = originalConsoleError;
    }

    const toSerializeWithChildren = `${toSerialize}${serializedChildren}</${options.tagName}>`;

    /**
     * first render the component with `prettyHtml` flag so it makes it easier to
     * access the inner content of the component.
     */
    const { html, styles } = await options.renderToString(toSerializeWithChildren, {
      fullDocument: false,
      serializeShadowRoot: options.serializeShadowRoot ?? 'declarative-shadow-dom',
      prettyHtml: true,
    });

    if (!html) {
      throw new Error('No HTML returned from renderToString');
    }

    /**
     * cut out the inner content of the component
     */
    const serializedComponentByLine = html.split('\n');
    const hydrationComment = '<!--r.1-->';
    const isShadowComponent = serializedComponentByLine[1].includes('shadowrootmode="open"');
    let templateContent: undefined | string = undefined;
    if (isShadowComponent) {
      const templateEndTag = '  </template>';
      templateContent = serializedComponentByLine
        .slice(2, serializedComponentByLine.lastIndexOf(templateEndTag))
        .join('\n')
        .trim();
    }

    /**
     * `html-react-parser` is a Node.js dependency so we should make sure to only import it when
     * run on the server and when needed.
     */
    const { default: parse } = await import('html-react-parser');
    const typedParse = parse as unknown as typeof parse.default;

    /**
     * Parse the string back into a React component
     */
    const StencilElement = () =>
      typedParse(html, {
        transform(reactNode, domNode) {
          /**
           * only render the component we have been serializing before
           */
          if ('name' in domNode && domNode.name === options.tagName) {
            const props = (reactNode as any).props;
            /**
             * remove the outer tag (e.g. `options.tagName`) so we only have the inner content
             */
            const CustomTag = `${options.tagName}`;

            /**
             * if the component is not a shadow component we can render it with the light DOM only
             */
            if (!isShadowComponent) {
              const { children, ...customProps } = props || {};
              const __html = serializedComponentByLine
                /**
                 * remove the components outer tags as we want to set the inner content only
                 */
                .slice(1, -1)
                /**
                 * bring the array back to a string
                 */
                .join('\n')
                .trim()
                /**
                 * remove any whitespace between tags that may cause hydration errors
                 */
                .replace(/(?<=>)\s+(?=<)/g, '');

              return (
                <>
                  {styles.map((style) => (
                    <style key={style.id} id={style.id} dangerouslySetInnerHTML={{ __html: style.content }} />
                  ))}
                  <CustomTag {...customProps} suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html }} />
                </>
              );
            }

            /**
             * return original component with given props and `suppressHydrationWarning` flag and
             * set the template content based on our serialized Stencil component.
             */
            return (
              <>
                {styles.map((style) => (
                  <style key={style.id} id={style.id} dangerouslySetInnerHTML={{ __html: style.content }} />
                ))}
                <CustomTag {...props} suppressHydrationWarning={true}>
                  <template
                    // @ts-expect-error
                    shadowrootmode="open"
                    suppressHydrationWarning={true}
                    dangerouslySetInnerHTML={{ __html: hydrationComment + templateContent }}
                  ></template>
                  {children}
                </CustomTag>
              </>
            );
          }

          return;
        },
      });

    const DynamicComponent = dynamic(
      async () => {
        /**
         * Load client component
         */
        const cmp = await options.clientModule;
        const cmpProp = options.tagName
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        return () => {
          const Cmp = cmp[cmpProp];
          return (
            <Cmp suppressHydrationWarning={true} {...props}>
              {children}
            </Cmp>
          );
        };
      },
      {
        /**
         * Render Declarative Shadow DOM component
         */
        loading: () => <StencilElement />,
        ssr: false,
      }
    );
    return <DynamicComponent suppressHydrationWarning={true} />;
  }) as unknown as ReactWebComponent<I, E>;
};

/**
 * Resolve the component types for server side rendering.
 *
 * It walks through all component children and resolves them, e.g. call `createComponentForServerSideRendering` to
 * create a React component which we can pass into `ReactDOMServer.renderToString`. This enables us to include
 * the Light DOM of a component as part of Stencils serialization process.
 *
 * @param children - the children to resolve
 * @returns the resolved children
 */
async function resolveComponentTypes(children: ReactNode): Promise<ReactNode> {
  /**
   * If the children are empty or primitive, return them directly
   */
  if (isPrimitive(children) || isEmpty(children)) {
    return children;
  }

  /**
   * If the children are not iterable, make them an array
   */
  if (!isIterable(children)) {
    children = [children];
  }

  return Promise.all(
    Array.from(children).map(async (child) => {
      if (isPrimitive(child) || isEmpty(child)) {
        return child;
      }

      if (isIterable(child)) {
        return resolveComponentTypes(child);
      }

      // Only ReactElements have type and props properties
      if (!React.isValidElement(child)) {
        return child;
      }

      const { type, props } = child as React.ReactElement<any>;

      try {
        const resolvedType = await resolveType(type, props);

        /**
         * If the resolved type is a ReactElement, return it directly
         */
        if (React.isValidElement(resolvedType)) {
          return resolvedType;
        }

        const resolvedChildren = props?.children ? await resolveComponentTypes(props.children) : props?.children;

        /**
         * If the resolved type is a string (HTML element), create a new element
         */
        if (typeof resolvedType === 'string') {
          return React.createElement(resolvedType, { ...props, children: resolvedChildren });
        }

        /**
         * Otherwise, return the original child with resolved children
         */
        return React.cloneElement(child, { ...props, children: resolvedChildren });
      } catch (error) {
        if (process.env.STENCIL_SSR_DEBUG) {
          console.warn('Failed to resolve component type:', error);
        }
        return child;
      }
    })
  );
}

// Resolve the component type to a primitive element type
const resolveType = async (type: string | React.JSXElementConstructor<any>, props: any): Promise<ReactNodeExtended> => {
  /**
   * Child is a primitive element like 'div'
   */
  if (typeof type === 'string') {
    return type;
  }

  try {
    let resolvedType: ReactNodeExtended = null;

    if (isJSXClassElementConstructor(type)) {
      /**
       * Child is a Class Component
       */
      const instance = new type(props);
      resolvedType = instance.render ? await instance.render() : instance;
    } else if (isLazyExoticComponent(type)) {
      /**
       * Handle React Lazy Component
       */
      const payload = type._payload;
      const lazyResult =
        payload._status === -1 // Uninitialized = -1 so we need to resolve the promise
          ? await payload._result()
          : payload._result;

      const lazyComponent = lazyResult.default || lazyResult;
      resolvedType = await resolveType(lazyComponent, props);
    } else if (typeof type === 'function') {
      /**
       * Child is a Function Component (including async Server Components)
       */
      let result: any = type(props);

      /**
       * If the result is a Promise, await it
       */
      if (result && typeof result === 'object' && 'then' in result && typeof result.then === 'function') {
        result = await result;
      }

      resolvedType = result as ReactNodeExtended;
    }

    /**
     * Recursively resolve nested component types
     */
    while (
      resolvedType &&
      typeof resolvedType === 'object' &&
      !React.isValidElement(resolvedType) &&
      !isPrimitive(resolvedType) &&
      'type' in resolvedType
    ) {
      resolvedType = await resolveType((resolvedType as any).type, props);
    }

    return resolvedType;
  } catch (error) {
    if (process.env.STENCIL_SSR_DEBUG) {
      console.warn('Error resolving component type:', error);
    }
    return null;
  }
};

/**
 * Defines a custom element and creates a React component for server side rendering.
 * @public
 */
export const createComponent = <I extends HTMLElement, E extends EventNames = {}>({
  hydrateModule,
  properties,
  tagName,
  serializeShadowRoot,
  ...options
}: {
  hydrateModule: Promise<HydrateModule>;
  properties: Record<string, string>;
  tagName: string;
  serializeShadowRoot?: SerializeShadowRootOptions;
  clientModule: Promise<Record<string, ReactWebComponent<any, any>>>;
} & Options<I, E> & { defineCustomElement: () => void }): ReactWebComponent<I, E> => {
  /**
   * If we are running in the browser, we can use the `createComponentWrapper` function
   * to create a React component that can be used in the browser. This allows to import
   * a Stencil component from one source and have a browser and server version of the component.
   */
  if (typeof window !== 'undefined' && createComponentWrapper) {
    return createComponentWrapper<I, E>({
      tagName,
      ...options,
    }) as unknown as ReactWebComponent<I, E>;
  }

  /**
   * IIFE to lazy load the `createComponentForServerSideRendering` function while allowing
   * to return the correct type for the `ReactWebComponent`.
   *
   * Note: we want to lazy load the `./ssr` and `hydrateModule` modules to avoid
   * bundling them in the runtime and serving them in the browser.
   */
  return (async (props: WebComponentProps<I>) => {
    const resolvedHydrateModule = await hydrateModule;
    return createComponentForServerSideRendering<I, E>({
      tagName,
      properties,
      renderToString: resolvedHydrateModule.renderToString,
      serializeProperty: resolvedHydrateModule.serializeProperty,
      serializeShadowRoot,
      ...options,
    })(props as any);
  }) as unknown as ReactWebComponent<I, E>;
};

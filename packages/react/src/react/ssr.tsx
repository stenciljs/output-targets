import type { EventName, ReactWebComponent, WebComponentProps } from '@lit/react';
import React, { Component, JSXElementConstructor, ReactNode } from 'react';
import ReactDOMServer from 'react-dom/server';
import styleToCss from 'style-object-to-css-string';
import { possibleStandardNames } from './constants';

const LOG_PREFIX = '[react-output-target]';

// A key value map matching React prop names to event names.
type EventNames = Record<string, EventName | string>;

/**
 * these types are defined by a Stencil hydrate app so we have to copy the minimal types here
 */
interface RenderToStringOptions {
  fullDocument?: boolean;
  serializeShadowRoot?: boolean;
  prettyHtml?: boolean;
}
export type RenderToString = (html: string, options: RenderToStringOptions) => Promise<{ html: string | null }>;
interface CreateComponentForServerSideRenderingOptions {
  tagName: string;
  properties: Record<string, string>;
  renderToString: RenderToString;
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
export const createComponentForServerSideRendering = <I extends HTMLElement, E extends EventNames = {}>(
  options: CreateComponentForServerSideRenderingOptions
) => {
  return (async ({ children, ...props }: StencilProps<I> = {}) => {
    /**
     * ensure we only run on server
     */
    if (!('process' in globalThis) || typeof window !== 'undefined') {
      throw new Error('`createComponentForServerSideRendering` can only be run on the server');
    }

    /**
     * compose element props into a string
     */
    let stringProps = '';
    for (const [key, value] of Object.entries(props)) {
      let propValue = isPrimitive(value) ? `"${value}"` : undefined;

      /**
       * parse the style object into a string
       */
      if (key === 'style' && typeof value === 'object') {
        propValue = `"${styleToCss(value).replaceAll('\n', ' ')}"`;
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
      const awaitedChildren = await resolveComponentTypes(children);
      serializedChildren = ReactDOMServer.renderToString(awaitedChildren);
    } catch (err: unknown) {
      /**
       * if rendering the light DOM fails, we log a warning and continue to render the component
       */
      if (process.env.STENCIL_SSR_DEBUG) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.warn(
          `${LOG_PREFIX} Failed to serialize light DOM for ${toSerialize.slice(0, -1)} />: ${
            error.message
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
    const { html } = await options.renderToString(toSerializeWithChildren, {
      fullDocument: false,
      serializeShadowRoot: true,
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
        .slice(2, serializedComponentByLine.indexOf(templateEndTag))
        .join('\n')
        .trim();
    }

    /**
     * `html-react-parser` is a Node.js dependency so we should make sure to only import it when
     * run on the server and when needed.
     */
    const { default: parse } = await import('html-react-parser');

    /**
     * Parse the string back into a React component
     */
    const StencilElement = () =>
      parse(html, {
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
                <CustomTag {...customProps} suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html }} />
              );
            }

            /**
             * return original component with given props and `suppressHydrationWarning` flag and
             * set the template content based on our serialized Stencil component.
             */
            return (
              <CustomTag {...props} suppressHydrationWarning>
                <template
                  // @ts-expect-error
                  shadowrootmode="open"
                  suppressHydrationWarning={true}
                  dangerouslySetInnerHTML={{ __html: hydrationComment + templateContent }}
                ></template>
                {children}
              </CustomTag>
            );
          }

          return;
        },
      });

    return <StencilElement />;
  }) as unknown as ReactWebComponent<I, E>;
};

/**
 * Resolve the component types for server side rendering.
 *
 * It walks through all component childs and resolves them, e.g. call `createComponentForServerSideRendering` to
 * create a React component which we can pass into `ReactDOMServer.renderToString`. This enables us to include
 * the Light DOM of a component as part of Stencils serialization process.
 *
 * @param children - the children to resolve
 * @returns the resolved children
 */
async function resolveComponentTypes(children: ReactNode): Promise<ReactNode> {
  /**
   * If the children are a empty or a primitive we can return them directly
   * e.g. `Hello World` or `42` or `null`
   */
  if (isPrimitive(children) || isEmpty(children)) {
    return children;
  }

  /**
   * If the children are not iterable we make them an array, so we can map over them later
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

      const { type, props } = child;

      return {
        ...child,
        props: {
          ...props,
          children: await resolveComponentTypes(props.children),
        },
        type: await resolveType(type, props),
      } as ReactNode;
    })
  );
}

// Resolve the component type to a primitive element type
const resolveType = async (type: string | React.JSXElementConstructor<any>, props: any): Promise<ReactNodeExtended> => {
  let resolvedType: ReactNodeExtended = null;

  if (typeof type === 'string') {
    // Child is a primitive element like 'div'
    return type;
  } else if (isJSXClassElementConstructor(type)) {
    // Child is a Class Component
    const instance = new type(props);
    resolvedType = instance.render ? instance.render() : instance;
  } else if (isLazyExoticComponent(type)) {
    // Handle React Lazy Component
    // https://github.com/facebook/react/blob/main/packages/react/src/ReactLazy.js
    const payload = type._payload;
    const { deault: lazyComponet } =
      payload._status === -1 // Uninitialized = -1 so we need resolve the promise
        ? await payload._result()
        : payload._result;
    // Now resolve the actual component type of the lazy component
    resolvedType = await resolveType(lazyComponet, props);
  } else if (typeof type !== 'object') {
    // Child is a Function Component because React Server
    // Components can be a Promise we need to await it
    resolvedType = await type(props);
  }

  // Recursively resolve the component type until we have a primitive element type
  if (!isEmpty(resolvedType) && !isPrimitive(resolvedType) && 'type' in resolvedType) {
    resolvedType = await resolveType(resolvedType.type, props);
  }

  return resolvedType;
};

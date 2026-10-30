import type { EventName, ReactWebComponent, WebComponentProps } from '@lit/react';
import React, { Component, Fragment, JSXElementConstructor, ReactNode } from 'react';
import type { Element } from 'html-react-parser';
import { stringifyCSSProperties } from 'react-style-stringify';

import { createComponent as createComponentWrapper, StencilReactComponent } from './create-component.js';
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
  /** @deprecated use `beforeSsr` — kept for v4/v5 compatibility */
  beforeHydrate?: (document: Document) => void | Promise<void>;
}
export interface HydrateStyleElement {
  id?: string;
  href?: string | null;
  content?: string;
}

type RenderToString = (
  html: string,
  options: RenderToStringOptions
) => Promise<{ html: string | null; styles: HydrateStyleElement[] }>;

export type HydrateModule = {
  renderToString: RenderToString;
  transformTag: (tagName: string) => string;
  setTagTransformer: (transformer: (tagName: string) => string) => void;
};
interface CreateComponentForServerSideRenderingOptions {
  tagName: string;
  properties: Record<string, string>;
  renderToString: RenderToString;
  serializeShadowRoot?: SerializeShadowRootOptions;
  transformTag?: (tagName: string) => string;
}

// Marks SSR components so `resolveType` can serialize nested ones shallowly.
const stencilSsrOptions = Symbol('stencil-react-ssr-options');
type ShallowComponentOptions = {
  tagName: string;
  properties: Record<string, string>;
  transformTag?: (tag: string) => string;
};
type MarkedSsrComponent = { [stencilSsrOptions]: ShallowComponentOptions };

type AttributeValue = string | number | boolean | Record<string, unknown>;

// Adapter-owned attribute that ties an element in a Stencil render to its complex props, which
// `beforeHydrate` assigns as properties since they can't be serialized as attributes.
const complexPropsAttribute = 'data-stencil-react-props';

// What one Stencil render collects from the React children it serializes.
interface SerializationContext {
  // Complex props by the value of their element's `complexPropsAttribute`, until `beforeHydrate` assigns them.
  complexProps: Map<string, Record<string, unknown>>;
  // From `html-react-parser`, which is only loaded during a server render.
  parseStyle: (style: string) => Record<string, unknown>;
}

// Banks an element's complex props for `beforeHydrate` and marks the element's attributes with their key.
const bankComplexProps = (
  context: SerializationContext,
  attributes: Record<string, AttributeValue>,
  complexProps: Record<string, unknown>
) => {
  if (Object.keys(complexProps).length > 0) {
    const id = String(context.complexProps.size);
    context.complexProps.set(id, complexProps);
    attributes[complexPropsAttribute] = id;
  }
};

// Splits props into attribute values (primitives, `style`) keyed by attribute name and
// complex values applied as properties via `beforeHydrate`. `false` is dropped.
const splitProps = (props: Record<string, unknown>, properties: Record<string, string>) => {
  const attributes: Record<string, AttributeValue> = {};
  const complexProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'boolean' && value === false) {
      continue;
    }
    const attributeName = possibleStandardNames[key as keyof typeof possibleStandardNames] || properties[key] || key;
    if (key === 'style' && typeof value === 'object' && value) {
      attributes[attributeName] = value as Record<string, unknown>;
      continue;
    }
    if (isPrimitive(value)) {
      attributes[attributeName] = value;
    } else {
      complexProps[key] = value;
    }
  }
  return { attributes, complexProps };
};

const isStencilSsrComponent = (type: unknown): type is MarkedSsrComponent =>
  typeof type === 'function' && stencilSsrOptions in type;

// Parents only need nested Stencil children as tags with attributes. Rendering them fully
// here ran each child once per ancestor level; the child renders itself once as a real child.
const createShallowComponent =
  (options: ShallowComponentOptions, context: SerializationContext) =>
  ({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) => {
    const { attributes, complexProps } = splitProps(props, options.properties);
    // React only accepts a style object, but callers without type checks can pass a string.
    if (typeof attributes.style === 'string') {
      attributes.style = context.parseStyle(attributes.style);
    }
    bankComplexProps(context, attributes, complexProps);
    const transformTag = options.transformTag ?? hydrateModuleCache?.transformTag;
    const tagName = transformTag ? transformTag(options.tagName) : options.tagName;
    return React.createElement(tagName, { ...attributes, suppressHydrationWarning: true }, children);
  };

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
 * Returns true if the value is a React exotic component that react-dom/server handles
 * natively (forwardRef or memo). These must NOT be called directly as their render
 * functions use hooks, which are illegal outside of React's renderer.
 *
 * - React.forwardRef → { $$typeof: Symbol(react.forward_ref), render }
 * - React.memo       → { $$typeof: Symbol(react.memo), type, compare }
 *
 * We require $$typeof to be present to avoid false-positives on plain objects
 * that happen to have a 'render' or 'type' key.
 */
const isNativelyRenderedExotic = (
  value: unknown
): value is React.ForwardRefExoticComponent<any> | React.MemoExoticComponent<any> =>
  !!value &&
  typeof value === 'object' &&
  '$$typeof' in value &&
  ('render' in value || ('type' in value && 'compare' in value));

// Same options `html-react-parser` parses with, plus the source offsets `getInnerHTML` slices by.
const htmlParserOptions = { lowerCaseAttributeNames: false, withStartIndices: true, withEndIndices: true };

/**
 * Returns the source of an element's children, keeping its whitespace exactly as serialized.
 * @param element - an element parsed from `html` with `htmlParserOptions`
 * @param html - the source the element was parsed from
 * @returns the inner HTML of the element
 */
const getInnerHTML = (element: Element, html: string) => {
  const first = element.children[0];
  const last = element.children[element.children.length - 1];
  return first && last ? html.slice(first.startIndex!, last.endIndex! + 1) : '';
};

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
      throw new Error('`createComponentForServerSideRendering` can only be run on the server');
    }

    /**
     * `html-react-parser` is a Node.js dependency so we should make sure to only import it when
     * run on the server and when needed.
     */
    const { htmlToDOM, domToReact, attributesToProps } = await import('html-react-parser');
    const context: SerializationContext = {
      complexProps: new Map(),
      parseStyle: (style) => attributesToProps({ style }).style ?? {},
    };

    /**
     * compose element props into a string; complex (non-primitive) props are banked
     * and applied via beforeHydrate; they never need to be attribute-serialized
     */
    const { attributes, complexProps } = splitProps(props, options.properties);
    bankComplexProps(context, attributes, complexProps);
    let stringProps = '';
    for (const [attributeName, value] of Object.entries(attributes)) {
      const serialized = typeof value === 'object' ? stringifyCSSProperties(value) : value;
      stringProps += ` ${attributeName}="${serialized}"`;
    }

    /**
     * Attempt to serialize the components light DOM as it may have an impact on how the Stencil
     * component is being serialized. For example a Stencil component may render certain elements
     * if its light DOM contains other elements.
     */
    let serializedChildren = '';
    const transformedTagName = options.transformTag ? options.transformTag(options.tagName) : options.tagName;
    const toSerialize = `<${transformedTagName}${stringProps} suppressHydrationWarning="true">`;
    const originalConsoleError = console.error;
    try {
      // Ignore potential console errors during serialization (for example if a hook is used, which
      // is not allowed in SSR) as they are not relevant for the user and may cause confusion
      if (!process.env.STENCIL_SSR_DEBUG) {
        console.error = () => {};
      }
      const awaitedChildren = await resolveComponentTypes(children, context);
      const { renderToString } = await import('react-dom/server');
      serializedChildren = renderToString(awaitedChildren);
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

    const toSerializeWithChildren = `${toSerialize}${serializedChildren}</${transformedTagName}>`;

    /**
     * `prettyHtml` stays off: its formatting whitespace can't be told apart from text in the light DOM.
     */
    const { html: renderedHtml, styles } = await options.renderToString(toSerializeWithChildren, {
      fullDocument: false,
      serializeShadowRoot: options.serializeShadowRoot ?? 'declarative-shadow-dom',
      prettyHtml: false,
      ...(context.complexProps.size > 0 && {
        beforeHydrate: (doc: Document) => {
          doc.querySelectorAll(`[${complexPropsAttribute}]`).forEach((el) => {
            const id = el.getAttribute(complexPropsAttribute)!;
            const complexProps = context.complexProps.get(id);
            if (complexProps) {
              el.removeAttribute(complexPropsAttribute);
              Object.assign(el, complexProps);
              context.complexProps.delete(id);
            }
          });
        },
      }),
    });

    if (!renderedHtml) {
      throw new Error('No HTML returned from renderToString');
    }
    let html = renderedHtml;
    // Remove the markers `beforeHydrate` couldn't reach: Stencil keeps `<template>` content out of the
    // document and parses `<noscript>` content as text.
    for (const id of context.complexProps.keys()) {
      html = html.replaceAll(` ${complexPropsAttribute}="${id}"`, '');
    }

    /**
     * cut out the inner content of the component; with `fullDocument: false` the html is the host element
     */
    const nodes = htmlToDOM(html, htmlParserOptions);
    const host = nodes.find((node): node is Element => 'attribs' in node);
    const template = host?.children.find(
      (node): node is Element => 'attribs' in node && node.name === 'template' && node.attribs.shadowrootmode === 'open'
    );
    const hydrationComment = '<!--r.1-->';
    const isShadowComponent = !!template;
    const delegatesFocus = !!template && 'shadowrootdelegatesfocus' in template.attribs;

    /**
     * Parse the string back into a React component
     */
    const StencilElement = () =>
      domToReact(nodes, {
        transform(reactNode, domNode) {
          /**
           * only render the component we have been serializing before
           */
          if ('name' in domNode && (domNode.name === transformedTagName || domNode.name === options.tagName)) {
            const props = (reactNode as any).props;
            /**
             * remove the outer tag (e.g. `transformedTagName`) so we only have the inner content
             */
            const CustomTag = `${transformedTagName}`;

            /**
             * if the component is not a shadow component we can render it with the light DOM only
             */
            if (!isShadowComponent) {
              const { children, ...customProps } = props || {};
              const __html = getInnerHTML(domNode as Element, html);

              const renderStyles =
                styles.length > 0 &&
                styles.map((style, index) => {
                  return (
                    <style
                      href={`stencil-${style.id || options.tagName}`}
                      key={style.id || index}
                      id={style.id}
                      precedence="stencil"
                      suppressHydrationWarning={true}
                      dangerouslySetInnerHTML={{ __html: style.content || '' }}
                    />
                  );
                });
              return (
                <Fragment>
                  {renderStyles}
                  <CustomTag {...customProps} suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html }} />
                </Fragment>
              );
            }

            /**
             * return original component with given props and `suppressHydrationWarning` flag and
             * set the template content based on our serialized Stencil component.
             */
            return (
              <CustomTag {...props} suppressHydrationWarning={true}>
                <template
                  // @ts-expect-error
                  shadowrootmode="open"
                  {...(delegatesFocus ? { shadowrootdelegatesfocus: '' } : {})}
                  suppressHydrationWarning={true}
                  dangerouslySetInnerHTML={{ __html: hydrationComment + getInnerHTML(template, html) }}
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
 * It walks through all component children and resolves them, e.g. call `createComponentForServerSideRendering` to
 * create a React component which we can pass into `ReactDOMServer.renderToString`. This enables us to include
 * the Light DOM of a component as part of Stencils serialization process.
 *
 * @param children - the children to resolve
 * @param context - collects what the parent's Stencil render needs from nested Stencil components
 * @returns the resolved children
 */
async function resolveComponentTypes(children: ReactNode, context: SerializationContext): Promise<ReactNode> {
  /**
   * If the children are a empty or a primitive we can return them directly
   * e.g. `Hello World` or `42` or `null`
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
        return resolveComponentTypes(child, context);
      }

      // Only ReactElements have type and props properties
      if (!React.isValidElement(child)) {
        return child;
      }

      const { type, props } = child as React.ReactElement<object & { children: ReactNode }>;

      const resolvedType = await resolveType(type, props as any, context);

      // If resolveType returned a fully rendered React element (e.g. from an async Stencil SSR
      // component), return it directly — it is already the final output and must not be wrapped
      // back into a new element with itself as the `type`.
      if (React.isValidElement(resolvedType)) {
        return resolvedType;
      }

      return {
        ...child,
        props: {
          ...props,
          children: await resolveComponentTypes(props.children, context),
        },
        type: resolvedType,
      } as ReactNode;
    })
  );
}

// Resolve the component type to a primitive element type
const resolveType = async (
  type: string | React.JSXElementConstructor<any>,
  props: any,
  context: SerializationContext
): Promise<ReactNodeExtended> => {
  let resolvedType: ReactNodeExtended = null;

  if (isStencilSsrComponent(type)) {
    // Nested Stencil SSR component: emit its tag shallowly instead of running its hydrate pass.
    return createShallowComponent(type[stencilSsrOptions], context);
  }

  if (typeof type === 'string') {
    // Child is a primitive element like 'div'
    return type;
  } else if (isJSXClassElementConstructor(type)) {
    // Child is a Class Component
    const instance = new type(props, undefined);
    resolvedType = instance.render ? instance.render() : instance;
  } else if (isLazyExoticComponent(type)) {
    // Handle React Lazy Component and Next.js RSC module references.
    // React.lazy payload: { _status: -1, _result: promiseFn } → call _result() when uninitialized.
    // Next.js RSC reference: { _result: undefined, _init: fn } → call _init(payload) to resolve.
    // https://github.com/facebook/react/blob/main/packages/react/src/ReactLazy.js
    const payload = type._payload;
    let lazyComponent: any;
    if (typeof (type as any)._init === 'function' && payload._result === undefined) {
      // Next.js RSC module reference format: use _init to resolve the component
      const resolved = await (type as any)._init(payload);
      lazyComponent = resolved?.default ?? resolved;
    } else {
      const { default: def } =
        payload._status === -1 // Uninitialized = -1 so we need resolve the promise
          ? await payload._result()
          : payload._result;
      lazyComponent = def;
    }
    // Now resolve the actual component type of the lazy component
    resolvedType = await resolveType(lazyComponent, props, context);
  } else if (isNativelyRenderedExotic(type)) {
    // React.forwardRef and React.memo objects are handled natively by react-dom/server.
    // Calling their inner render/type functions directly violates React's hook rules.
    // Return the exotic object as-is; renderToString will render it correctly.
    return type;
  } else if (typeof type !== 'object') {
    // Child is a Function Component because React Server
    // Components can be a Promise we need to await it
    resolvedType = await type(props);
  }

  // Recursively resolve the component type until we have a primitive element type.
  // React.isValidElement narrows to ReactElement, giving `.type` as `string | JSXElementConstructor<any>`.
  // Exotic components return early above, so a valid element here still needs its type resolved.
  if (!isEmpty(resolvedType) && !isPrimitive(resolvedType) && React.isValidElement(resolvedType)) {
    resolvedType = await resolveType(resolvedType.type, props, context);
  }

  return resolvedType;
};

type CreateComponentForSSROptions<
  I extends HTMLElement,
  E extends EventNames = {},
  C = Omit<I, keyof HTMLElement>,
  R extends keyof C = never,
> = Omit<CreateComponentForServerSideRenderingOptions, 'renderToString' | 'transformTag'> & {
  hydrateModule: Promise<HydrateModule> | undefined;
  transformTag?: (tag: string) => string;
  getTagTransformer?: () => ((tag: string) => string) | undefined;
  clientModule?: StencilReactComponent<I, E, C, R>;
};

let hydrateModuleCache: HydrateModule | null = null;

/**
 * Defines a custom element and creates a React component for server side rendering.
 * @public
 */
export const createComponent = <
  I extends HTMLElement,
  E extends EventNames = {},
  C = Omit<I, keyof HTMLElement>,
  R extends keyof C = never,
>(
  options: CreateComponentForSSROptions<I, E, C, R>
): StencilReactComponent<I, E, C, R> => {
  /**
   * If we are running in the browser, we can use the `clientModule` function
   * to create a React component that can be used in the browser. This allows to import
   * a Stencil component from one source and have a browser and server version of the component.
   */
  if (typeof window !== 'undefined') {
    if (options.clientModule) {
      return options.clientModule;
    }
    // Fallback to createComponentWrapper if clientModule not provided (backward compatibility)
    if (createComponentWrapper) {
      return createComponentWrapper<I, E, C, R>({
        tagName: options.tagName,
        properties: options.properties,
      } as any) as unknown as StencilReactComponent<I, E, C, R>;
    }
  }

  /**
   * IIFE to lazy load the `createComponentForServerSideRendering` function while allowing
   * to return the correct type for the `ReactWebComponent`.
   *
   * Note: we want to lazy load the `./ssr` and `hydrateModule` modules to avoid
   * bundling them in the runtime and serving them in the browser.
   */
  const ServerComponent = (async (props: WebComponentProps<I>) => {
    if (!options.hydrateModule) {
      throw new Error(
        '`hydrateModule` is required when rendering a Stencil component on the server. ' +
          'This indicates a misconfiguration of the Stencil React output target.'
      );
    }
    let firstTime = false;
    if (!hydrateModuleCache) {
      hydrateModuleCache = await options.hydrateModule;
      firstTime = true;
    }
    const resolvedHydrateModule = hydrateModuleCache;

    if (options.getTagTransformer && firstTime) {
      const tagTransformer = options.getTagTransformer();
      if (tagTransformer) {
        resolvedHydrateModule.setTagTransformer(tagTransformer);
      }
    }
    options.transformTag = resolvedHydrateModule.transformTag;

    return createComponentForServerSideRendering<I, E>({
      renderToString: resolvedHydrateModule.renderToString,
      ...options,
    })(props as any);
  }) as unknown as StencilReactComponent<I, E, C, R> & MarkedSsrComponent;
  ServerComponent[stencilSsrOptions] = options;

  return ServerComponent;
};

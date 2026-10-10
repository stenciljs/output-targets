import type { EventName, ReactWebComponent, WebComponentProps } from '@lit/react';
import React, { JSXElementConstructor, ReactNode } from 'react';
import type { Element } from 'html-react-parser';

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

type StencilProps<I extends HTMLElement> = WebComponentProps<I>;

// Definition comes from React but is not exported or part of the types package
// see https://github.com/facebook/react/blob/372ec00c0384cd2089651154ea7c67693ee3f2a5/packages/react/src/ReactLazy.js#L46
type LazyComponent<T, P> = {
  $$typeof: symbol | number;
  _payload: P;
  _init: (payload: P) => T;
};

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

interface SerializationContext {
  renderToString: RenderToString;
  properties: Map<string, Record<string, unknown>>;
  parseStyle: (style: string) => React.CSSProperties | undefined;
}

// Metadata belongs to the generated wrapper, without adding public fields to it.
type ServerComponentMetadata = Omit<CreateComponentForServerSideRenderingOptions, 'renderToString'> & {
  hydrateModule: Promise<HydrateModule> | undefined;
};
const serverComponents = new WeakMap<Function, ServerComponentMetadata>();
const propertiesAttribute = 'data-stencil-react-props';

function createLightDOMElement(
  options: Pick<CreateComponentForServerSideRenderingOptions, 'tagName' | 'properties' | 'transformTag'>,
  { children, ...props }: Record<string, unknown> & { children?: ReactNode },
  context: SerializationContext
) {
  const attributes: Record<string, unknown> = {};
  const properties: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(props)) {
    if (name === 'ref' || value === false) continue;
    if (name === 'style') {
      attributes.style = typeof value === 'string' ? context.parseStyle(value) : value;
    } else if (typeof value === 'string' || typeof value === 'number' || value === true) {
      const attribute =
        possibleStandardNames[name as keyof typeof possibleStandardNames] || options.properties[name] || name;
      attributes[attribute] = value === true ? 'true' : value;
    } else {
      properties[name] = value;
    }
  }
  if (Object.keys(properties).length) {
    const id = String(context.properties.size);
    context.properties.set(id, properties);
    attributes[propertiesAttribute] = id;
  }
  const tagName = options.transformTag?.(options.tagName) ?? options.tagName;
  return React.createElement(tagName, attributes, children);
}

function getInnerHTML(element: Element, html: string): string {
  const first = element.children[0];
  const last = element.children[element.children.length - 1];
  if (!first || !last) return '';
  if (first.startIndex === null || last.endIndex === null) throw new Error('Missing HTML parser offsets');
  return html.slice(first.startIndex, last.endIndex + 1);
}

/**
 * Transform a React component into a Stencil component for server side rendering. This logic is executed
 * by a React framework e.g. Next.js in an Node.js environment. The function will:
 *
 *   - serialize the component (including the Light DOM) into a string (see `toSerializeWithChildren`)
 *   - render the Stencil subtree using the configured shadow-root serialization mode
 *   - preserve the serialized HTML when returning the React component
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

    const { htmlToDOM, attributesToProps } = await import('html-react-parser');
    const context: SerializationContext = {
      renderToString: options.renderToString,
      properties: new Map(),
      parseStyle: (style) => attributesToProps({ style }).style,
    };
    const transformedTagName = options.transformTag?.(options.tagName) ?? options.tagName;
    const { renderToString } = await import('react-dom/server');
    const closingTag = `</${transformedTagName}>`;
    const hostHTML = renderToString(createLightDOMElement(options, props, context));
    const toSerialize = hostHTML.slice(0, -closingTag.length);

    /**
     * Attempt to serialize the components light DOM as it may have an impact on how the Stencil
     * component is being serialized. For example a Stencil component may render certain elements
     * if its light DOM contains other elements.
     */
    let serializedChildren = '';
    const originalConsoleError = console.error;
    try {
      if (!process.env.STENCIL_SSR_DEBUG) {
        console.error = () => {};
      }
      const awaitedChildren = await resolveChildren(children, context);
      // Keep React's hoisted resource links inside the serialized light DOM.
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

    const toSerializeWithChildren = `${toSerialize}${serializedChildren}${closingTag}`;

    const { html, styles } = await options.renderToString(toSerializeWithChildren, {
      fullDocument: false,
      serializeShadowRoot: options.serializeShadowRoot ?? 'declarative-shadow-dom',
      prettyHtml: false,
      ...(context.properties.size > 0 && {
        beforeHydrate(document: Document) {
          document.querySelectorAll(`[${propertiesAttribute}]`).forEach((element) => {
            const properties = context.properties.get(element.getAttribute(propertiesAttribute)!);
            element.removeAttribute(propertiesAttribute);
            if (properties) Object.assign(element, properties);
          });
        },
      }),
    });

    if (!html) {
      throw new Error('No HTML returned from renderToString');
    }

    const parserOptions = { withStartIndices: true, withEndIndices: true, lowerCaseAttributeNames: false };
    const nodes = htmlToDOM(html, parserOptions);
    const host = nodes.find((node): node is Element => 'attribs' in node && node.name === transformedTagName);
    if (!host) throw new Error(`No <${transformedTagName}> returned from renderToString`);
    const template = host.children.find(
      (node): node is Element => 'attribs' in node && node.name === 'template' && node.attribs.shadowrootmode === 'open'
    );
    // Custom-element attributes must stay verbatim, especially `class` in React 18.
    // Only style needs converting back to a React prop.
    const hostProps = { ...host.attribs, style: context.parseStyle(host.attribs.style) };
    const content = template
      ? React.createElement(
          transformedTagName,
          { ...hostProps, suppressHydrationWarning: true },
          React.createElement('template', {
            ...template.attribs,
            suppressHydrationWarning: true,
            dangerouslySetInnerHTML: { __html: '<!--r.1-->' + getInnerHTML(template, html) },
          }),
          children
        )
      : React.createElement(transformedTagName, {
          ...hostProps,
          suppressHydrationWarning: true,
          dangerouslySetInnerHTML: { __html: getInnerHTML(host, html) },
        });

    return React.createElement(
      React.Fragment,
      null,
      styles.map((style, index) =>
        React.createElement('style', {
          key: style.id || index,
          id: style.id,
          href: `stencil-${style.id || options.tagName}`,
          precedence: 'stencil',
          suppressHydrationWarning: true,
          dangerouslySetInnerHTML: { __html: style.content || '' },
        })
      ),
      content
    );
  }) as unknown as ReactWebComponent<I, E>;
};

// Await nested promises before React.Children assigns keys; it traverses child arrays synchronously.
async function awaitChildren(children: ReactNode): Promise<ReactNode> {
  children = await children;
  return Array.isArray(children) ? Promise.all(children.map(awaitChildren)) : children;
}

/**
 * Resolve light-DOM children while preserving the props and content returned by components.
 * Generated wrappers from the same hydrate module become custom elements for the parent's Stencil pass.
 */
async function resolveChildren(children: ReactNode, context: SerializationContext): Promise<ReactNode> {
  children = await awaitChildren(children);
  if (isPrimitive(children) || isEmpty(children)) return children;
  if (isIterable(children)) {
    return Promise.all(React.Children.toArray(children).map((child) => resolveChildren(child, context)));
  }
  if (!React.isValidElement(children)) return children;

  const element = children as React.ReactElement<{ children?: ReactNode }>;
  const resolved = await resolveElement(element, context);
  // A component's returned root occupies the same list position as the component it replaces.
  return React.isValidElement(resolved) && element.key !== null
    ? React.cloneElement(resolved, { key: element.key })
    : resolved;
}

async function resolveElement(
  element: React.ReactElement<{ children?: ReactNode }>,
  context: SerializationContext
): Promise<ReactNode> {
  const { type, props } = element;
  const options = typeof type === 'function' ? serverComponents.get(type) : undefined;
  if (options?.hydrateModule) {
    const hydrateModule = await options.hydrateModule;
    if (hydrateModule.renderToString === context.renderToString) {
      return createLightDOMElement(
        { ...options, transformTag: hydrateModule.transformTag },
        { ...props, children: await resolveChildren(props.children, context) },
        context
      );
    }
  }

  if (isLazyExoticComponent(type)) {
    // Handle React Lazy Component and Next.js RSC module references.
    // React.lazy payload: { _status: -1, _result: promiseFn } → call _result() when uninitialized.
    // Next.js RSC reference: { _result: undefined, _init: fn } → call _init(payload) to resolve.
    // https://github.com/facebook/react/blob/main/packages/react/src/ReactLazy.js
    const payload = type._payload;
    let lazyComponent: any;
    if (typeof (type as any)._init === 'function' && payload._result === undefined) {
      const resolved = await (type as any)._init(payload);
      lazyComponent = resolved?.default ?? resolved;
    } else {
      const { default: def } = payload._status === -1 ? await payload._result() : payload._result;
      lazyComponent = def;
    }
    return resolveChildren({ ...element, type: lazyComponent }, context);
  }

  if (isJSXClassElementConstructor(type)) {
    const instance = new type(props, undefined);
    return resolveChildren(instance.render(), context);
  }
  if (typeof type === 'function') {
    // Keep the returned tree, not just its root type with the caller's original props.
    return resolveChildren(await type(props), context);
  }

  // Native elements, Fragments and exotic components are rendered by React.
  // In particular, forwardRef/memo render functions may use hooks and must not be invoked here.
  return {
    ...element,
    props: { ...props, children: await resolveChildren(props.children, context) },
  };
}

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
  const component = async (props: WebComponentProps<I>) => {
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
  };
  serverComponents.set(component, options);
  return component as unknown as StencilReactComponent<I, E, C, R>;
};

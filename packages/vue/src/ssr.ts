import url from 'node:url';
import * as vue from 'vue';
import type { SetupContext } from 'vue';
import { type LooseRequired } from '@vue/shared';

import { type InputProps } from './types';

const LOG_PREFIX = '[vue-output-target]';


/**
 * When using Stencil SSR in Nuxt projects, we have to make sure that we import Vue from
 * the users project dependencies and not the one that may be resolve by the output target.
 * We only need to do this in Nuxt projects, hence inspecting for `/.nuxt/` in the `process.argv`.
 */
let externalVue: string | undefined;
if (globalThis.process?.argv?.[1]?.includes('/.nuxt/')) {
  const { resolve } = await import('import-meta-resolve');
  externalVue = await resolve('vue', url.pathToFileURL(globalThis.process.argv[1]).href);
}
const VueImport: typeof vue = externalVue
  ? await import(externalVue)
  : vue;

const { defineComponent, useSlots, compile, createSSRApp } = VueImport;

/**
 * these types are defined by a Stencil hydrate app so we have to copy the minimal types here
 */
interface RenderToStringOptions {
  fullDocument?: boolean;
  serializeShadowRoot?: boolean;
  prettyHtml?: boolean;
}
type RenderToString = (html: string, options: RenderToStringOptions) => Promise<{ html: string | null }>;

interface StencilSSRComponentOptions {
  tagName: string;
  hydrateModule: Promise<{ renderToString: RenderToString }>;
  props?: Record<string, [any, string?]>;
}

/**
 * returns true if the value is a primitive, e.g. string, number, boolean
 * @param value - the value to check
 * @returns true if the value is a primitive, false otherwise
 */
function isPrimitive(value: any) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

export function defineStencilSSRComponent<Props, VModelType = string | number | boolean>(
  options: StencilSSRComponentOptions
) {
  return defineComponent<Props & InputProps<VModelType>>({
    async setup(props: LooseRequired<Readonly<{}> & Readonly<{}> & {}>, context: SetupContext) {
      /**
       * resolve light dom into a string
       */
      const slots = useSlots();
      let renderedLightDom = '';
      if (typeof slots.default === 'function') {
        const ssrLightDom = createSSRApp({ render: () => slots.default!() });
        const { renderToString: vueRenderToString } = await import('vue/server-renderer');
        renderedLightDom = await vueRenderToString(ssrLightDom, { context });
      }

      /**
       * compose element props into a string
       */
      let stringProps = '';
      for (const [key, value] of Object.entries(props)) {
        if (typeof value === 'undefined') {
          continue;
        }

        /**
         * Stencils metadata tells us which properties can be serialized
         */
        const propName = options.props?.[key][1];
        const propValue = isPrimitive(value)
          ? typeof value === 'boolean'
            ? /**
               * omit boolean properties that are false all together
               */
              value
              ? '"true"'
              : undefined
            : `"${value}"`
          : Array.isArray(value) && value.every(isPrimitive)
            ? JSON.stringify(value)
            : undefined;
        if (!propName || !propValue) {
          console.warn(
            `${LOG_PREFIX} ignore component property "${key}" for ${options.tagName} ` +
              "- property type is unknown or not a primitive and can't be serialized"
          );
          continue;
        }

        stringProps += ` ${propName}=${propValue}`;
      }

      /**
       * transform component into Declarative Shadow DOM by lazy loading the hydrate module
       */
      const toSerialize = `<${options.tagName}${stringProps}>${renderedLightDom}</${options.tagName}>`;
      const { renderToString } = await options.hydrateModule;
      const { html } = await renderToString(toSerialize, {
        fullDocument: false,
        serializeShadowRoot: true,
      });

      if (!html) {
        throw new Error(`'${options.tagName}' component did not render anything.`);
      }

      return compile(
        html
          /**
           * by default Vue strips out the <style> tag, so this little trick
           * makes it work by wrapping it in a component tag
           */
          .replace('<style>', `<component :is="'style'">`)
          .replace('</style>', '</component>'),
        {
          comments: true,
          isCustomElement: (tag: string) => tag === options.tagName,
        }
      );
    },
    props: Object.entries(options.props || {}).reduce(
      (acc, [key, value]) => {
        acc[key] = value[0];
        return acc;
      },
      {} as Record<string, Function | Object | Number | String>
    ),
    /**
     * the template tags can be arbitrary as they will be replaced with above compiled template
     */
    template: '<div></div>',
  });
}

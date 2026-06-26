import { defineComponent, useSlots, compile, createSSRApp, type SetupContext } from 'vue';
import { type LooseRequired } from '@vue/shared';
import { type InputProps } from './types';

/**
 * these types are defined by a Stencil hydrate app so we have to copy the minimal types here
 */
interface RenderToStringOptions {
  fullDocument?: boolean;
  serializeShadowRoot?: boolean;
  prettyHtml?: boolean;
  /** @deprecated use `beforeSsr` — kept for v4/v5 compatibility */
  beforeHydrate?: (document: Document) => void | Promise<void>;
}
type RenderToString = (html: string, options: RenderToStringOptions) => Promise<{ html: string | null }>;

interface StencilSSRComponentOptions {
  tagName: string;
  hydrateModule: Promise<{
    renderToString: RenderToString;
    setTagTransformer?: (transformer: (tag: string) => string) => void;
    transformTag?: (tag: string) => string;
  }>;
  props?: Record<string, [any, string?]>;
  getTagTransformer?: () => ((tag: string) => string) | undefined;
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
       * compose element props into a string; complex (non-primitive) props are banked
       * and applied via beforeHydrate so they never need to be attribute-serialized
       */
      let stringProps = '';
      const complexProps: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        if (typeof value === 'undefined') {
          continue;
        }

        if (!isPrimitive(value)) {
          complexProps[key] = value;
          continue;
        }

        if (typeof value === 'boolean' && value === false) {
          continue;
        }

        const propName = options.props?.[key]?.[1] ?? key;
        const propValue = typeof value === 'boolean' ? '"true"' : `"${value}"`;
        stringProps += ` ${propName}=${propValue}`;
      }

      /**
       * transform component into Declarative Shadow DOM by lazy loading the hydrate module
       */
      const hydrateModule = await options.hydrateModule;

      // Sync the tag transformer with the hydrate module if provided
      if (options.getTagTransformer) {
        const tagTransformer = options.getTagTransformer();
        if (tagTransformer && hydrateModule.setTagTransformer) {
          hydrateModule.setTagTransformer(tagTransformer);
        }
      }

      // Use the hydrate module's transformTag if available, otherwise use the tag as-is
      const transformedTagName = hydrateModule.transformTag
        ? hydrateModule.transformTag(options.tagName)
        : options.tagName;
      const toSerialize = `<${transformedTagName}${stringProps}>${renderedLightDom}</${transformedTagName}>`;
      const { renderToString } = hydrateModule;
      const { html } = await renderToString(toSerialize, {
        fullDocument: false,
        serializeShadowRoot: true,
        ...(Object.keys(complexProps).length > 0 && {
          beforeHydrate: (doc: Document) => {
            const el = doc.querySelector(transformedTagName) as any;
            if (el) {
              for (const [propName, value] of Object.entries(complexProps)) {
                el[propName] = value;
              }
            }
          },
        }),
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
          .replace(/<style([^>]*)>/g, `<component :is="'style'" $1>`)
          .replace(/<\/style>/g, '</component>'),
        {
          comments: true,
          isCustomElement: (tag) => tag === transformedTagName || tag === options.tagName,
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

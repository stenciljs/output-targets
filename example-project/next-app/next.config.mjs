import stencilSSR from '@stencil/ssr/next';

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default stencilSSR({
  module: import('component-library-react'),
  from: 'component-library-react',
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot: {
    scoped: ['my-counter'],
    default: 'declarative-shadow-dom',
  },
})(nextConfig);

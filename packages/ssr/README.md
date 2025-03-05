# @stencil/ssr

> A package for server-side rendering Stencil components.

This package provides utilities for server-side rendering Stencil components in React, Vue or Angular applications bundled through a Rollup based compiler, e.g. Vite or Remix.

## Install

Install this package via:

```sh
$ npm install --save-dev @stencil/ssr
```

## Setup

In your e.g. Vite configuration, add the `stencilSSR` plugin as following:

```ts
import { defineConfig } from "vite";
import { stencilSSR } from "@stencil/react-output-target/vite";

export default defineConfig({
  // ...
  plugins: [
    stencilSSR({
      module: import('component-library-react'),
      from: 'component-library-react',
      hydrateModule: import('component-library/hydrate'),
    }),
  ],
});
```

The plugin requires the following options:

#### `module`

The import of the library that exposes your Stencil components wrapped around the output target.

### `from`

The name of the library that exposes your Stencil components wrapped around the output target.

### `hydrateModule`

tbd.

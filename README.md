| Project               | Package                                                                                          | Version                                                                                                                                            | Documentation                                        |
| --------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| React Output Target   | [`@stencil/react-output-target`](https://www.npmjs.com/package/@stencil/react-output-target)     | [![version](https://img.shields.io/npm/v/@stencil/react-output-target/latest.svg)](https://www.npmjs.com/package/@stencil/react-output-target)     | [README](./packages/react/README.md)                 |
| Angular Output Target | [`@stencil/angular-output-target`](https://www.npmjs.com/package/@stencil/angular-output-target) | [![version](https://img.shields.io/npm/v/@stencil/angular-output-target/latest.svg)](https://www.npmjs.com/package/@stencil/angular-output-target) | [README](./packages/angular/README.md)               |
| Vue Output Target     | [`@stencil/vue-output-target`](https://www.npmjs.com/package/@stencil/vue-output-target)         | [![version](https://img.shields.io/npm/v/@stencil/vue-output-target/latest.svg)](https://www.npmjs.com/package/@stencil/vue-output-target)         | [README](./packages/vue/README.md)                   |
| SSR                   | [`@stencil/ssr`](https://www.npmjs.com/package/@stencil/ssr)                                     | [![version](https://img.shields.io/npm/v/@stencil/ssr/latest.svg)](https://www.npmjs.com/package/@stencil/ssr)                                     | [README](./packages/ssr/README.md)                   |

# Introduction

Integrating web components into existing framework applications can be difficult at times. More about this can be read at https://custom-elements-everywhere.com/. To accommodate the various issues, the Stencil team has created output target plugins to make the process simpler.

Stencil offers output targets for React, Angular, and Vue.

## React

In your React project, you can use the following command to install the output target:

```bash
npm install @stencil/react-output-target
```

Update the `stencil.config.ts` file to include the following:

```ts
import type { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  // ...
  plugins: [
    reactOutputTarget({
      // ...
    })
  ]
  // ...
}
```

Read more about using Stencil components in a React application in our [docs](https://stenciljs.com/docs/react).

## Vue

In your Vue project, you can use the following command to install the output target:

```bash
npm install @stencil/vue-output-target
```

Update the `stencil.config.ts` file to include the following:

```ts
import type { Config } from '@stencil/core';
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  // ...
  plugins: [
    vueOutputTarget({
      // ...
    })
  ]
  // ...
}
```

Read more about using Stencil components in a Vue application in our [docs](https://stenciljs.com/docs/vue).

## Angular

In your Angular project, you can use the following command to install the output target:

```bash
npm install @stencil/angular-output-target
```

Update the `stencil.config.ts` file to include the following:

```ts
import type { Config } from '@stencil/core';
import { angularOutputTarget } from '@stencil/angular-output-target';

export const config: Config = {
  // ...
  plugins: [
    angularOutputTarget({
      // ...
    })
  ]
  // ...
}
```

Read more about using Stencil components in an Angular application in our [docs](https://stenciljs.com/docs/angular).

## Example Project

Check out our [example project](https://github.com/stenciljs/output-targets/blob/main/example-project/component-library) which structures a reference implementation for a common design system that contains the following components:

- [`component-library`](https://github.com/stenciljs/output-targets/blob/main/example-project/component-library) - A Stencil project that exports components
- [`component-library-vue`](https://github.com/stenciljs/output-targets/blob/main/example-project/component-library-vue) - A Vue project that consumes Stencil components and exports them as a Vue component
- [`component-library-angular`](https://github.com/stenciljs/output-targets/blob/main/example-project/component-library-angular) - An Angular project that consumes Stencil components and exports them as an Angular module
- [`component-library-react`](https://github.com/stenciljs/output-targets/blob/main/example-project/component-library-react) - A React + Vite project that uses Stencil components and exports them as a React component
- [`next-app`](https://github.com/stenciljs/output-targets/blob/main/example-project/next-app) - A Next.js application that consumes the Stencil components from the `component-library-react` project
- [`next-15-react-19-app`](https://github.com/stenciljs/output-targets/blob/main/example-project/next-15-react-19-app) - A Next.js v15 application using React v19 that consumes the Stencil components from the `component-library-react` project
- [`nuxt-app`](https://github.com/stenciljs/output-targets/blob/main/example-project/nuxt-app) - A Nuxt application that consumes the Stencil components from the `component-library-vue` project
- [`vue-app`](https://github.com/stenciljs/output-targets/blob/main/example-project/vue-app) - A Vue + Vite example application that consumes the Stencil components from the `component-library-vue` project
- [`vue-app-broken`](https://github.com/stenciljs/output-targets/blob/main/example-project/vue-app-broken) - A Vue + Vite example application with invalid type use for testing purposes, ensuring Vue component properties types are propagated correctly

Detailed information for each output target can be found in each package's README.

## Contributing

See our [CONTRIBUTING.md](./CONTRIBUTING.md) file for more information on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

## Community

Join the Stencil community on [Discord](https://chat.stenciljs.com/) to get help, share your projects, and get notified when new releases are made.

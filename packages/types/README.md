# @stencil/types-output-target

Automate the creation of type definitions for your Stencil web components.

- React (v19+ natively supports custom elements)
- Vue (v3+)
- Solid
- Svelte
- Preact

## Setup

### In Your Stencil Component Library

Install the `@stencil/types-output-target` package in your Stencil project as a development dependency:

```bash
npm install @stencil/types-output-target --save-dev
```

Configure the output target in your `stencil.config.ts` file:

```ts
import { Config } from '@stencil/core';
import { typesOutputTarget } from '@stencil/types-output-target';

export const config: Config = {
  outputTargets: [
    typesOutputTarget({
      reactTypesPath: 'dist/types',
      vueTypesPath: 'dist/types',
      solidTypesPath: 'dist/types',
      svelteTypesPath: 'dist/types',
      preactTypesPath: 'dist/types',
    }),
  ],
};
```

Build your Stencil project to generate the framework-specific type definitions:

```bash
npm run build
```

The component wrappers will be generated in the specified output directory.

### Peer Dependencies

Ensure that your Stencil component library's `package.json` includes the necessary peer dependencies for the frameworks you are targeting. For example, for React:

```json
"peerDependencies": {
  "@types/react": ">=19"
},
"peerDependenciesMeta": {
  "@types/react": {
    "optional": true
  }
}
```

### Using the Generated Types

Your users can now import the generated type definitions in their projects to get type support for your Stencil web components in their chosen framework. 
For example, in a React project:

```tsx
import 'your-component-library/react-types';
```
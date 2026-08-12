## 2.0

### Breaking Changes

- The `createComponent` function and `StencilReactComponent` type have been moved from `@stencil/react-output-target/runtime` to generated build artifacts. Apps that imported these directly can now import them from their Stencil React components package. Stencil React components generated with `@stencil/react-output-target` v1 will not be compatible with `@stencil/react-output-target` v2 runtime.
- Building the generated React component library requires targeting es2015 at minimum. Projects can set `"target": "es2015"` or higher in their `tsconfig.json` files.

## 0.6.0

### Breaking Changes

- Support for Stencil v2 has been removed. Update to the latest version of Stencil to continue using the React output target.

- The `reactOutputTarget` function now accepts an object with the following properties:

  - `outDir`: The directory where the React components will be generated.
  - `esModule`: If `true`, the output target will generate ES module files for each React component wrapper. Defaults to `false`.
  - `stencilPackageName`: The name of the package that exports the Stencil components. Defaults to the package.json detected by the Stencil compiler.

- Support for React 16 has been removed. Update to React 17 to continue using the React output target.

- Support for the `dist` output target has been removed. Update to the `dist-custom-elements` output target to continue using the React output target.

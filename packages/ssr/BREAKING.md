## 0.6.0

### Breaking Changes

- Support for Stencil v2 has been removed. Update to the latest version of Stencil to continue using the React output target.

- The `reactOutputTarget` function now accepts an object with the following properties:

  - `outDir`: The directory where the React components will be generated.
  - `esModule`: If `true`, the output target will generate ES module files for each React component wrapper. Defaults to `false`.
  - `stencilPackageName`: The name of the package that exports the Stencil components. Defaults to the package.json detected by the Stencil compiler.

- Support for React 16 has been removed. Update to React 17 to continue using the React output target.

- Support for the `dist` output target has been removed. Update to the `dist-custom-elements` output target to continue using the React output target.

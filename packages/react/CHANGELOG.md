## [1.6.1](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.6.0...@stencil/react-output-target@1.6.1) (2026-07-14)


### :bug: Bug Fix

* **react:** guard resolveType against exotic components and rendered SSR elements ([#809](https://github.com/stenciljs/output-targets/issues/809)) ([8d71209](https://github.com/stenciljs/output-targets/commit/8d712093b23aea34420c58370c5e1de0949662d5))
* **react:** stop guessing package manager and inserting `workspace` links ([11b5eb1](https://github.com/stenciljs/output-targets/commit/11b5eb1895f4e1a23fdcee9fb0fe445acfd00e06))

## [1.6.0](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.5.3...@stencil/react-output-target@1.6.0) (2026-06-25)


### :rocket: Enhancement

* **react:** compat with stencil v5 ([3f82413](https://github.com/stenciljs/output-targets/commit/3f82413af6d440b33c3b14192bc53af65bf860c8))
* **react:** reflect required props in generated React component types ([#821](https://github.com/stenciljs/output-targets/issues/821)) ([ab922ee](https://github.com/stenciljs/output-targets/commit/ab922eee6f8d27b76397686de34ffa906529c202))
* v5 compatibility  ([#822](https://github.com/stenciljs/output-targets/issues/822)) ([1f981d0](https://github.com/stenciljs/output-targets/commit/1f981d061a90abd54e848fe685240f50add43a10))

## [1.5.3](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.5.2...@stencil/react-output-target@1.5.3) (2026-06-05)


### :bug: Bug Fix

* **react:** emit components.server.ts barrel when esModules + hydrateModule are set ([#805](https://github.com/stenciljs/output-targets/issues/805)) ([e9a4802](https://github.com/stenciljs/output-targets/commit/e9a4802325dd75decbe07a5bbff9756398f44f46))

## [1.5.3](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.5.1...@stencil/react-output-target@1.5.2) (2026-05-28)


### :bug: Bug Fix

* **react:** avoid bundling hydrate module into client graph ([#797](https://github.com/stenciljs/output-targets/issues/797)) ([865cd52](https://github.com/stenciljs/output-targets/commit/865cd522b728a09969a76fef1ab755bbe6c25ab5))
* **react:** Update to latest version of ts-morph 28.0.0 ([#798](https://github.com/stenciljs/output-targets/issues/798)) ([ed52811](https://github.com/stenciljs/output-targets/commit/ed5281177542933ebe573e6f3846ff78fa69b652))

## [1.5.2](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.5.1...@stencil/react-output-target@1.5.2) (2026-04-27)


### :bug: Bug Fix

* **react:** revert 1.5.1 (reflect required props in component type when used in TSX) ([#794](https://github.com/stenciljs/output-targets/issues/794)) ([5014701](https://github.com/stenciljs/output-targets/commit/50147011e1b8d481711c81d238a2eba3e1a252c2))

## [1.5.1](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.5.0...@stencil/react-output-target@1.5.1) (2026-04-23)


### :bug: Bug Fix

* **react:** reflect required props in component type when used in TSX ([#788](https://github.com/stenciljs/output-targets/issues/788)) ([5e30d14](https://github.com/stenciljs/output-targets/commit/5e30d14a14426729fc91786fdc327520cedb08e0))

## [1.5.0](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.4.1...@stencil/react-output-target@1.5.0) (2026-04-09)


### :bug: Bug Fix

* **react:** use component type in component definitions ([#777](https://github.com/stenciljs/output-targets/issues/777)) ([6e474fb](https://github.com/stenciljs/output-targets/commit/6e474fbd105875b349b26ec991aec9fd0ef336d1))


### :rocket: Enhancement

* **react:** implement SSR style deduplication for scoped components ([#774](https://github.com/stenciljs/output-targets/issues/774)) ([456d02d](https://github.com/stenciljs/output-targets/commit/456d02d4c34442349f0f0365cdf0c6f65aea85a6))

## [1.4.2](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.4.1...@stencil/react-output-target@1.4.2) (2026-02-21)


### :bug: Bug Fix

* **react:** fix(react): improve prop serialization ([#764](https://github.com/stenciljs/output-targets/pull/764)) ([1b09cae](https://github.com/stenciljs/output-targets/commit/92bf3492f39e6ab457d7aa39a9f373c0b9fba809))
  

## [1.4.1](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.4.0...@stencil/react-output-target@1.4.1) (2026-02-10)


### :bug: Bug Fix

* **react:** Fix hydration mismatch errors with NextJs Runtime SSR ([#757](https://github.com/stenciljs/output-targets/issues/757)) ([f8fcabd](https://github.com/stenciljs/output-targets/commit/f8fcabd2dd7d3513f687c4f6efe0fe1a3ff4dd42))
* **react:** keep ts-ignore with correct import ([8b2c0ef](https://github.com/stenciljs/output-targets/commit/8b2c0ef0de46edfb975aae0cddf137d76d54257a))


## [1.4.0](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.3.3...@stencil/react-output-target@1.4.0) (2026-01-24)


### :rocket: Enhancement

* **react:** new `nativeTypesPath`; output types for React 19 ([bd8d3ed](https://github.com/stenciljs/output-targets/commit/bd8d3edda06024a4e14a49342b4a007b9a6831f1))

## [1.3.3](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.3.2...@stencil/react-output-target@1.3.3) (2026-01-23)


### :bug: Bug Fix

* **react:** strip comments from types ([2dbcc16](https://github.com/stenciljs/output-targets/commit/2dbcc16cacd7ada6252376f6e4e0abb18e3242eb))


## [1.3.2](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.3.1...@stencil/react-output-target@1.3.2) (2026-01-20)


### :bug: Bug Fix

* **react:** stop server components always passing `getTagTransformer` ([277b61d](https://github.com/stenciljs/output-targets/commit/277b61d2b906b70d651578ddaeed72b7ef7b4da0))

## [1.3.1](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.3.0...@stencil/react-output-target@1.3.1) (2026-01-19)


### :bug: Bug Fix

* **react:** stop tag-transformer being added to components.server ([02ed7a1](https://github.com/stenciljs/output-targets/commit/02ed7a159c8d0b1cb3e4d6d1c4505b75fd7e01f7))


## [1.3.0](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.2.0...@stencil/react-output-target@1.3.0) (2026-01-14)


### :bug: Bug Fix

* **react:** always use per-component CustomEvent types for event props ([#716](https://github.com/stenciljs/output-targets/issues/716)) ([8ebba85](https://github.com/stenciljs/output-targets/commit/8ebba85f603518482457faf74997d0008ded3dc9)), closes [#531](https://github.com/stenciljs/output-targets/issues/531)


### :rocket: Enhancement

* **react:** add tag transformation ([b8030dc](https://github.com/stenciljs/output-targets/commit/b8030dc15884e11103111d376730bcd459d7a8ab))

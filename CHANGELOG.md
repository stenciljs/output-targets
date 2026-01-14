## [0.2.0](https://github.com/stenciljs/output-targets/compare/@stencil/ssr@0.1.0...@stencil/ssr@0.2.0) (2026-01-14)


### :rocket: Enhancement

* **angular:** add tag transformation ([b7cdbbf](https://github.com/stenciljs/output-targets/commit/b7cdbbf70277d46eedc7ba7fd5e530a6efa81ae6))
* **react:** add tag transformation ([b8030dc](https://github.com/stenciljs/output-targets/commit/b8030dc15884e11103111d376730bcd459d7a8ab))
* **react:** enhance React output target with unified server/client imports and improved SSR property serialization ([132f9d9](https://github.com/stenciljs/output-targets/commit/132f9d9fe72e1f9f63f3e91e4be98f75de1cefda))
* **ssr:** add tag transformation ([667c09c](https://github.com/stenciljs/output-targets/commit/667c09cd24f894bb170a76ab0db2587c52459ba7))
* Upgraded component-library-angular to Angular 20 and added a new Angular app to example-project ([#652](https://github.com/stenciljs/output-targets/issues/652)) ([a6fefb6](https://github.com/stenciljs/output-targets/commit/a6fefb6d8cebe32a00d0e7289a079dc12120d26d)), closes [#643](https://github.com/stenciljs/output-targets/issues/643)
* **vue:** add tag transformation ([ec904bc](https://github.com/stenciljs/output-targets/commit/ec904bc7e25b5f81d33db37d55bab9c71a5127f2))
* **vue:** add tag transformation ([35985fd](https://github.com/stenciljs/output-targets/commit/35985fd895cbbf8898e07847d03ec24928afab18))
* **vue:** add tag transformation ([2951f39](https://github.com/stenciljs/output-targets/commit/2951f390914ad041722adc86e989afce199aed72))
* **vue:** implement custom event property as source for v-model ([#689](https://github.com/stenciljs/output-targets/issues/689)) ([bc385bb](https://github.com/stenciljs/output-targets/commit/bc385bb0794e3062bd579669f18bb4f3ccf3aef3))


### :bug: Bug Fix

* **#646:** react create components.ts file ([#647](https://github.com/stenciljs/output-targets/issues/647)) ([7524cbf](https://github.com/stenciljs/output-targets/commit/7524cbf0b74e87c1e5856ed27d128cdbed3853bd)), closes [#646](https://github.com/stenciljs/output-targets/issues/646) [#646](https://github.com/stenciljs/output-targets/issues/646)
* **angular:** include outputs in angular component definition ([#688](https://github.com/stenciljs/output-targets/issues/688)) ([16f1fd1](https://github.com/stenciljs/output-targets/commit/16f1fd18d63754dc1efdddc2cebdf1b9ba5137d6)), closes [#643](https://github.com/stenciljs/output-targets/issues/643) [#643](https://github.com/stenciljs/output-targets/issues/643)
* **angular:** prettify code ([69e1cba](https://github.com/stenciljs/output-targets/commit/69e1cbaa5b9a86a1b6ba654a1d2255de6fd184c9))
* **angular:** use forwardRef in control value accessor directives. ([#697](https://github.com/stenciljs/output-targets/issues/697)) ([dcb4bd2](https://github.com/stenciljs/output-targets/commit/dcb4bd28f659070e329b8e0f7454770b3fd8bbed))
* **ci:** run in macos environment ([0631306](https://github.com/stenciljs/output-targets/commit/063130616cda2bf86d9b2296e9a06154905a0a6d))
* **dependabot:** don't run updates based on projects ([3d43687](https://github.com/stenciljs/output-targets/commit/3d43687a81e8376104653684d1b6104cbd4bf3a1))
* **dependabot:** group updates of minor and patch versions in a single PR ([47bdb20](https://github.com/stenciljs/output-targets/commit/47bdb209e2caae1d7f55ae2c1db79d3be053775d))
* **dependabot:** optimize configuration ([ce29757](https://github.com/stenciljs/output-targets/commit/ce29757f3194eeaea4b3c3d8c626788d15b50419))
* **internal:** update changelog ([4bb6cfc](https://github.com/stenciljs/output-targets/commit/4bb6cfc84ebdebbf0975f159b26b2ced92193d1f))
* nuxt ssr mismatch class errors ([#651](https://github.com/stenciljs/output-targets/issues/651)) ([be797b1](https://github.com/stenciljs/output-targets/commit/be797b179d3073848c4082c8db603d82bb76d0d7))
* **react:** always use per-component CustomEvent types for event props ([#716](https://github.com/stenciljs/output-targets/issues/716)) ([8ebba85](https://github.com/stenciljs/output-targets/commit/8ebba85f603518482457faf74997d0008ded3dc9)), closes [#531](https://github.com/stenciljs/output-targets/issues/531)
* **react:** better style to css transformation ([ccc76a7](https://github.com/stenciljs/output-targets/commit/ccc76a7dd7b65dddbc28d05334652bba01e5c6ba))
* **react:** fixed wording in component wrapper ([a83bb4b](https://github.com/stenciljs/output-targets/commit/a83bb4bd29fa276f8b5fa895e9b4637164a6753d))
* **react:** forward ref to underlying web component ([#655](https://github.com/stenciljs/output-targets/issues/655)) ([9f20ee0](https://github.com/stenciljs/output-targets/commit/9f20ee0add49b0a149d958a8b2676a7ebee79aa7))
* **react:** improved SSR for Next.js ([#683](https://github.com/stenciljs/output-targets/issues/683)) ([c49a3b5](https://github.com/stenciljs/output-targets/commit/c49a3b5d9ec11c680bd55413f2e9fea76e23ac4c))
* **react:** make types compatible with v18 and v19 ([f887ae7](https://github.com/stenciljs/output-targets/commit/f887ae76b0e9de58e46231af3376daf06f945071))
* **react:** properly type generated component files ([3e7cc0c](https://github.com/stenciljs/output-targets/commit/3e7cc0cddf9d535228fccb8eccc3b53fd6c015f3))
* **react:** revive esModules option ([d98df24](https://github.com/stenciljs/output-targets/commit/d98df248168ad61ad122cfc9c96d81e7767ab226))
* revert model update event renaming ([#649](https://github.com/stenciljs/output-targets/issues/649)) ([5c67692](https://github.com/stenciljs/output-targets/commit/5c676928bf310f897e8e8c40d35230638bf0ac82))
* **ssr:** improved SSR handling in Next.js ([#641](https://github.com/stenciljs/output-targets/issues/641)) ([22e075f](https://github.com/stenciljs/output-targets/commit/22e075f5eb8461af6465598dadd8dd1923f70ff3))
* **vue:** remove unnecessary vue patch ([34f7ce2](https://github.com/stenciljs/output-targets/commit/34f7ce225dc751c08627e27dfbe945a09d77c976))


### :memo: Documentation

* **internal:** link release workflow ([0e69d0e](https://github.com/stenciljs/output-targets/commit/0e69d0eff7cf3829dafa8cbb16f9082ed1329cc6))
* **internal:** update contributing guidelines ([08c96fd](https://github.com/stenciljs/output-targets/commit/08c96fdac6078f04459c12406ba2b6dcf7e1363b))

## [1.2.0](https://github.com/stenciljs/output-targets/compare/@stencil/angular-output-target@1.1.0...@stencil/angular-output-target@1.2.0) (2026-01-14)


### :rocket: Enhancement

* **angular:** add tag transformation ([b7cdbbf](https://github.com/stenciljs/output-targets/commit/b7cdbbf70277d46eedc7ba7fd5e530a6efa81ae6))
* **react:** add tag transformation ([b8030dc](https://github.com/stenciljs/output-targets/commit/b8030dc15884e11103111d376730bcd459d7a8ab))
* **ssr:** add tag transformation ([667c09c](https://github.com/stenciljs/output-targets/commit/667c09cd24f894bb170a76ab0db2587c52459ba7))
* **vue:** add tag transformation ([ec904bc](https://github.com/stenciljs/output-targets/commit/ec904bc7e25b5f81d33db37d55bab9c71a5127f2))
* **vue:** add tag transformation ([35985fd](https://github.com/stenciljs/output-targets/commit/35985fd895cbbf8898e07847d03ec24928afab18))
* **vue:** add tag transformation ([2951f39](https://github.com/stenciljs/output-targets/commit/2951f390914ad041722adc86e989afce199aed72))
* **vue:** implement custom event property as source for v-model ([#689](https://github.com/stenciljs/output-targets/issues/689)) ([bc385bb](https://github.com/stenciljs/output-targets/commit/bc385bb0794e3062bd579669f18bb4f3ccf3aef3))


### :bug: Bug Fix

* **angular:** include outputs in angular component definition ([#688](https://github.com/stenciljs/output-targets/issues/688)) ([16f1fd1](https://github.com/stenciljs/output-targets/commit/16f1fd18d63754dc1efdddc2cebdf1b9ba5137d6)), closes [#643](https://github.com/stenciljs/output-targets/issues/643) [#643](https://github.com/stenciljs/output-targets/issues/643)
* **angular:** use forwardRef in control value accessor directives. ([#697](https://github.com/stenciljs/output-targets/issues/697)) ([dcb4bd2](https://github.com/stenciljs/output-targets/commit/dcb4bd28f659070e329b8e0f7454770b3fd8bbed))
* **internal:** update changelog ([4bb6cfc](https://github.com/stenciljs/output-targets/commit/4bb6cfc84ebdebbf0975f159b26b2ced92193d1f))
* **react:** always use per-component CustomEvent types for event props ([#716](https://github.com/stenciljs/output-targets/issues/716)) ([8ebba85](https://github.com/stenciljs/output-targets/commit/8ebba85f603518482457faf74997d0008ded3dc9)), closes [#531](https://github.com/stenciljs/output-targets/issues/531)
* **react:** improved SSR for Next.js ([#683](https://github.com/stenciljs/output-targets/issues/683)) ([c49a3b5](https://github.com/stenciljs/output-targets/commit/c49a3b5d9ec11c680bd55413f2e9fea76e23ac4c))


### :memo: Documentation

* **internal:** link release workflow ([0e69d0e](https://github.com/stenciljs/output-targets/commit/0e69d0eff7cf3829dafa8cbb16f9082ed1329cc6))
* **internal:** update contributing guidelines ([08c96fd](https://github.com/stenciljs/output-targets/commit/08c96fdac6078f04459c12406ba2b6dcf7e1363b))

## [1.3.0](https://github.com/stenciljs/output-targets/compare/@stencil/react-output-target@1.2.0...@stencil/react-output-target@1.3.0) (2026-01-14)


### :rocket: Enhancement

* **angular:** add tag transformation ([b7cdbbf](https://github.com/stenciljs/output-targets/commit/b7cdbbf70277d46eedc7ba7fd5e530a6efa81ae6))
* **react:** add tag transformation ([b8030dc](https://github.com/stenciljs/output-targets/commit/b8030dc15884e11103111d376730bcd459d7a8ab))
* **ssr:** add tag transformation ([667c09c](https://github.com/stenciljs/output-targets/commit/667c09cd24f894bb170a76ab0db2587c52459ba7))
* **vue:** add tag transformation ([ec904bc](https://github.com/stenciljs/output-targets/commit/ec904bc7e25b5f81d33db37d55bab9c71a5127f2))
* **vue:** add tag transformation ([35985fd](https://github.com/stenciljs/output-targets/commit/35985fd895cbbf8898e07847d03ec24928afab18))
* **vue:** add tag transformation ([2951f39](https://github.com/stenciljs/output-targets/commit/2951f390914ad041722adc86e989afce199aed72))
* **vue:** implement custom event property as source for v-model ([#689](https://github.com/stenciljs/output-targets/issues/689)) ([bc385bb](https://github.com/stenciljs/output-targets/commit/bc385bb0794e3062bd579669f18bb4f3ccf3aef3))


### :bug: Bug Fix

* **angular:** include outputs in angular component definition ([#688](https://github.com/stenciljs/output-targets/issues/688)) ([16f1fd1](https://github.com/stenciljs/output-targets/commit/16f1fd18d63754dc1efdddc2cebdf1b9ba5137d6)), closes [#643](https://github.com/stenciljs/output-targets/issues/643) [#643](https://github.com/stenciljs/output-targets/issues/643)
* **angular:** use forwardRef in control value accessor directives. ([#697](https://github.com/stenciljs/output-targets/issues/697)) ([dcb4bd2](https://github.com/stenciljs/output-targets/commit/dcb4bd28f659070e329b8e0f7454770b3fd8bbed))
* **react:** always use per-component CustomEvent types for event props ([#716](https://github.com/stenciljs/output-targets/issues/716)) ([8ebba85](https://github.com/stenciljs/output-targets/commit/8ebba85f603518482457faf74997d0008ded3dc9)), closes [#531](https://github.com/stenciljs/output-targets/issues/531)


### :memo: Documentation

* **internal:** link release workflow ([0e69d0e](https://github.com/stenciljs/output-targets/commit/0e69d0eff7cf3829dafa8cbb16f9082ed1329cc6))
* **internal:** update contributing guidelines ([08c96fd](https://github.com/stenciljs/output-targets/commit/08c96fdac6078f04459c12406ba2b6dcf7e1363b))

## [0.12.0](https://github.com/stenciljs/output-targets/compare/@stencil/vue-output-target@0.11.0...@stencil/vue-output-target@0.12.0) (2026-01-14)


### :rocket: Enhancement

* **vue:** add tag transformation ([ec904bc](https://github.com/stenciljs/output-targets/commit/ec904bc7e25b5f81d33db37d55bab9c71a5127f2))

## @stencil/react-output-target@1.2.1 

#### :bug: Bug Fix

- [`8ebba85`](https://github.com/stenciljs/output-targets/commit/8ebba85f603518482457faf74997d0008ded3dc9) fix(react): always use per-component CustomEvent types for event props (#716) ([@theo-staizen](https://github.com/theo-staizen)

## @stencil/vue-output-target@0.11.7 (2025-07-16)

#### :rocket: Enhancement

- [`bc385bb`](https://github.com/stenciljs/output-targets/commit/bc385bb0794e3062bd579669f18bb4f3ccf3aef3) feat(vue): implement custom event property as source for v-model (#689) ([@adamczykpiotr](https://github.com/adamczykpiotr))

## @stencil/angular-output-target@1.1.1 (2025-07-16)

#### :bug: Bug Fix

- [`16f1fd1`](https://github.com/stenciljs/output-targets/commit/16f1fd18d63754dc1efdddc2cebdf1b9ba5137d6) fix(angular): include outputs in angular component definition (#688) ([@rikis-ATL](https://github.com/rikis-ATL))

## @stencil/react-output-target@1.2.0 (2025-07-10)

#### :bug: Bug Fix

- [`c49a3b5`](https://github.com/stenciljs/output-targets/commit/c49a3b5d9ec11c680bd55413f2e9fea76e23ac4c) fix(react): improved SSR for Next.js (#683) ([@christian-bromann](https://github.com/christian-bromann))


## @stencil/react-output-target@1.1.1 (2025-04-03)

#### :bug: Bug Fix

- [`9f20ee0`](https://github.com/stenciljs/output-targets/commit/9f20ee0) fix(react): forward ref to underlying web component (#655) ([@RakeshPawar](https://github.com/RakeshPawar))

## @stencil/angular-output-target@1.1.0 (2025-04-03)

#### :rocket: Enhancement

- [`11f028d`](https://github.com/stenciljs/output-targets/commit/11f028d) Feature/required inputs (#673) ([@mklemarczyk](https://github.com/mklemarczyk))

## @stencil/ssr@0.1.0, @stencil/react-output-target@1.0.0 (2025-04-03)

#### :rocket: Enhancement

- [`2873b0e`](https://github.com/stenciljs/output-targets/commit/2873b0e03c0476f69301f705cd7f3e682451e6b2) feat(react): support Vite based SSR (#624) ([@christian-bromann](https://github.com/christian-bromann))
- [`5a1a276`](https://github.com/stenciljs/output-targets/pull/624/commits/5a1a276143a0a943e5be03e99484624469725e56) feat(ssr): support object hydration (#633) ([@christian-bromann](https://github.com/christian-bromann))

## @stencil/vue-output-target@0.10.7 (2025-03-17)

#### :bug: Bug Fix

- `@stencil/vue-output-target`
  - [`50ed60f0`](https://github.com/stenciljs/output-targets/commit/50ed60f00d9b417246b251a426347ef034fa5ed6) fix(vue): support more complex types for routerLink ([@christian-bromann](https://github.com/christian-bromann))

## @stencil/vue-output-target@0.10.6 (2025-03-17)

#### :bug: Bug Fix

- `@stencil/vue-output-target`
  - [`22805963`](https://github.com/stenciljs/output-targets/commit/228059631895aca6089e70d3ae10733bf86ef64d) fix(vue): fix typing for routerLink attribute
 ([@christian-bromann](https://github.com/christian-bromann))

## @stencil/vue-output-target@0.10.4 (2025-03-13)

#### :bug: Bug Fix

- `@stencil/vue-output-target`
  - [`a162a46dc`](https://github.com/stenciljs/output-targets/commit/a162a46dc5f49052f5d55a4cd2462454e10a8c71) fix(vue): support node classic module resolution for types ([@christian-bromann](https://github.com/christian-bromann))

## @stencil/vue-output-target@0.10.3 (2025-03-12)

#### :bug: Bug Fix

- `@stencil/vue-output-target`
  - [`e572b60f`](https://github.com/stenciljs/output-targets/commit/e572b60f0ea1adca852a1738c9aa0d4c520f11b5) fix(vue): fix model value assignment ([@christian-bromann](https://github.com/christian-bromann))

## @stencil/vue-output-target@0.10.2 (2025-03-12)

#### :bug: Bug Fix

- `@stencil/vue-output-target`
  - [`acd18913`](https://github.com/stenciljs/output-targets/commit/acd18913e11c4516ab9def64ad01562a9ec7c3) fix(vue): correctly reference model value and more testing ([@christian-bromann](https://github.com/christian-bromann))
  - adding various more e2e test to verify functionality of the framework wrapper

## @stencil/vue-output-target@0.10.1 (2025-03-11)

#### :bug: Bug Fix

- `@stencil/vue-output-target`
  - [`6abc0e30`](https://github.com/stenciljs/output-targets/commit/59838b71a0ea7241fe768eee465815eeabf27082) fix(vue): always import StencilVueComponent type
 ([@christian-bromann](https://github.com/christian-bromann))

## @stencil/vue-output-target@0.10.0 (2025-03-11)

#### :bug: Bug Fix

- `@stencil/vue-output-target`
  - [#630](https://github.com/stenciljs/output-targets/pull/630) vue: improve types for Vue Stencil components ([@christian-bromann](https://github.com/christian-bromann))

## @stencil/vue-output-target@0.9.6 (2025-03-04)

#### :bug: Bug Fix

- `@stencil/vue-output-target`
  - [#627](https://github.com/stenciljs/output-targets/pull/627) add e2e test for Vue component changes and transform event names to camel case ([@christian-bromann](https://github.com/christian-bromann))

## @stencil/vue-output-target@0.9.5 (2025-02-20)

#### :bug: Bug Fix

- `@stencil/vue-output-target`
  - [#617](https://github.com/stenciljs/output-targets/pull/617) Fix vue output target ([@andrewbeng89](https://github.com/andrewbeng89))

## @stencil/vue-output-target@0.0.1 (2020-06-26)

#### :rocket: Enhancement

- `@stencil/react-output-target`, `@stencil/vue-output-target`
  - [#62](https://github.com/stenciljs/output-targets/pull/62) Add ability to skip polyfills and registration. ([@jthoms1](https://github.com/jthoms1))
- `example-project`, `@stencil/vue-output-target`
  - [#57](https://github.com/stenciljs/output-targets/pull/57) Add vue support to output-targets ([@jthoms1](https://github.com/jthoms1))
- `@stencil/angular-output-target`, `example-project`
  - [#55](https://github.com/stenciljs/output-targets/pull/55) feat(#54): add outputs with types and docs to angular proxies ([@razvangeangu](https://github.com/razvangeangu))

#### :bug: Bug Fix

- `@stencil/angular-output-target`, `example-project`, `@stencil/react-output-target`
  - [#46](https://github.com/stenciljs/output-targets/pull/46) Testing ([@jthoms1](https://github.com/jthoms1))

#### :house: Internal

- `@stencil/angular-output-target`, `example-project`, `@stencil/react-output-target`, `@stencil/vue-output-target`
  - [#64](https://github.com/stenciljs/output-targets/pull/64) Add changelog process and update for releases ([@jthoms1](https://github.com/jthoms1))
- `example-project`, `@stencil/vue-output-target`
  - [#63](https://github.com/stenciljs/output-targets/pull/63) Vue generation tests ([@jthoms1](https://github.com/jthoms1))
- `example-project`
  - [#61](https://github.com/stenciljs/output-targets/pull/61) Angular tests ([@jthoms1](https://github.com/jthoms1))
  - [#53](https://github.com/stenciljs/output-targets/pull/53) Angular Tests ([@jthoms1](https://github.com/jthoms1))

#### Committers: 2

- Josh Thomas ([@jthoms1](https://github.com/jthoms1))
- Răzvan Geangu ([@razvangeangu](https://github.com/razvangeangu))

## @stencil/react-output-target@0.0.7 (2020-06-26)

#### :rocket: Enhancement

- `@stencil/react-output-target`, `@stencil/vue-output-target`
  - [#62](https://github.com/stenciljs/output-targets/pull/62) Add ability to skip polyfills and registration. ([@jthoms1](https://github.com/jthoms1))
- `example-project`, `@stencil/vue-output-target`
  - [#57](https://github.com/stenciljs/output-targets/pull/57) Add vue support to output-targets ([@jthoms1](https://github.com/jthoms1))
- `@stencil/angular-output-target`, `example-project`
  - [#55](https://github.com/stenciljs/output-targets/pull/55) feat(#54): add outputs with types and docs to angular proxies ([@razvangeangu](https://github.com/razvangeangu))

#### :bug: Bug Fix

- `@stencil/angular-output-target`, `example-project`, `@stencil/react-output-target`
  - [#46](https://github.com/stenciljs/output-targets/pull/46) Testing ([@jthoms1](https://github.com/jthoms1))

#### :house: Internal

- `@stencil/angular-output-target`, `example-project`, `@stencil/react-output-target`, `@stencil/vue-output-target`
  - [#64](https://github.com/stenciljs/output-targets/pull/64) Add changelog process and update for releases ([@jthoms1](https://github.com/jthoms1))
- `example-project`, `@stencil/vue-output-target`
  - [#63](https://github.com/stenciljs/output-targets/pull/63) Vue generation tests ([@jthoms1](https://github.com/jthoms1))
- `example-project`
  - [#61](https://github.com/stenciljs/output-targets/pull/61) Angular tests ([@jthoms1](https://github.com/jthoms1))
  - [#53](https://github.com/stenciljs/output-targets/pull/53) Angular Tests ([@jthoms1](https://github.com/jthoms1))

#### Committers: 2

- Josh Thomas ([@jthoms1](https://github.com/jthoms1))
- Răzvan Geangu ([@razvangeangu](https://github.com/razvangeangu))

## @stencil/angular-output-target@0.0.3 (2020-06-26)

#### :rocket: Enhancement

- `@stencil/react-output-target`, `@stencil/vue-output-target`
  - [#62](https://github.com/stenciljs/output-targets/pull/62) Add ability to skip polyfills and registration. ([@jthoms1](https://github.com/jthoms1))
- `example-project`, `@stencil/vue-output-target`
  - [#57](https://github.com/stenciljs/output-targets/pull/57) Add vue support to output-targets ([@jthoms1](https://github.com/jthoms1))
- `@stencil/angular-output-target`, `example-project`
  - [#55](https://github.com/stenciljs/output-targets/pull/55) feat(#54): add outputs with types and docs to angular proxies ([@razvangeangu](https://github.com/razvangeangu))

#### :bug: Bug Fix

- `@stencil/angular-output-target`, `example-project`, `@stencil/react-output-target`
  - [#46](https://github.com/stenciljs/output-targets/pull/46) Testing ([@jthoms1](https://github.com/jthoms1))

#### :house: Internal

- `@stencil/angular-output-target`, `example-project`, `@stencil/react-output-target`, `@stencil/vue-output-target`
  - [#64](https://github.com/stenciljs/output-targets/pull/64) Add changelog process and update for releases ([@jthoms1](https://github.com/jthoms1))
- `example-project`, `@stencil/vue-output-target`
  - [#63](https://github.com/stenciljs/output-targets/pull/63) Vue generation tests ([@jthoms1](https://github.com/jthoms1))
- `example-project`
  - [#61](https://github.com/stenciljs/output-targets/pull/61) Angular tests ([@jthoms1](https://github.com/jthoms1))
  - [#53](https://github.com/stenciljs/output-targets/pull/53) Angular Tests ([@jthoms1](https://github.com/jthoms1))

#### Committers: 2

- Josh Thomas ([@jthoms1](https://github.com/jthoms1))
- Răzvan Geangu ([@razvangeangu](https://github.com/razvangeangu))

# Contributing

This project uses [pnpm](https://pnpm.io/) for package management. You can install it by following the [installation instructions](https://pnpm.io/installation).

## Requirements

This project requires:

- Node.js v22.14.0 or higher (likely older versions work as well)
- [pnpm](https://pnpm.io/) v9.4.0 or higher

## Getting Started

Clone the repository:

```bash
git clone https://github.com/stenciljs/output-targets.git
cd output-targets
```

To set up this project and prepare the example projects to be used in your own projects, run the following commands:

```bash
pnpm install
pnpm build
```

## Development

### Working on Output Targets

In order to work on specific output targets, you can use the `dev` command to watch for changes:

```sh
pnpm run dev.angular # work on @stencil/angular-output-target
pnpm run dev.react   # work on @stencil/react-output-target
pnpm run dev.vue     # work on @stencil/vue-output-target
pnpm run dev.ssr     # work on @stencil/ssr
pnpm run dev         # watches changes on all output targets
```

### Building Output Targets

You can build individual output targets:

```sh
pnpm run build.angular # build @stencil/angular-output-target
pnpm run build.react   # build @stencil/react-output-target
pnpm run build.vue     # build @stencil/vue-output-target
```

### Working with Example Projects

The repository includes several example projects for testing. You can build them individually:

```sh
pnpm run build.example.core    # build the core component library
pnpm run build.example.angular # build the Angular example
pnpm run build.example.react   # build the React example
pnpm run build.example.vue     # build the Vue example
```

You can also start development servers for the example applications:

```sh
pnpm run start.next-14      # start Next.js 14 example
pnpm run start.next-15      # start Next.js 15 example
pnpm run start.next-runtime # start Next.js runtime-based example
pnpm run start.nuxt         # start Nuxt example
pnpm run start.vue          # start Vue example
```

## Code Quality

### Formatting

This project uses [Prettier](https://prettier.io/) for code formatting. You can run the following commands:

```bash
pnpm prettier         # format all files
pnpm prettier.dry-run # check formatting without making changes
```

## Testing

We run a comprehensive test suite including unit tests for individual output targets and end-to-end tests using [WebdriverIO](https://webdriver.io/) to verify that output targets actually hydrate and interact correctly in specific project setups.

### Unit Tests

To run unit tests for individual output targets:

```sh
pnpm run test.unit.angular # run unit tests for @stencil/angular-output-target
pnpm run test.unit.react   # run unit tests for @stencil/react-output-target
pnpm run test.unit.vue     # run unit tests for @stencil/vue-output-target
pnpm run test.unit         # run unit tests on all output targets
```

If you like to run tests on every change, use the watch commands:

```sh
pnpm run test.watch.angular # watch unit tests for @stencil/angular-output-target
pnpm run test.watch.react   # watch unit tests for @stencil/react-output-target
pnpm run test.watch.vue     # watch unit tests for @stencil/vue-output-target
pnpm run test.watch         # watch unit tests on all output targets
```

### End-to-End Tests

To run all tests including the end-to-end tests:

```sh
pnpm run test     # run all tests (unit + e2e)
pnpm run test.e2e # run only end-to-end tests
```

Run end-to-end tests for specific frameworks:

```sh
pnpm run test.e2e.react     # React + Vite
pnpm run test.e2e.vue       # Vue + Vite
pnpm run test.e2e.next      # Next.js 14
pnpm run test.e2e.next-15   # Next.js 15
pnpm run test.e2e.runtime   # Next.js runtime-based
pnpm run test.e2e.nuxt      # Nuxt
```

## Project Structure

This project is structured as a monorepo with the following organization:

```
.
├── packages/                          # Stencil Output target packages
│   ├── angular/                       # @stencil/angular-output-target
│   ├── react/                         # @stencil/react-output-target
│   ├── vue/                           # @stencil/vue-output-target
│   └── ssr/                           # @stencil/ssr (Server-Side Rendering utilities)
├── example-project/                   # Example projects for testing output targets
│   ├── component-library/             # Core Stencil project that exports components
│   ├── component-library-angular/     # Angular project consuming Stencil components
│   ├── component-library-react/       # React + Vite project using Stencil components
│   ├── component-library-vue/         # Vue wrapper package for Stencil components
│   ├── next-app/                      # Next.js 14 application (SSR testing)
│   ├── next-15-react-19-app/          # Next.js 15 + React 19 application
│   ├── next-15-runtime-based/         # Next.js 15 with runtime-based SSR approach
│   ├── nuxt-app/                      # Nuxt application (Vue SSR testing)
│   ├── vue-app/                       # Vue + Vite example application
│   ├── vue-app-broken/                # Vue app with invalid types (for testing)
│   ├── react-app/                     # React + Vite example application
│   ├── remix-app/                     # Remix application example
│   └── ng-app/                        # Angular CLI application example
└── tests/                             # Additional test utilities and scenarios
```

### Output Target Packages

- **`@stencil/angular-output-target`**: Generates Angular components and modules for Stencil components
- **`@stencil/react-output-target`**: Creates React component wrappers for Stencil components
- **`@stencil/vue-output-target`**: Produces Vue component wrappers for Stencil components  
- **`@stencil/ssr`**: Provides server-side rendering utilities for Stencil components in React applications (supports Webpack, Next.js, and Vite)

## Pull Request Guidelines

When contributing, please ensure your pull request follows these guidelines:

- [ ] Tests for the changes have been added (for bug fixes / features)
- [ ] Docs have been reviewed and added / updated if needed (for bug fixes / features)  
- [ ] Build (`pnpm run build`) was run locally for affected output targets
- [ ] Tests (`pnpm test`) were run locally and passed
- [ ] Prettier (`pnpm prettier`) was run locally and passed

See our [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) for more details.

## Release

Releases are managed through GitHub Actions. There is a manual workflow called "Production Release" in the GitHub Actions workflows directory.

**Important**: You have to manually bump the version of each package you like to release manually (see [example commit](Paul Visciano)) as well as drafting your own changelog (see [example release](https://github.com/stenciljs/output-targets/releases/tag/%40stencil%2Freact-output-target%401.2.0)).

Follow the following order of steps:

- verify the `main` branch passes all tests
- push a commit that bumps all packages you like to publish (see example of [single package release](https://github.com/stenciljs/output-targets/commit/d62bd2b9e633274a240d11a04f2e366c35ca9085), and [multi package release](https://github.com/stenciljs/output-targets/commit/848cbe1e80391a6ccd6cd43834062bbb15a7a4fb))
- create a tag for each package being released, e.g. `git tag -a @stencil/ssr@0.2.0`
- push commit and tags, e.g. `git push origin main --tags`
- create GitHub releases for each package that is being released (see [example](https://github.com/stenciljs/output-targets/releases/tag/%40stencil%2Freact-output-target%401.2.0))
- trigger the [release workflow](https://github.com/stenciljs/output-targets/actions/workflows/prod-build.yml) for the package you want to publish

When submitting the [release workflow](https://github.com/stenciljs/output-targets/actions/workflows/prod-build.yml), you'll need to specify:

1. **Package**: Which package should be published (`vue`, `react`, `angular`, or `ssr`)
2. **Version**: What version should be published
3. **NPM Tag**: What npm tag it should be published under (`next` or `latest`)
4. **Pre-ID**: Any pre-release identifier, like `alpha` or `rc`

## Getting Help

- Check existing [Issues](https://github.com/stenciljs/output-targets/issues) for known problems
- Review individual package READMEs in the `packages/` directory for specific documentation
- Join the Stencil community on [Discord](https://chat.stenciljs.com/) for questions and support

## Additional Resources

- [Stencil Documentation](https://stenciljs.com/docs/)
- [React Output Target Guide](https://stenciljs.com/docs/react)
- [Vue Output Target Guide](https://stenciljs.com/docs/vue)  
- [Angular Output Target Guide](https://stenciljs.com/docs/angular)
- [Server-Side Rendering Guide](https://stenciljs.com/docs/server-side-rendering)

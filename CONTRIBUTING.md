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

Releases are now automated using semantic-release based on conventional commits. The process has two main steps:

### Step 1: Automated Version Bumping & Changelog Generation

1. Ensure all commits since the last release follow the [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `fix(scope): message` - Patch version bump (e.g., 1.0.0 -> 1.0.1)
   - `feat(scope): message` - Minor version bump (e.g., 1.0.0 -> 1.1.0)
   - `feat(scope)!: message` or `BREAKING CHANGE:` - Major version bump (e.g., 1.0.0 -> 2.0.0)

   Valid scopes: `vue`, `react`, `angular`, `ssr`

   Examples:
   - `fix(vue): correct v-model binding issue`
   - `feat(react): add support for React 19`
   - `fix(angular): include outputs in component definition`

2. Verify the `main` branch passes all tests

3. Trigger the **Production Release PR** workflow:
   - Go to [Actions -> Production Release PR](https://github.com/stenciljs/output-targets/actions/workflows/release-pr.yml)
   - Click "Run workflow"
   - Select the base branch (usually `main`)

4. The workflow will:
   - Analyze commits since the last release for each package
   - Automatically bump versions based on conventional commits
   - Generate/update CHANGELOG.md with release notes
   - Create a Pull Request with all changes

5. Review the PR:
   - Verify version bumps are correct
   - Check the changelog entries
   - Ensure all changes look good

6. Merge the PR to `main`

### Step 2: Publishing to npm

After the release PR is merged:

1. Trigger the [Production Release workflow](https://github.com/stenciljs/output-targets/actions/workflows/prod-build.yml) for each package you want to publish

2. When submitting the release workflow, specify:
   - **Package**: Which package to publish (`vue`, `react`, `angular`, or `ssr`)
   - **Version**: The version from the merged PR
   - **NPM Tag**: What npm tag it should be published under (`next` or `latest`)
   - **Pre-ID**: Any pre-release identifier, like `alpha` or `rc` (if needed)

### Local Testing

To test the release process locally without making any changes:

```bash
# Dry run to see what versions would be bumped
pnpm run release:prepare
```

### Important Notes

- Only commits with the correct scope will trigger version bumps for that package
- Commits without a scope or with an invalid scope will be ignored
- The CHANGELOG.md is automatically generated from commit messages
- Tags are created automatically during the semantic-release process
- Always use conventional commits to ensure proper version bumping

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

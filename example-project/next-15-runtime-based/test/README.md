# SSR Compatibility Test Suite

This test suite systematically tests all Stencil components for SSR (Server-Side Rendering) compatibility with Next.js runtime-based SSR.

## Overview

The test suite:
- **Auto-discovers** all components from `component-library/src/components/`
- **Tests each component** for hydration mismatch errors
- **Documents known limitations** as skipped tests with clear descriptions
- **Prevents regressions** by catching hydration errors before they reach production

## Test Files

- `hydration-helpers.ts` - Helper functions for hydration detection (waitForHydration, checkConsoleForHydrationErrors, testComponentSSR)
- `ssr-compatibility.test.ts` - Comprehensive test suite that auto-discovers and tests all components
- `ssr-component-config.js` - Lightweight config for known limitations and test page mappings
- `test.e2e.ts` - Integration tests for SSR scenarios

## Scripts

Scripts are located in the `scripts/` folder at the project root:

- `scripts/discover-components.js` - Component discovery system
- `scripts/generate-coverage.js` - Generates coverage report from test results
- `scripts/run-tests-with-coverage.js` - Wrapper script that runs tests and generates coverage

## Running Tests

```bash
npm test
# or
pnpm test
```

This will:
1. Run the WebDriverIO test suite
2. Automatically generate a coverage report in `test/COVERAGE_REPORT.md`
3. Write test results to `test/test-results.json`

To generate coverage report manually:
```bash
node scripts/generate-coverage.js
```

## Component Discovery

Components are automatically discovered by scanning `component-library/src/components/`. The discovery system:

1. Scans all directories in the components folder
2. Reads component files to extract metadata (tag name, shadow/scoped)
3. Merges with config file for expected status and test page mappings

## Known Limitations

Components with known SSR limitations are marked with `.skip()` in the test suite. When a limitation is fixed:

1. Remove `.skip()` from the test
2. The test should now pass
3. Update `ssr-component-config.js` to change `expectedStatus` to `'supported'`

### Current Known Limitations

See `test/COVERAGE_REPORT.md` for the most up-to-date list of known limitations. The report is auto-generated from test results and includes:

- Components with hydration mismatch errors
- Detailed notes about why each component is unsupported
- Test page paths for each component

## Adding New Components

### From component-library

1. Add component to `component-library/src/components/[component-name]/`
2. Component is automatically discovered
3. Create test page in `src/app/[component-name]-test/page.tsx` if needed
4. Add test page mapping to `ssr-component-config.js`:
   ```javascript
   'my-new-component': {
     testPagePath: '/my-new-component-test',
   }
   ```

### From Bricks/Ionic

1. Copy component files to `component-library/src/components/[component-name]/`
2. Rebuild `component-library` to generate React bindings
3. Component is automatically discovered
4. Add to config if it has known limitations or needs test page mapping

**No special handling needed** - the auto-discovery system handles all components the same way!

## Test Page Mappings

Test pages are mapped to components in `ssr-component-config.js`. If a component doesn't have a test page:

- The test will be skipped
- A summary test lists all components without test pages
- Create a test page to enable testing

## Configuration

Edit `ssr-component-config.js` to:

- Mark components with known limitations (`expectedStatus: 'unsupported'`)
- Map components to test pages (`testPagePath: '/page-path'`)
- Add notes about limitations (`notes: 'description'`)

Most components don't need entries - they default to `'supported'`.

## CI Integration

Tests run automatically in CI. The test suite:

- Catches hydration mismatches before merge
- Shows skipped tests for known limitations
- Provides clear error messages when regressions occur

## Regression Detection

The test suite is designed to catch regressions:

1. **Supported components** - Tests will fail if hydration errors are detected (regression)
2. **Unsupported components** - Tests are skipped with `.skip()` (known limitations)
3. **When a fix is applied** - Remove `.skip()` from the test; it should now pass
4. **CI will catch** - Any new hydration errors will cause tests to fail, preventing merge

To verify regression detection works:
- Run tests with a known broken version (tests should fail)
- Run tests with a known good version (tests should pass)
- The test suite uses the same infrastructure as existing tests, so it inherits the same regression detection capabilities

## Coverage Report

The test suite automatically generates a coverage report at `test/COVERAGE_REPORT.md` that includes:

- Summary statistics (total components, passed, failed, skipped)
- Detailed component status table
- Components without test pages
- Failed tests with error details
- Known limitations (skipped tests) with reasons

The report is generated after each test run and reflects the actual test results.

## Documentation

- `COVERAGE_REPORT.md` - Auto-generated coverage report with component status
- Test descriptions - Self-documenting (known limitations explained in test names)

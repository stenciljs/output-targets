import { browser } from '@wdio/globals';
import type { local } from 'webdriver';

// @ts-ignore this may fail in Next.js as it can't resolve the module
import toDiffableHtml from 'diffable-html';
import { parse } from 'node-html-parser';

import type { TestComponent } from '../src/TestComponent';

/**
 * Fetch the source code of a test scenario
 *
 * @param scenario - The name of the test scenario
 * @returns The formatted source code of the test scenario
 */
export async function fetchSourceCode(scenario: TestComponent, retries = 3) {
  const url = `${browser.options.baseUrl}/${scenario}`;

  try {
    const response = await fetch(url);
    const html = await response.text();
    const root = parse(html);
    const testComponent = root.querySelector(`#${scenario}`);
    if (!testComponent) {
      throw new Error(`Test component ${scenario} not found in document: ${html}`);
    }
    return (
      toDiffableHtml(
        testComponent
          .toString()
          /**
           * replace parameter like `c-id="4.0.0.0"` to `c-id="x"`
           */
          .replaceAll(/c-id="[^"]*"/g, 'c-id="x"')
          .replaceAll(/s-id="[^"]*"/g, 's-id="x"')
          .replaceAll(
            /**
             * replace Next.js `BAILOUT_TO_CLIENT_SIDE_RENDERING` template tag with simplified version
             */
            /<template[^>]*?data-dgst="([^"]+)"[^>]*?data-msg="([\s\S]*?)"(?:[^>]*)><\/template>/g,
            '<template data-dgst="$1" data-msg="..." />'
          )
      ) as string
    )
      .split('\n')
      .filter((l: string) => !l.includes('suppresshydrationwarning'))
      .join('\n');
  } catch (err) {
    /**
     * at least retry once to avoid startup flakes
     */
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchSourceCode(scenario, retries - 1);
    }
    const error = err instanceof Error ? err : new Error(String(err));
    throw new Error(`Failed to fetch source code for ${scenario}: ${error.message}`);
  }
}

/**
 * Fetch the full page HTML including the head section
 *
 * @param scenario - The name of the test scenario
 * @returns The full page HTML including head and body
 */
export async function fetchFullPageHtml(scenario: TestComponent, retries = 3) {
  const url = `${browser.options.baseUrl}/${scenario}`;

  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch (err) {
    /**
     * at least retry once to avoid startup flakes
     */
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchFullPageHtml(scenario, retries - 1);
    }
    const error = err instanceof Error ? err : new Error(String(err));
    throw new Error(`Failed to fetch full page HTML for ${scenario}: ${error.message}`);
  }
}

/**
 * This is a helper function that is used to assert that no client side errors
 * were logged during the tests.
 * 
 * @param knownFailures - Array of test component names that are known to have hydration errors
 */
export function assertClientSideErrors (knownFailures: TestComponent[] = []) {
  /**
   * track all errors that are logged during the tests
   */
  const errors: string[] = []
  let removeLogHandler: undefined | (() => void)
  
  beforeEach(async () => {
    errors.length = 0;

    if (removeLogHandler) {
      return;
    }
    browser.sessionSubscribe({
      events: ['log.entryAdded'],
    });
    const onLogEvent = (entry: local.LogEntry) => {
      if (entry.level === 'error' && entry.text && entry.text !== 'error') {
        errors.push(entry.text);
      }
    };
    browser.on('log.entryAdded', onLogEvent);
    removeLogHandler = () => browser.off('log.entryAdded', onLogEvent);
  });

  /**
   * Verify that no errors were logged during the tests
   */
  afterEach(() => {
    // Get the current test component from the describe block context
    // The describe block name should match the component name
    const currentTestComponent = (global as any).__currentTestComponent as TestComponent | undefined
    const isKnownFailure = currentTestComponent && knownFailures.includes(currentTestComponent)

    /**
     * Filter errors based on whether this is a known failure
     * For known failures, we ignore hydration errors
     * For other components, we check for hydration errors
     */
    const relevantErrors = errors.filter((error) => {
      const errorLower = error.toLowerCase()
      const isHydrationError = (
        errorLower.includes('hydration') ||
        errorLower.includes('hydrating') ||
        error.includes('Expected server HTML to contain a matching') ||
        error.includes('Did not expect server HTML to contain') ||
        error.includes('error node')
      )
      
      // If it's a known failure, ignore hydration errors for this component
      if (isKnownFailure && isHydrationError) {
        return false
      }
      
      // Always filter out non-hydration errors that we don't care about
      if (!isHydrationError) {
        // Filter out WebdriverIO related socket errors
        if (
          error.includes('failed to connect to websocket') ||
          error.includes('WebSocket closed without opened.')
        ) {
          return false
        }
        // Keep other non-hydration errors
        return true
      }
      
      // For hydration errors on non-known-failures, we want to catch them
      return true
    })
    
    if (relevantErrors.length > 0) {
      const failureNote = isKnownFailure ? ' (Note: This component is marked as a known failure but still has non-hydration errors)' : ''
      throw new Error(`Errors were logged during the tests${failureNote}:\n  - ${relevantErrors.join('\n  - ')}`)
    }
  });
}

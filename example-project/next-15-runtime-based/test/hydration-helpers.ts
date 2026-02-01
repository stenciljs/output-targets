import { browser, $$ } from '@wdio/globals';
import { DiscoveredComponent } from '../scripts/discover-components.js';

/**
 * Helper function to wait for hydration to complete
 */
export async function waitForHydration(timeout = 5000) {
  // Wait for React to hydrate by checking for Stencil components with hydrated class
  await browser.waitUntil(
    async () => {
      // Check if Stencil components have hydrated by looking for the .hydrated class
      const hydratedElements = await $$('.hydrated');
      const length = Array.isArray(hydratedElements) ? hydratedElements.length : 0;
      if (length === 0) return false;
      
      // Wait a bit more to ensure hydration is complete
      await browser.pause(100);
      return true;
    },
    {
      timeout,
      timeoutMsg: 'Hydration did not complete within timeout',
    }
  );
}

/**
 * Helper function to get the latest log timestamp
 */
export async function getLatestLogTimestamp(): Promise<number> {
  const logs = await browser.getLogs('browser');
  if (logs.length === 0) return 0;
  return Math.max(...logs.map((log: any) => (log as any).timestamp || 0));
}

/**
 * Helper function to check for hydration errors in console
 * Only checks errors that occurred after the specified timestamp
 */
export async function checkConsoleForHydrationErrors(sinceTimestamp?: number): Promise<string[]> {
  const logs = await browser.getLogs('browser');
  const errors: string[] = [];

  for (const log of logs) {
    const logEntry = log as any;
    // Only check SEVERE level errors (actual errors, not warnings)
    if (logEntry.level !== 'SEVERE') continue;
    
    // Filter by timestamp if provided (only check errors from current page)
    if (sinceTimestamp && logEntry.timestamp && logEntry.timestamp < sinceTimestamp) continue;
    
    const message = (logEntry.message || '').toLowerCase();
    // Only capture actual hydration errors (exclude network errors like 404s)
    if (
      (message.includes('hydration failed') || (message.includes('hydration') && message.includes('error'))) &&
      !message.includes('failed to load resource') &&
      !message.includes('404')
    ) {
      errors.push(logEntry.message || '');
    }
  }

  return errors;
}

/**
 * Test a component for SSR hydration errors
 * @param component - The discovered component to test
 * @param testPagePath - Optional test page path (uses component's testPagePath if not provided)
 */
export async function testComponentSSR(component: DiscoveredComponent, testPagePath?: string): Promise<{
  passed: boolean;
  errors: string[];
}> {
  const beforeTimestamp = await getLatestLogTimestamp();
  const pagePath = testPagePath || component.testPagePath;
  
  if (!pagePath) {
    // Skip if no test page available
    return { passed: true, errors: [] };
  }
  
  await browser.url(pagePath);
  await waitForHydration();
  
  const errors = await checkConsoleForHydrationErrors(beforeTimestamp);
  return {
    passed: errors.length === 0,
    errors,
  };
}

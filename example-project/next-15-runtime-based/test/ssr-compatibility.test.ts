import { browser, expect } from '@wdio/globals';
import { getAllComponents } from '../scripts/discover-components.js';
import { testComponentSSR } from './hydration-helpers.js';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store test results for coverage report
const testResults: Array<{
  component: string;
  tag: string;
  status: 'passed' | 'failed' | 'skipped' | 'not-tested';
  errors?: string[];
}> = [];

describe('SSR Compatibility Test Suite', () => {
  // Write test results even if tests fail
  after(() => {
    try {
      const resultsPath = resolve(__dirname, 'test-results.json');
      writeFileSync(resultsPath, JSON.stringify(testResults, null, 2), 'utf-8');
      console.log(`\nTest results written to: ${resultsPath}`);
      console.log(`Total test results: ${testResults.length}`);
    } catch (error) {
      console.error('Error writing test results:', error);
    }
  });

  beforeEach(async () => {
    // Navigate to blank page to clear any previous state
    await browser.url('about:blank');
    await browser.pause(100);
    
    // Clear console logs before each test
    await browser.execute(() => {
      console.clear();
    });
  });

  describe('Component Library Components', () => {
    const components = getAllComponents();
    
    // Group components by expected status
    const supportedComponents = components.filter(c => c.expectedStatus === 'supported' || c.expectedStatus === 'unknown');
    const unsupportedComponents = components.filter(c => c.expectedStatus === 'unsupported');

    describe('Supported Components', () => {
      supportedComponents.forEach((component) => {
        if (!component.testPagePath) {
          // Skip components without test pages
          return;
        }

        it(`should detect no hydration errors on ${component.tag}`, async () => {
          const result = await testComponentSSR(component);
          
          if (result.errors.length > 0) {
            console.log(`Hydration errors for ${component.tag}:`, JSON.stringify(result.errors, null, 2));
            testResults.push({
              component: component.name,
              tag: component.tag,
              status: 'failed',
              errors: result.errors,
            });
          } else {
            testResults.push({
              component: component.name,
              tag: component.tag,
              status: 'passed',
            });
          }
          
          expect(result.errors).toHaveLength(0);
        });
      });
    });

    describe('Unsupported Components (Known Limitations)', () => {
      unsupportedComponents.forEach((component) => {
        if (!component.testPagePath) {
          // Skip components without test pages
          return;
        }

        const limitationNote = component.notes 
          ? ` (KNOWN: ${component.notes})`
          : ' (KNOWN LIMITATION)';

        it(`should detect no hydration errors on ${component.tag}${limitationNote}`, async () => {
          // Running test to see actual failures instead of skipping
          const result = await testComponentSSR(component);
          
          if (result.errors.length > 0) {
            console.log(`Hydration errors for ${component.tag}:`, JSON.stringify(result.errors, null, 2));
            testResults.push({
              component: component.name,
              tag: component.tag,
              status: 'failed',
              errors: result.errors,
            });
          } else {
            testResults.push({
              component: component.name,
              tag: component.tag,
              status: 'passed',
            });
          }
          
          // Note: These are expected to fail, but we're running them to see the actual errors
          expect(result.errors).toHaveLength(0);
        });
      });
    });
  });


  describe('Component Discovery Summary', () => {
    it('should discover all components from component-library', () => {
      const components = getAllComponents();
      
      expect(components.length).toBeGreaterThan(0);
      
      // Log summary
      console.log(`\nDiscovered ${components.length} components:`);
      components.forEach(component => {
        const status = component.expectedStatus === 'supported' ? '✅' :
                      component.expectedStatus === 'unsupported' ? '❌' :
                      component.expectedStatus === 'partial' ? '⚠️' : '❓';
        const page = component.testPagePath ? ` (page: ${component.testPagePath})` : ' (no test page)';
        console.log(`  ${status} ${component.tag} [${component.encapsulation}]${page}`);
      });
    });
  });
});

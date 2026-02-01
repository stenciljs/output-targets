#!/usr/bin/env node

/**
 * Script to generate SSR compatibility coverage report based on actual test runs
 * 
 * Usage: node scripts/generate-coverage.js
 * 
 * This script:
 * 1. Discovers all components
 * 2. Runs the test suite
 * 3. Parses test results
 * 4. Generates coverage report based on actual test outcomes
 */

import { getAllComponents } from './discover-components.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Read test results from JSON file written by test suite
 * When called from posttest, tests have already run, so we just read the results
 */
function readTestResults() {
  const resultsPath = resolve(__dirname, '../test/test-results.json');
  
  let jsonResults = null;
  if (existsSync(resultsPath)) {
    try {
      jsonResults = JSON.parse(readFileSync(resultsPath, 'utf-8'));
    } catch (error) {
      console.error('Error reading test-results.json:', error.message);
    }
  } else {
    console.warn('test-results.json not found. Tests may not have completed successfully.');
  }
  
  return jsonResults;
}

/**
 * Parse test results from JSON file written by test suite
 */
function parseJSONTestResults(jsonResults, components) {
  const results = [];
  const componentMap = new Map();
  components.forEach(c => componentMap.set(c.tag, c));
  const seenComponents = new Set();
  
  // jsonResults is an array of test results written by the test suite
  if (Array.isArray(jsonResults)) {
    jsonResults.forEach((testResult) => {
      const component = componentMap.get(testResult.tag);
      if (component) {
        seenComponents.add(testResult.tag);
        results.push({
          component,
          status: testResult.status,
          testName: `should detect no hydration errors on ${testResult.tag}`,
          errors: testResult.errors,
        });
      }
    });
  }
  
  // Add components that weren't tested
  for (const component of components) {
    if (!seenComponents.has(component.tag)) {
      results.push({
        component,
        status: 'not-tested',
      });
    }
  }
  
  return results;
}

/**
 * Parse test results from spec reporter text output (fallback)
 */
function parseTestResults(testOutput, components) {
  const results = [];
  
  // Map components by tag for quick lookup
  const componentMap = new Map();
  components.forEach(c => componentMap.set(c.tag, c));
  
  // Track which components we've seen in test output
  const seenComponents = new Set();
  
  // Try to parse as JSON first (if using JSON reporter)
  try {
    const jsonMatch = testOutput.match(/\[[\s\S]*\]$/m);
    if (jsonMatch) {
      const testData = JSON.parse(jsonMatch[0]);
      if (Array.isArray(testData)) {
        testData.forEach((suite) => {
          if (suite.suites) {
            suite.suites.forEach((subSuite) => {
              if (subSuite.tests) {
                subSuite.tests.forEach((test) => {
                  const title = test.title || '';
                  for (const [tag, component] of componentMap.entries()) {
                    if (title.includes(`should detect no hydration errors on ${tag}`)) {
                      seenComponents.add(tag);
                      results.push({
                        component,
                        status: test.state === 'passed' ? 'passed' :
                               test.state === 'failed' ? 'failed' :
                               test.state === 'skipped' ? 'skipped' : 'not-tested',
                        testName: title,
                        errors: test.err ? [test.err.message || String(test.err)] : undefined,
                      });
                      break;
                    }
                  }
                });
              }
            });
          }
        });
      }
    }
  } catch {
    // Not JSON, fall back to text parsing
  }
  
  // If no JSON results, parse spec reporter output
  if (results.length === 0) {
    const lines = testOutput.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for test descriptions that mention component tags
      for (const [tag, component] of componentMap.entries()) {
        if (line.includes(`should detect no hydration errors on ${tag}`)) {
          seenComponents.add(tag);
          
          // Look ahead and behind for test status indicators
          const contextStart = Math.max(0, i - 5);
          const contextEnd = Math.min(lines.length, i + 20);
          const context = lines.slice(contextStart, contextEnd).join('\n');
          
          // Check if test was skipped
          if (context.includes('SKIP') || context.includes('skip') || context.includes('SKIPPED')) {
            results.push({
              component,
              status: 'skipped',
              testName: line.trim(),
            });
          }
          // Check if test passed (look for "✓" or "PASS" or "passed")
          else if (context.includes('✓') || context.includes('PASS') || context.includes('passed')) {
            results.push({
              component,
              status: 'passed',
              testName: line.trim(),
            });
          }
          // Check if test failed (look for "✗" or "FAIL" or "failed")
          else if (context.includes('✗') || context.includes('FAIL') || context.includes('failed') || context.includes('Error:')) {
            // Try to extract error message from following lines
            const errors = [];
            for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
              if (lines[j].includes('Error:') || lines[j].includes('AssertionError') || lines[j].includes('expect')) {
                errors.push(lines[j].trim());
                if (errors.length >= 3) break; // Limit to 3 error lines
              }
            }
            results.push({
              component,
              status: 'failed',
              testName: line.trim(),
              errors: errors.length > 0 ? errors : undefined,
            });
          }
          break;
        }
      }
    }
  }
  
  // Add components that weren't tested
  for (const component of components) {
    if (!seenComponents.has(component.tag)) {
      results.push({
        component,
        status: 'not-tested',
      });
    }
  }
  
  return results;
}

function getChromeVersion() {
  try {
    // Try different methods to get Chrome version based on OS
    const platform = process.platform;
    let chromeVersion = 'Unknown';
    
    if (platform === 'darwin') {
      // macOS
      try {
        const version = execSync('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version', {
          encoding: 'utf-8',
          timeout: 5000,
        }).trim();
        // Extract version number (e.g., "Google Chrome 120.0.6099.109" -> "120.0.6099.109")
        const match = version.match(/(\d+\.\d+\.\d+\.\d+|\d+\.\d+\.\d+)/);
        chromeVersion = match ? match[1] : version;
      } catch {
        // Try alternative path
        try {
          const version = execSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --version', {
            encoding: 'utf-8',
            timeout: 5000,
          }).trim();
          const match = version.match(/(\d+\.\d+\.\d+\.\d+|\d+\.\d+\.\d+)/);
          chromeVersion = match ? match[1] : version;
        } catch {
          chromeVersion = 'Unknown';
        }
      }
    } else if (platform === 'linux') {
      // Linux
      try {
        const version = execSync('google-chrome --version', {
          encoding: 'utf-8',
          timeout: 5000,
        }).trim();
        const match = version.match(/(\d+\.\d+\.\d+\.\d+|\d+\.\d+\.\d+)/);
        chromeVersion = match ? match[1] : version;
      } catch {
        // Try chromium as fallback
        try {
          const version = execSync('chromium --version', {
            encoding: 'utf-8',
            timeout: 5000,
          }).trim();
          const match = version.match(/(\d+\.\d+\.\d+\.\d+|\d+\.\d+\.\d+)/);
          chromeVersion = match ? match[1] : version;
        } catch {
          chromeVersion = 'Unknown';
        }
      }
    } else if (platform === 'win32') {
      // Windows
      try {
        // Try to read from registry or Chrome's version file
        const version = execSync('reg query "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon" /v version', {
          encoding: 'utf-8',
          timeout: 5000,
        }).trim();
        const match = version.match(/(\d+\.\d+\.\d+\.\d+|\d+\.\d+\.\d+)/);
        chromeVersion = match ? match[1] : 'Unknown';
      } catch {
        chromeVersion = 'Unknown';
      }
    }
    
    return chromeVersion;
  } catch (error) {
    return 'Unknown';
  }
}

async function getEnvironmentInfo() {
  const projectRoot = process.cwd();
  const chromeVersion = getChromeVersion();
  const envInfo = {
    nodeVersion: process.version,
    browser: 'Chrome',
    chromeVersion: chromeVersion,
    nextjsVersion: 'Unknown',
    outputTargetsVersion: 'Unknown',
    stencilCoreVersion: 'Unknown',
  };
  
  try {
    // Get Next.js version from current project's package.json
    const packageJsonPath = resolve(projectRoot, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.dependencies && packageJson.dependencies.next) {
        envInfo.nextjsVersion = packageJson.dependencies.next;
      } else if (packageJson.devDependencies && packageJson.devDependencies.next) {
        envInfo.nextjsVersion = packageJson.devDependencies.next;
      }
    }
    
    // Get output-targets version from component-library's actual dependency
    // Check if it's using workspace:* (local code) or a version number
    const componentLibraryPath = resolve(projectRoot, '../component-library/package.json');
    if (existsSync(componentLibraryPath)) {
      const componentLibraryPackage = JSON.parse(readFileSync(componentLibraryPath, 'utf-8'));
      
      // Check for @stencil/react-output-target in devDependencies
      if (componentLibraryPackage.devDependencies && componentLibraryPackage.devDependencies['@stencil/react-output-target']) {
        const depVersion = componentLibraryPackage.devDependencies['@stencil/react-output-target'];
        if (depVersion === 'workspace:*' || depVersion.startsWith('workspace:')) {
          // Using local workspace code
          envInfo.outputTargetsVersion = 'workspace:* (local)';
        } else {
          // Using a specific version
          envInfo.outputTargetsVersion = depVersion;
        }
      } else {
        // Fallback to package.json version if not found in dependencies
        const reactPackagePath = resolve(projectRoot, '../../packages/react/package.json');
        if (existsSync(reactPackagePath)) {
          const reactPackage = JSON.parse(readFileSync(reactPackagePath, 'utf-8'));
          envInfo.outputTargetsVersion = reactPackage.version || 'Unknown';
        }
      }
      
      // Get Stencil core version from component-library
      if (componentLibraryPackage.devDependencies && componentLibraryPackage.devDependencies['@stencil/core']) {
        envInfo.stencilCoreVersion = componentLibraryPackage.devDependencies['@stencil/core'];
      }
    }
  } catch (error) {
    console.warn('Warning: Could not read environment info:', error.message);
  }
  
  return envInfo;
}

/**
 * Read test run history
 */
function readTestRunHistory() {
  const historyPath = resolve(__dirname, '../test/test-run-history.json');
  
  if (!existsSync(historyPath)) {
    return [];
  }
  
  try {
    const content = readFileSync(historyPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Warning: Could not read test run history:', error.message);
    return [];
  }
}

/**
 * Save test run to history
 */
function saveTestRunToHistory(report) {
  // Only save to history if SAVE_TO_HISTORY environment variable is set
  // This ensures only actual test runs (via npm test) are recorded, not manual script runs
  const shouldSave = process.env.SAVE_TO_HISTORY === 'true';
  
  const historyPath = resolve(__dirname, '../test/test-run-history.json');
  const history = readTestRunHistory();
  
  if (shouldSave) {
    // Create component-level results map
    const componentResults = {};
    report.components.forEach(component => {
      const testResult = report.testResults.find(r => r.component.tag === component.tag);
      if (testResult) {
        componentResults[component.tag] = {
          status: testResult.status,
          name: component.name,
          encapsulation: component.encapsulation,
        };
      }
    });
    
    const runEntry = {
      timestamp: report.generatedAt,
      environment: report.environment,
      summary: {
        total: report.total,
        passed: report.passed,
        failed: report.failed,
        skipped: report.skipped,
        notTested: report.notTested,
      },
      componentResults: componentResults,
    };
    
    // Add to history (most recent first)
    history.unshift(runEntry);
    
    // Keep last 100 runs
    const maxHistory = 100;
    const trimmedHistory = history.slice(0, maxHistory);
    
    try {
      writeFileSync(historyPath, JSON.stringify(trimmedHistory, null, 2), 'utf-8');
      console.log(`\n📝 Test run saved to history: ${historyPath}`);
      return trimmedHistory;
    } catch (error) {
      console.warn('Warning: Could not save test run history:', error.message);
      return history;
    }
  }
  
  // Return existing history without saving
  return history;
}


async function generateCoverageReport() {
  const components = getAllComponents();
  
  // Read test results (tests have already run via npm test)
  const jsonResults = readTestResults();
  
  // Parse test results
  const testResults = jsonResults 
    ? parseJSONTestResults(jsonResults, components)
    : [];
  
  // Get environment information
  const environmentInfo = await getEnvironmentInfo();
  
  const report = {
    total: components.length,
    withTestPages: components.filter(c => c.testPagePath).length,
    withoutTestPages: components.filter(c => !c.testPagePath).length,
    passed: testResults.filter(r => r.status === 'passed').length,
    failed: testResults.filter(r => r.status === 'failed').length,
    skipped: testResults.filter(r => r.status === 'skipped').length,
    notTested: testResults.filter(r => r.status === 'not-tested').length,
    components,
    testResults,
    generatedAt: new Date().toISOString(),
    environment: environmentInfo,
  };
  
  // Save to history and get all history
  const history = saveTestRunToHistory(report);
  report.history = history;
  
  return report;
}


/**
 * Read example code from test page file
 */
function getComponentExample(testPagePath) {
  if (!testPagePath) return null;
  
  const projectRoot = process.cwd();
  const pagePath = resolve(projectRoot, 'src/app', testPagePath.slice(1), 'page.tsx');
  
  if (!existsSync(pagePath)) {
    return null;
  }
  
  try {
    const content = readFileSync(pagePath, 'utf-8');
    // Extract the component usage (simplified - just return the full file content for now)
    return content;
  } catch (error) {
    return null;
  }
}

/**
 * Determine SSR status for a component
 * Returns: 'green' | 'red' | 'unknown'
 */
function getSSRStatus(component, testResult) {
  if (!component.testPagePath) {
    return 'unknown';
  }
  
  if (!testResult || testResult.status === 'not-tested') {
    return 'unknown';
  }
  
  // Red: failed or skipped (has mismatch errors)
  if (testResult.status === 'failed' || testResult.status === 'skipped') {
    return 'red';
  }
  
  // Green: passed (passes mismatch and all other tests)
  if (testResult.status === 'passed') {
    return 'green';
  }
  
  return 'unknown';
}

/**
 * Generate HTML coverage report
 */
function generateHTMLReport(report) {
  const resultMap = new Map();
  report.testResults.forEach(result => {
    resultMap.set(result.component.tag, result);
  });
  
  // Group components by status
  const greenComponents = [];
  const redComponents = [];
  const unknownComponents = [];
  
  // Get list of failed component names for tooltip
  const failedComponentNames = [];
  const skippedComponentNames = [];
  
  report.components.forEach(component => {
    const testResult = resultMap.get(component.tag);
    const status = getSSRStatus(component, testResult);
    const example = getComponentExample(component.testPagePath);
    
    const componentData = {
      ...component,
      testResult,
      status,
      example,
    };
    
    if (status === 'green') {
      greenComponents.push(componentData);
    } else if (status === 'red') {
      redComponents.push(componentData);
      if (testResult && testResult.status === 'failed') {
        failedComponentNames.push(component.tag);
      } else if (testResult && testResult.status === 'skipped') {
        skippedComponentNames.push(component.tag);
      }
    } else {
      unknownComponents.push(componentData);
    }
  });
  
  const allFailedNames = [...failedComponentNames, ...skippedComponentNames];
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SSR Compatibility Coverage Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      margin: -20px -20px 30px -20px;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      position: relative;
    }
    
    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    
    header .meta {
      opacity: 0.9;
      font-size: 0.9em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .header-info-icon {
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      color: white;
      flex-shrink: 0;
    }
    
    .header-info-icon:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    .header-info-icon .info-tooltip {
      width: 350px;
      max-width: calc(100vw - 40px);
      white-space: normal;
      text-align: left;
      line-height: 1.5;
      font-size: 0.9em;
      bottom: auto;
      top: 125%;
      left: auto;
      right: 100%;
      margin-right: 10px;
      transform: none;
    }
    
    .header-info-icon .info-tooltip::after {
      bottom: auto;
      top: 10px;
      left: auto;
      right: -5px;
      border-top-color: transparent;
      border-bottom-color: transparent;
      border-left-color: transparent;
      border-right-color: #1f2937;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .summary-card .number {
      font-size: 2.5em;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .summary-card.green .number { color: #10b981; }
    .summary-card.red .number { color: #ef4444; }
    .summary-card.unknown .number { color: #6b7280; }
    
    .summary-card .label {
      color: #6b7280;
      font-size: 0.9em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    
    .info-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      font-weight: 600;
      font-style: normal;
      line-height: 1;
      cursor: help;
      position: relative;
      transition: all 0.2s ease;
      border: 1.5px solid #d1d5db;
      flex-shrink: 0;
    }
    
    .info-icon:hover {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
      transform: scale(1.1);
    }
    
    .info-icon::before {
      content: "i";
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-style: normal;
    }
    
    .info-tooltip {
      visibility: hidden;
      opacity: 0;
      position: absolute;
      bottom: 125%;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 0.8em;
      line-height: 1.4;
      white-space: normal;
      width: 220px;
      text-align: left;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: opacity 0.2s, visibility 0.2s;
      pointer-events: none;
    }
    
    .info-tooltip::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: #1f2937;
    }
    
    .info-icon:hover .info-tooltip {
      visibility: visible;
      opacity: 1;
    }
    
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.7em;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .status-badge.green {
      background: #d1fae5;
      color: #065f46;
    }
    
    }
    
    .status-badge.red {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .status-badge.unknown {
      background: #f3f4f6;
      color: #4b5563;
    }
    
    /* Hide badge for green cards in green section */
    .section.green .status-badge.green {
      display: none;
    }
    
    .section {
      margin-bottom: 50px;
    }
    
    .section-header {
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px 0;
      border-bottom: 3px solid;
      transition: opacity 0.2s;
    }
    
    .section-header:hover {
      opacity: 0.8;
    }
    
    .section.green .section-header { border-color: #10b981; color: #065f46; }
    .section.red .section-header { border-color: #ef4444; color: #991b1b; }
    .section.unknown .section-header { border-color: #6b7280; color: #4b5563; }
    
    .section-title {
      font-size: 1.8em;
      margin: 0;
      flex: 1;
    }
    
    .section-toggle {
      font-size: 1.2em;
      transition: transform 0.3s;
    }
    
    .section.collapsed .section-toggle {
      transform: rotate(-90deg);
    }
    
    .section-content {
      overflow: hidden;
      transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
      max-height: 10000px;
      opacity: 1;
    }
    
    .section.collapsed .section-content {
      max-height: 0;
      opacity: 0;
      margin: 0;
    }
    
    .components-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
      gap: 25px;
    }
    
    .component-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid #e5e7eb;
    }
    
    .component-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .component-card.green { border-left: 3px solid #10b981; }
    .component-card.red { border-left: 3px solid #ef4444; }
    .component-card.unknown { border-left: 3px solid #6b7280; }
    
    .component-header {
      padding: 16px 20px;
    }
    
    .component-name {
      font-size: 1.1em;
      font-weight: 600;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #111827;
    }
    
    .component-tag {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      background: #f3f4f6;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      color: #4b5563;
      display: inline-block;
      margin-bottom: 8px;
    }
    
    .component-meta {
      display: flex;
      gap: 12px;
      font-size: 0.85em;
      color: #6b7280;
      flex-wrap: wrap;
    }
    
    .component-meta strong {
      color: #374151;
    }
    
    .component-body {
      padding: 0 20px 20px 20px;
    }
    
    .component-notes {
      background: #fef3c7;
      border-left: 3px solid #f59e0b;
      padding: 10px 12px;
      margin-bottom: 12px;
      border-radius: 4px;
      font-size: 0.85em;
      line-height: 1.5;
    }
    
    .component-notes.error {
      background: #fee2e2;
      border-color: #ef4444;
    }
    
    .component-notes ul {
      margin-top: 6px;
    }
    
    .component-notes li {
      margin-bottom: 4px;
    }
    
    .example-section {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
    
    .example-section h4 {
      margin-bottom: 10px;
      color: #6b7280;
      font-size: 0.75em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    .code-block {
      background: #1e293b;
      color: #e2e8f0;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.8em;
      line-height: 1.7;
      border: 1px solid #334155;
      position: relative;
    }
    
    .code-block code {
      color: #e2e8f0;
      white-space: pre;
      display: block;
    }
    
    .code-block::-webkit-scrollbar {
      height: 8px;
    }
    
    .code-block::-webkit-scrollbar-track {
      background: #0f172a;
      border-radius: 4px;
    }
    
    .code-block::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 4px;
    }
    
    .code-block::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
    
    .test-page-section {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }
    
    .test-page-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .test-page-url {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.8em;
      color: #6b7280;
    }
    
    .test-page-link {
      display: inline-flex;
      align-items: center;
      color: #667eea;
      text-decoration: none;
      font-size: 0.875em;
      font-weight: 500;
      transition: color 0.2s;
    }
    
    .test-page-link:hover {
      color: #5568d3;
      text-decoration: underline;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }
    
    .environment-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .environment-title {
      font-size: 1.5em;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .environment-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .environment-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .environment-label {
      font-size: 0.85em;
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .environment-value {
      font-size: 1.1em;
      color: #111827;
      font-weight: 600;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .environment-value-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    
    .audit-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .audit-title {
      font-size: 1.5em;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    
    .audit-table-wrapper {
      overflow-x: auto;
    }
    
    .audit-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 0.9em;
    }
    
    .audit-table thead {
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .audit-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .audit-table th.status {
      text-align: center;
    }
    
    .audit-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      color: #111827;
    }
    
    .audit-table tbody tr {
      transition: background 0.2s;
    }
    
    .audit-table tbody tr:hover {
      background: #f9fafb;
    }
    
    
    .audit-table .timestamp {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.85em;
      color: #6b7280;
      white-space: nowrap;
    }
    
    .audit-table .version {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.85em;
      color: #111827;
    }
    
    .audit-table .status {
      text-align: center;
    }
    
    .audit-table .status-passed {
      color: #10b981;
      font-weight: 600;
    }
    
    .audit-table .status-failed {
      color: #ef4444;
      font-weight: 600;
    }
    
    
    @media (max-width: 768px) {
      .components-grid {
        grid-template-columns: 1fr;
      }
      
      header h1 {
        font-size: 2em;
      }
      
      .summary {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>SSR Compatibility Coverage Report</h1>
      <div class="meta">
        Generated: ${new Date(report.generatedAt).toLocaleString()}
        <span class="info-icon header-info-icon">
          <span class="info-tooltip">This report shows results from the <strong>SSR compatibility test suite</strong> (ssr-compatibility.test.ts), which tests for hydration mismatch errors. <strong>Snapshot comparison tests</strong> (test.e2e.ts) are also part of the test suite and run alongside these tests, verifying that server-rendered HTML matches expected snapshots. However, snapshot test results could not be reliably captured for inclusion in this report due to limitations in accessing WebDriverIO test results programmatically.</span>
        </span>
      </div>
    </header>
    
    <div class="summary">
      <div class="summary-card green">
        <div class="number">${report.passed}</div>
        <div class="label">
          ✅ Runtime SSR-compatible
          <span class="info-icon">
            <span class="info-tooltip">Components that pass all SSR compatibility tests, including hydration mismatch detection. These components are safe to use with Next.js runtime-based SSR.</span>
          </span>
        </div>
      </div>
      <div class="summary-card red">
        <div class="number" ${allFailedNames.length > 0 ? `title="${allFailedNames.join(', ')}" style="cursor: help;"` : ''}>${report.failed + report.skipped}</div>
        <div class="label">
          ❌ Not SSR-Compatible
          <span class="info-icon">
            <span class="info-tooltip">Components with known hydration mismatch errors or other SSR incompatibilities. These components should not be used with SSR until issues are resolved.${allFailedNames.length > 0 ? ' Hover over the number to see component names.' : ''}</span>
          </span>
        </div>
      </div>
      <div class="summary-card">
        <div class="number">${report.total}</div>
        <div class="label">
          Total Components
          <span class="info-icon">
            <span class="info-tooltip">The total number of components discovered in the component library, including all encapsulation types (shadow and scoped).</span>
          </span>
        </div>
      </div>
    </div>
    
    ${greenComponents.length > 0 ? `
    <div class="section green">
      <div class="section-header" onclick="toggleSection(this)">
        <span class="section-toggle">▼</span>
        <h2 class="section-title">✅ Runtime SSR-compatible Components (${greenComponents.length})</h2>
      </div>
      <div class="section-content">
        <div class="components-grid">
          ${greenComponents.map(comp => renderComponentCard(comp)).join('')}
        </div>
      </div>
    </div>
    ` : ''}
    
    ${redComponents.length > 0 ? `
    <div class="section red">
      <div class="section-header" onclick="toggleSection(this)">
        <span class="section-toggle">▼</span>
        <h2 class="section-title">❌ Not SSR-Compatible Components (${redComponents.length})</h2>
      </div>
      <div class="section-content">
        <div class="components-grid">
          ${redComponents.map(comp => renderComponentCard(comp)).join('')}
        </div>
      </div>
    </div>
    ` : ''}
    
    <div class="environment-section">
      <h2 class="environment-title">Current Testing Environment</h2>
      <div class="environment-grid">
        <div class="environment-item">
          <div class="environment-label">Node Version</div>
          <div class="environment-value">${report.environment.nodeVersion}</div>
        </div>
        <div class="environment-item">
          <div class="environment-label">Browser</div>
          <div class="environment-value">${report.environment.browser || 'Chrome'} ${report.environment.chromeVersion !== 'Unknown' ? report.environment.chromeVersion : 'Unknown'}</div>
        </div>
        <div class="environment-item">
          <div class="environment-label">Next.js Version</div>
          <div class="environment-value">${report.environment.nextjsVersion}</div>
        </div>
        <div class="environment-item">
          <div class="environment-label">Stencil Core Version</div>
          <div class="environment-value">${report.environment.stencilCoreVersion}</div>
        </div>
        <div class="environment-item">
          <div class="environment-label">Output-Targets Version</div>
          <div class="environment-value">${report.environment.outputTargetsVersion}</div>
        </div>
      </div>
    </div>
    
    <div class="audit-section" id="audit-section" style="display: none;">
      <h2 class="audit-title" id="audit-title">
        Test Run History
      </h2>
      <div class="audit-table-wrapper">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Node</th>
              <th>Browser</th>
              <th>Next.js</th>
              <th>Stencil Core</th>
              <th>Output-Targets</th>
              <th class="status">Passed</th>
              <th class="status">Failed</th>
              <th class="status">Total</th>
            </tr>
          </thead>
          <tbody id="audit-table-body">
            <!-- Table rows will be dynamically generated by JavaScript -->
          </tbody>
        </table>
      </div>
    </div>
    
    <script>
      // Fallback: embed current history data in case fetch fails (e.g., file:// protocol)
      let testRunHistory = ${JSON.stringify(report.history || [])};
      
      function renderAuditTable() {
        const auditSection = document.getElementById('audit-section');
        const auditTableBody = document.getElementById('audit-table-body');
        const auditTitle = document.getElementById('audit-title');
        
        if (!testRunHistory || !Array.isArray(testRunHistory) || testRunHistory.length === 0) {
          auditSection.style.display = 'none';
          return;
        }
        
        auditSection.style.display = 'block';
        auditTableBody.innerHTML = '';
        auditTitle.innerHTML = 'Test Run History';
        
        testRunHistory.forEach((run) => {
          if (!run || !run.summary) {
            return; // Skip invalid entries
          }
          
          // Get failed component names for tooltip
          let failedNames = [];
          if (run.componentResults) {
            Object.keys(run.componentResults).forEach(tag => {
              const result = run.componentResults[tag];
              if (result && result.status === 'failed') {
                failedNames.push(tag);
              }
            });
          }
          const failedTooltip = failedNames.length > 0 ? ' title="' + failedNames.join(', ') + '" style="cursor: help;"' : '';
          
          const browserDisplay = (run.environment.browser || 'Chrome') + ' ' + (run.environment.chromeVersion !== 'Unknown' ? run.environment.chromeVersion : 'N/A');
          const row = document.createElement('tr');
          row.innerHTML = '<td class="timestamp">' + new Date(run.timestamp).toLocaleString() + '</td>' +
            '<td class="version">' + run.environment.nodeVersion + '</td>' +
            '<td class="version">' + browserDisplay + '</td>' +
            '<td class="version">' + run.environment.nextjsVersion + '</td>' +
            '<td class="version">' + run.environment.stencilCoreVersion + '</td>' +
            '<td class="version">' + run.environment.outputTargetsVersion + '</td>' +
            '<td class="status status-passed">' + run.summary.passed + '</td>' +
            '<td class="status status-failed"' + failedTooltip + '>' + run.summary.failed + '</td>' +
            '<td class="status">' + run.summary.total + '</td>';
          
          auditTableBody.appendChild(row);
        });
      }
      
      // Load test run history from JSON file (updates embedded data if fetch succeeds)
      async function loadTestRunHistory() {
        // Check if we're in a file:// context (can't fetch)
        const isFileProtocol = window.location.protocol === 'file:';
        
        if (isFileProtocol) {
          // Can't fetch in file:// protocol, use embedded data
          console.log('Using embedded test run history data (file:// protocol detected)');
          return false;
        }
        
        // Try multiple possible paths (only works with http/https)
        const paths = [
          './test-run-history.json',
          'test-run-history.json',
          '/test/test-run-history.json'
        ];
        
        for (const path of paths) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data)) {
                testRunHistory = data;
                console.log('Loaded test run history from:', path);
                return true;
              }
            }
          } catch (error) {
            // Silently try next path (CORS errors are expected in some contexts)
            continue;
          }
        }
        
        // If fetch fails, use embedded data (already set as fallback)
        console.log('Using embedded test run history data (fetch failed or not available)');
        return false;
      }
      
      // Render audit table when page loads
      document.addEventListener('DOMContentLoaded', async function() {
        // Load data from JSON file (or use embedded)
        await loadTestRunHistory();
        // Render the tables (will use embedded data if fetch failed)
        renderAuditTable();
        
        // Collapse all component sections by default
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
          section.classList.add('collapsed');
        });
      });
    </script>
  </div>
  <script>
    function toggleSection(header) {
      const section = header.closest('.section');
      section.classList.toggle('collapsed');
    }
  </script>
</body>
</html>`;

  return html;
}

/**
 * Render a component card
 */
function renderComponentCard(component) {
  const statusText = component.status === 'green' ? 'Runtime SSR-compatible' :
                     component.status === 'red' ? 'Not Compatible' : 'Unknown';
  
  let notesHtml = '';
  if (component.notes) {
    const isError = component.status === 'red';
    notesHtml = `
      <div class="component-notes ${isError ? 'error' : ''}">
        <strong>Note:</strong> ${escapeHtml(component.notes)}
      </div>
    `;
  }
  
  if (component.testResult && component.testResult.errors && component.testResult.errors.length > 0) {
    notesHtml += `
      <div class="component-notes error">
        <strong>Errors:</strong>
        <ul style="margin-top: 8px; padding-left: 20px;">
          ${component.testResult.errors.map(err => `<li>${escapeHtml(err)}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  let exampleHtml = '';
  if (component.example) {
    exampleHtml = `
      <div class="example-section">
        <h4>Example Usage</h4>
        <div class="code-block">
          <code>${escapeHtml(component.example)}</code>
        </div>
      </div>
    `;
  }
  
  // Only show badge if not green (since green is implied by section)
  const badgeHtml = component.status !== 'green' 
    ? `<span class="status-badge ${component.status}">${statusText}</span>`
    : '';
  
  return `
    <div class="component-card ${component.status}">
      <div class="component-header">
        <div class="component-name">
          ${badgeHtml}
          ${escapeHtml(component.name)}
        </div>
        <div class="component-tag">${escapeHtml(component.tag)}</div>
        <div class="component-meta">
          <span>Encapsulation: <strong>${component.encapsulation}</strong></span>
        </div>
      </div>
      <div class="component-body">
        ${notesHtml}
        ${component.testPagePath ? `
        <div class="test-page-section">
          <div class="test-page-info">
            <span class="test-page-url">${component.testPagePath}</span>
            <a href="http://localhost:3002${component.testPagePath}" class="test-page-link" target="_blank">View Test Page →</a>
          </div>
        </div>
        ` : ''}
        ${exampleHtml}
      </div>
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function main() {
  console.log('Discovering components...');
  const report = await generateCoverageReport();
  
  console.log(`\nTest Results Summary:`);
  console.log(`  Total Components: ${report.total}`);
  console.log(`  ✅ Passed: ${report.passed}`);
  console.log(`  ❌ Failed: ${report.failed}`);
  console.log(`  ⏭️  Skipped (Known Limitations): ${report.skipped}`);
  console.log(`  ❓ Not Tested: ${report.notTested}`);
  console.log(`  📄 With test pages: ${report.withTestPages}`);
  console.log(`  📝 Without test pages: ${report.withoutTestPages}`);
  
  console.log('\nComponent test results:');
  const resultMap = new Map();
  report.testResults.forEach(result => {
    resultMap.set(result.component.tag, result);
  });
  
  report.components.forEach(component => {
    const result = resultMap.get(component.tag);
    let status;
    
    if (!component.testPagePath) {
      status = '❓';
    } else if (!result || result.status === 'not-tested') {
      status = '❓';
    } else if (result.status === 'passed') {
      status = '✅';
    } else if (result.status === 'failed') {
      status = '❌';
    } else if (result.status === 'skipped') {
      status = '⏭️';
    } else {
      status = '❓';
    }
    
    const page = component.testPagePath ? ` (page: ${component.testPagePath})` : ' (no test page)';
    console.log(`  ${status} ${component.tag} [${component.encapsulation}]${page}`);
  });
  
  // Generate HTML report
  const html = generateHTMLReport(report);
  const htmlPath = resolve(__dirname, '../test/COVERAGE_REPORT.html');
  writeFileSync(htmlPath, html, 'utf-8');
  console.log(`📊 HTML coverage report written to: ${htmlPath}`);
  
  if (report.failed > 0) {
    console.log(`\n⚠️  Warning: ${report.failed} test(s) failed. Check the report for details.`);
    // Don't exit with error code - let npm handle test failures
    // process.exit(1);
  }
}

main();

#!/usr/bin/env node

/**
 * Wrapper script that runs tests and always generates coverage report
 * Preserves the test exit code so CI can detect failures
 */

import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

try {
  // Run tests
  execSync('wdio run ./wdio.conf.ts', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  // Tests passed - generate coverage with history saving enabled
  execSync('node scripts/generate-coverage.js', {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, SAVE_TO_HISTORY: 'true' }
  });
  
  process.exit(0);
} catch (error) {
  // Tests failed - still generate coverage with history saving enabled, then exit with error code
  try {
    execSync('node scripts/generate-coverage.js', {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, SAVE_TO_HISTORY: 'true' }
    });
  } catch (coverageError) {
    console.error('Error generating coverage report:', coverageError.message);
  }
  
  // Exit with the test failure code
  process.exit(error.status || 1);
}

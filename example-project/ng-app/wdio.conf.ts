/// <reference types="@wdio/globals/types" />

export const config: WebdriverIO.Config = {
  specs: ['./tests/**/*.e2e.ts'],
  exclude: [],
  maxInstances: 10,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: process.env.CI ? ['--headless'] : [],
      },
    },
  ],
  logLevel: 'info',
  bail: 0,
  baseUrl: 'http://localhost:4200',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['spec'],
  onPrepare: async function() {
    const { spawn } = await import('child_process');
    const isWindows = process.platform === 'win32';

    // On Windows, use shell mode with the full command string
    const ngServe = isWindows
      ? spawn('pnpm start', {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true
        })
      : spawn('pnpm', ['start'], {
          cwd: process.cwd(),
          stdio: 'inherit'
        });

    // Handle process errors
    ngServe.on('error', (err) => {
      console.error('Failed to start dev server:', err);
      throw err;
    });

    // Wait for server to be ready - check for port
    const maxWait = 120000; // Increase timeout to 2 minutes for Windows CI
    const startTime = Date.now();
    console.log('Waiting for dev server to be ready on http://localhost:4200...');
    while (Date.now() - startTime < maxWait) {
      try {
        const response = await fetch('http://localhost:4200');
        if (response.ok) {
          console.log('Dev server is ready!');
          break;
        }
      } catch {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Check if we timed out
    if (Date.now() - startTime >= maxWait) {
      console.error('Dev server failed to start within timeout period');
      throw new Error('Dev server failed to start');
    }

    (global as any).ngServe = ngServe;
  },
  onComplete: async function() {
    const ngServe = (global as any).ngServe;
    if (ngServe && ngServe.pid) {
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        // On Windows, kill the entire process tree
        const { spawn } = await import('child_process');
        spawn('taskkill', ['/pid', ngServe.pid.toString(), '/f', '/t'], { shell: true });
      } else {
        ngServe.kill();
      }
    }
  },
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
};

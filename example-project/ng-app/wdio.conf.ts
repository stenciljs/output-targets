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
    const command = isWindows ? 'pnpm.cmd' : 'pnpm';
    const ngServe = spawn(command, ['start'], { cwd: process.cwd(), stdio: 'inherit' });

    // Wait for server to be ready - check for port
    const maxWait = 60000;
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
      try {
        const response = await fetch('http://localhost:4200');
        if (response.ok) break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    (global as any).ngServe = ngServe;
  },
  onComplete: function() {
    if ((global as any).ngServe) {
      (global as any).ngServe.kill();
    }
  },
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
};

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { makeOpenStencilConfig, makePrompts } from 'stencil-output-targets-shared/test-utils/wizard';
import { wizard } from './wizard';

const MINIMAL_CONFIG =
  `import type { Config } from '@stencil/core';\n` +
  `export const config: Config = { namespace: 'my-app', outputTargets: [] };\n`;

describe('React wizard', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'wizard-react-'));
    await writeFile(join(tmpDir, 'stencil.config.ts'), MINIMAL_CONFIG, 'utf8');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('exports the correct wizard shape', () => {
    expect(wizard.init.id).toBe('@stencil/react-output-target');
    expect(wizard.init.displayName).toBe('React');
    expect(wizard.init.description).toBeTruthy();
    expect(wizard.init.run).toBeTypeOf('function');
  });

  it('amends stencil.config.ts and scaffolds wrapper package on happy path', async () => {
    const nypm = { addDependency: vi.fn().mockResolvedValue(undefined) };
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(tmpDir),
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-react'), // wrapper dir
        confirm: vi.fn().mockResolvedValueOnce(false), // no SSR
      }),
      nypm,
    };

    await wizard.init.run(ctx as any);

    const configText = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');
    expect(configText).toContain("reactOutputTarget({ outDir: 'my-app-react/src' })");
    expect(configText).toContain("{ type: 'standalone' }");
    expect(configText).toContain('import { reactOutputTarget }');

    const pkgJson = JSON.parse(await readFile(join(tmpDir, 'my-app-react', 'package.json'), 'utf8'));
    expect(pkgJson.name).toBe('my-app-react');
    expect(pkgJson.peerDependencies.react).toBe('^18 || ^19');

    const indexTs = await readFile(join(tmpDir, 'my-app-react', 'src', 'index.ts'), 'utf8');
    expect(indexTs).toContain("export * from './components.js'");

    expect(nypm.addDependency).toHaveBeenCalledWith(
      ['@stencil/react-output-target'],
      expect.objectContaining({ cwd: tmpDir, dev: true })
    );
  });

  it('adds SSR output target and clientModule when SSR is enabled', async () => {
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(tmpDir),
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi
          .fn()
          .mockResolvedValueOnce('./my-app-react') // wrapper dir
          .mockResolvedValueOnce('my-app-react'), // npm package name for SSR
        confirm: vi.fn().mockResolvedValueOnce(true), // enable SSR
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const configText = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');
    expect(configText).toContain("hydrateModule: 'my-app/dist/ssr'");
    expect(configText).toContain("clientModule: 'my-app-react'");
    expect(configText).toContain("{ type: 'ssr' }");
  });

  it('skips setup when already configured and user declines redo', async () => {
    const alreadyConfigured =
      `import type { Config } from '@stencil/core';\n` +
      `import { reactOutputTarget } from '@stencil/react-output-target';\n` +
      `export const config: Config = { namespace: 'my-app', outputTargets: [reactOutputTarget({ outDir: 'src' })] };\n`;
    await writeFile(join(tmpDir, 'stencil.config.ts'), alreadyConfigured, 'utf8');

    const nypm = { addDependency: vi.fn() };
    const cancel = vi.fn();
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(tmpDir),
      workspaceRoot: undefined,
      prompts: makePrompts({
        cancel,
        confirm: vi.fn().mockResolvedValueOnce(false), // decline redo
      }),
      nypm,
    };

    await wizard.init.run(ctx as any);

    expect(cancel).toHaveBeenCalledWith('Skipping React setup.');
    expect(nypm.addDependency).not.toHaveBeenCalled();
  });

  it('proceeds when already configured and user confirms redo', async () => {
    const alreadyConfigured =
      `import type { Config } from '@stencil/core';\n` +
      `import { reactOutputTarget } from '@stencil/react-output-target';\n` +
      `export const config: Config = { namespace: 'my-app', outputTargets: [reactOutputTarget({ outDir: 'src' })] };\n`;
    await writeFile(join(tmpDir, 'stencil.config.ts'), alreadyConfigured, 'utf8');

    const nypm = { addDependency: vi.fn().mockResolvedValue(undefined) };
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(tmpDir),
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-react'),
        confirm: vi
          .fn()
          .mockResolvedValueOnce(true) // confirm redo
          .mockResolvedValueOnce(false), // no SSR
      }),
      nypm,
    };

    await wizard.init.run(ctx as any);

    expect(nypm.addDependency).toHaveBeenCalled();
  });

  it('prompts for package name (not dir) when workspaceRoot is set', async () => {
    // In workspace mode wrapperDir = join(dirname(config.rootDir), packageName)
    // Use a nested coreDir so dirname stays inside tmpDir
    const coreDir = join(tmpDir, 'packages', 'my-app');
    await mkdir(coreDir, { recursive: true });
    await writeFile(join(coreDir, 'stencil.config.ts'), MINIMAL_CONFIG, 'utf8');

    const textMock = vi.fn().mockResolvedValueOnce('my-app-react');
    const ctx = {
      config: { rootDir: coreDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(coreDir),
      workspaceRoot: tmpDir,
      prompts: makePrompts({
        text: textMock,
        confirm: vi.fn().mockResolvedValueOnce(false),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    expect(textMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'Wrapper package name?' }));
  });
});

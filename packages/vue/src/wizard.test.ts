import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { wizard } from './wizard';

const MINIMAL_CONFIG =
  `import type { Config } from '@stencil/core';\n` +
  `export const config: Config = { namespace: 'my-app', outputTargets: [] };\n`;

function makePrompts(overrides: Record<string, unknown> = {}) {
  return {
    intro: vi.fn(),
    outro: vi.fn(),
    cancel: vi.fn(),
    text: vi.fn(),
    confirm: vi.fn(),
    select: vi.fn(),
    multiselect: vi.fn(),
    spinner: vi.fn().mockReturnValue({ start: vi.fn(), stop: vi.fn() }),
    isCancel: vi.fn().mockReturnValue(false),
    log: { success: vi.fn(), warn: vi.fn(), info: vi.fn() },
    ...overrides,
  };
}

describe('Vue wizard', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'wizard-vue-'));
    await writeFile(join(tmpDir, 'stencil.config.ts'), MINIMAL_CONFIG, 'utf8');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('exports the correct wizard shape', () => {
    expect(wizard.init.id).toBe('@stencil/vue-output-target');
    expect(wizard.init.displayName).toBe('Vue');
    expect(wizard.init.description).toBeTruthy();
    expect(wizard.init.run).toBeTypeOf('function');
  });

  it('adds loader-bundle output target in lazy mode', async () => {
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-vue'),
        select: vi.fn().mockResolvedValueOnce('lazy'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const configText = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');
    expect(configText).toContain("{ type: 'loader-bundle' }");
    expect(configText).toContain('vueOutputTarget(');
    expect(configText).toContain("proxiesFile: 'my-app-vue/src/components.ts'");
    expect(configText).toContain("componentCorePackage: 'my-app'");
    expect(configText).not.toContain('includeImportCustomElements');
    expect(configText).toContain('import { vueOutputTarget }');
  });

  it('adds standalone output target and standalone-specific options in standalone mode', async () => {
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-vue'),
        select: vi.fn().mockResolvedValueOnce('standalone'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const configText = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');
    expect(configText).toContain("{ type: 'standalone' }");
    expect(configText).toContain('includeImportCustomElements: true');
    expect(configText).toContain('includeDefineCustomElements: false');
    expect(configText).toContain("customElementsDir: 'dist/standalone'");
  });

  it('scaffolds wrapper package with correct Vue peer dependency', async () => {
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-vue'),
        select: vi.fn().mockResolvedValueOnce('lazy'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const pkgJson = JSON.parse(await readFile(join(tmpDir, 'my-app-vue', 'package.json'), 'utf8'));
    expect(pkgJson.name).toBe('my-app-vue');
    expect(pkgJson.peerDependencies.vue).toBe('^3.4.0');

    const indexTs = await readFile(join(tmpDir, 'my-app-vue', 'src', 'index.ts'), 'utf8');
    expect(indexTs).toContain("export * from './components.js'");
  });

  it('skips setup when already configured and user declines redo', async () => {
    const alreadyConfigured =
      `import type { Config } from '@stencil/core';\n` +
      `import { vueOutputTarget } from '@stencil/vue-output-target';\n` +
      `export const config: Config = { namespace: 'my-app', outputTargets: [vueOutputTarget({ proxiesFile: 'src/components.ts', componentCorePackage: 'my-app' })] };\n`;
    await writeFile(join(tmpDir, 'stencil.config.ts'), alreadyConfigured, 'utf8');

    const cancel = vi.fn();
    const nypm = { addDependency: vi.fn() };
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        cancel,
        confirm: vi.fn().mockResolvedValueOnce(false), // decline redo
      }),
      nypm,
    };

    await wizard.init.run(ctx as any);

    expect(cancel).toHaveBeenCalledWith('Skipping Vue setup.');
    expect(nypm.addDependency).not.toHaveBeenCalled();
  });

  it('prompts for package name (not dir) when workspaceRoot is set', async () => {
    const coreDir = join(tmpDir, 'packages', 'my-app');
    await mkdir(coreDir, { recursive: true });
    await writeFile(join(coreDir, 'stencil.config.ts'), MINIMAL_CONFIG, 'utf8');

    const textMock = vi.fn().mockResolvedValueOnce('my-app-vue');
    const ctx = {
      config: { rootDir: coreDir, fsNamespace: 'my-app' },
      workspaceRoot: tmpDir,
      prompts: makePrompts({
        text: textMock,
        select: vi.fn().mockResolvedValueOnce('lazy'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    expect(textMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'Wrapper package name?' }));
  });
});

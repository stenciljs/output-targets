import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { makeOpenStencilConfig, makePrompts } from 'stencil-output-targets-shared/test-utils/wizard';
import { wizard } from './wizard';

const MINIMAL_CONFIG =
  `import type { Config } from '@stencil/core';\n` +
  `export const config: Config = { namespace: 'my-app', outputTargets: [] };\n`;

describe('Types wizard', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'wizard-types-'));
    await writeFile(join(tmpDir, 'stencil.config.ts'), MINIMAL_CONFIG, 'utf8');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('exports the correct wizard shape', () => {
    expect(wizard.init.id).toBe('@stencil/types-output-target');
    expect(wizard.init.displayName).toBe('Types');
    expect(wizard.init.description).toBeTruthy();
    expect(wizard.init.run).toBeTypeOf('function');
  });

  it('exits early and logs when typesOutputTarget is already configured', async () => {
    const alreadyConfigured =
      `import type { Config } from '@stencil/core';\n` +
      `import { typesOutputTarget } from '@stencil/types-output-target';\n` +
      `export const config: Config = { namespace: 'my-app', outputTargets: [typesOutputTarget({ reactTypesPath: 'dist/types' })] };\n`;
    await writeFile(join(tmpDir, 'stencil.config.ts'), alreadyConfigured, 'utf8');

    const log = { success: vi.fn(), warn: vi.fn(), info: vi.fn() };
    const outro = vi.fn();
    const multiselect = vi.fn();
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(tmpDir),
      prompts: makePrompts({ log, outro, multiselect }),
      nypm: { addDependency: vi.fn() },
    };

    await wizard.init.run(ctx as any);

    expect(multiselect).not.toHaveBeenCalled();
    expect(outro).toHaveBeenCalledWith('Already configured');
  });

  it('adds typesOutputTarget with reactTypesPath when React is selected', async () => {
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(tmpDir),
      prompts: makePrompts({
        multiselect: vi.fn().mockResolvedValueOnce(['react']),
      }),
      nypm: { addDependency: vi.fn() },
    };

    await wizard.init.run(ctx as any);

    const configText = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');
    expect(configText).toContain('typesOutputTarget(');
    expect(configText).toContain("reactTypesPath: 'dist/types'");
    expect(configText).toContain('import { typesOutputTarget }');
  });

  it('adds all selected framework type paths when multiple frameworks are chosen', async () => {
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(tmpDir),
      prompts: makePrompts({
        multiselect: vi.fn().mockResolvedValueOnce(['react', 'vue', 'svelte']),
      }),
      nypm: { addDependency: vi.fn() },
    };

    await wizard.init.run(ctx as any);

    const configText = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');
    expect(configText).toContain("reactTypesPath: 'dist/types'");
    expect(configText).toContain("vueTypesPath: 'dist/types'");
    expect(configText).toContain("svelteTypesPath: 'dist/types'");
    expect(configText).not.toContain('solidTypesPath');
    expect(configText).not.toContain('preactTypesPath');
  });

  it('cancels and makes no changes when user cancels the multiselect', async () => {
    const cancel = vi.fn();
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(tmpDir),
      prompts: makePrompts({
        cancel,
        multiselect: vi.fn().mockResolvedValueOnce(Symbol('cancel')),
        isCancel: vi.fn().mockReturnValue(true),
      }),
      nypm: { addDependency: vi.fn() },
    };

    const originalConfig = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');

    await wizard.init.run(ctx as any);

    expect(cancel).toHaveBeenCalledWith('Setup cancelled.');
    const configAfter = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');
    expect(configAfter).toBe(originalConfig);
  });

  it('adds Solid and Preact type paths when selected', async () => {
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(tmpDir),
      prompts: makePrompts({
        multiselect: vi.fn().mockResolvedValueOnce(['solid', 'preact']),
      }),
      nypm: { addDependency: vi.fn() },
    };

    await wizard.init.run(ctx as any);

    const configText = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');
    expect(configText).toContain("solidTypesPath: 'dist/types'");
    expect(configText).toContain("preactTypesPath: 'dist/types'");
  });
});

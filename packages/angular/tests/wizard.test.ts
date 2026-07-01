import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { wizard } from '../src/wizard';

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

describe('Angular wizard', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'wizard-angular-'));
    await writeFile(join(tmpDir, 'stencil.config.ts'), MINIMAL_CONFIG, 'utf8');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('exports the correct wizard shape', () => {
    expect(wizard.init.id).toBe('@stencil/angular-output-target');
    expect(wizard.init.displayName).toBe('Angular');
    expect(wizard.init.description).toBeTruthy();
    expect(wizard.init.run).toBeTypeOf('function');
  });

  it('generates standalone config with only directivesProxyFile (no directivesArrayFile, no outputType)', async () => {
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-angular'),
        select: vi.fn().mockResolvedValueOnce('standalone'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const configText = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');
    expect(configText).toContain("angularOutputTarget(");
    expect(configText).toContain("directivesProxyFile: 'my-app-angular/src/lib/directives.ts'");
    expect(configText).toContain("componentCorePackage: 'my-app'");
    expect(configText).not.toContain("directivesArrayFile");
    expect(configText).not.toContain("outputType");
    expect(configText).toContain("import { angularOutputTarget }");
  });

  it('generates component (NgModule) config with directivesArrayFile and outputType', async () => {
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-angular'),
        select: vi.fn().mockResolvedValueOnce('component'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const configText = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');
    expect(configText).toContain("directivesArrayFile: 'my-app-angular/src/lib/directives.array.ts'");
    expect(configText).toContain("outputType: 'component'");

    // NgModule file should be scaffolded
    const moduleTs = await readFile(
      join(tmpDir, 'my-app-angular', 'src', 'lib', 'my-app.module.ts'),
      'utf8',
    );
    expect(moduleTs).toContain('class MyAppModule');
    expect(moduleTs).toContain("import { DIRECTIVES } from './directives.array'");
  });

  it('generates SCAM config with outputType:scam and no NgModule file', async () => {
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-angular'),
        select: vi.fn().mockResolvedValueOnce('scam'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const configText = await readFile(join(tmpDir, 'stencil.config.ts'), 'utf8');
    expect(configText).toContain("outputType: 'scam'");
    expect(configText).not.toContain("directivesArrayFile");

    // No NgModule file for SCAM
    const moduleExists = await readFile(
      join(tmpDir, 'my-app-angular', 'src', 'lib', 'my-app.module.ts'),
      'utf8',
    ).then(() => true).catch(() => false);
    expect(moduleExists).toBe(false);
  });

  it('scaffolds Angular wrapper package with ng-packagr build setup', async () => {
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-angular'),
        select: vi.fn().mockResolvedValueOnce('standalone'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const pkgJson = JSON.parse(
      await readFile(join(tmpDir, 'my-app-angular', 'package.json'), 'utf8'),
    );
    expect(pkgJson.scripts.build).toBe('ng-packagr -p ng-package.json');
    expect(pkgJson.peerDependencies['@angular/core']).toBe('>=19');

    const ngPackage = JSON.parse(
      await readFile(join(tmpDir, 'my-app-angular', 'ng-package.json'), 'utf8'),
    );
    expect(ngPackage.lib.entryFile).toBe('src/index.ts');
  });

  it('amends pnpm-workspace.yaml to allow esbuild build scripts', async () => {
    await writeFile(
      join(tmpDir, 'pnpm-workspace.yaml'),
      'packages:\n  - packages/*\n',
      'utf8',
    );

    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-angular'),
        select: vi.fn().mockResolvedValueOnce('standalone'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const yamlContent = await readFile(join(tmpDir, 'pnpm-workspace.yaml'), 'utf8');
    expect(yamlContent).toContain('esbuild');
  });

  it('does not duplicate esbuild when pnpm-workspace.yaml already lists it', async () => {
    await writeFile(
      join(tmpDir, 'pnpm-workspace.yaml'),
      'packages:\n  - packages/*\nonlyBuiltDependencies:\n  - esbuild\nallowBuilds:\n  esbuild: true\n',
      'utf8',
    );

    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-angular'),
        select: vi.fn().mockResolvedValueOnce('standalone'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const yamlContent = await readFile(join(tmpDir, 'pnpm-workspace.yaml'), 'utf8');
    // esbuild should appear exactly once in each section
    const onlyBuiltMatches = yamlContent.match(/- esbuild/g) ?? [];
    expect(onlyBuiltMatches.length).toBe(1);
    const allowBuildsMatches = yamlContent.match(/esbuild: true/g) ?? [];
    expect(allowBuildsMatches.length).toBe(1);
  });

  it('amends allowBuilds when section already has other entries', async () => {
    await writeFile(
      join(tmpDir, 'pnpm-workspace.yaml'),
      'packages:\n  - packages/*\nonlyBuiltDependencies:\n  - other-pkg\nallowBuilds:\n  other-pkg: true\n',
      'utf8',
    );

    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-angular'),
        select: vi.fn().mockResolvedValueOnce('standalone'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const yamlContent = await readFile(join(tmpDir, 'pnpm-workspace.yaml'), 'utf8');
    expect(yamlContent).toContain('esbuild');
    expect(yamlContent).toContain('other-pkg');
  });

  it('skips setup when already configured and user declines redo', async () => {
    const alreadyConfigured =
      `import type { Config } from '@stencil/core';\n` +
      `import { angularOutputTarget } from '@stencil/angular-output-target';\n` +
      `export const config: Config = { namespace: 'my-app', outputTargets: [angularOutputTarget({ componentCorePackage: 'my-app', directivesProxyFile: 'src/lib/directives.ts' })] };\n`;
    await writeFile(join(tmpDir, 'stencil.config.ts'), alreadyConfigured, 'utf8');

    const cancel = vi.fn();
    const nypm = { addDependency: vi.fn() };
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      workspaceRoot: undefined,
      prompts: makePrompts({
        cancel,
        confirm: vi.fn().mockResolvedValueOnce(false),  // decline redo
      }),
      nypm,
    };

    await wizard.init.run(ctx as any);

    expect(cancel).toHaveBeenCalledWith('Skipping Angular setup.');
    expect(nypm.addDependency).not.toHaveBeenCalled();
  });

  it('prompts for package name (not dir) when workspaceRoot is set', async () => {
    const coreDir = join(tmpDir, 'packages', 'my-app');
    await mkdir(coreDir, { recursive: true });
    await writeFile(join(coreDir, 'stencil.config.ts'), MINIMAL_CONFIG, 'utf8');

    const textMock = vi.fn().mockResolvedValueOnce('my-app-angular');
    const ctx = {
      config: { rootDir: coreDir, fsNamespace: 'my-app' },
      workspaceRoot: tmpDir,
      prompts: makePrompts({
        text: textMock,
        select: vi.fn().mockResolvedValueOnce('standalone'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    expect(textMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Wrapper package name?' }),
    );
  });
});

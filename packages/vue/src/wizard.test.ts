import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { makeFakeEditor, makeOpenStencilConfig, makePrompts } from 'stencil-output-targets-shared/test-utils/wizard';
import { wizard } from './wizard';

describe('Vue wizard', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'wizard-vue-'));
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
    const editor = makeFakeEditor();
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-vue'),
        select: vi.fn().mockResolvedValueOnce('lazy'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    expect(editor.addImport).toHaveBeenCalledWith('@stencil/vue-output-target', ['vueOutputTarget']);
    expect(editor.addOutputTarget).toHaveBeenCalledWith("{ type: 'loader-bundle' }");

    const targetCode = editor.addOutputTarget.mock.calls
      .map(([code]) => code)
      .find((code) => code.includes('vueOutputTarget('));
    expect(targetCode).toContain("proxiesFile: 'my-app-vue/src/components.ts'");
    expect(targetCode).toContain("componentCorePackage: 'my-app'");
    expect(targetCode).not.toContain('includeImportCustomElements');
    expect(editor.save).toHaveBeenCalled();
  });

  it('adds standalone output target and standalone-specific options in standalone mode', async () => {
    const editor = makeFakeEditor();
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-vue'),
        select: vi.fn().mockResolvedValueOnce('standalone'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    expect(editor.addOutputTarget).toHaveBeenCalledWith("{ type: 'standalone' }");
    const targetCode = editor.addOutputTarget.mock.calls
      .map(([code]) => code)
      .find((code) => code.includes('vueOutputTarget('));
    expect(targetCode).toContain('includeImportCustomElements: true');
    expect(targetCode).toContain('includeDefineCustomElements: false');
    expect(targetCode).toContain("customElementsDir: 'dist/standalone'");
  });

  it('scaffolds wrapper package with correct Vue peer dependency', async () => {
    const editor = makeFakeEditor();
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
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

  it('replaces existing vueOutputTarget when user confirms redo', async () => {
    const editor = makeFakeEditor();
    editor.outputTargetsContains.mockReturnValueOnce(true); // already configured
    editor.replaceOutputTarget.mockReturnValue(true); // an existing element is found and replaced in place

    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
      workspaceRoot: undefined,
      prompts: makePrompts({
        confirm: vi.fn().mockResolvedValueOnce(true), // confirm redo
        text: vi.fn().mockResolvedValueOnce('./my-app-vue'),
        select: vi.fn().mockResolvedValueOnce('lazy'),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    expect(editor.replaceOutputTarget).toHaveBeenCalledWith(
      'vueOutputTarget(',
      expect.stringContaining("proxiesFile: 'my-app-vue/src/components.ts'")
    );
    // replaceOutputTarget reported success, so the wizard must not also append a second vueOutputTarget(...)
    const vueTargetAdds = editor.addOutputTarget.mock.calls.filter(([code]) => code.includes('vueOutputTarget('));
    expect(vueTargetAdds).toHaveLength(0);
  });

  it('skips setup when already configured and user declines redo', async () => {
    const editor = makeFakeEditor();
    editor.outputTargetsContains.mockReturnValueOnce(true); // already configured

    const cancel = vi.fn();
    const nypm = { addDependency: vi.fn() };
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
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
    expect(editor.save).not.toHaveBeenCalled();
  });

  it('prompts for package name (not dir) when workspaceRoot is set', async () => {
    const coreDir = join(tmpDir, 'packages', 'my-app');
    await mkdir(coreDir, { recursive: true });

    const editor = makeFakeEditor();
    const textMock = vi.fn().mockResolvedValueOnce('my-app-vue');
    const ctx = {
      config: { rootDir: coreDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
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

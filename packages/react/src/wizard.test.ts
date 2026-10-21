import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { makeFakeEditor, makeOpenStencilConfig, makePrompts } from 'stencil-output-targets-shared/test-utils/wizard';
import { wizard } from './wizard';

describe('React wizard', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'wizard-react-'));
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
    const editor = makeFakeEditor();
    const nypm = { addDependency: vi.fn().mockResolvedValue(undefined) };
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-react'), // wrapper dir
        confirm: vi.fn().mockResolvedValueOnce(false), // no SSR
      }),
      nypm,
    };

    await wizard.init.run(ctx as any);

    expect(editor.addImport).toHaveBeenCalledWith('@stencil/react-output-target', ['reactOutputTarget']);
    expect(editor.addOutputTarget).toHaveBeenCalledWith("{ type: 'standalone' }");
    const targetCode = editor.addOutputTarget.mock.calls
      .map(([code]) => code)
      .find((code) => code.includes('reactOutputTarget('));
    expect(targetCode).toContain("reactOutputTarget({ outDir: 'my-app-react/src' })");

    const pkgJson = JSON.parse(await readFile(join(tmpDir, 'my-app-react', 'package.json'), 'utf8'));
    expect(pkgJson.name).toBe('my-app-react');
    expect(pkgJson.peerDependencies.react).toBe('^18 || ^19');

    const indexTs = await readFile(join(tmpDir, 'my-app-react', 'src', 'index.ts'), 'utf8');
    expect(indexTs).toContain("export * from './components.js'");

    expect(nypm.addDependency).toHaveBeenCalledWith(
      ['@stencil/react-output-target'],
      expect.objectContaining({ cwd: tmpDir, dev: true })
    );
    // the wrapper package needs it at runtime, so it's a regular dependency there
    expect(nypm.addDependency).toHaveBeenCalledWith(['@stencil/react-output-target'], {
      cwd: join(tmpDir, 'my-app-react'),
    });
  });

  it('adds SSR output target and clientModule when SSR is enabled', async () => {
    const editor = makeFakeEditor();
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
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

    expect(editor.addOutputTarget).toHaveBeenCalledWith("{ type: 'ssr' }");
    const targetCode = editor.addOutputTarget.mock.calls
      .map(([code]) => code)
      .find((code) => code.includes('reactOutputTarget('));
    expect(targetCode).toContain("hydrateModule: 'my-app/dist/ssr'");
    expect(targetCode).toContain("clientModule: 'my-app-react'");
  });

  it('skips setup when already configured and user declines redo', async () => {
    const editor = makeFakeEditor();
    editor.outputTargetsContains.mockReturnValueOnce(true); // already configured

    const nypm = { addDependency: vi.fn() };
    const cancel = vi.fn();
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

    expect(cancel).toHaveBeenCalledWith('Skipping React setup.');
    expect(nypm.addDependency).not.toHaveBeenCalled();
    expect(editor.save).not.toHaveBeenCalled();
  });

  it('proceeds when already configured and user confirms redo', async () => {
    const editor = makeFakeEditor();
    editor.outputTargetsContains.mockReturnValueOnce(true); // already configured

    const nypm = { addDependency: vi.fn().mockResolvedValue(undefined) };
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
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

  it("uses the core package's real name, not its namespace, for the dependency and hydrateModule", async () => {
    await writeFile(join(tmpDir, 'package.json'), JSON.stringify({ name: 'testy-test' }), 'utf8');

    const editor = makeFakeEditor();
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'testytest' },
      openStencilConfig: makeOpenStencilConfig(editor),
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi
          .fn()
          .mockResolvedValueOnce('./testytest-react') // wrapper dir
          .mockResolvedValueOnce('testytest-react'), // wrapper package name (SSR clientModule)
        confirm: vi.fn().mockResolvedValueOnce(true), // SSR
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const targetCode = editor.addOutputTarget.mock.calls
      .map(([code]) => code)
      .find((code) => code.includes('reactOutputTarget('));
    expect(targetCode).toContain("hydrateModule: 'testy-test/dist/ssr'");

    const pkgJson = JSON.parse(await readFile(join(tmpDir, 'testytest-react', 'package.json'), 'utf8'));
    expect(Object.keys(pkgJson.dependencies)).toEqual(['testy-test']);
  });

  it('points hydrateModule at the `./ssr` entry when the project generates an exports map', async () => {
    const editor = makeFakeEditor();
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app', generateExportMaps: true },
      openStencilConfig: makeOpenStencilConfig(editor),
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-react').mockResolvedValueOnce('my-app-react'),
        confirm: vi.fn().mockResolvedValueOnce(true),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    const targetCode = editor.addOutputTarget.mock.calls
      .map(([code]) => code)
      .find((code) => code.includes('reactOutputTarget('));
    expect(targetCode).toContain("hydrateModule: 'my-app/ssr'");
  });

  it('leaves generateExportMaps for the author to opt into', async () => {
    const editor = makeFakeEditor();
    const ctx = {
      config: { rootDir: tmpDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
      workspaceRoot: undefined,
      prompts: makePrompts({
        text: vi.fn().mockResolvedValueOnce('./my-app-react'),
        confirm: vi.fn().mockResolvedValueOnce(false),
      }),
      nypm: { addDependency: vi.fn().mockResolvedValue(undefined) },
    };

    await wizard.init.run(ctx as any);

    expect(editor.setProperty).not.toHaveBeenCalled();
  });

  it('prompts for package name (not dir) when workspaceRoot is set', async () => {
    // In workspace mode wrapperDir = join(dirname(config.rootDir), packageName)
    // Use a nested coreDir so dirname stays inside tmpDir
    const coreDir = join(tmpDir, 'packages', 'my-app');
    await mkdir(coreDir, { recursive: true });

    const editor = makeFakeEditor();
    const textMock = vi.fn().mockResolvedValueOnce('my-app-react');
    const ctx = {
      config: { rootDir: coreDir, fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
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

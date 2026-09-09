import { describe, it, expect, vi } from 'vitest';
import { makeFakeEditor, makeOpenStencilConfig, makePrompts } from 'stencil-output-targets-shared/test-utils/wizard';
import { wizard } from './wizard';

describe('Types wizard', () => {
  it('exports the correct wizard shape', () => {
    expect(wizard.init.id).toBe('@stencil/types-output-target');
    expect(wizard.init.displayName).toBe('Types');
    expect(wizard.init.description).toBeTruthy();
    expect(wizard.init.run).toBeTypeOf('function');
  });

  it('exits early and logs when typesOutputTarget is already configured', async () => {
    const editor = makeFakeEditor();
    editor.outputTargetsContains.mockReturnValueOnce(true); // already configured

    const log = { success: vi.fn(), warn: vi.fn(), info: vi.fn() };
    const outro = vi.fn();
    const multiselect = vi.fn();
    const ctx = {
      config: { rootDir: '/virtual/my-app', fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
      prompts: makePrompts({ log, outro, multiselect }),
      nypm: { addDependency: vi.fn() },
    };

    await wizard.init.run(ctx as any);

    expect(multiselect).not.toHaveBeenCalled();
    expect(outro).toHaveBeenCalledWith('Already configured');
    expect(editor.addOutputTarget).not.toHaveBeenCalled();
  });

  it('adds typesOutputTarget with reactTypesPath when React is selected', async () => {
    const editor = makeFakeEditor();
    const ctx = {
      config: { rootDir: '/virtual/my-app', fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
      prompts: makePrompts({
        multiselect: vi.fn().mockResolvedValueOnce(['react']),
      }),
      nypm: { addDependency: vi.fn() },
    };

    await wizard.init.run(ctx as any);

    expect(editor.addImport).toHaveBeenCalledWith('@stencil/types-output-target', ['typesOutputTarget']);
    const targetCode = editor.addOutputTarget.mock.calls[0]?.[0];
    expect(targetCode).toContain('typesOutputTarget(');
    expect(targetCode).toContain("reactTypesPath: 'dist/types'");
  });

  it('adds all selected framework type paths when multiple frameworks are chosen', async () => {
    const editor = makeFakeEditor();
    const ctx = {
      config: { rootDir: '/virtual/my-app', fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
      prompts: makePrompts({
        multiselect: vi.fn().mockResolvedValueOnce(['react', 'vue', 'svelte']),
      }),
      nypm: { addDependency: vi.fn() },
    };

    await wizard.init.run(ctx as any);

    const targetCode = editor.addOutputTarget.mock.calls[0]?.[0];
    expect(targetCode).toContain("reactTypesPath: 'dist/types'");
    expect(targetCode).toContain("vueTypesPath: 'dist/types'");
    expect(targetCode).toContain("svelteTypesPath: 'dist/types'");
    expect(targetCode).not.toContain('solidTypesPath');
    expect(targetCode).not.toContain('preactTypesPath');
  });

  it('cancels and makes no changes when user cancels the multiselect', async () => {
    const editor = makeFakeEditor();
    const cancel = vi.fn();
    const ctx = {
      config: { rootDir: '/virtual/my-app', fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
      prompts: makePrompts({
        cancel,
        multiselect: vi.fn().mockResolvedValueOnce(Symbol('cancel')),
        isCancel: vi.fn().mockReturnValue(true),
      }),
      nypm: { addDependency: vi.fn() },
    };

    await wizard.init.run(ctx as any);

    expect(cancel).toHaveBeenCalledWith('Setup cancelled.');
    expect(editor.addOutputTarget).not.toHaveBeenCalled();
    expect(editor.save).not.toHaveBeenCalled();
  });

  it('adds Solid and Preact type paths when selected', async () => {
    const editor = makeFakeEditor();
    const ctx = {
      config: { rootDir: '/virtual/my-app', fsNamespace: 'my-app' },
      openStencilConfig: makeOpenStencilConfig(editor),
      prompts: makePrompts({
        multiselect: vi.fn().mockResolvedValueOnce(['solid', 'preact']),
      }),
      nypm: { addDependency: vi.fn() },
    };

    await wizard.init.run(ctx as any);

    const targetCode = editor.addOutputTarget.mock.calls[0]?.[0];
    expect(targetCode).toContain("solidTypesPath: 'dist/types'");
    expect(targetCode).toContain("preactTypesPath: 'dist/types'");
  });
});

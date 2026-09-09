import { vi } from 'vitest';

export function makeFakeEditor() {
  return {
    addImport: vi.fn(),
    outputTargetsContains: vi.fn().mockReturnValue(false),
    addOutputTarget: vi.fn(),
    replaceOutputTarget: vi.fn().mockReturnValue(false),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

export type FakeConfigEditor = ReturnType<typeof makeFakeEditor>;

export function makeOpenStencilConfig(editor: FakeConfigEditor) {
  return vi.fn().mockResolvedValue(editor);
}

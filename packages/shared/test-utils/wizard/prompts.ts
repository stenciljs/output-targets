import { vi } from 'vitest';

/** Fakes `WizardContext.prompts` (`@clack/prompts`) for wizard.ts tests. */
export function makePrompts(overrides: Record<string, unknown> = {}) {
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

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    /**
     * The narrowed signature of `nullableBooleanAttribute` decides which template bindings
     * compile, and nothing else in this repo would fail if it widened. The `*.test-d.ts` files
     * pin it, so type checking runs as part of the normal test command.
     */
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.spec.json',
    },
  },
});

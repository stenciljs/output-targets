import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' with { type: 'json' };

const external = ['path', 'node-sass', 'fs', 'util', 'vue', 'vue/server-renderer'];
const wizardExternal = ['node:fs/promises', 'node:path', 'ts-morph'];
const plugins = [typescript()];
const core = {
  input: './src/index.ts',
  external,
  plugins,
  watch: {
    clearScreen: false
  },
  output: [
    {
      format: 'cjs',
      file: pkg.exports['.'].require,
    },
    {
      format: 'es',
      file: pkg.exports['.'].import,
    },
  ],
}
const runtime = {
  input: './src/runtime.ts',
  external,
  plugins,
  watch: {
    clearScreen: false
  },
  output: [
    {
      format: 'cjs',
      file: pkg.exports['./runtime'].require,
    },
    {
      format: 'es',
      file: pkg.exports['./runtime'].import,
    },
  ],
}
const wizard = {
  input: './src/wizard.ts',
  external: wizardExternal,
  plugins,
  watch: {
    clearScreen: false,
  },
  output: [
    {
      format: 'es',
      file: pkg.exports['./wizard'].import,
    },
  ],
};

export default [core, runtime, wizard];

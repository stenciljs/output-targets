import pkg from './package.json' with { type: 'json' };

export default {
  input: 'dist/index.js',

  external: ['path', 'node-sass', 'fs', 'util', 'os'],

  watch: {
    clearScreen: false,
  },

  output: [
    {
      format: 'cjs',
      file: pkg.main,
    },
    {
      format: 'es',
      file: pkg.module,
    },
  ],
};

import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

import { describe, it, expect } from 'vitest';
import esbuild from 'esbuild';

import { transform } from '../src/transform.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const templatePath = path.resolve(__dirname, '__fixtures__', 'app.tsx')
const template = await fs.readFile(templatePath, 'utf-8');
const code = await esbuild.transform(template, {
  loader: 'tsx',
  jsx: 'automatic', // Use React 17+ JSX transform
  jsxDev: true,
  sourcefile: templatePath,
});

describe('transform', () => {
  it('should transform the code', async () => {
    expect(await transform(code.code, templatePath, {
      from: 'component-library-react',
      module: import('component-library-react'),
      hydrateModule: import('component-library/hydrate'),
      serializeShadowRoot: 'scoped',
    })).toMatchSnapshot()
  })
})

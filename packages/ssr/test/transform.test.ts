import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

import { describe, it, expect } from 'vitest';
import esbuild from 'esbuild';

import { transform } from '../src/transform.js';

function removeFileNameLines (code: string) {
  return code.replace(/^\s*fileName:.*,\n/gm, '');
}

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const templatePath = path.resolve(__dirname, '__fixtures__', 'app.tsx')
const template = await fs.readFile(templatePath, 'utf-8');
const code = removeFileNameLines((await esbuild.transform(template, {
  loader: 'tsx',
  jsx: 'automatic', // Use React 17+ JSX transform
  jsxDev: true,
  sourcefile: templatePath,
})).code);

describe('transform', () => {
  it('should transform the code', async () => {
    const transformedCode = await transform(code, templatePath, {
      from: 'component-library-react',
      module: import('component-library-react'),
      hydrateModule: import('component-library/hydrate'),
      serializeShadowRoot: 'scoped',
    })
    if (!transformedCode) {
      throw new Error('No transformed code')
    }
    expect(removeFileNameLines(transformedCode)).toMatchSnapshot()
  })
})

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
  it('should transform the code using "scoped"', async () => {
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

  it('should transform the code using "declarative-shadow-dom"', async () => {
    const transformedCode = await transform(code, templatePath, {
      from: 'component-library-react',
      module: import('component-library-react'),
      hydrateModule: import('component-library/hydrate'),
      serializeShadowRoot: 'declarative-shadow-dom',
    })
    if (!transformedCode) {
      throw new Error('No transformed code')
    }
    expect(removeFileNameLines(transformedCode)).toMatchSnapshot()
  })
})

describe('transform wrapper element', () => {
  /**
   * Components are rendered through a `display: contents` wrapper. A browser only assigns the direct
   * children of a shadow host to a slot, so the wrapper has to carry the `slot` prop of the component
   * it wraps. Otherwise a component passed to a named slot is never assigned to it.
   */
  const wrapperPattern = /jsxDEV\("div", \{ style: \{ display: "contents" \}[^\n]*/g

  it.each([
    { serializeShadowRoot: 'scoped', strategy: undefined },
    { serializeShadowRoot: 'scoped', strategy: 'nextjs' },
    { serializeShadowRoot: 'declarative-shadow-dom', strategy: 'nextjs' },
  ] as const)('should forward the `slot` prop to every wrapper using "$serializeShadowRoot" and strategy "$strategy"', async ({ serializeShadowRoot, strategy }) => {
    const transformedCode = await transform(code, templatePath, {
      from: 'component-library-react',
      module: import('component-library-react'),
      hydrateModule: import('component-library/hydrate'),
      serializeShadowRoot,
      strategy,
    })
    if (!transformedCode) {
      throw new Error('No transformed code')
    }

    const wrappers = removeFileNameLines(transformedCode).match(wrapperPattern) ?? []
    expect(wrappers.length).toBeGreaterThan(0)
    for (const wrapper of wrappers) {
      expect(wrapper).toContain('slot: props.slot')
    }
  })
})

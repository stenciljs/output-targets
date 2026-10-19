import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { CompilerCtx, ComponentCompilerMeta } from '@stencil/core/internal';
import { afterEach, describe, expect, it } from 'vitest';
import { generateTransformTagScript } from '../src/generate-transformtag-script';
import type { OutputTargetAngular } from '../src/types';

describe('generateTransformTagScript', () => {
  let temporaryDirectory: string | undefined;

  afterEach(async () => {
    if (temporaryDirectory) {
      await rm(temporaryDirectory, { recursive: true, force: true });
      temporaryDirectory = undefined;
    }
  });

  it('injects the tag transformer when the export contains other symbols and newlines', async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'stencil-angular-transform-tag-'));

    const libraryDirectory = join(temporaryDirectory, 'projects', 'library');
    const bundleDirectory = join(libraryDirectory, 'fesm2022');
    const bundlePath = join(bundleDirectory, 'library.mjs');
    const directivesProxyFile = join(libraryDirectory, 'src', 'lib', 'proxies.ts');

    await mkdir(bundleDirectory, { recursive: true });
    await writeFile(
      bundlePath,
      `const MyComponent = { selector: 'my-component' };
const myCustomMethod = () => {};
const setTagTransformer = () => {};

export {
  myCustomMethod,
  setTagTransformer
};
`
    );

    const compilerCtx = {
      fs: {
        writeFile: async (filePath: string, content: string) => {
          await mkdir(dirname(filePath), { recursive: true });
          await writeFile(filePath, content);
        },
      },
    } as unknown as CompilerCtx;
    const components = [{ tagName: 'my-component' }] as ComponentCompilerMeta[];
    const outputTarget = {
      componentCorePackage: '@example/stencil-lib',
      directivesProxyFile,
    } as OutputTargetAngular;

    await generateTransformTagScript(compilerCtx, components, outputTarget, '@example/angular-lib');

    const scriptPath = join(libraryDirectory, 'scripts', 'patch-transform-selectors.mjs');
    execFileSync(process.execPath, [scriptPath, "(tag) => 'v1-' + tag"]);

    const patchedBundle = await readFile(bundlePath, 'utf8');
    expect(patchedBundle).toContain("selector: 'v1-my-component'");
    expect(patchedBundle).toContain('stencilSetTagTransformer');
  });
});

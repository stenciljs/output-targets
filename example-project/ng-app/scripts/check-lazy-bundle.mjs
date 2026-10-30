/**
 * Checks a `lazy` build's esbuild stats: no component's element code may be reachable from the
 * initial chunks through static imports, since every wrapper imports its element when it is
 * created.
 *
 * Usage: pnpm run test.lazy-bundle
 */
import { readFileSync } from 'node:fs';

const statsFile = process.argv[2] ?? 'dist/ng-app/stats.json';
const { outputs } = JSON.parse(readFileSync(statsFile, 'utf8'));

const elementModule = /component-library\/components\/(my-[^/]+)\.js$/;

const elementsIn = (outputNames) =>
  new Set(
    outputNames.flatMap((name) =>
      Object.keys(outputs[name].inputs).flatMap((input) => input.match(elementModule)?.[1] ?? [])
    )
  );

// esbuild reports every `import()` target as an entry point too, so the initial chunks are the
// entry points nothing imports dynamically, plus everything they import statically.
const dynamicImports = new Set(
  Object.values(outputs).flatMap((output) =>
    output.imports.filter((i) => i.kind === 'dynamic-import').map((i) => i.path)
  )
);
const initial = new Set();
const pending = Object.keys(outputs).filter(
  (name) => name.endsWith('.js') && outputs[name].entryPoint && !dynamicImports.has(name)
);
while (pending.length > 0) {
  const name = pending.pop();
  if (initial.has(name)) continue;
  initial.add(name);
  pending.push(...outputs[name].imports.filter((i) => i.kind === 'import-statement').map((i) => i.path));
}

const all = elementsIn(Object.keys(outputs).filter((name) => name.endsWith('.js')));
const inInitial = elementsIn([...initial]);

if (all.size === 0) {
  console.error(`No element modules found in ${statsFile}. Was the app built with --stats-json?`);
  process.exit(1);
}
if (inInitial.size > 0) {
  console.error(`Element code in the initial chunks: ${[...inInitial].sort().join(', ')}`);
  process.exit(1);
}
console.log(`OK: none of the ${all.size} element modules are in the initial chunks.`);

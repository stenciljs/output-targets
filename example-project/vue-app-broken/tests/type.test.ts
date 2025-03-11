import cp from 'node:child_process'
import path from 'node:path'
import url from 'node:url'

import { describe, it, expect } from 'vitest'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

describe('type check', () => {
  it('should fail type check', async () => {
    const result = await new Promise((resolve) => {
      cp.exec(`npx vue-tsc --noEmit -p ${path.resolve(__dirname, '../tsconfig.json')}`, {
        cwd: path.resolve(__dirname, '..'),
      }, (error, stdout, stderr) => resolve(stdout))
    })
    expect(result).toMatchInlineSnapshot(`
      "src/App.vue(7,5): error TS2322: Type 'string' is not assignable to type 'string[]'.
      src/App.vue(9,14): error TS2322: Type '"ups"' is not assignable to type '"clear" | "outline" | "solid" | "default" | undefined'.
      "
    `)
  })
})

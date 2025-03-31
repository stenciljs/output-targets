import cp from 'node:child_process'
import path from 'node:path'
import url from 'node:url'

import { describe, it, expect } from 'vitest'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

describe('type check', () => {
  it('should fail type check', async () => {
    const result = await new Promise<string>((resolve, rejects) => {
      let stdout = ''
      const  child = cp.exec(`npm run build.app`, {
        cwd: path.resolve(__dirname, '..'),
      })
      child.stdout?.on('data', (data) => {
        stdout += data
      })
      child.on('exit', (code) => {
        if (code !== 2) {
          return rejects(new Error(`Command failed with exit code ${code}`))
        }
        resolve(stdout)
      })
    });

    const typeErrors = result.split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('src/App.vue'))
    expect(typeErrors).toMatchInlineSnapshot(`
      [
        "src/App.vue(7,6): error TS2322: Type 'number' is not assignable to type 'string'.",
        "src/App.vue(10,6): error TS2322: Type 'Map<string, { qux: number; }>' is not assignable to type 'Map<string, { qux: symbol; }>'.",
        "src/App.vue(12,14): error TS2322: Type '"ups"' is not assignable to type '"clear" | "outline" | "solid" | "default" | undefined'.",
        "src/App.vue(13,43): error TS2353: Object literal may only specify known properties, and 'para__ms' does not exist in type 'Symbol | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric'.",
      ]
    `)
  })
})

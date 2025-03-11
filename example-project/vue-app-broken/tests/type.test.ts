import cp from 'node:child_process'
import path from 'node:path'
import url from 'node:url'

import { describe, it, expect } from 'vitest'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

describe('type check', () => {
  it('should fail type check', async () => {
    const result = await new Promise((resolve, rejects) => {
      const  child = cp.exec(`npx vue-tsc --noEmit -p ${path.resolve(__dirname, '../tsconfig.json')}`, {
        cwd: path.resolve(__dirname, '..'),
      }, (_, stdout, __) => resolve(stdout))

      child.on('exit', (code) => {
        if (code !== 1) {
          rejects(new Error(`Command failed with exit code ${code}`))
        }
      })

      child.stderr?.on('data', (data) => {
        console.log(data)
      })
    })
    expect(result).toContain(
      `App.vue(7,5): error TS2322: Type 'string' is not assignable to type 'string[]'.`
    )
    expect(result).toContain(
      `App.vue(9,14): error TS2322: Type '"ups"' is not assignable to type '"clear" | "outline" | "solid" | "default" | undefined'.`
    )
  })
})

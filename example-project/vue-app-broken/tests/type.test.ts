import cp from 'node:child_process'
import path from 'node:path'
import url from 'node:url'

import { describe, it, expect } from 'vitest'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

describe('type check', () => {
  it('should fail type check', async () => {
    const result = await new Promise((resolve, rejects) => {
      let stdout = ''
      const  child = cp.exec(`npm run build.app`, {
        cwd: path.resolve(__dirname, '..'),
      })
      child.stdout?.on('data', (data) => {
        stdout += data
      })
      child.on('exit', (code) => {
        if (code !== 2) {
          rejects(new Error(`Command failed with exit code ${code}`))
        }
        resolve(stdout)
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

// Verifikasi vitest configs — phase 2.2.
// 1) 5 file root identik byte-per-byte dengan ORIGINAL
// 2) vitest.shared.ts: parseable, exports vitestExecArgv + standardDecoratorPlugin
// 3) vitest.e2e.config.ts: parseable, imports shared
// 4) vitest.snapshot.config.ts: parseable, imports shared
// 5) vitest.config.ts: byte-identical, catatan jujur: import packages/shell/pwsh-local
//    + scripts/coverage-exempt belum ada (fase 6 + 2.8)
// 6) pytest.ini: byte-identical, valid INI format
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPLICA = join(HERE, '..', '..')
const ORIGINAL = join(REPLICA, '..', 'deepseek-harness')

const ROOT_FILES = [
  'vitest.config.ts',
  'vitest.shared.ts',
  'vitest.e2e.config.ts',
  'vitest.snapshot.config.ts',
  'pytest.ini',
]

test('1. lima file root identik dengan ORIGINAL (diff byte = 0)', () => {
  for (const name of ROOT_FILES) {
    const a = readFileSync(join(REPLICA, name), 'utf8')
    const b = readFileSync(join(ORIGINAL, name), 'utf8')
    assert.equal(a, b, `${name} harus identik dengan ORIGINAL`)
  }
})

test('2. vitest.shared.ts: exports vitestExecArgv + standardDecoratorPlugin', () => {
  const text = readFileSync(join(REPLICA, 'vitest.shared.ts'), 'utf8')
  assert.match(text, /export\s+const\s+vitestExecArgv/)
  assert.match(text, /export\s+function\s+standardDecoratorPlugin/)
  assert.match(text, /import\s+ts\s+from\s+'typescript'/)
})

test('3. vitest.e2e.config.ts: imports shared + defineConfig', () => {
  const text = readFileSync(join(REPLICA, 'vitest.e2e.config.ts'), 'utf8')
  assert.match(text, /import.*from\s+'\.\/vitest\.shared\.ts'/)
  assert.match(text, /defineConfig/)
  assert.match(text, /testTimeout:\s*120_000/)
})

test('4. vitest.snapshot.config.ts: imports shared + DSH_SNAPSHOT env', () => {
  const text = readFileSync(join(REPLICA, 'vitest.snapshot.config.ts'), 'utf8')
  assert.match(text, /import.*from\s+'\.\/vitest\.shared\.ts'/)
  assert.match(text, /DSH_SNAPSHOT/)
  assert.match(text, /defineConfig/)
})

test('5. vitest.config.ts: dependencies sudah ada — packages/shell/pwsh-local + scripts/coverage-exempt (post-phase-12 audit)', () => {
  const text = readFileSync(join(REPLICA, 'vitest.config.ts'), 'utf8')
  assert.match(text, /import.*resolvePwshPath.*from\s+'\.\/packages\/shell\/pwsh-local\/src\/resolve\.ts'/)
  assert.match(text, /import.*coverageExemptHeavySuites.*from\s+'\.\/scripts\/coverage-exempt\.ts'/)
  // Dependencies sudah ada (fase 6+ pwsh-local, fase 2.8 coverage-exempt)
  assert.ok(
    existsSync(join(REPLICA, 'packages', 'shell', 'pwsh-local')),
    'packages/shell/pwsh-local sudah ada — vitest.config.ts siap dijalankan'
  )
  assert.ok(
    existsSync(join(REPLICA, 'scripts', 'coverage-exempt.ts')),
    'scripts/coverage-exempt.ts sudah ada — vitest.config.ts siap dijalankan'
  )
})

test('6. pytest.ini: valid INI format (section [pytest], testpaths, norecursedirs)', () => {
  const text = readFileSync(join(REPLICA, 'pytest.ini'), 'utf8')
  assert.match(text, /\[pytest\]/)
  assert.match(text, /testpaths\s*=\s*python\/sdk\/tests/)
  assert.match(text, /norecursedirs\s*=\s*node_modules/)
})

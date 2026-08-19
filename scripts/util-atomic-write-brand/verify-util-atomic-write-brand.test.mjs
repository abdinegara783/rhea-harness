/**
 * Fidelity tests for Phase 3.1: packages/util/atomic-write + packages/util/brand.
 *
 * Verifies that the REPLICA copies are byte-identical to the ORIGINAL and that
 * key exports, structure, and metadata are preserved.
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

const REPO_ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..', '..')
const ORIG_ROOT = resolve(REPO_ROOT, '..', 'deepseek-harness')

function readRel(base, rel) {
  return readFileSync(resolve(base, rel), 'utf8')
}

function assertByteIdentical(rel) {
  const orig = readRel(ORIG_ROOT, rel)
  const repl = readRel(REPO_ROOT, rel)
  assert.strictEqual(orig, repl, `${rel}: byte-identical with ORIGINAL`)
}

describe('Phase 3.1 — packages/util/atomic-write', () => {
  const PKG = 'packages/util/atomic-write'

  it('1. all source files exist and are byte-identical', () => {
    const files = [
      `${PKG}/src/index.ts`,
      `${PKG}/src/invariant.ts`,
      `${PKG}/package.json`,
      `${PKG}/tsconfig.json`,
      `${PKG}/README.md`,
      `${PKG}/README.zh.md`,
      `${PKG}/README.i18n.yaml`,
      `${PKG}/tests/atomic-write.spec.ts`,
      `${PKG}/tests/invariant.spec.ts`,
    ]
    for (const f of files) {
      assert.ok(existsSync(resolve(REPO_ROOT, f)), `${f}: exists in REPLICA`)
      assertByteIdentical(f)
    }
  })

  it('2. package name is @deepseek-ai/dsh-atomic-write', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, `${PKG}/package.json`))
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-atomic-write')
    assert.strictEqual(pkg.license, 'MIT')
    assert.strictEqual(pkg.type, 'module')
  })

  it('3. exports writeFileAtomic and withFileLock', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /export async function writeFileAtomic/, 'exports writeFileAtomic')
    assert.match(src, /export async function withFileLock/, 'exports withFileLock')
    assert.match(src, /export interface WriteFileAtomicOptions/, 'exports WriteFileAtomicOptions')
  })

  it('4. writeFileAtomic uses exclusive-create (wx) + rename pattern', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /flag: 'wx'/, 'wx flag for exclusive create')
    assert.match(src, /await rename\(temp, filename\)/, 'rename for atomic swap')
    assert.match(src, /randomBytes/, 'random suffix for temp file')
  })

  it('5. withFileLock uses exponential backoff with timeout', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /LOCK_RETRY_INITIAL_MS = 20/, 'initial retry 20ms')
    assert.match(src, /LOCK_RETRY_MAX_MS = 200/, 'max retry 200ms')
    assert.match(src, /LOCK_TIMEOUT_MS = 2_000/, 'timeout 2s')
    assert.match(src, /delay \* 2/, 'exponential backoff')
  })

  it('6. invariant companion registers with Cordis', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/invariant.ts`)
    assert.match(src, /name = 'atomic-write-invariant'/, 'companion name')
    assert.match(src, /inject = \['invariants'\]/, 'injects invariants service')
    assert.match(src, /ctx\.invariants\.register/, 'registers with invariants')
  })

  it('7. tsconfig extends root and references invariants', () => {
    const tsconfig = JSON.parse(readRel(REPO_ROOT, `${PKG}/tsconfig.json`))
    assert.strictEqual(tsconfig.extends, '../../../tsconfig.base.json')
    assert.deepStrictEqual(tsconfig.references, [{ path: '../../runtime-diagnostics/invariants' }])
  })

  it('8. i18n YAML has git blob hashes for bilingual pair', () => {
    const yaml = readRel(REPO_ROOT, `${PKG}/README.i18n.yaml`)
    assert.match(yaml, /README\.md: [a-f0-9]{40}/, 'English blob hash')
    assert.match(yaml, /README\.zh\.md: [a-f0-9]{40}/, 'Chinese blob hash')
  })

  it('9. test file has 5 test cases covering writeFileAtomic + withFileLock', () => {
    const spec = readRel(REPO_ROOT, `${PKG}/tests/atomic-write.spec.ts`)
    const itCount = (spec.match(/\bit\(/g) || []).length
    assert.strictEqual(itCount, 5, `5 test cases, ada ${itCount}`)
    assert.match(spec, /describe\('writeFileAtomic'/, 'writeFileAtomic describe block')
    assert.match(spec, /describe\('withFileLock'/, 'withFileLock describe block')
  })
})

describe('Phase 3.1 — packages/util/brand', () => {
  const PKG = 'packages/util/brand'

  it('10. all source files exist and are byte-identical', () => {
    const files = [
      `${PKG}/src/index.ts`,
      `${PKG}/src/invariant.ts`,
      `${PKG}/package.json`,
      `${PKG}/tsconfig.json`,
      `${PKG}/README.md`,
      `${PKG}/README.zh.md`,
      `${PKG}/README.i18n.yaml`,
    ]
    for (const f of files) {
      assert.ok(existsSync(resolve(REPO_ROOT, f)), `${f}: exists in REPLICA`)
      assertByteIdentical(f)
    }
  })

  it('11. package name is @deepseek-ai/dsh-brand', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, `${PKG}/package.json`))
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-brand')
    assert.strictEqual(pkg.license, 'MIT')
    assert.strictEqual(pkg.type, 'module')
  })

  it('12. exports Branded<B> type-only primitive', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /export type Branded<B extends string>/, 'exports Branded<B>')
    assert.match(src, /declare const BRAND: unique symbol/, 'BRAND symbol declaration')
    assert.match(src, /readonly \[BRAND\]: B/, 'brand intersection type')
  })

  it('13. brand package has no tests directory (type-only, no runtime)', () => {
    assert.ok(!existsSync(resolve(REPO_ROOT, `${PKG}/tests`)), 'brand/tests should not exist')
  })

  it('14. invariant companion registers with Cordis', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/invariant.ts`)
    assert.match(src, /name = 'brand-invariant'/, 'companion name')
    assert.match(src, /inject = \['invariants'\]/, 'injects invariants service')
    assert.match(src, /ctx\.invariants\.register/, 'registers with invariants')
  })

  it('15. README explains brand policy: cross-boundary ids only', () => {
    const readme = readRel(REPO_ROOT, `${PKG}/README.md`)
    assert.match(readme, /brand ids that cross package boundaries/, 'brand policy')
    assert.match(readme, /SessionId/, 'mentions SessionId example')
    assert.match(readme, /CallId/, 'mentions CallId example')
    assert.match(readme, /JobId/, 'mentions JobId example')
  })

  it('16. Chinese README is a faithful translation', () => {
    const zh = readRel(REPO_ROOT, `${PKG}/README.zh.md`)
    assert.match(zh, /名义类型原语/, 'Chinese: nominal typing primitive')
    assert.match(zh, /品牌使/, 'Chinese: brand makes')
    assert.match(zh, /跨包边界/, 'Chinese: cross-package boundary')
  })

  it('17. honest note: vitest tests cannot run yet', () => {
    // atomic-write.spec.ts imports vitest + @deepseek-ai/cordis — needs full pnpm install
    // brand has no tests (type-only package)
    const spec = readRel(REPO_ROOT, 'packages/util/atomic-write/tests/atomic-write.spec.ts')
    assert.match(spec, /from 'vitest'/)
    const invSpec = readRel(REPO_ROOT, 'packages/util/atomic-write/tests/invariant.spec.ts')
    assert.match(invSpec, /from 'vitest'/)
  })
})

/**
 * Fidelity tests for Phase 3.4: packages/identity/anonymous-user-id.
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

const PKG = 'packages/identity/anonymous-user-id'

describe('Phase 3.4 — packages/identity/anonymous-user-id', () => {
  it('1. all source files exist and are byte-identical', () => {
    const files = [
      'src/index.ts', 'src/invariant.ts', 'package.json', 'tsconfig.json',
      'README.md', 'README.zh.md', 'README.i18n.yaml',
      'tests/anonymous-user-id.spec.ts', 'tests/invariant.spec.ts',
    ]
    for (const f of files) {
      assertByteIdentical(`${PKG}/${f}`)
    }
  })

  it('2. package.json has correct metadata', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, `${PKG}/package.json`))
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-anonymous-user-id')
    assert.strictEqual(pkg.version, '0.1.0-rc.5')
    assert.match(pkg.description, /anonymous user identity/)
    assert.strictEqual(pkg.type, 'module')
    assert.strictEqual(pkg.main, 'lib/index.js')
    // Peer dependencies
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-brand'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-home-paths'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-invariants'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/cordis'])
  })

  it('3. exports getOrCreateAnonymousUserId and AnonymousUserId type', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /export type AnonymousUserId = Branded<'AnonymousUserId'>/)
    assert.match(src, /export const ANONYMOUS_USER_ID_FILE_NAME/)
    assert.match(src, /export function getOrCreateAnonymousUserId/)
    assert.match(src, /import type \{ Branded \} from '@deepseek-ai\/dsh-brand'/)
    assert.match(src, /import \{ resolveDshHome \} from '@deepseek-ai\/dsh-home-paths'/)
  })

  it('4. uses exclusive-create (wx flag) for concurrent safety', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /flag: 'wx'/)
    assert.match(src, /randomUUID/)
    assert.match(src, /UUID_PATTERN/)
  })

  it('5. memoizes per resolved file path', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /const memo = new Map/)
    assert.match(src, /memo\.get\(file\)/)
    assert.match(src, /memo\.set\(file, id\)/)
  })

  it('6. best-effort persistence (write failure still returns id)', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /Best-effort persistence/)
    // Has nested try/catch for write failures
    const catchCount = (src.match(/\bcatch\b/g) || []).length
    assert.ok(catchCount >= 2, `setidaknya 2 catch blocks, ada ${catchCount}`)
  })

  it('7. invariant companion has correct name', () => {
    const inv = readRel(REPO_ROOT, `${PKG}/src/invariant.ts`)
    assert.match(inv, /anonymous-user-id-invariant/)
    assert.match(inv, /@deepseek-ai\/dsh-anonymous-user-id/)
  })

  it('8. tsconfig has references to brand, home-paths, and invariants', () => {
    const tsconfig = JSON.parse(readRel(REPO_ROOT, `${PKG}/tsconfig.json`))
    assert.ok(tsconfig.references, 'punya references')
    const paths = tsconfig.references.map(r => r.path)
    assert.ok(paths.some(p => p.includes('util/brand')), 'reference ke util/brand')
    assert.ok(paths.some(p => p.includes('util/home-paths')), 'reference ke util/home-paths')
    assert.ok(paths.some(p => p.includes('runtime-diagnostics/invariants')), 'reference ke runtime-diagnostics/invariants')
  })

  it('9. test spec has 9 test cases for main + 1 for invariant', () => {
    const spec = readRel(REPO_ROOT, `${PKG}/tests/anonymous-user-id.spec.ts`)
    const testCount = (spec.match(/\bit\(/g) || []).length
    assert.strictEqual(testCount, 9, `9 test kasus di anonymous-user-id.spec.ts, ada ${testCount}`)

    const invSpec = readRel(REPO_ROOT, `${PKG}/tests/invariant.spec.ts`)
    const invTestCount = (invSpec.match(/\bit\(/g) || []).length
    assert.strictEqual(invTestCount, 1, `1 test kasus di invariant.spec.ts, ada ${invTestCount}`)
  })

  it('10. i18n YAML has git blob hashes', () => {
    const yaml = readRel(REPO_ROOT, `${PKG}/README.i18n.yaml`)
    assert.match(yaml, /README\.md: [0-9a-f]{40}/, 'README.md blob hash')
    assert.match(yaml, /README\.zh\.md: [0-9a-f]{40}/, 'README.zh.md blob hash')
  })

  it('11. Chinese translation exists and has content', () => {
    const zh = readRel(REPO_ROOT, `${PKG}/README.zh.md`)
    assert.match(zh, /匿名身份/)
    assert.match(zh, /UUID/)
  })

  it('12. total 9 files copied', () => {
    const expected = [
      'packages/identity/anonymous-user-id/src/index.ts',
      'packages/identity/anonymous-user-id/src/invariant.ts',
      'packages/identity/anonymous-user-id/package.json',
      'packages/identity/anonymous-user-id/tsconfig.json',
      'packages/identity/anonymous-user-id/README.md',
      'packages/identity/anonymous-user-id/README.zh.md',
      'packages/identity/anonymous-user-id/README.i18n.yaml',
      'packages/identity/anonymous-user-id/tests/anonymous-user-id.spec.ts',
      'packages/identity/anonymous-user-id/tests/invariant.spec.ts',
    ]
    for (const f of expected) {
      assert.ok(existsSync(resolve(REPO_ROOT, f)), `exists: ${f}`)
    }
    assert.strictEqual(expected.length, 9)
  })

  it('13. honest note: vitest tests cannot run yet', () => {
    // anonymous-user-id.spec.ts imports vitest + @deepseek-ai/cordis — needs full pnpm install
    // invariant.spec.ts imports vitest + cordis + dsh-invariants
    const spec = readRel(REPO_ROOT, 'packages/identity/anonymous-user-id/tests/anonymous-user-id.spec.ts')
    assert.match(spec, /from 'vitest'/)
    const invSpec = readRel(REPO_ROOT, 'packages/identity/anonymous-user-id/tests/invariant.spec.ts')
    assert.match(invSpec, /from 'vitest'/)
  })
})

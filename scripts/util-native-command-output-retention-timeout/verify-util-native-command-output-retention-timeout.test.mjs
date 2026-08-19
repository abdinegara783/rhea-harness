/**
 * Fidelity tests for Phase 3.3: packages/util/native-command + output-retention + timeout.
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

// ─── native-command ──────────────────────────────────────────────────────

describe('Phase 3.3 — packages/util/native-command', () => {
  const PKG = 'packages/util/native-command'

  it('1. all source files exist and are byte-identical', () => {
    const files = [
      'src/index.ts', 'src/invariant.ts', 'package.json', 'tsconfig.json',
      'README.md', 'README.zh.md', 'README.i18n.yaml',
      'tests/native-command.spec.ts',
    ]
    for (const f of files) {
      assertByteIdentical(`${PKG}/${f}`)
    }
  })

  it('2. package.json has correct metadata', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, `${PKG}/package.json`))
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-native-command')
    assert.strictEqual(pkg.version, '0.1.0-rc.5')
    assert.match(pkg.description, /no-shell.*execFile/)
    assert.strictEqual(pkg.type, 'module')
    assert.strictEqual(pkg.main, 'lib/index.js')
    assert.ok(pkg.peerDependencies['@deepseek-ai/cordis'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-invariants'])
  })

  it('3. exports runNativeCommand and NativeCommandRunner type', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /export type NativeCommandRunner/)
    assert.match(src, /export const runNativeCommand/)
    assert.match(src, /import \{ execFile \} from 'node:child_process'/)
    assert.match(src, /windowsHide: true/)
  })

  it('4. invariant companion has correct name', () => {
    const inv = readRel(REPO_ROOT, `${PKG}/src/invariant.ts`)
    assert.match(inv, /native-command-invariant/)
    assert.match(inv, /@deepseek-ai\/dsh-native-command/)
  })

  it('5. test spec has 4 test cases', () => {
    const spec = readRel(REPO_ROOT, `${PKG}/tests/native-command.spec.ts`)
    const testCount = (spec.match(/\bit\(/g) || []).length
    assert.strictEqual(testCount, 4, `4 test cases, ada ${testCount}`)
  })
})

// ─── output-retention ────────────────────────────────────────────────────

describe('Phase 3.3 — packages/util/output-retention', () => {
  const PKG = 'packages/util/output-retention'

  it('1. all source files exist and are byte-identical', () => {
    const files = [
      'src/index.ts', 'src/invariant.ts', 'package.json', 'tsconfig.json',
      'README.md', 'README.zh.md', 'README.i18n.yaml',
      'tests/output-retention.spec.ts',
    ]
    for (const f of files) {
      assertByteIdentical(`${PKG}/${f}`)
    }
  })

  it('2. package.json has correct metadata', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, `${PKG}/package.json`))
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-output-retention')
    assert.strictEqual(pkg.version, '0.1.0-rc.5')
    assert.match(pkg.description, /bounded-retention/)
    assert.strictEqual(pkg.type, 'module')
  })

  it('3. exports ItemRetainer, TextRetainer, describeOmitted, formatRetentionNotice', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /export class ItemRetainer/)
    assert.match(src, /export class TextRetainer/)
    assert.match(src, /export function describeOmitted/)
    assert.match(src, /export function formatRetentionNotice/)
    assert.match(src, /export type Omitted/)
    assert.match(src, /export interface PushDecision/)
    assert.match(src, /export interface RetainedItems/)
    assert.match(src, /export interface RetainedText/)
  })

  it('4. TextRetainer supports head, tail, headTail strategies', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /kind: 'head'/)
    assert.match(src, /kind: 'tail'/)
    assert.match(src, /kind: 'headTail'/)
    assert.match(src, /trimTrailingPartialUtf8/)
    assert.match(src, /trimLeadingContinuationUtf8/)
  })

  it('5. invariant companion has correct name', () => {
    const inv = readRel(REPO_ROOT, `${PKG}/src/invariant.ts`)
    assert.match(inv, /output-retention-invariant/)
  })

  it('6. test spec has many test cases (comprehensive)', () => {
    const spec = readRel(REPO_ROOT, `${PKG}/tests/output-retention.spec.ts`)
    const testCount = (spec.match(/\bit\(/g) || []).length
    assert.ok(testCount >= 25, `setidaknya 25 test kasus, ada ${testCount}`)
  })
})

// ─── timeout ─────────────────────────────────────────────────────────────

describe('Phase 3.3 — packages/util/timeout', () => {
  const PKG = 'packages/util/timeout'

  it('1. all source files exist and are byte-identical', () => {
    const files = [
      'src/index.ts', 'src/invariant.ts', 'package.json', 'tsconfig.json',
      'README.md', 'README.zh.md', 'README.i18n.yaml',
      'tests/timeout.spec.ts',
    ]
    for (const f of files) {
      assertByteIdentical(`${PKG}/${f}`)
    }
  })

  it('2. package.json has correct metadata', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, `${PKG}/package.json`))
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-timeout')
    assert.strictEqual(pkg.version, '0.1.0-rc.5')
    assert.match(pkg.description, /timeout\/deadline/)
    assert.strictEqual(pkg.type, 'module')
  })

  it('3. exports clampTimeout, deadline, idleWatchdog, timeoutOf, TimeoutReason, MAX_TIMER_DELAY_MS', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /export class TimeoutReason/)
    assert.match(src, /export const MAX_TIMER_DELAY_MS/)
    assert.match(src, /export function clampTimeout/)
    assert.match(src, /export function deadline/)
    assert.match(src, /export function idleWatchdog/)
    assert.match(src, /export function timeoutOf/)
  })

  it('4. deadline uses AbortSignal.any for signal fusion', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /AbortSignal\.any/)
    assert.match(src, /Symbol\.dispose/)
    assert.match(src, /TimeoutReason\(code, timeoutMs\)/)
  })

  it('5. MAX_TIMER_DELAY_MS is 2_147_483_647', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /2_147_483_647/)
  })

  it('6. invariant companion has correct name', () => {
    const inv = readRel(REPO_ROOT, `${PKG}/src/invariant.ts`)
    assert.match(inv, /timeout-invariant/)
  })

  it('7. test spec has many test cases (comprehensive)', () => {
    const spec = readRel(REPO_ROOT, `${PKG}/tests/timeout.spec.ts`)
    const testCount = (spec.match(/\bit\(/g) || []).length
    assert.ok(testCount >= 20, `setidaknya 20 test kasus, ada ${testCount}`)
  })

  it('8. Chinese translation exists and has content', () => {
    const zh = readRel(REPO_ROOT, `${PKG}/README.zh.md`)
    assert.match(zh, /时序与分类/)
    assert.match(zh, /deadline/)
  })
})

// ─── cross-package ───────────────────────────────────────────────────────

describe('Phase 3.3 — cross-package checks', () => {
  it('1. all 3 packages have tsconfig references to runtime-diagnostics/invariants', () => {
    for (const pkg of ['native-command', 'output-retention', 'timeout']) {
      const tsconfig = JSON.parse(readRel(REPO_ROOT, `packages/util/${pkg}/tsconfig.json`))
      assert.ok(tsconfig.references, `${pkg}: punya references`)
      assert.ok(
        tsconfig.references.some(r => r.path.includes('runtime-diagnostics/invariants')),
        `${pkg}: reference ke runtime-diagnostics/invariants`,
      )
    }
  })

  it('2. i18n YAML files have git blob hashes', () => {
    for (const pkg of ['native-command', 'output-retention', 'timeout']) {
      const yaml = readRel(REPO_ROOT, `packages/util/${pkg}/README.i18n.yaml`)
      assert.match(yaml, /README\.md: [0-9a-f]{40}/, `${pkg}: README.md blob hash`)
      assert.match(yaml, /README\.zh\.md: [0-9a-f]{40}/, `${pkg}: README.zh.md blob hash`)
    }
  })

  it('3. total 24 files copied across 3 packages', () => {
    const expected = [
      'packages/util/native-command/src/index.ts',
      'packages/util/native-command/src/invariant.ts',
      'packages/util/native-command/package.json',
      'packages/util/native-command/tsconfig.json',
      'packages/util/native-command/README.md',
      'packages/util/native-command/README.zh.md',
      'packages/util/native-command/README.i18n.yaml',
      'packages/util/native-command/tests/native-command.spec.ts',
      'packages/util/output-retention/src/index.ts',
      'packages/util/output-retention/src/invariant.ts',
      'packages/util/output-retention/package.json',
      'packages/util/output-retention/tsconfig.json',
      'packages/util/output-retention/README.md',
      'packages/util/output-retention/README.zh.md',
      'packages/util/output-retention/README.i18n.yaml',
      'packages/util/output-retention/tests/output-retention.spec.ts',
      'packages/util/timeout/src/index.ts',
      'packages/util/timeout/src/invariant.ts',
      'packages/util/timeout/package.json',
      'packages/util/timeout/tsconfig.json',
      'packages/util/timeout/README.md',
      'packages/util/timeout/README.zh.md',
      'packages/util/timeout/README.i18n.yaml',
      'packages/util/timeout/tests/timeout.spec.ts',
    ]
    for (const f of expected) {
      assert.ok(existsSync(resolve(REPO_ROOT, f)), `exists: ${f}`)
    }
    assert.strictEqual(expected.length, 24)
  })

  it('23. honest note: vitest tests cannot run yet', () => {
    // native-command.spec.ts imports vitest + @deepseek-ai/cordis — needs full pnpm install
    // output-retention.spec.ts imports vitest + cordis
    // timeout.spec.ts imports vitest + cordis
    const nativeSpec = readRel(REPO_ROOT, 'packages/util/native-command/tests/native-command.spec.ts')
    assert.match(nativeSpec, /from 'vitest'/)
    const retentionSpec = readRel(REPO_ROOT, 'packages/util/output-retention/tests/output-retention.spec.ts')
    assert.match(retentionSpec, /from 'vitest'/)
    const timeoutSpec = readRel(REPO_ROOT, 'packages/util/timeout/tests/timeout.spec.ts')
    assert.match(timeoutSpec, /from 'vitest'/)
  })
})

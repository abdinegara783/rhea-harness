/**
 * Verifikasi fidelitas phase 5.9: guard (repeat-tool-reminder, timeout-policy) + plan (plan-mode).
 * 15 tes — byte-identical fidelity, metadata, exports API, invariant pattern, test spec count, README, terjemahan Mandarin.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..', '..')
const ORIG = resolve(ROOT, '..', 'deepseek-harness')
const REPL = ROOT

/** Daftar semua berkas sumber yang harus identik (tidak termasuk lib/ dan node_modules/). */
const SOURCE_FILES = [
  // guard group-level
  'packages/guard/README.md',
  'packages/guard/README.zh.md',
  'packages/guard/README.i18n.yaml',
  // repeat-tool-reminder
  'packages/guard/repeat-tool-reminder/package.json',
  'packages/guard/repeat-tool-reminder/tsconfig.json',
  'packages/guard/repeat-tool-reminder/src/index.ts',
  'packages/guard/repeat-tool-reminder/src/invariant.ts',
  'packages/guard/repeat-tool-reminder/tests/repeat-tool-reminder.spec.ts',
  'packages/guard/repeat-tool-reminder/README.md',
  'packages/guard/repeat-tool-reminder/README.zh.md',
  'packages/guard/repeat-tool-reminder/README.i18n.yaml',
  // timeout-policy
  'packages/guard/timeout-policy/package.json',
  'packages/guard/timeout-policy/tsconfig.json',
  'packages/guard/timeout-policy/src/index.ts',
  'packages/guard/timeout-policy/src/invariant.ts',
  'packages/guard/timeout-policy/tests/timeout-policy.spec.ts',
  'packages/guard/timeout-policy/README.md',
  'packages/guard/timeout-policy/README.zh.md',
  'packages/guard/timeout-policy/README.i18n.yaml',
  // plan group-level
  'packages/plan/README.md',
  'packages/plan/README.zh.md',
  'packages/plan/README.i18n.yaml',
  // plan-mode
  'packages/plan/plan-mode/package.json',
  'packages/plan/plan-mode/tsconfig.json',
  'packages/plan/plan-mode/src/index.ts',
  'packages/plan/plan-mode/src/invariant.ts',
  'packages/plan/plan-mode/src/types.ts',
  'packages/plan/plan-mode/src/client.ts',
  'packages/plan/plan-mode/tests/plan-mode.spec.ts',
  'packages/plan/plan-mode/tests/integration.spec.ts',
  'packages/plan/plan-mode/tests/invariant.spec.ts',
  'packages/plan/plan-mode/tests/projection.spec.ts',
  'packages/plan/plan-mode/README.md',
  'packages/plan/plan-mode/README.zh.md',
  'packages/plan/plan-mode/README.i18n.yaml',
]

function read(path) {
  return readFileSync(resolve(REPL, path), 'utf8')
}

function readOrig(path) {
  return readFileSync(resolve(ORIG, path), 'utf8')
}

describe('Phase 5.9 — Guard & Plan Mode verification', () => {
  // 1. Fidelitas byte-identik
  it('1 — semua 34 berkas sumber identik byte-demi-byte', () => {
    for (const f of SOURCE_FILES) {
      const orig = readOrig(f)
      const repl = read(f)
      assert.equal(repl, orig, `Perbedaan terdeteksi di ${f}`)
    }
    assert.equal(SOURCE_FILES.length, 35)
  })

  // 2. Metadata repeat-tool-reminder
  it('2 — metadata paket repeat-tool-reminder', () => {
    const pkg = JSON.parse(read('packages/guard/repeat-tool-reminder/package.json'))
    assert.equal(pkg.name, '@deepseek-ai/dsh-repeat-tool-reminder')
    assert.equal(pkg.version, '0.1.0-rc.5')
    assert.ok(pkg.exports['.'])
    assert.ok(pkg.exports['./invariant'])
    assert.ok(pkg.exports['./src/*'])
    assert.ok(pkg.exports['./package.json'])
  })

  // 3. Metadata timeout-policy
  it('3 — metadata paket timeout-policy', () => {
    const pkg = JSON.parse(read('packages/guard/timeout-policy/package.json'))
    assert.equal(pkg.name, '@deepseek-ai/dsh-tool-call-timeout-policy')
    assert.ok(pkg.exports['.'])
    assert.ok(pkg.exports['./invariant'])
  })

  // 4. Metadata plan-mode
  it('4 — metadata paket plan-mode', () => {
    const pkg = JSON.parse(read('packages/plan/plan-mode/package.json'))
    assert.equal(pkg.name, '@deepseek-ai/dsh-plan-mode')
    assert.ok(pkg.exports['.'])
    assert.ok(pkg.exports['./invariant'])
    assert.ok(pkg.exports['./types'])
    assert.ok(pkg.exports['./client'])
  })

  // 5. Export API repeat-tool-reminder
  it('5 — export API repeat-tool-reminder', () => {
    const src = read('packages/guard/repeat-tool-reminder/src/index.ts')
    assert.match(src, /export const name = 'repeat-tool-reminder'/)
    assert.match(src, /export function apply\(ctx: Context, config: Config\)/)
    assert.match(src, /export interface Config/)
    assert.match(src, /export const Config/)
  })

  // 6. Export API timeout-policy
  it('6 — export API timeout-policy', () => {
    const src = read('packages/guard/timeout-policy/src/index.ts')
    assert.match(src, /export const TOOL_TIMEOUT = 'TOOL_TIMEOUT'/)
    assert.match(src, /export const name = 'timeout-policy'/)
    assert.match(src, /export const inject = \['tools'\]/)
    assert.match(src, /export function apply\(ctx: Context\)/)
  })

  // 7. Export API plan-mode
  it('7 — export API plan-mode', () => {
    const src = read('packages/plan/plan-mode/src/index.ts')
    assert.match(src, /export const EXIT_PLAN_MODE = 'exit_plan_mode'/)
    assert.match(src, /export function foldPlanMode/)
    assert.match(src, /export function resolveConfig/)
    assert.match(src, /export class PlanModeController/)
    assert.match(src, /export default PlanModeController/)
  })

  // 8. Plan-mode types
  it('8 — PlanProjection interface di types.ts', () => {
    const src = read('packages/plan/plan-mode/src/types.ts')
    assert.match(src, /export interface PlanProjection/)
    assert.match(src, /active: boolean/)
    assert.match(src, /pending: boolean/)
    assert.match(src, /SessionProjectionMap/)
  })

  // 9. Plan-mode client re-export
  it('9 — client.ts re-export dari types.ts', () => {
    const src = read('packages/plan/plan-mode/src/client.ts')
    assert.match(src, /export type \* from '\.\/types\.ts'/)
  })

  // 10. Invariant companion pattern (ketiga paket)
  it('10 — invariant companion pattern di ketiga paket', () => {
    for (const inv of [
      'packages/guard/repeat-tool-reminder/src/invariant.ts',
      'packages/guard/timeout-policy/src/invariant.ts',
      'packages/plan/plan-mode/src/invariant.ts',
    ]) {
      const src = read(inv)
      assert.match(src, /export const name =/)
      assert.match(src, /export const inject = \['invariants'\]/)
      assert.match(src, /export const apply/)
    }
  })

  // 11. Test spec count
  it('11 — test spec files ada di setiap paket', () => {
    // repeat-tool-reminder: 1 test file
    const rtr = read('packages/guard/repeat-tool-reminder/tests/repeat-tool-reminder.spec.ts')
    const rtrIts = (rtr.match(/\bit\(/g) || []).length
    assert.ok(rtrIts >= 14, `repeat-tool-reminder: ${rtrIts} it() — minimal 14`)

    // timeout-policy: 1 test file
    const tp = read('packages/guard/timeout-policy/tests/timeout-policy.spec.ts')
    const tpIts = (tp.match(/\bit\(/g) || []).length
    assert.ok(tpIts >= 10, `timeout-policy: ${tpIts} it() — minimal 10`)

    // plan-mode: 4 test files
    const pm = read('packages/plan/plan-mode/tests/plan-mode.spec.ts')
    const pmIts = (pm.match(/\bit\(/g) || []).length
    assert.ok(pmIts >= 30, `plan-mode.spec: ${pmIts} it() — minimal 30`)

    const integ = read('packages/plan/plan-mode/tests/integration.spec.ts')
    assert.ok((integ.match(/\bit\(/g) || []).length >= 3)

    const inv = read('packages/plan/plan-mode/tests/invariant.spec.ts')
    assert.ok((inv.match(/\bit\(/g) || []).length >= 5)

    const proj = read('packages/plan/plan-mode/tests/projection.spec.ts')
    assert.ok((proj.match(/\bit\(/g) || []).length >= 5)
  })

  // 12. tsconfig references
  it('12 — tsconfig references mengarah ke dependensi yang benar', () => {
    const rtrTs = JSON.parse(read('packages/guard/repeat-tool-reminder/tsconfig.json'))
    const rtrPaths = rtrTs.references.map(r => r.path)
    assert.ok(rtrPaths.includes('../../../vendor/cordis'))
    assert.ok(rtrPaths.includes('../../core/tools'))
    assert.ok(rtrPaths.includes('../../core/agent'))

    const tpTs = JSON.parse(read('packages/guard/timeout-policy/tsconfig.json'))
    const tpPaths = tpTs.references.map(r => r.path)
    assert.ok(tpPaths.includes('../../util/timeout'))
    assert.ok(tpPaths.includes('../../core/tools'))

    const pmTs = JSON.parse(read('packages/plan/plan-mode/tsconfig.json'))
    const pmPaths = pmTs.references.map(r => r.path)
    assert.ok(pmPaths.includes('../../core/tools'))
    assert.ok(pmPaths.includes('../../core/agent'))
    assert.ok(pmPaths.includes('../../core/system-prompt'))
    assert.ok(pmPaths.includes('../../interaction/user-questions'))
  })

  // 13. README trust model
  it('13 — README.md setiap paket berisi deskripsi lengkap', () => {
    const rtrReadme = read('packages/guard/repeat-tool-reminder/README.md')
    assert.match(rtrReadme, /@deepseek-ai\/dsh-repeat-tool-reminder/)
    assert.match(rtrReadme, /Config/)
    assert.match(rtrReadme, /Chain semantics/)
    assert.match(rtrReadme, /Model Experience/)

    const tpReadme = read('packages/guard/timeout-policy/README.md')
    assert.match(tpReadme, /dsh-tool-call-timeout-policy/)
    assert.match(tpReadme, /Cooperative/)
    assert.match(tpReadme, /Model Experience/)

    const pmReadme = read('packages/plan/plan-mode/README.md')
    assert.match(pmReadme, /@deepseek-ai\/dsh-plan-mode/)
    assert.match(pmReadme, /Durable state/)
    assert.match(pmReadme, /Configuration/)
  })

  // 14. Chinese translation
  it('14 — README.zh.md terjemahan Mandarin ada di setiap paket', () => {
    for (const zh of [
      'packages/guard/README.zh.md',
      'packages/guard/repeat-tool-reminder/README.zh.md',
      'packages/guard/timeout-policy/README.zh.md',
      'packages/plan/README.zh.md',
      'packages/plan/plan-mode/README.zh.md',
    ]) {
      const content = read(zh)
      assert.ok(content.length > 100, `${zh} terlalu pendek — terjemahan mungkin hilang`)
      // Harus mengandung karakter CJK
      assert.ok(/[\u4e00-\u9fff]/.test(content), `${zh} tidak mengandung karakter Mandarin`)
    }
  })

  // 15. File count
  it('15 — total 35 berkas sumber diduplikasi', () => {
    assert.equal(SOURCE_FILES.length, 35)
    // Verifikasi setiap berkas benar-benar ada di REPLICA
    for (const f of SOURCE_FILES) {
      const content = read(f)
      assert.ok(content.length > 0, `${f} kosong atau tidak ada`)
    }
  })
})

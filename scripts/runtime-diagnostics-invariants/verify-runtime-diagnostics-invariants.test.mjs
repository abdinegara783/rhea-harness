/**
 * Fidelity tests for Phase 3.6: packages/runtime-diagnostics/invariants.
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

const ALL_FILES = [
  'packages/runtime-diagnostics/invariants/src/index.ts',
  'packages/runtime-diagnostics/invariants/src/invariant.ts',
  'packages/runtime-diagnostics/invariants/tests/service.spec.ts',
  'packages/runtime-diagnostics/invariants/package.json',
  'packages/runtime-diagnostics/invariants/tsconfig.json',
  'packages/runtime-diagnostics/invariants/README.md',
  'packages/runtime-diagnostics/invariants/README.zh.md',
  'packages/runtime-diagnostics/invariants/README.i18n.yaml',
]

describe('Phase 3.6 — packages/runtime-diagnostics/invariants', () => {
  it('1. all source files exist in REPLICA', () => {
    for (const f of ALL_FILES) {
      assert.ok(existsSync(resolve(REPO_ROOT, f)), `${f} exists`)
    }
  })

  it('2. all files are byte-identical with ORIGINAL', () => {
    for (const f of ALL_FILES) assertByteIdentical(f)
  })

  it('3. package.json metadata is correct', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/package.json'))
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-invariants')
    assert.strictEqual(pkg.type, 'module')
    assert.strictEqual(pkg.version, '0.1.0-rc.5')
    assert.ok(pkg.peerDependencies['@deepseek-ai/cordis'])
    assert.ok(pkg.dependencies['@deepseek-ai/schemastery'])
  })

  it('4. src/index.ts exports key symbols', () => {
    const src = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/src/index.ts')
    assert.match(src, /export class InvariantRegistry extends Service/)
    assert.match(src, /export class InvariantError extends Error/)
    assert.match(src, /export interface Config/)
    assert.match(src, /export interface InvariantInstaller/)
    assert.match(src, /export type InvariantFailure/)
    assert.match(src, /export default InvariantRegistry/)
  })

  it('5. InvariantError has stable code INVARIANT', () => {
    const src = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/src/index.ts')
    assert.match(src, /readonly code = 'INVARIANT' as const/)
    assert.match(src, /readonly packageName: string/)
  })

  it('6. Config interface has enabled, package_allowlist, package_blocklist', () => {
    const src = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/src/index.ts')
    assert.match(src, /readonly enabled\?: boolean/)
    assert.match(src, /readonly package_allowlist\?: string\[\]/)
    assert.match(src, /readonly package_blocklist\?: string\[\]/)
  })

  it('7. compilePatterns validates regex patterns', () => {
    const src = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/src/index.ts')
    assert.match(src, /function compilePatterns/)
    assert.match(src, /non-blank/)
    assert.match(src, /surrounding whitespace/)
    assert.match(src, /duplicate regex/)
    assert.match(src, /invalid regex/)
  })

  it('8. InvariantRegistry.register validates packageName and reserves ownership', () => {
    const src = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/src/index.ts')
    assert.match(src, /register\(packageName: string, installer: InvariantInstaller\)/)
    assert.match(src, /packageName must be non-blank/)
    assert.match(src, /already registered/)
    assert.match(src, /this\.registrations\.has\(packageName\)/)
  })

  it('9. src/invariant.ts registers companion', () => {
    const src = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/src/invariant.ts')
    assert.match(src, /invariants-invariant/)
    assert.match(src, /inject.*invariants/)
    assert.match(src, /@deepseek-ai\/dsh-invariants/)
    assert.match(src, /ctx\.invariants\.register/)
  })

  it('10. tsconfig references are correct', () => {
    const tsconfig = JSON.parse(readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/tsconfig.json'))
    const refs = tsconfig.references.map(r => r.path)
    assert.ok(refs.some(r => r.includes('vendor/cosmokit')))
    assert.ok(refs.some(r => r.includes('vendor/cordis')))
    assert.ok(refs.some(r => r.includes('vendor/schemastery')))
  })

  it('11. test spec files count is correct', () => {
    const testFiles = ALL_FILES.filter(f => f.match(/\.spec\.ts$/))
    assert.strictEqual(testFiles.length, 1, '1 spec file: service')
  })

  it('12. i18n YAML has blob hashes', () => {
    const content = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/README.i18n.yaml')
    assert.match(content, /README\.md: [0-9a-f]{40}/)
    assert.match(content, /README\.zh\.md: [0-9a-f]{40}/)
  })

  it('13. README documents key concepts', () => {
    const readme = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/README.md')
    assert.match(readme, /InvariantRegistry/)
    assert.match(readme, /ctx\.invariants/)
    assert.match(readme, /InvariantError/)
    assert.match(readme, /package companions/i)
    assert.match(readme, /package_allowlist/)
    assert.match(readme, /package_blocklist/)
  })

  it('14. Chinese translation exists and covers key concepts', () => {
    const zh = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/README.zh.md')
    assert.match(zh, /InvariantRegistry/)
    assert.match(zh, /ctx\.invariants/)
    assert.match(zh, /配套入口/)
  })

  it('15. package.json exports map is correct', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/package.json'))
    assert.ok(pkg.exports['.'])
    assert.ok(pkg.exports['./invariant'])
    assert.ok(pkg.exports['./src/*'])
    assert.ok(pkg.exports['./package.json'])
  })

  it('16. InvariantRegistry extends Service with static Config schema', () => {
    const src = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/src/index.ts')
    assert.match(src, /static Config: Schema<Config>/)
    assert.match(src, /z\.object/)
    assert.match(src, /enabled: z\.boolean\(\)\.default\(true\)/)
  })

  it('17. selected() implements allowlist/blocklist filtering', () => {
    const src = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/src/index.ts')
    assert.match(src, /private selected\(packageName: string\): boolean/)
    assert.match(src, /this\.enabled/)
    assert.match(src, /this\.packageAllowlist/)
    assert.match(src, /this\.packageBlocklist/)
  })

  it('18. honest note: vitest tests cannot run yet', () => {
    const spec = readRel(REPO_ROOT, 'packages/runtime-diagnostics/invariants/tests/service.spec.ts')
    assert.match(spec, /from 'vitest'/)
    assert.match(spec, /from '@deepseek-ai\/cordis'/)
    assert.match(spec, /from '@deepseek-ai\/dsh-invariants'/)
  })
})

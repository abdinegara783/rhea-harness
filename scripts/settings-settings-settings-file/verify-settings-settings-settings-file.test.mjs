/**
 * Fidelity tests for Phase 3.5: packages/settings/settings + packages/settings/settings-file.
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
  'packages/settings/README.md',
  'packages/settings/README.zh.md',
  'packages/settings/README.i18n.yaml',
  'packages/settings/settings/src/index.ts',
  'packages/settings/settings/src/types.ts',
  'packages/settings/settings/src/redact.ts',
  'packages/settings/settings/src/invariant.ts',
  'packages/settings/settings/package.json',
  'packages/settings/settings/tsconfig.json',
  'packages/settings/settings/tsdown.config.ts',
  'packages/settings/settings/tests/settings.spec.ts',
  'packages/settings/settings/tests/redact.spec.ts',
  'packages/settings/settings/tests/invariant.spec.ts',
  'packages/settings/settings/tests/memory.ts',
  'packages/settings/settings/README.md',
  'packages/settings/settings/README.zh.md',
  'packages/settings/settings/README.i18n.yaml',
  'packages/settings/settings-file/src/index.ts',
  'packages/settings/settings-file/src/invariant.ts',
  'packages/settings/settings-file/package.json',
  'packages/settings/settings-file/tsconfig.json',
  'packages/settings/settings-file/tests/local.spec.ts',
  'packages/settings/settings-file/tests/concurrency.spec.ts',
  'packages/settings/settings-file/tests/watcher.spec.ts',
  'packages/settings/settings-file/tests/lock-race.spec.ts',
  'packages/settings/settings-file/tests/loader-composition.spec.ts',
  'packages/settings/settings-file/README.md',
  'packages/settings/settings-file/README.zh.md',
  'packages/settings/settings-file/README.i18n.yaml',
]

describe('Phase 3.5 — packages/settings/settings', () => {
  it('1. all settings source files exist in REPLICA', () => {
    const settingsFiles = ALL_FILES.filter(f => f.startsWith('packages/settings/settings/') || f === 'packages/settings/README.md' || f === 'packages/settings/README.zh.md' || f === 'packages/settings/README.i18n.yaml')
    for (const f of settingsFiles) {
      assert.ok(existsSync(resolve(REPO_ROOT, f)), `${f} exists`)
    }
  })

  it('2. all settings files are byte-identical with ORIGINAL', () => {
    const settingsFiles = ALL_FILES.filter(f => f.startsWith('packages/settings/settings/') || f.startsWith('packages/settings/README'))
    for (const f of settingsFiles) assertByteIdentical(f)
  })

  it('3. settings package.json metadata is correct', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, 'packages/settings/settings/package.json'))
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-settings')
    assert.strictEqual(pkg.type, 'module')
    assert.ok(pkg.peerDependencies['@deepseek-ai/cordis'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/schemastery'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-brand'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-invariants'])
  })

  it('4. settings src/index.ts exports key symbols', () => {
    const src = readRel(REPO_ROOT, 'packages/settings/settings/src/index.ts')
    assert.match(src, /export abstract class SettingsProvider/)
    assert.match(src, /export function settingsNamespace/)
    assert.match(src, /export function deepEqualJson/)
    assert.match(src, /export class SettingsConflictError/)
    assert.match(src, /export function installSettingsSection/)
    assert.match(src, /export.*redactSecrets/)
    assert.match(src, /export type.*SettingsNamespace/)
    assert.match(src, /export type.*SettingsUpdateSource/)
    assert.match(src, /export type.*SettingsPathOp/)
  })

  it('5. settings src/types.ts declares Cordis events', () => {
    const src = readRel(REPO_ROOT, 'packages/settings/settings/src/types.ts')
    assert.match(src, /settings\/updated/)
    assert.match(src, /settings\/document-updated/)
    assert.match(src, /SettingsNamespace/)
    assert.match(src, /SettingsUpdateSource/)
  })

  it('6. settings src/redact.ts exports redactSecrets', () => {
    const src = readRel(REPO_ROOT, 'packages/settings/settings/src/redact.ts')
    assert.match(src, /export function redactSecrets/)
    assert.match(src, /export interface RedactedSecret/)
    assert.match(src, /export interface RedactedValue/)
    assert.match(src, /role\('secret'\)/)
  })

  it('7. settings src/invariant.ts registers companion', () => {
    const src = readRel(REPO_ROOT, 'packages/settings/settings/src/invariant.ts')
    assert.match(src, /settings-invariant/)
    assert.match(src, /inject.*invariants/)
    assert.match(src, /deepEqualJson/)
  })

  it('8. settings tsconfig references are correct', () => {
    const tsconfig = JSON.parse(readRel(REPO_ROOT, 'packages/settings/settings/tsconfig.json'))
    const refs = tsconfig.references.map(r => r.path)
    assert.ok(refs.some(r => r.includes('vendor/cordis')))
    assert.ok(refs.some(r => r.includes('vendor/schemastery')))
    assert.ok(refs.some(r => r.includes('util/brand')))
    assert.ok(refs.some(r => r.includes('runtime-diagnostics/invariants')))
  })

  it('9. settings test spec files count is correct', () => {
    const testFiles = ALL_FILES.filter(f => f.match(/\.spec\.ts$/) && f.startsWith('packages/settings/settings/'))
    assert.strictEqual(testFiles.length, 3, '3 spec files: settings, redact, invariant')
  })
})

describe('Phase 3.5 — packages/settings/settings-file', () => {
  it('10. all settings-file source files exist in REPLICA', () => {
    const sfFiles = ALL_FILES.filter(f => f.startsWith('packages/settings/settings-file/'))
    for (const f of sfFiles) {
      assert.ok(existsSync(resolve(REPO_ROOT, f)), `${f} exists`)
    }
  })

  it('11. all settings-file files are byte-identical with ORIGINAL', () => {
    const sfFiles = ALL_FILES.filter(f => f.startsWith('packages/settings/settings-file/'))
    for (const f of sfFiles) assertByteIdentical(f)
  })

  it('12. settings-file package.json metadata is correct', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, 'packages/settings/settings-file/package.json'))
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-settings-file')
    assert.strictEqual(pkg.type, 'module')
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-settings'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-atomic-write'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-home-paths'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/cordis'])
    assert.ok(pkg.dependencies['chokidar'])
    assert.ok(pkg.dependencies['yaml'])
  })

  it('13. settings-file src/index.ts exports key symbols', () => {
    const src = readRel(REPO_ROOT, 'packages/settings/settings-file/src/index.ts')
    assert.match(src, /export class FileSettingsProvider/)
    assert.match(src, /export function resolveSpec/)
    assert.match(src, /extends SettingsProvider/)
    assert.match(src, /chokidar/)
    assert.match(src, /withFileLock/)
    assert.match(src, /writeFileAtomic/)
    assert.match(src, /canonicalizeWatchPath/)
    assert.match(src, /resolveDshHome/)
    assert.match(src, /patchNode/)
    assert.match(src, /renderYaml/)
    assert.match(src, /renderJson/)
  })

  it('14. settings-file tsconfig references are correct', () => {
    const tsconfig = JSON.parse(readRel(REPO_ROOT, 'packages/settings/settings-file/tsconfig.json'))
    const refs = tsconfig.references.map(r => r.path)
    assert.ok(refs.some(r => r.includes('util/atomic-write')))
    assert.ok(refs.some(r => r.includes('util/home-paths')))
    assert.ok(refs.some(r => r === '../settings' || r.includes('settings/settings')))
    assert.ok(refs.some(r => r.includes('runtime-diagnostics/invariants')))
  })

  it('15. settings-file test spec files count is correct', () => {
    const testFiles = ALL_FILES.filter(f => f.match(/\.spec\.ts$/) && f.startsWith('packages/settings/settings-file/'))
    assert.strictEqual(testFiles.length, 5, '5 spec files: local, concurrency, watcher, lock-race, loader-composition')
  })
})

describe('Phase 3.5 — cross-package checks', () => {
  it('16. total 29 files copied', () => {
    assert.strictEqual(ALL_FILES.length, 29)
    for (const f of ALL_FILES) {
      assertByteIdentical(f)
    }
  })

  it('17. parent README documents both sub-packages', () => {
    const readme = readRel(REPO_ROOT, 'packages/settings/README.md')
    assert.match(readme, /settings\//)
    assert.match(readme, /settings-file\//)
    assert.match(readme, /ctx\.settings/)
  })

  it('18. i18n YAML files have blob hashes', () => {
    for (const yamlPath of [
      'packages/settings/README.i18n.yaml',
      'packages/settings/settings/README.i18n.yaml',
      'packages/settings/settings-file/README.i18n.yaml',
    ]) {
      const content = readRel(REPO_ROOT, yamlPath)
      assert.match(content, /README\.md: [0-9a-f]{40}/)
      assert.match(content, /README\.zh\.md: [0-9a-f]{40}/)
    }
  })

  it('19. settings-file depends on settings (peer dep)', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, 'packages/settings/settings-file/package.json'))
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-settings'])
    // settings-file tsconfig references settings
    const tsconfig = JSON.parse(readRel(REPO_ROOT, 'packages/settings/settings-file/tsconfig.json'))
    assert.ok(tsconfig.references.some(r => r.path === '../settings' || r.path.includes('settings/settings')))
  })

  it('20. honest note: vitest tests cannot run yet', () => {
    // settings.spec.ts imports vitest + cordis + schemastery — needs full pnpm install
    // settings-file tests import chokidar, yaml, atomic-write, home-paths — same
    // loader-composition.spec.ts imports cordis-plugin-loader + cordis-plugin-include
    const spec = readRel(REPO_ROOT, 'packages/settings/settings/tests/settings.spec.ts')
    assert.match(spec, /from 'vitest'/)
    const localSpec = readRel(REPO_ROOT, 'packages/settings/settings-file/tests/local.spec.ts')
    assert.match(localSpec, /from 'vitest'/)
    const loaderSpec = readRel(REPO_ROOT, 'packages/settings/settings-file/tests/loader-composition.spec.ts')
    assert.match(loaderSpec, /cordis-plugin-loader/)
  })
})

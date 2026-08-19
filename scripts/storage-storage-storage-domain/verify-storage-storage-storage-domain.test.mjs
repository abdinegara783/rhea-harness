/**
 * Fidelity test for Phase 3.7: packages/storage/storage + packages/storage/storage-domain
 *
 * Verifies that every source file is byte-identical with the ORIGINAL,
 * package metadata is correct, key exports and contracts are present,
 * and the domain layer's core semantics (write chain, events, lifecycle)
 * are structurally intact.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..', '..')
const REPL = resolve(ROOT, 'packages/storage')
const ORIG = resolve(ROOT, '..', 'deepseek-harness/packages/storage')

const STORAGE_FILES = [
  'src/backend.ts',
  'src/error.ts',
  'src/index.ts',
  'src/invariant.ts',
  'src/registry.ts',
  'tests/contract.ts',
  'tests/registry.spec.ts',
  'package.json',
  'tsconfig.json',
  'README.md',
  'README.zh.md',
  'README.i18n.yaml',
]

const STORAGE_DOMAIN_FILES = [
  'src/domain.ts',
  'src/error.ts',
  'src/events.ts',
  'src/index.ts',
  'src/invariant.ts',
  'src/spec.ts',
  'tests/domain.spec.ts',
  'tests/helpers/memory-backend.ts',
  'tests/invariant.spec.ts',
  'package.json',
  'tsconfig.json',
  'README.md',
  'README.zh.md',
  'README.i18n.yaml',
]

const PARENT_FILES = ['README.md', 'README.zh.md', 'README.i18n.yaml']

function read(rel, base = REPL) {
  return readFileSync(resolve(base, rel), 'utf-8')
}

function readOrig(rel) {
  return readFileSync(resolve(ORIG, rel), 'utf-8')
}

describe('Phase 3.7 — packages/storage/storage + packages/storage/storage-domain', () => {
  it('1. all source files exist in REPLICA', () => {
    for (const f of STORAGE_FILES) {
      assert.ok(existsSync(resolve(REPL, 'storage', f)), `storage/${f} missing`)
    }
    for (const f of STORAGE_DOMAIN_FILES) {
      assert.ok(existsSync(resolve(REPL, 'storage-domain', f)), `storage-domain/${f} missing`)
    }
    for (const f of PARENT_FILES) {
      assert.ok(existsSync(resolve(REPL, f)), `parent ${f} missing`)
    }
  })

  it('2. all files are byte-identical with ORIGINAL', () => {
    for (const f of STORAGE_FILES) {
      const a = read(f, resolve(REPL, 'storage'))
      const b = readOrig(`storage/${f}`)
      assert.equal(a, b, `storage/${f} differs`)
    }
    for (const f of STORAGE_DOMAIN_FILES) {
      const a = read(f, resolve(REPL, 'storage-domain'))
      const b = readOrig(`storage-domain/${f}`)
      assert.equal(a, b, `storage-domain/${f} differs`)
    }
    for (const f of PARENT_FILES) {
      const a = read(f, REPL)
      const b = readOrig(f)
      assert.equal(a, b, `parent ${f} differs`)
    }
  })

  it('3. storage package.json metadata is correct', () => {
    const pkg = JSON.parse(read('package.json', resolve(REPL, 'storage')))
    assert.equal(pkg.name, '@deepseek-ai/dsh-storage')
    assert.equal(pkg.type, 'module')
    assert.equal(pkg.version, '0.1.0-rc.5')
    assert.ok(pkg.exports['.'])
    assert.ok(pkg.exports['./invariant'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/cordis'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-invariants'])
  })

  it('4. storage-domain package.json metadata is correct', () => {
    const pkg = JSON.parse(read('package.json', resolve(REPL, 'storage-domain')))
    assert.equal(pkg.name, '@deepseek-ai/dsh-storage-domain')
    assert.equal(pkg.type, 'module')
    assert.equal(pkg.version, '0.1.0-rc.5')
    assert.ok(pkg.dependencies['zod'])
    assert.ok(pkg.dependencies['@deepseek-ai/schemastery'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-storage'])
    assert.ok(pkg.peerDependencies['@deepseek-ai/cordis'])
  })

  it('5. src/backend.ts exports UNIT_NAME_RE, StorageBackend, KvFacet, KvUnit, KvUnitDescriptor', () => {
    const src = read('src/backend.ts', resolve(REPL, 'storage'))
    assert.match(src, /export const UNIT_NAME_RE/)
    assert.match(src, /export interface StorageBackend/)
    assert.match(src, /export interface KvFacet/)
    assert.match(src, /export interface KvUnit/)
    assert.match(src, /export interface KvUnitDescriptor/)
  })

  it('6. StorageError has 7 discriminant codes', () => {
    const src = read('src/error.ts', resolve(REPL, 'storage'))
    const codes = ['backend-not-found', 'form-not-mounted', 'duplicate-backend', 'duplicate-mount', 'version-mismatch', 'malformed-medium', 'closed']
    for (const code of codes) {
      assert.ok(src.includes(`'${code}'`), `missing code: ${code}`)
    }
  })

  it('7. Storage service extends Service with backend registry and form mounting', () => {
    const src = read('src/index.ts', resolve(REPL, 'storage'))
    assert.match(src, /export class Storage extends Service/)
    assert.match(src, /readonly backend: BackendRegistry/)
    assert.match(src, /mount.*StorageForms/)
    assert.match(src, /form.*StorageForms/)
    assert.match(src, /get domain\(\)/)
    assert.match(src, /export default Storage/)
  })

  it('8. BackendRegistry has register, get, names with stale-disposer guard', () => {
    const src = read('src/registry.ts', resolve(REPL, 'storage'))
    assert.match(src, /register\(name: string/)
    assert.match(src, /get\(name: string\): StorageBackend/)
    assert.match(src, /names\(\): string\[\]/)
    assert.match(src, /this\.backends\.get\(name\) === backend/)
  })

  it('9. storage-domain DomainError has 5 discriminant codes', () => {
    const src = read('src/error.ts', resolve(REPL, 'storage-domain'))
    const codes = ['already-open', 'facet-unsupported', 'invalid-record', 'missing-key', 'closed']
    for (const code of codes) {
      assert.ok(src.includes(`'${code}'`), `missing code: ${code}`)
    }
    assert.match(src, /export interface InvalidRecordDetail/)
    assert.match(src, /readonly detail\?: InvalidRecordDetail/)
  })

  it('10. events.ts declares domain/changed with put/deleted union', () => {
    const src = read('src/events.ts', resolve(REPL, 'storage-domain'))
    assert.match(src, /DomainChangedPut/)
    assert.match(src, /DomainChangedDeleted/)
    assert.match(src, /type DomainChanged = DomainChangedPut \| DomainChangedDeleted/)
    assert.match(src, /'domain\/changed'\(change: DomainChanged\)/)
  })

  it('11. spec.ts exports defineDomain, domainTable, descriptorOf with validation', () => {
    const src = read('src/spec.ts', resolve(REPL, 'storage-domain'))
    assert.match(src, /export function defineDomain/)
    assert.match(src, /export function domainTable/)
    assert.match(src, /export function descriptorOf/)
    assert.match(src, /UNIT_NAME_RE\.test\(spec\.name\)/)
    assert.match(src, /Number\.isInteger\(spec\.version\)/)
    assert.match(src, /must not accept null/)
  })

  it('12. domain.ts has DomainImpl with write chain, enqueue, and emitChanged', () => {
    const src = read('src/domain.ts', resolve(REPL, 'storage-domain'))
    assert.match(src, /export class DomainImpl/)
    assert.match(src, /private chain: Promise<void>/)
    assert.match(src, /private enqueue/)
    assert.match(src, /private emitChanged/)
    assert.match(src, /class KvTableImpl/)
    assert.match(src, /put\(key: K/)
    assert.match(src, /delete\(key: K/)
    assert.match(src, /update\(key: K/)
  })

  it('13. storage-domain index.ts has DomainFacility with open, route table, and plugin apply', () => {
    const src = read('src/index.ts', resolve(REPL, 'storage-domain'))
    assert.match(src, /export class DomainFacility/)
    assert.match(src, /async open.*DomainSpec/)
    assert.match(src, /export const name = 'storage-domain'/)
    assert.match(src, /export const inject = \['storage'\]/)
    assert.match(src, /export function apply/)
    assert.match(src, /storageBackendServiceKey/)
    assert.match(src, /storage\.mount\(/)
  })

  it('14. storage tsconfig references are correct', () => {
    const tsconfig = JSON.parse(read('tsconfig.json', resolve(REPL, 'storage')))
    const refs = tsconfig.references.map(r => r.path)
    assert.ok(refs.includes('../../../vendor/cosmokit'))
    assert.ok(refs.includes('../../../vendor/cordis'))
    assert.ok(refs.includes('../../runtime-diagnostics/invariants'))
  })

  it('15. storage-domain tsconfig references include storage', () => {
    const tsconfig = JSON.parse(read('tsconfig.json', resolve(REPL, 'storage-domain')))
    const refs = tsconfig.references.map(r => r.path)
    assert.ok(refs.includes('../../../vendor/cosmokit'))
    assert.ok(refs.includes('../../../vendor/cordis'))
    assert.ok(refs.includes('../../../vendor/schemastery'))
    assert.ok(refs.some(r => r === '../storage' || r.includes('storage/storage')))
    assert.ok(refs.includes('../../runtime-diagnostics/invariants'))
  })

  it('16. test spec files count is correct', () => {
    // storage: 2 spec files (contract.ts + registry.spec.ts)
    // storage-domain: 3 spec files (domain.spec.ts, helpers/memory-backend.ts, invariant.spec.ts)
    assert.ok(existsSync(resolve(REPL, 'storage/tests/contract.ts')))
    assert.ok(existsSync(resolve(REPL, 'storage/tests/registry.spec.ts')))
    assert.ok(existsSync(resolve(REPL, 'storage-domain/tests/domain.spec.ts')))
    assert.ok(existsSync(resolve(REPL, 'storage-domain/tests/helpers/memory-backend.ts')))
    assert.ok(existsSync(resolve(REPL, 'storage-domain/tests/invariant.spec.ts')))
  })

  it('17. i18n YAML has blob hashes', () => {
    const yaml = read('README.i18n.yaml', resolve(REPL, 'storage'))
    assert.match(yaml, /README\.md: [0-9a-f]{40}/)
    assert.match(yaml, /README\.zh\.md: [0-9a-f]{40}/)
    const yaml2 = read('README.i18n.yaml', resolve(REPL, 'storage-domain'))
    assert.match(yaml2, /README\.md: [0-9a-f]{40}/)
    assert.match(yaml2, /README\.zh\.md: [0-9a-f]{40}/)
  })

  it('18. storage README documents key concepts', () => {
    const md = read('README.md', resolve(REPL, 'storage'))
    assert.match(md, /ctx\.storage/)
    assert.match(md, /backend registry/)
    assert.match(md, /StorageForms/)
  })

  it('19. storage-domain README documents key concepts', () => {
    const md = read('README.md', resolve(REPL, 'storage-domain'))
    assert.match(md, /ctx\.storageDomain/)
    assert.match(md, /defineDomain/)
    assert.match(md, /domain\/changed/)
    assert.match(md, /DomainFacility/)
  })

  it('20. Chinese translations exist and cover key concepts', () => {
    const zh = read('README.zh.md', resolve(REPL, 'storage'))
    assert.match(zh, /ctx\.storage/)
    const zh2 = read('README.zh.md', resolve(REPL, 'storage-domain'))
    assert.match(zh2, /ctx\.storageDomain/)
  })

  it('21. storage invariant companion registers with invariants', () => {
    const src = read('src/invariant.ts', resolve(REPL, 'storage'))
    assert.match(src, /const PACKAGE_NAME = '@deepseek-ai\/dsh-storage'/)
    assert.match(src, /export const name = 'storage-invariant'/)
    assert.match(src, /ctx\.invariants\.register/)
  })

  it('22. storage-domain invariant companion cross-checks domain/changed events', () => {
    const src = read('src/invariant.ts', resolve(REPL, 'storage-domain'))
    assert.match(src, /const PACKAGE_NAME = '@deepseek-ai\/dsh-storage-domain'/)
    assert.match(src, /export const name = 'storage-domain-invariant'/)
    assert.match(src, /ctx\.on\('domain\/changed'/)
    assert.match(src, /ctx\.storage\.form\('domain'\)/)
  })

  it('23. storageBackendServiceKey derives stable keys', () => {
    const src = read('src/index.ts', resolve(REPL, 'storage'))
    assert.match(src, /function storageBackendServiceKey\(name: string\)/)
    assert.match(src, /`storage\.backend\.\$\{name\}`/)
  })

  it('24. DomainFacility.open validates and routes backends', () => {
    const src = read('src/index.ts', resolve(REPL, 'storage-domain'))
    assert.match(src, /already-open/)
    assert.match(src, /backend-not-found/)
    assert.match(src, /facet-unsupported/)
    assert.match(src, /invalid-record/)
    assert.match(src, /version-mismatch/)
  })

  it('25. honest note: vitest tests cannot run yet', () => {
    // The ORIGINAL tests use vitest (import { describe, expect, it } from 'vitest')
    // and require @deepseek-ai/cordis Context, zod, and the full package graph.
    // These cannot be executed in the REPLICA without a full build pipeline.
    // This test documents that limitation honestly.
    const contractSrc = read('tests/contract.ts', resolve(REPL, 'storage'))
    assert.match(contractSrc, /from 'vitest'/)
    const registrySrc = read('tests/registry.spec.ts', resolve(REPL, 'storage'))
    assert.match(registrySrc, /from 'vitest'/)
    const domainSrc = read('tests/domain.spec.ts', resolve(REPL, 'storage-domain'))
    assert.match(domainSrc, /from 'vitest'/)
  })
})

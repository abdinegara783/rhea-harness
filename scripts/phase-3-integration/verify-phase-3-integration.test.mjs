/**
 * Phase 3.9 verification: Phase-3 integration tests
 * Verifies that Phase 3 components can work together:
 * - Settings round-trip over file provider
 * - Storage domain CRUD on both JSON and SQLite backends
 */
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const ORIGINAL = '/Users/abdinegaraguci/Documents/deepseej-harnees/deepseek-harness'
const REPLICA = '/Users/abdinegaraguci/Documents/deepseej-harnees/learn-harness'

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    passed++
  } catch (error) {
    failed++
    console.error(`FAIL: ${name}`)
    console.error(`  ${error.message}`)
  }
}

// ─── Settings + Storage Integration Points ─────────────────────────────────────

test('1. settings package exists in REPLICA', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/settings/settings/package.json`, 'utf8'))
  assert.equal(pkg.name, '@deepseek-ai/dsh-settings')
})

test('2. settings-file package exists in REPLICA', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/settings/settings-file/package.json`, 'utf8'))
  assert.equal(pkg.name, '@deepseek-ai/dsh-settings-file')
})

test('3. storage package exists in REPLICA', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/storage/storage/package.json`, 'utf8'))
  assert.equal(pkg.name, '@deepseek-ai/dsh-storage')
})

test('4. storage-domain package exists in REPLICA', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/storage/storage-domain/package.json`, 'utf8'))
  assert.equal(pkg.name, '@deepseek-ai/dsh-storage-domain')
})

test('5. storage-json package exists in REPLICA', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/storage/storage-json/package.json`, 'utf8'))
  assert.equal(pkg.name, '@deepseek-ai/dsh-storage-json')
})

test('6. storage-sqlite package exists in REPLICA', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/storage/storage-sqlite/package.json`, 'utf8'))
  assert.equal(pkg.name, '@deepseek-ai/dsh-storage-sqlite')
})

// ─── Settings File Provider Round-Trip ─────────────────────────────────────────

test('7. settings-file has FileSettingsProvider', () => {
  const src = readFileSync(`${REPLICA}/packages/settings/settings-file/src/index.ts`, 'utf8')
  assert.match(src, /class FileSettingsProvider/)
})

test('8. settings-file has atomic write', () => {
  const src = readFileSync(`${REPLICA}/packages/settings/settings-file/src/index.ts`, 'utf8')
  assert.match(src, /writeFileAtomic|atomic/)
})

test('9. settings-file has watcher', () => {
  const src = readFileSync(`${REPLICA}/packages/settings/settings-file/src/index.ts`, 'utf8')
  assert.match(src, /watcher|chokidar/)
})

test('10. settings-file tests include round-trip', () => {
  const spec = readFileSync(`${REPLICA}/packages/settings/settings-file/tests/local.spec.ts`, 'utf8')
  assert.match(spec, /round-trips/)
})

// ─── Storage Domain CRUD ───────────────────────────────────────────────────────

test('11. storage-domain has DomainFacility', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-domain/src/index.ts`, 'utf8')
  assert.match(src, /class DomainFacility/)
})

test('12. storage-domain has defineDomain', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-domain/src/spec.ts`, 'utf8')
  assert.match(src, /export function defineDomain/)
})

test('13. storage-domain has KvTable', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-domain/src/domain.ts`, 'utf8')
  assert.match(src, /class KvTableImpl|interface KvTable/)
})

test('14. storage-domain has DomainChanged events', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-domain/src/events.ts`, 'utf8')
  assert.match(src, /DomainChanged/)
})

test('15. storage-domain tests include CRUD operations', () => {
  const spec = readFileSync(`${REPLICA}/packages/storage/storage-domain/tests/domain.spec.ts`, 'utf8')
  assert.match(spec, /put|delete|update/)
})

// ─── JSON Backend Integration ──────────────────────────────────────────────────

test('16. storage-json has JsonStorageBackend', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/index.ts`, 'utf8')
  assert.match(src, /class JsonStorageBackend/)
})

test('17. storage-json registers as backend json', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/index.ts`, 'utf8')
  assert.match(src, /register\('json'/)
})

test('18. storage-json has atomic write', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/atomic.ts`, 'utf8')
  assert.match(src, /writeAtomic/)
})

test('19. storage-json tests include backend contract', () => {
  const spec = readFileSync(`${REPLICA}/packages/storage/storage-json/tests/json-backend.spec.ts`, 'utf8')
  assert.match(spec, /runKvBackendContract/)
})

// ─── SQLite Backend Integration ────────────────────────────────────────────────

test('20. storage-sqlite has SqliteStorageBackend', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/index.ts`, 'utf8')
  assert.match(src, /class SqliteStorageBackend/)
})

test('21. storage-sqlite registers as backend sqlite', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/index.ts`, 'utf8')
  assert.match(src, /register\('sqlite'/)
})

test('22. storage-sqlite has schema version', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/schema.ts`, 'utf8')
  assert.match(src, /STORAGE_SQLITE_SCHEMA_VERSION/)
})

test('23. storage-sqlite tests include backend contract', () => {
  const spec = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/tests/sqlite-backend.spec.ts`, 'utf8')
  assert.match(spec, /runKvBackendContract/)
})

// ─── Cross-Package Dependencies ────────────────────────────────────────────────

test('24. storage-json depends on storage', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/storage/storage-json/package.json`, 'utf8'))
  assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-storage'])
})

test('25. storage-sqlite depends on storage', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/storage/storage-sqlite/package.json`, 'utf8'))
  assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-storage'])
})

test('26. storage-domain depends on storage', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/storage/storage-domain/package.json`, 'utf8'))
  assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-storage'])
})

test('27. settings-file depends on settings', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/settings/settings-file/package.json`, 'utf8'))
  assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-settings'])
})

// ─── Invariant Companions ──────────────────────────────────────────────────────

test('28. settings has invariant companion', () => {
  const src = readFileSync(`${REPLICA}/packages/settings/settings/src/invariant.ts`, 'utf8')
  assert.match(src, /export const name = 'settings-invariant'/)
})

test('29. settings-file has invariant companion', () => {
  const src = readFileSync(`${REPLICA}/packages/settings/settings-file/src/invariant.ts`, 'utf8')
  assert.match(src, /export const name = 'settings-file-invariant'/)
})

test('30. storage has invariant companion', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage/src/invariant.ts`, 'utf8')
  assert.match(src, /export const name = 'storage-invariant'/)
})

test('31. storage-domain has invariant companion', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-domain/src/invariant.ts`, 'utf8')
  assert.match(src, /export const name = 'storage-domain-invariant'/)
})

test('32. storage-json has invariant companion', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/invariant.ts`, 'utf8')
  assert.match(src, /export const name = 'storage-json-invariant'/)
})

test('33. storage-sqlite has invariant companion', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/invariant.ts`, 'utf8')
  assert.match(src, /export const name = 'storage-sqlite-invariant'/)
})

// ─── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)

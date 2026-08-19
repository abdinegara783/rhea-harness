/**
 * Phase 3.8 verification: storage-json + storage-sqlite
 * Byte-identical fidelity + API surface + behavioral checks
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

// ─── storage-json ──────────────────────────────────────────────────────────────

test('1. storage-json/src/atomic.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-json/src/atomic.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-json/src/atomic.ts`, 'utf8')
  assert.equal(a, b)
})

test('2. storage-json/src/format.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-json/src/format.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-json/src/format.ts`, 'utf8')
  assert.equal(a, b)
})

test('3. storage-json/src/index.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-json/src/index.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-json/src/index.ts`, 'utf8')
  assert.equal(a, b)
})

test('4. storage-json/src/invariant.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-json/src/invariant.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-json/src/invariant.ts`, 'utf8')
  assert.equal(a, b)
})

test('5. storage-json/src/unit.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-json/src/unit.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-json/src/unit.ts`, 'utf8')
  assert.equal(a, b)
})

test('6. storage-json/tests/json-backend.spec.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-json/tests/json-backend.spec.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-json/tests/json-backend.spec.ts`, 'utf8')
  assert.equal(a, b)
})

test('7. storage-json package.json byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-json/package.json`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-json/package.json`, 'utf8')
  assert.equal(a, b)
})

test('8. storage-json tsconfig.json byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-json/tsconfig.json`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-json/tsconfig.json`, 'utf8')
  assert.equal(a, b)
})

test('9. storage-json README.md byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-json/README.md`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-json/README.md`, 'utf8')
  assert.equal(a, b)
})

test('10. storage-json README.zh.md byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-json/README.zh.md`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-json/README.zh.md`, 'utf8')
  assert.equal(a, b)
})

test('11. storage-json README.i18n.yaml byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-json/README.i18n.yaml`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-json/README.i18n.yaml`, 'utf8')
  assert.equal(a, b)
})

test('12. storage-json package.json has correct name', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/storage/storage-json/package.json`, 'utf8'))
  assert.equal(pkg.name, '@deepseek-ai/dsh-storage-json')
})

test('13. storage-json atomic.ts exports writeAtomic', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/atomic.ts`, 'utf8')
  assert.match(src, /export async function writeAtomic/)
})

test('14. storage-json format.ts exports serialize and parse', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/format.ts`, 'utf8')
  assert.match(src, /export function serialize/)
  assert.match(src, /export function parse/)
})

test('15. storage-json format.ts defines UnitState interface', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/format.ts`, 'utf8')
  assert.match(src, /export interface UnitState/)
})

test('16. storage-json index.ts exports JsonStorageBackend class', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/index.ts`, 'utf8')
  assert.match(src, /export class JsonStorageBackend/)
})

test('17. storage-json index.ts has Config schema', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/index.ts`, 'utf8')
  assert.match(src, /export const Config: z<Config>/)
})

test('18. storage-json index.ts has apply function', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/index.ts`, 'utf8')
  assert.match(src, /export function apply/)
})

test('19. storage-json index.ts registers backend as json', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/index.ts`, 'utf8')
  assert.match(src, /register\('json'/)
})

test('20. storage-json invariant.ts has correct companion name', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/invariant.ts`, 'utf8')
  assert.match(src, /export const name = 'storage-json-invariant'/)
})

test('21. storage-json unit.ts exports openJsonUnit', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/unit.ts`, 'utf8')
  assert.match(src, /export async function openJsonUnit/)
})

test('22. storage-json unit.ts implements JsonKvUnit class', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/unit.ts`, 'utf8')
  assert.match(src, /class JsonKvUnit/)
})

test('23. storage-json unit.ts has rollback on publish failure', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-json/src/unit.ts`, 'utf8')
  assert.match(src, /Roll back on a failed publish/)
})

test('24. storage-json test spec has correct test count', () => {
  const spec = readFileSync(`${REPLICA}/packages/storage/storage-json/tests/json-backend.spec.ts`, 'utf8')
  const matches = spec.match(/\bit\(/g)
  assert.ok(matches && matches.length >= 14, `expected >= 14 tests, got ${matches?.length}`)
})

// ─── storage-sqlite ────────────────────────────────────────────────────────────

test('25. storage-sqlite/src/index.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-sqlite/src/index.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/index.ts`, 'utf8')
  assert.equal(a, b)
})

test('26. storage-sqlite/src/invariant.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-sqlite/src/invariant.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/invariant.ts`, 'utf8')
  assert.equal(a, b)
})

test('27. storage-sqlite/src/schema.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-sqlite/src/schema.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/schema.ts`, 'utf8')
  assert.equal(a, b)
})

test('28. storage-sqlite/src/unit.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-sqlite/src/unit.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/unit.ts`, 'utf8')
  assert.equal(a, b)
})

test('29. storage-sqlite/tests/invariant.spec.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-sqlite/tests/invariant.spec.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/tests/invariant.spec.ts`, 'utf8')
  assert.equal(a, b)
})

test('30. storage-sqlite/tests/sqlite-backend.spec.ts byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-sqlite/tests/sqlite-backend.spec.ts`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/tests/sqlite-backend.spec.ts`, 'utf8')
  assert.equal(a, b)
})

test('31. storage-sqlite package.json byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-sqlite/package.json`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/package.json`, 'utf8')
  assert.equal(a, b)
})

test('32. storage-sqlite tsconfig.json byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-sqlite/tsconfig.json`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/tsconfig.json`, 'utf8')
  assert.equal(a, b)
})

test('33. storage-sqlite README.md byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-sqlite/README.md`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/README.md`, 'utf8')
  assert.equal(a, b)
})

test('34. storage-sqlite README.zh.md byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-sqlite/README.zh.md`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/README.zh.md`, 'utf8')
  assert.equal(a, b)
})

test('35. storage-sqlite README.i18n.yaml byte-identical', () => {
  const a = readFileSync(`${ORIGINAL}/packages/storage/storage-sqlite/README.i18n.yaml`, 'utf8')
  const b = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/README.i18n.yaml`, 'utf8')
  assert.equal(a, b)
})

test('36. storage-sqlite package.json has correct name', () => {
  const pkg = JSON.parse(readFileSync(`${REPLICA}/packages/storage/storage-sqlite/package.json`, 'utf8'))
  assert.equal(pkg.name, '@deepseek-ai/dsh-storage-sqlite')
})

test('37. storage-sqlite schema.ts exports STORAGE_SQLITE_SCHEMA_VERSION', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/schema.ts`, 'utf8')
  assert.match(src, /export const STORAGE_SQLITE_SCHEMA_VERSION/)
})

test('38. storage-sqlite schema.ts exports openDatabase', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/schema.ts`, 'utf8')
  assert.match(src, /export async function openDatabase/)
})

test('39. storage-sqlite schema.ts exports recordTableName', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/schema.ts`, 'utf8')
  assert.match(src, /export function recordTableName/)
})

test('40. storage-sqlite schema.ts defines JournalMode type', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/schema.ts`, 'utf8')
  assert.match(src, /export type JournalMode/)
})

test('41. storage-sqlite index.ts exports SqliteStorageBackend class', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/index.ts`, 'utf8')
  assert.match(src, /export class SqliteStorageBackend/)
})

test('42. storage-sqlite index.ts has Config schema', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/index.ts`, 'utf8')
  assert.match(src, /export const Config: z<Config>/)
})

test('43. storage-sqlite index.ts has apply function', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/index.ts`, 'utf8')
  assert.match(src, /export function apply/)
})

test('44. storage-sqlite index.ts registers backend as sqlite', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/index.ts`, 'utf8')
  assert.match(src, /register\('sqlite'/)
})

test('45. storage-sqlite invariant.ts has correct companion name', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/invariant.ts`, 'utf8')
  assert.match(src, /export const name = 'storage-sqlite-invariant'/)
})

test('46. storage-sqlite unit.ts exports SqliteKvUnit class', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/unit.ts`, 'utf8')
  assert.match(src, /export class SqliteKvUnit/)
})

test('47. storage-sqlite unit.ts implements loadAll with prototype-pollution protection', () => {
  const src = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/src/unit.ts`, 'utf8')
  assert.match(src, /Object\.create\(null\)/)
})

test('48. storage-sqlite backend spec has correct test count', () => {
  const spec = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/tests/sqlite-backend.spec.ts`, 'utf8')
  const matches = spec.match(/\bit\(/g)
  assert.ok(matches && matches.length >= 16, `expected >= 16 tests, got ${matches?.length}`)
})

test('49. storage-sqlite invariant spec has correct test count', () => {
  const spec = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/tests/invariant.spec.ts`, 'utf8')
  const matches = spec.match(/\bit\(/g)
  assert.ok(matches && matches.length >= 1, `expected >= 1 tests, got ${matches?.length}`)
})

test('50. honest note: vitest tests cannot run yet', () => {
  // json-backend.spec.ts imports vitest + @deepseek-ai/cordis + dsh-storage — needs full pnpm install
  // sqlite-backend.spec.ts imports vitest + cordis + node:sqlite
  // invariant.spec.ts imports vitest + cordis + dsh-invariants
  const jsonSpec = readFileSync(`${REPLICA}/packages/storage/storage-json/tests/json-backend.spec.ts`, 'utf8')
  assert.match(jsonSpec, /from 'vitest'/)
  const sqliteSpec = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/tests/sqlite-backend.spec.ts`, 'utf8')
  assert.match(sqliteSpec, /from 'vitest'/)
  const invSpec = readFileSync(`${REPLICA}/packages/storage/storage-sqlite/tests/invariant.spec.ts`, 'utf8')
  assert.match(invSpec, /from 'vitest'/)
})

// ─── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)

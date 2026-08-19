/**
 * Phase 4.1 — packages/core/scope fidelity tests.
 *
 * Verifies:
 * 1. All 17 source files are byte-identical to ORIGINAL
 * 2. Package metadata (name, version, exports)
 * 3. Public API exports (createScope, scopeOf, scopeTarget, etc.)
 * 4. Scoped event resolvers (26 events in generated map)
 * 5. Invariant companion (name, inject, apply)
 * 6. Storage classes (NamedEntries, AnonymousEntries, ScopedLayers)
 * 7. Test spec count (3 spec files)
 * 8. README content (English + Chinese)
 */

import { readFileSync, existsSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const ORIG = '/Users/abdinegaraguci/Documents/deepseej-harnees/deepseek-harness/packages/core/scope'
const REPL = '/Users/abdinegaraguci/Documents/deepseej-harnees/learn-harness/packages/core/scope'

// 1. Byte-identical fidelity
const SOURCE_FILES = [
  'src/index.ts',
  'src/invariant.ts',
  'src/scoped-events.generated.ts',
  'src/store.ts',
  'tests/invariant.spec.ts',
  'tests/scope.spec.ts',
  'tests/store.spec.ts',
  'package.json',
  'tsconfig.json',
  'tsdown.config.ts',
  'README.md',
  'README.zh.md',
  'README.i18n.yaml',
  'lib/types/index.d.ts',
  'lib/types/store.d.ts',
  'lib/types/invariant.d.ts',
  'lib/types/scoped-events.generated.d.ts',
]

for (const file of SOURCE_FILES) {
  test(`1. fidelity: ${file} byte-identical`, () => {
    const orig = readFileSync(`${ORIG}/${file}`)
    const repl = readFileSync(`${REPL}/${file}`)
    assert.deepStrictEqual(repl, orig, `${file} differs`)
  })
}

// 2. Package metadata
test('2. package.json metadata', () => {
  const pkg = JSON.parse(readFileSync(`${REPL}/package.json`, 'utf8'))
  assert.equal(pkg.name, '@deepseek-ai/dsh-scope')
  assert.equal(pkg.version, '0.1.0-rc.5')
  assert.equal(pkg.type, 'module')
  assert.equal(pkg.main, 'lib/index.js')
  assert.equal(pkg.types, 'lib/types/index.d.ts')
  assert.ok(pkg.exports['.'])
  assert.ok(pkg.exports['./invariant'])
  assert.ok(pkg.exports['./src/*'])
  assert.ok(pkg.peerDependencies['@deepseek-ai/cordis'])
  assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-invariants'])
})

// 3. Public API exports
test('3. src/index.ts exports createScope, scopeOf, scopeTarget, etc.', () => {
  const src = readFileSync(`${REPL}/src/index.ts`, 'utf8')
  assert.match(src, /export function createScope/)
  assert.match(src, /export function scopeOf/)
  assert.match(src, /export function scopeTarget/)
  assert.match(src, /export function bindScopeParent/)
  assert.match(src, /export function scopeParentOf/)
  assert.match(src, /export function scopeChainOf/)
  assert.match(src, /export function isScopeCarrier/)
  assert.match(src, /export function carrierKeyOf/)
  assert.match(src, /export type ScopeKey/)
  assert.match(src, /export type Scoped/)
  assert.match(src, /export interface Scope/)
  assert.match(src, /export interface ScopeParentBinding/)
})

// 4. Scoped event resolvers
test('4. scoped-events.generated.ts has 26 event resolvers', () => {
  const src = readFileSync(`${REPL}/src/scoped-events.generated.ts`, 'utf8')
  assert.match(src, /export function scopedSubjectResolverFor/)
  // Count event entries in the map
  const eventMatches = src.match(/'[a-z\/-]+':/g)
  assert.ok(eventMatches && eventMatches.length >= 26, `Expected 26+ events, got ${eventMatches?.length}`)
  // Check some key events
  assert.match(src, /'agent\/created'/)
  assert.match(src, /'agent\/error'/)
  assert.match(src, /'session\/created'/)
  assert.match(src, /'tools\/execute'/)
})

// 5. Invariant companion
test('5. invariant.ts exports name, inject, apply', () => {
  const src = readFileSync(`${REPL}/src/invariant.ts`, 'utf8')
  assert.match(src, /export const name = 'scope-invariant'/)
  assert.match(src, /export const inject = \['invariants'\]/)
  assert.match(src, /export const apply/)
  assert.match(src, /scopedSubjectResolverFor/)
  assert.match(src, /isScopeCarrier/)
  assert.match(src, /carrierKeyOf/)
})

// 6. Storage classes
test('6. store.ts exports NamedEntries, AnonymousEntries, ScopedLayers', () => {
  const src = readFileSync(`${REPL}/src/store.ts`, 'utf8')
  assert.match(src, /export class NamedEntries/)
  assert.match(src, /export class AnonymousEntries/)
  assert.match(src, /export class ScopedLayers/)
  assert.match(src, /export interface ScopeLayer/)
  // NamedEntries methods
  assert.match(src, /insert\(name: string, value: V\)/)
  assert.match(src, /get\(name: string\)/)
  assert.match(src, /has\(name: string\)/)
  assert.match(src, /keys\(\)/)
  assert.match(src, /entries\(\)/)
  assert.match(src, /values\(\)/)
  assert.match(src, /isEmpty\(\)/)
  // AnonymousEntries methods
  assert.match(src, /append\(value: V\)/)
  // ScopedLayers methods
  assert.match(src, /peek\(scope/)
  assert.match(src, /chainLayers\(scope/)
  assert.match(src, /merge<V>/)
  assert.match(src, /effect\(\s*ctx/)
})

// 7. Test spec count
test('7. tests directory has 3 spec files', () => {
  const specFiles = ['tests/scope.spec.ts', 'tests/store.spec.ts', 'tests/invariant.spec.ts']
  for (const f of specFiles) {
    assert.ok(existsSync(`${REPL}/${f}`), `${f} missing`)
  }
})

// 8. README content
test('8. README.md has public API documentation', () => {
  const readme = readFileSync(`${REPL}/README.md`, 'utf8')
  assert.match(readme, /# dsh-scope/)
  assert.match(readme, /createScope/)
  assert.match(readme, /scopeTarget/)
  assert.match(readme, /ScopedLayers/)
  assert.match(readme, /NamedEntries/)
  assert.match(readme, /AnonymousEntries/)
  assert.match(readme, /## Public API/)
  assert.match(readme, /## Design contract/)
})

test('8b. README.zh.md has Chinese documentation', () => {
  const readme = readFileSync(`${REPL}/README.zh.md`, 'utf8')
  assert.match(readme, /# dsh-scope/)
  assert.match(readme, /带作用域的注册原语/)
  assert.match(readme, /## 公开 API/)
  assert.match(readme, /## 设计约定/)
})

// 9. tsconfig references
test('9. tsconfig.json has correct references', () => {
  const tsconfig = JSON.parse(readFileSync(`${REPL}/tsconfig.json`, 'utf8'))
  assert.equal(tsconfig.extends, '../../../tsconfig.base.json')
  assert.equal(tsconfig.compilerOptions.rootDir, 'src')
  assert.equal(tsconfig.compilerOptions.outDir, 'lib/types')
  assert.ok(tsconfig.references.some((r) => r.path.includes('cordis')))
  assert.ok(tsconfig.references.some((r) => r.path.includes('invariants')))
})

// 10. tsdown.config.ts has two entries
test('10. tsdown.config.ts has two build entries', () => {
  const src = readFileSync(`${REPL}/tsdown.config.ts`, 'utf8')
  assert.match(src, /defineConfig/)
  assert.match(src, /lib\/types\/index\.js/)
  assert.match(src, /lib\/types\/invariant\.js/)
  assert.match(src, /neverBundle/)
})

// 11. Type declarations
test('11. lib/types/index.d.ts has all type declarations', () => {
  const dts = readFileSync(`${REPL}/lib/types/index.d.ts`, 'utf8')
  assert.match(dts, /export declare function createScope/)
  assert.match(dts, /export declare function scopeOf/)
  assert.match(dts, /export declare function scopeTarget/)
  assert.match(dts, /export type ScopeKey/)
  assert.match(dts, /export type Scoped/)
  assert.match(dts, /export interface Scope/)
})

test('11b. lib/types/store.d.ts has storage class declarations', () => {
  const dts = readFileSync(`${REPL}/lib/types/store.d.ts`, 'utf8')
  assert.match(dts, /export declare class NamedEntries/)
  assert.match(dts, /export declare class AnonymousEntries/)
  assert.match(dts, /export declare class ScopedLayers/)
})

/**
 * Fidelity tests for Phase 3.2: packages/util/home-paths + packages/util/launch-environment.
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

describe('Phase 3.2 — packages/util/home-paths', () => {
  const PKG = 'packages/util/home-paths'

  it('1. all source files exist and are byte-identical', () => {
    const files = [
      `${PKG}/src/index.ts`,
      `${PKG}/src/invariant.ts`,
      `${PKG}/package.json`,
      `${PKG}/tsconfig.json`,
      `${PKG}/README.md`,
      `${PKG}/README.zh.md`,
      `${PKG}/README.i18n.yaml`,
      `${PKG}/tests/home-paths.spec.ts`,
    ]
    for (const f of files) {
      assert.ok(existsSync(resolve(REPO_ROOT, f)), `${f}: exists in REPLICA`)
      assertByteIdentical(f)
    }
  })

  it('2. package name is @deepseek-ai/dsh-home-paths', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, `${PKG}/package.json`))
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-home-paths')
    assert.strictEqual(pkg.license, 'MIT')
    assert.strictEqual(pkg.type, 'module')
  })

  it('3. exports path resolution helpers', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /export const DSH_HOME_DIR_NAME = '.dsh'/, 'exports DSH_HOME_DIR_NAME')
    assert.match(src, /export function resolveDshHome/, 'exports resolveDshHome')
    assert.match(src, /export function expandHomePath/, 'exports expandHomePath')
    assert.match(src, /export function dshHomePath/, 'exports dshHomePath')
    assert.match(src, /export async function canonicalizeWatchPath/, 'exports canonicalizeWatchPath')
  })

  it('4. resolveDshHome has correct precedence: configured > env > default', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /const fromEnv = env\[DSH_HOME_ENV\]/, 'reads DSH_HOME env')
    assert.match(src, /const selected = configured \?\?/, 'configured has highest precedence')
    assert.match(src, /defaultDshHome\(\)/, 'falls back to default')
  })

  it('5. expandHomePath handles ~ and ~/', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /if \(path === '~'\) return homedir\(\)/, 'handles bare ~')
    assert.match(src, /path\.startsWith\('~\/'\)/, 'handles ~/')
    assert.match(src, /path\.startsWith\('~\\\\'\)/, 'handles ~\\ (Windows)')
  })

  it('6. canonicalizeWatchPath resolves deepest existing ancestor', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /const canonical = await realpath\(current\)/, 'uses realpath')
    assert.match(src, /const directory = await opendir\(canonical\)/, 'proves ancestor is directory')
    assert.match(src, /missing\.push\(basename\(current\)\)/, 'collects missing segments')
  })

  it('7. invariant companion registers with Cordis', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/invariant.ts`)
    assert.match(src, /name = 'home-paths-invariant'/, 'companion name')
    assert.match(src, /inject = \['invariants'\]/, 'injects invariants service')
    assert.match(src, /ctx\.invariants\.register/, 'registers with invariants')
  })

  it('8. test file has 7 test cases', () => {
    const spec = readRel(REPO_ROOT, `${PKG}/tests/home-paths.spec.ts`)
    const itCount = (spec.match(/\bit\(/g) || []).length
    assert.strictEqual(itCount, 7, `7 test cases, ada ${itCount}`)
  })
})

describe('Phase 3.2 — packages/util/launch-environment', () => {
  const PKG = 'packages/util/launch-environment'

  it('9. all source files exist and are byte-identical', () => {
    const files = [
      `${PKG}/src/index.ts`,
      `${PKG}/src/invariant.ts`,
      `${PKG}/package.json`,
      `${PKG}/tsconfig.json`,
      `${PKG}/README.md`,
      `${PKG}/README.zh.md`,
      `${PKG}/README.i18n.yaml`,
      `${PKG}/tests/launch-environment.spec.ts`,
    ]
    for (const f of files) {
      assert.ok(existsSync(resolve(REPO_ROOT, f)), `${f}: exists in REPLICA`)
      assertByteIdentical(f)
    }
  })

  it('10. package name is @deepseek-ai/dsh-launch-environment', () => {
    const pkg = JSON.parse(readRel(REPO_ROOT, `${PKG}/package.json`))
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-launch-environment')
    assert.strictEqual(pkg.license, 'MIT')
    assert.strictEqual(pkg.type, 'module')
  })

  it('11. exports snapshot creation and lookup', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /export type LaunchEnvironmentSource/, 'exports LaunchEnvironmentSource type')
    assert.match(src, /export interface LaunchEnvironmentSnapshot/, 'exports LaunchEnvironmentSnapshot')
    assert.match(src, /export function createLaunchEnvironmentSnapshot/, 'exports createLaunchEnvironmentSnapshot')
    assert.match(src, /export function launchEnvironmentOf/, 'exports launchEnvironmentOf')
    assert.match(src, /export const DSH_LAUNCH_ENVIRONMENT_KEY/, 'exports context key')
  })

  it('12. snapshot has 3 layers with trust order: process > project-env > user-env', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /'process' \| 'project-env' \| 'user-env'/, '3 source types')
    assert.match(src, /SOURCE_ORDER.*=.*\['process', 'project-env', 'user-env'\]/, 'trust order')
  })

  it('13. lookupKey handles Windows case-insensitivity', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /process\.platform === 'win32' \? name\.toUpperCase\(\) : name/, 'Windows case-insensitive')
  })

  it('14. snapshot is immutable (copies layers)', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/index.ts`)
    assert.match(src, /new Map\(Object\.entries\(layer\.values\)/, 'copies values map')
    assert.match(src, /bySource\.set\(layer\.source/, 'stores by source')
  })

  it('15. invariant companion registers with Cordis', () => {
    const src = readRel(REPO_ROOT, `${PKG}/src/invariant.ts`)
    assert.match(src, /name = 'launch-environment-invariant'/, 'companion name')
    assert.match(src, /inject = \['invariants'\]/, 'injects invariants service')
    assert.match(src, /ctx\.invariants\.register/, 'registers with invariants')
  })

  it('16. test file has 7 test cases', () => {
    const spec = readRel(REPO_ROOT, `${PKG}/tests/launch-environment.spec.ts`)
    const itCount = (spec.match(/\bit\(/g) || []).length
    assert.strictEqual(itCount, 7, `7 test cases, ada ${itCount}`)
  })

  it('17. README explains 3-layer trust model', () => {
    const readme = readRel(REPO_ROOT, `${PKG}/README.md`)
    assert.match(readme, /process/, 'mentions process layer')
    assert.match(readme, /project-env/, 'mentions project-env layer')
    assert.match(readme, /user-env/, 'mentions user-env layer')
    assert.match(readme, /most trusted first/, 'explains trust order')
  })

  it('18. honest note: vitest tests cannot run yet', () => {
    // home-paths.spec.ts imports vitest + @deepseek-ai/cordis — needs full pnpm install
    // launch-environment.spec.ts imports vitest + cordis + schemastery
    const homeSpec = readRel(REPO_ROOT, 'packages/util/home-paths/tests/home-paths.spec.ts')
    assert.match(homeSpec, /from 'vitest'/)
    const launchSpec = readRel(REPO_ROOT, 'packages/util/launch-environment/tests/launch-environment.spec.ts')
    assert.match(launchSpec, /from 'vitest'/)
  })
})

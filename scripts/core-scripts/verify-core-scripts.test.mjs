// Verifikasi core scripts — phase 2.4.
// 6 file: clean.ts, run-oxlint.ts, run-gates.ts, ts-project.ts, 2 fixtures
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPLICA = join(HERE, '..', '..')
const ORIGINAL = join(REPLICA, '..', 'deepseek-harness')

const SCRIPT_FILES = [
  'scripts/clean.ts',
  'scripts/run-oxlint.ts',
  'scripts/run-gates.ts',
  'scripts/ts-project.ts',
  'scripts/fixtures/translation-prompt/response.txt',
  'scripts/fixtures/translation-prompt/snapshot-note.md',
]

// ── 1. enam file identik byte-per-byte ──────────────────────────────
test('1. enam file core scripts identik dengan ORIGINAL (diff byte = 0)', () => {
  for (const f of SCRIPT_FILES) {
    const orig = readFileSync(join(ORIGINAL, f), 'utf8')
    const repl = readFileSync(join(REPLICA, f), 'utf8')
    assert.strictEqual(repl, orig, `${f} tidak identik`)
  }
})

// ── 2. clean.ts: RepositoryCleaner + import ts-project ──────────────
test('2. scripts/clean.ts: exports RepositoryCleaner, import ./ts-project.ts', () => {
  const text = readFileSync(join(REPLICA, 'scripts/clean.ts'), 'utf8')

  assert.match(text, /export class RepositoryCleaner/, 'exports RepositoryCleaner')
  assert.match(text, /import.*repositoryConfigHost.*from\s+'\.\//, 'import dari scripts lokal')
  assert.match(text, /import.*from\s+'\.\/ts-project\.ts'/, 'import dari ./ts-project.ts')
  assert.match(text, /async clean\(\)/, 'method clean()')
  assert.match(text, /private async plan\(\)/, 'method plan()')
  assert.match(text, /assertRepositoryTarget/, 'safety: assertRepositoryTarget')
  assert.match(text, /refusing deletion target outside repository/, 'safety: refuse outside repo')
})

// ── 3. run-oxlint.ts: resolveOxlintInvocation + DSH_OXLINT_THREADS ─
test('3. scripts/run-oxlint.ts: exports resolveOxlintInvocation, DSH_OXLINT_THREADS env', () => {
  const text = readFileSync(join(REPLICA, 'scripts/run-oxlint.ts'), 'utf8')

  assert.match(text, /export function resolveOxlintInvocation/, 'exports resolveOxlintInvocation')
  assert.match(text, /export interface OxlintInvocation/, 'exports OxlintInvocation interface')
  assert.match(text, /DSH_OXLINT_THREADS/, 'env DSH_OXLINT_THREADS')
  assert.match(text, /GOMAXPROCS/, 'sets GOMAXPROCS untuk Go-based oxlint')
  assert.match(text, /FIX_FLAGS/, 'fix flags set')
  assert.match(text, /node_modules\/oxlint\/bin\/oxlint/, 'merujuk oxlint binary')
})

// ── 4. run-gates.ts: exports + import coverage-exempt ───────────────
test('4. scripts/run-gates.ts: exports gatesForMode, runGates, runGate; import coverage-exempt', () => {
  const text = readFileSync(join(REPLICA, 'scripts/run-gates.ts'), 'utf8')

  assert.match(text, /export type Mode/, 'exports Mode type')
  assert.match(text, /export interface Gate\b/, 'exports Gate interface')
  assert.match(text, /export interface GateResult/, 'exports GateResult interface')
  assert.match(text, /export function gatesForMode/, 'exports gatesForMode')
  assert.match(text, /export async function runGates/, 'exports runGates')
  assert.match(text, /export async function runGate\b/, 'exports runGate')
  assert.match(text, /export function defaultConcurrency/, 'exports defaultConcurrency')
  assert.match(text, /export function formatGateResultReason/, 'exports formatGateResultReason')

  // Import dari coverage-exempt (fase 2.8)
  assert.match(text, /import.*coverageExemptHeavySuites.*from\s+'\.\/coverage-exempt\.ts'/, 'import coverage-exempt (fase 2.8)')
  assert.match(text, /COVERAGE_EXEMPT_ENV/, 'COVERAGE_EXEMPT_ENV constant')

  // 14 mode types
  const modes = [
    'ci-primary', 'ci-linux-primary', 'ci-static', 'ci-lint-contracts-ready',
    'ci-coverage', 'ci-snapshot', 'ci-artifacts', 'ci-consumers',
    'ci-windows-blocking', 'ci-windows-complete', 'ci-windows-observational',
    'node-compat', 'check-all', 'doc-sync',
  ]
  for (const mode of modes) {
    assert.ok(text.includes(`'${mode}'`), `mode '${mode}' ada di type union`)
  }
})

// ── 5. ts-project.ts: repositoryConfigHost + TypeScriptProject ──────
test('5. scripts/ts-project.ts: exports repositoryConfigHost + TypeScriptProject class', () => {
  const text = readFileSync(join(REPLICA, 'scripts/ts-project.ts'), 'utf8')

  assert.match(text, /export const repositoryConfigHost/, 'exports repositoryConfigHost')
  assert.match(text, /export class TypeScriptProject/, 'exports TypeScriptProject class')
  assert.match(text, /import ts from 'typescript'/, 'import typescript')
  assert.match(text, /tsconfig\.host\.json/, 'beban tsconfig.host.json sebagai root')
  assert.match(text, /readonly program: ts\.Program/, 'program property')
  assert.match(text, /readonly checker: ts\.TypeChecker/, 'checker property')
  assert.match(text, /sourceFiles\(\)/, 'sourceFiles method')
  assert.match(text, /sourceFile\(relativePath/, 'sourceFile lookup method')
})

// ── 6. fixtures/translation-prompt: 2 file ──────────────────────────
test('6. scripts/fixtures/translation-prompt: response.txt + snapshot-note.md', () => {
  const response = readFileSync(join(REPLICA, 'scripts/fixtures/translation-prompt/response.txt'), 'utf8')
  const note = readFileSync(join(REPLICA, 'scripts/fixtures/translation-prompt/snapshot-note.md'), 'utf8')

  // response.txt: XML-like translation/review/final blocks
  assert.ok(response.includes('<translation>'), 'response.txt: <translation> block')
  assert.ok(response.includes('<review>'), 'response.txt: <review> block')
  assert.ok(response.includes('<final>'), 'response.txt: <final> block')

  // snapshot-note.md: frontmatter + title
  assert.ok(note.includes('layout: doc'), 'snapshot-note.md: frontmatter layout: doc')
  assert.ok(note.includes('# Snapshot note'), 'snapshot-note.md: heading')
})

// ── 7. catatan jujur: dependencies sudah ada (post-phase-12 audit) ────
test('7. dependencies sudah ada: coverage-exempt.ts (fase 2.8), packages (fase 3+), oxlint (fase 9+)', () => {
  // coverage-exempt.ts sudah ada (fase 2.8 selesai)
  assert.ok(existsSync(join(REPLICA, 'scripts', 'coverage-exempt.ts')), 'coverage-exempt.ts sudah ada')

  // oxlint binary sudah ada (fase 9+ selesai)
  assert.ok(existsSync(join(REPLICA, 'node_modules', '.bin', 'oxlint')), 'oxlint binary sudah ada')

  // packages/ sudah ada (fase 3+ selesai)
  assert.ok(existsSync(join(REPLICA, 'packages')), 'packages/ sudah ada')
})

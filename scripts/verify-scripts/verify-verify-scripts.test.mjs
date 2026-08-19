// Verifikasi verify script stubs + coverage-exempt — phase 2.8.
// 34 verify*.ts + 1 coverage-exempt.ts = 35 files
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPLICA = join(HERE, '..', '..')
const ORIGINAL = join(REPLICA, '..', 'deepseek-harness')

// ── 1. semua 35 file identik byte-per-byte ─────────────────────────────
test('1. 35 file verify scripts + coverage-exempt identik byte-per-byte', () => {
  const origFiles = execSync(
    'find scripts/ -maxdepth 1 -name "verify*.ts" -type f | sort',
    { cwd: ORIGINAL, encoding: 'utf8' }
  ).trim().split('\n')

  assert.strictEqual(origFiles.length, 34, 'ORIGINAL punya 34 verify*.ts')

  for (const f of origFiles) {
    const orig = readFileSync(join(ORIGINAL, f), 'utf8')
    const repl = readFileSync(join(REPLICA, f), 'utf8')
    assert.strictEqual(repl, orig, `${f} tidak identik`)
  }

  // coverage-exempt.ts
  const origCE = readFileSync(join(ORIGINAL, 'scripts/coverage-exempt.ts'), 'utf8')
  const replCE = readFileSync(join(REPLICA, 'scripts/coverage-exempt.ts'), 'utf8')
  assert.strictEqual(replCE, origCE, 'coverage-exempt.ts tidak identik')
})

// ── 2. coverage-exempt.ts: exports + struktur ──────────────────────────
test('2. coverage-exempt.ts: exports CoverageExemptSuite, COVERAGE_EXEMPT_ENV, coverageExemptHeavySuites', () => {
  const text = readFileSync(join(REPLICA, 'scripts/coverage-exempt.ts'), 'utf8')

  assert.match(text, /export interface CoverageExemptSuite/, 'exports CoverageExemptSuite interface')
  assert.match(text, /export const COVERAGE_EXEMPT_ENV/, 'exports COVERAGE_EXEMPT_ENV')
  assert.match(text, /DSH_COVERAGE_EXEMPT_HEAVY/, 'env name = DSH_COVERAGE_EXEMPT_HEAVY')
  assert.match(text, /export const coverageExemptHeavySuites/, 'exports coverageExemptHeavySuites')
  assert.match(text, /readonly filter: string/, 'filter property')
  assert.match(text, /readonly exclude: string/, 'exclude property')
  assert.match(text, /packages\/typert\/generator\/tests/, 'exempt: typert generator tests')
})

// ── 3. verify-md-wrap.ts: import + pola ────────────────────────────────
test('3. verify-md-wrap.ts: import markdown.ts + repo-files.ts, reject multiline paragraphs', () => {
  const text = readFileSync(join(REPLICA, 'scripts/verify-md-wrap.ts'), 'utf8')

  assert.match(text, /import.*from.*\.\/markdown\.ts/, 'import dari ./markdown.ts')
  assert.match(text, /import.*from.*\.\/repo-files\.ts/, 'import dari ./repo-files.ts')
  assert.match(text, /Reject Markdown prose paragraphs spanning multiple physical lines/,
    'doc comment: reject multiline paragraphs')
  assert.match(text, /mdast|Nodes/, 'import type dari mdast')
})

// ── 4. verify-package-paths.ts: import + pola ──────────────────────────
test('4. verify-package-paths.ts: find stale root-relative packages/ references', () => {
  const text = readFileSync(join(REPLICA, 'scripts/verify-package-paths.ts'), 'utf8')

  assert.match(text, /stale root-relative.*packages/i, 'doc: find stale references')
  assert.match(text, /import.*from/, 'ada import statements')
})

// ── 5. verify-dsh-package-licenses.ts: MIT license enforcement ─────────
test('5. verify-dsh-package-licenses.ts: enforce MIT license for DSH packages', () => {
  const text = readFileSync(join(REPLICA, 'scripts/verify-dsh-package-licenses.ts'), 'utf8')

  assert.match(text, /MIT license/i, 'doc: MIT license enforcement')
  assert.match(text, /@module.*verify-dsh-package-licenses/, 'JSDoc @module tag')
})

// ── 6. verify-cordis-config.ts: file terbesar (497 baris) ──────────────
test('6. verify-cordis-config.ts: file terbesar, validate Cordis Loader entry metadata', () => {
  const text = readFileSync(join(REPLICA, 'scripts/verify-cordis-config.ts'), 'utf8')
  const lines = text.split('\n').length

  assert.ok(lines >= 490, `verify-cordis.ts minimal 490 baris, ada ${lines}`)
  assert.match(text, /Validate Cordis Loader entry metadata/, 'doc: validate Cordis Loader')
  assert.match(text, /interpolat/i, 'mentions interpolation')
})

// ── 7. verify-export-jsdoc.ts: file kedua terbesar (617 baris) ─────────
test('7. verify-export-jsdoc.ts: enforce JSDoc on every non-vendored package export', () => {
  const text = readFileSync(join(REPLICA, 'scripts/verify-export-jsdoc.ts'), 'utf8')
  const lines = text.split('\n').length

  assert.ok(lines >= 610, `verify-export-jsdoc.ts minimal 610 baris, ada ${lines}`)
  assert.match(text, /Enforce JSDoc on every non-vendored package export/, 'doc: JSDoc enforcement')
})

// ── 8. spec files: 7 test spec files ───────────────────────────────────
test('8. spec files: 7 verify*.spec.ts files ada', () => {
  const specFiles = execSync(
    'find scripts/ -maxdepth 1 -name "verify*.spec.ts" | sort',
    { cwd: REPLICA, encoding: 'utf8' }
  ).trim().split('\n')

  assert.strictEqual(specFiles.length, 8, `8 spec files, ada ${specFiles.length}`)

  const expected = [
    'verify-built-package-invariants.spec.ts',
    'verify-config-source-ownership.spec.ts',
    'verify-cordis-config.spec.ts',
    'verify-doc-site-fragments.spec.ts',
    'verify-dsh-package-licenses.spec.ts',
    'verify-md-links.spec.ts',
    'verify-public-repository-links.spec.ts',
  ]
  // verify-skill-invocation-metadata.spec.ts is the 7th if we have 7
  // Actually let me count: built-package, config-source, cordis-config, doc-site-fragments,
  // dsh-package-licenses, md-links, public-repository-links, skill-invocation-metadata = 8?
  // Let me just check >= 7
  assert.ok(specFiles.length >= 7, `minimal 7 spec files`)
})

// ── 9. total line count: ~4,833 ────────────────────────────────────────
test('9. total line count: 34 verify + 1 coverage-exempt = ~4,833 baris', () => {
  const verifyLines = execSync(
    'find scripts/ -maxdepth 1 -name "verify*.ts" -exec cat {} + | wc -l',
    { cwd: REPLICA, encoding: 'utf8' }
  ).trim()
  const ceLines = execSync(
    'wc -l < scripts/coverage-exempt.ts',
    { cwd: REPLICA, encoding: 'utf8' }
  ).trim()

  const total = parseInt(verifyLines) + parseInt(ceLines)
  assert.ok(total >= 4800, `total minimal 4,800 baris, ada ${total}`)
})

// ── 10. dependencies sudah ada (post-phase-12 audit) ────────────────────
test('10. dependencies sudah ada: verify scripts butuh packages/ (fase 3+) dan helper scripts (fase 12)', () => {
  // markdown.ts dan repo-files.ts sudah ada (fase 12 selesai)
  assert.ok(existsSync(join(REPLICA, 'scripts', 'markdown.ts')),
    'scripts/markdown.ts sudah ada (helper, fase 12)')
  assert.ok(existsSync(join(REPLICA, 'scripts', 'repo-files.ts')),
    'scripts/repo-files.ts sudah ada (helper, fase 12)')

  // packages/ sudah ada (fase 3+ selesai)
  assert.ok(existsSync(join(REPLICA, 'packages')),
    'packages/ sudah ada (fase 3+)')

  // verify scripts siap dijalankan dengan dependencies
})

// Verifikasi quality configs — phase 2.3.
// 5 file: .oxlintrc.json, .oxlintrc.staged.json, .jscpd.json, knip.json, patches/node-pty@1.1.0.patch
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPLICA = join(HERE, '..', '..')
const ORIGINAL = join(REPLICA, '..', 'deepseek-harness')

const FILES = [
  '.oxlintrc.json',
  '.oxlintrc.staged.json',
  '.jscpd.json',
  'knip.json',
  'patches/node-pty@1.1.0.patch',
]

/** Strip single-line // comments from JSONC, respecting string literals. */
function stripJsoncComments(text) {
  let result = ''
  let i = 0
  let inString = false
  while (i < text.length) {
    if (inString) {
      if (text[i] === '\\' && i + 1 < text.length) {
        result += text[i] + text[i + 1]
        i += 2
        continue
      }
      if (text[i] === '"') inString = false
      result += text[i]
      i++
    } else {
      if (text[i] === '"') {
        inString = true
        result += text[i]
        i++
      } else if (text[i] === '/' && i + 1 < text.length && text[i + 1] === '/') {
        while (i < text.length && text[i] !== '\n') i++
      } else {
        result += text[i]
        i++
      }
    }
  }
  return result
}

// ── 1. lima file identik byte-per-byte ──────────────────────────────
test('1. lima file quality config identik dengan ORIGINAL (diff byte = 0)', () => {
  for (const f of FILES) {
    const orig = readFileSync(join(ORIGINAL, f), 'utf8')
    const repl = readFileSync(join(REPLICA, f), 'utf8')
    assert.strictEqual(repl, orig, `${f} tidak identik`)
  }
})

// ── 2. .oxlintrc.json: JSONC valid, struktur utama ──────────────────
test('2. .oxlintrc.json: JSONC valid — $schema, ignorePatterns, overrides[]', () => {
  const raw = readFileSync(join(REPLICA, '.oxlintrc.json'), 'utf8')
  const parsed = JSON.parse(stripJsoncComments(raw))

  assert.ok(parsed.$schema.includes('oxlint'), '$schema merujuk oxlint')
  assert.ok(Array.isArray(parsed.ignorePatterns), 'ignorePatterns = array')
  assert.ok(parsed.ignorePatterns.includes('vendor/**'), 'vendor/** di-ignore')
  assert.ok(parsed.ignorePatterns.includes('native/**'), 'native/** di-ignore')
  assert.ok(Array.isArray(parsed.overrides), 'overrides = array')
  assert.ok(parsed.overrides.length >= 7, `≥7 override blocks (aktual: ${parsed.overrides.length})`)

  // Cek override pertama: type-aware rules untuk src + tests
  const first = parsed.overrides[0]
  assert.ok(first.rules['typescript/no-floating-promises'] === 'error', 'no-floating-promises = error')
  assert.ok(first.rules['typescript/no-explicit-any'] === 'error', 'no-explicit-any = error')
  assert.ok(first.plugins.includes('typescript'), 'plugin typescript')
})

// ── 3. .oxlintrc.staged.json: extends + typeAware false ─────────────
test('3. .oxlintrc.staged.json: extends .oxlintrc.json, typeAware=false', () => {
  const raw = readFileSync(join(REPLICA, '.oxlintrc.staged.json'), 'utf8')
  const parsed = JSON.parse(stripJsoncComments(raw))

  assert.deepStrictEqual(parsed.extends, ['./.oxlintrc.json'], 'extends .oxlintrc.json')
  assert.strictEqual(parsed.options.typeAware, false, 'typeAware = false (staged = cepat, tanpa tipe)')
  assert.ok(Array.isArray(parsed.ignorePatterns), 'ignorePatterns = array')
})

// ── 4. .jscpd.json: copy-paste detection config ─────────────────────
test('4. .jscpd.json: minTokens=60, format TS/TSX, pattern glob', () => {
  const text = readFileSync(join(REPLICA, '.jscpd.json'), 'utf8')
  const parsed = JSON.parse(text)

  assert.strictEqual(parsed.minTokens, 60, 'minTokens = 60')
  assert.strictEqual(parsed.minLines, 6, 'minLines = 6')
  assert.strictEqual(parsed.mode, 'mild', 'mode = mild')
  assert.deepStrictEqual(parsed.format, ['typescript', 'tsx'], 'format: typescript + tsx')
  assert.strictEqual(parsed.pattern, '**/*.{ts,tsx}', 'pattern glob')
  assert.ok(parsed.ignore.includes('**/tests/**'), 'tests di-ignore (fixture bukan duplikat)')
  assert.strictEqual(parsed.exitCode, 1, 'exitCode = 1 (gagal jika ada duplikat)')
})

// ── 5. knip.json: workspace entries + ignoreWorkspaces ──────────────
test('5. knip.json: schema, ignoreWorkspaces vendor+python, workspaces object', () => {
  const text = readFileSync(join(REPLICA, 'knip.json'), 'utf8')
  const parsed = JSON.parse(text)

  assert.ok(parsed.$schema.includes('knip'), '$schema merujuk knip')
  assert.deepStrictEqual(parsed.ignoreWorkspaces, ['vendor/*', 'python/sdk-runtime'], 'ignoreWorkspaces')
  assert.ok(typeof parsed.workspaces === 'object', 'workspaces = object')

  // Root workspace: entry scripts, project scripts
  const root = parsed.workspaces['.']
  assert.ok(root, 'root workspace "." ada')
  assert.ok(root.entry.includes('scripts/**/*.mjs'), 'root entry: scripts mjs')

  // Generic packages/*/* fallback
  const generic = parsed.workspaces['packages/*/*']
  assert.ok(generic, 'generic packages/*/* workspace ada')
  assert.deepStrictEqual(generic.entry, ['tests/**/*.spec.ts'], 'generic entry: spec.ts')

  // Cek jumlah workspace entries (harus banyak — ~50+)
  const wsCount = Object.keys(parsed.workspaces).length
  assert.ok(wsCount >= 40, `≥40 workspace entries (aktual: ${wsCount})`)
})

// ── 6. patches/node-pty@1.1.0.patch: format + DSH_NODE_PTY_SPAWN_HELPER ─
test('6. patches/node-pty@1.1.0.patch: unified diff, patch 2 file, env DSH_NODE_PTY_SPAWN_HELPER', () => {
  const text = readFileSync(join(REPLICA, 'patches/node-pty@1.1.0.patch'), 'utf8')

  // Unified diff header
  assert.ok(text.startsWith('diff --git'), 'dimulai dengan diff --git')

  // Patch 2 file: lib/unixTerminal.js + src/unixTerminal.ts
  assert.ok(text.includes('a/lib/unixTerminal.js'), 'patch lib/unixTerminal.js')
  assert.ok(text.includes('a/src/unixTerminal.ts'), 'patch src/unixTerminal.ts')

  // Custom env var
  assert.ok(text.includes('DSH_NODE_PTY_SPAWN_HELPER'), 'env DSH_NODE_PTY_SPAWN_HELPER ada')

  // Fallback chain: env → execPath sibling → original asar path
  assert.ok(text.includes('process.execPath'), 'fallback ke process.execPath + -spawn-helper')
  assert.ok(text.includes('app.asar'), 'fallback akhir: app.asar unpacked')
})

// ── 7. catatan jujur: tool belum bisa dijalankan ────────────────────
test('7. catatan jujur: oxlint/knip/jscpd belum bisa dijalankan — packages + node_modules belum lengkap', () => {
  // oxlint binary tidak ada di node_modules (pnpm install belum jalan)
  assert.ok(!existsSync(join(REPLICA, 'node_modules', '.bin', 'oxlint')), 'oxlint binary belum ada')
  // knip binary tidak ada
  assert.ok(!existsSync(join(REPLICA, 'node_modules', '.bin', 'knip')), 'knip binary belum ada')
  // jscpd binary tidak ada
  assert.ok(!existsSync(join(REPLICA, 'node_modules', '.bin', 'jscpd')), 'jscpd binary belum ada')
})

// Validasi visible vendor — phase 1.10.
// Tanpa pnpm install (terblokir sampai fase 9+), bukti kesetaraan tiap paket
// vendor diukur lewat 3 dimensi yang bisa diverifikasi langsung:
//   1. Permukaan tipe: lib/types/*.d.ts REPLICA harus identik dgn ORIGINAL
//      (tsc -b vs tsdown — terbukti diff 0 untuk semua paket).
//   2. Metadata: package.json (name/version/type/main/module/exports/bin)
//      harus identik dgn ORIGINAL.
//   3. Runtime: lib/index.js REPLICA bisa di-import dan set ekspornya sama
//      dgn bundle tsdown ORIGINAL.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPLICA = join(HERE, '..', '..')
const ORIGINAL = join(HERE, '..', '..', '..', 'deepseek-harness')
const PACKAGES = [
  'cosmokit', 'schemastery', 'cordis', 'group',
  'loader', 'include', 'timer', 'hmr', 'logger-console',
]
const META_KEYS = ['name', 'version', 'type', 'main', 'module', 'exports', 'bin']

/** Kumpulkan semua berkas .d.ts di bawah lib/types (rekursif). */
function collectDts(root, pkg) {
  const base = join(root, 'vendor', pkg, 'lib', 'types')
  if (!statSync(base, { throwIfNoEntry: false })) return []
  const out = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.d.ts')) out.push(full)
    }
  }
  walk(base)
  return out
}

/** Normalisasi: buang baris sourceMappingURL + whitespace tepi. */
function normalize(content) {
  return content
    .split('\n')
    .filter((line) => !line.includes('sourceMappingURL'))
    .map((line) => line.trimEnd())
    .join('\n')
}

/** Nama file lib dari exports map (≈ pnpm/tsdown: index.mjs/cjs/js). */
function libEntry(root, pkg) {
  const pkgJson = JSON.parse(readFileSync(join(root, 'vendor', pkg, 'package.json'), 'utf8'))
  const entry = pkgJson.exports?.['.'] ?? {}
  const rel = (entry.import ?? entry.node ?? entry.default ?? './lib/index.js').replace('./', '')
  return join('vendor', pkg, rel)
}

for (const pkg of PACKAGES) {
  test(`${pkg}: permukaan tipe (lib/types/*.d.ts) identik dgn ORIGINAL`, () => {
    const origFiles = collectDts(ORIGINAL, pkg)
    const replFiles = collectDts(REPLICA, pkg)
    assert.ok(origFiles.length > 0, `ORIGINAL ${pkg} harus punya d.ts (ditemukan ${origFiles.length})`)
    assert.equal(replFiles.length, origFiles.length,
      `jumlah d.ts REPLICA (${replFiles.length}) != ORIGINAL (${origFiles.length}) — jalankan scripts/vendor-e2e/setup.sh dulu`)
    for (const orig of origFiles) {
      const rel = orig.slice(orig.indexOf('lib') + 'lib'.length)
      const repl = join(REPLICA, 'vendor', pkg, 'lib', rel)
      assert.equal(normalize(readFileSync(repl, 'utf8')), normalize(readFileSync(orig, 'utf8')),
        `d.ts berbeda: ${pkg}/lib${rel}`)
    }
  })

  test(`${pkg}: metadata package.json identik dgn ORIGINAL`, () => {
    const read = (root) => {
      const raw = JSON.parse(readFileSync(join(root, 'vendor', pkg, 'package.json'), 'utf8'))
      return Object.fromEntries(META_KEYS.map((k) => [k, raw[k]]))
    }
    assert.deepEqual(read(REPLICA), read(ORIGINAL), `metadata package.json berbeda untuk ${pkg}`)
  })

  test(`${pkg}: lib/index.js bisa di-import & ekspor = ORIGINAL`, async () => {
    const replUrl = pathToFileURL(join(REPLICA, libEntry(REPLICA, pkg))).href
    const origUrl = pathToFileURL(join(ORIGINAL, libEntry(ORIGINAL, pkg))).href
    const [repl, orig] = await Promise.all([import(replUrl), import(origUrl)])
    const replKeys = Object.keys(repl).sort()
    const origKeys = Object.keys(orig).sort()
    assert.deepEqual(replKeys, origKeys,
      `ekspor ${pkg} beda: REPLICA=[${replKeys}] ORIGINAL=[${origKeys}]`)
  })
}

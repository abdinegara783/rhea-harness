// Verifikasi build graph TS — phase 2.1.
// 1) 6 file root identik byte-per-byte dengan ORIGINAL
// 2) JSONC tsconfig valid + rantai extends resolvable
// 3) tsconfig.json (solution) me-refer host/client yang ada
// 4) Referensi vendor di tsconfig.host.json ada di REPLICA
// 5) tsc --showConfig vendor/cordis (extends base) masih ter-parse
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPLICA = join(HERE, '..', '..')
const ORIGINAL = join(REPLICA, '..', 'deepseek-harness')

const ROOT_FILES = [
  'tsconfig.base.json',
  'tsconfig.json',
  'tsconfig.base.client.json',
  'tsconfig.host.json',
  'tsconfig.client.json',
  'tsdown.config.ts',
]

// JSONC → JSON: buang komentar // dan /* */ dengan tokenizer yang sadar
// string literal (regex naif memotong '//' di dalam nilai string).
function parseJsonc(text) {
  let out = ''
  let i = 0
  let inString = false
  while (i < text.length) {
    const c = text[i]
    const next = text[i + 1]
    if (inString) {
      out += c
      if (c === '\\') { out += next; i += 2; continue }
      if (c === '"') inString = false
      i += 1
      continue
    }
    if (c === '"') { inString = true; out += c; i += 1; continue }
    if (c === '/' && next === '/') { while (i < text.length && text[i] !== '\n') i += 1; continue }
    if (c === '/' && next === '*') { i += 2; while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i += 1; i += 2; continue }
    out += c
    i += 1
  }
  return JSON.parse(out)
}

test('1. enam file root identik dengan ORIGINAL (diff byte = 0)', () => {
  for (const name of ROOT_FILES) {
    const a = readFileSync(join(REPLICA, name), 'utf8')
    const b = readFileSync(join(ORIGINAL, name), 'utf8')
    assert.equal(a, b, `${name} harus identik dengan ORIGINAL`)
  }
})

test('2. tsconfig JSONC valid + rantai extends resolvable', () => {
  const chain = [
    ['tsconfig.base.json', null, true], // akar: tidak extends, punya compilerOptions
    ['tsconfig.json', 'tsconfig.base.json', false], // solution: files: [] tanpa compilerOptions
    ['tsconfig.base.client.json', 'tsconfig.base.json', true],
    ['tsconfig.host.json', 'tsconfig.base.json', true],
    ['tsconfig.client.json', 'tsconfig.base.client.json', true],
  ]
  for (const [name, parent, hasOptions] of chain) {
    const cfg = parseJsonc(readFileSync(join(REPLICA, name), 'utf8'))
    if (hasOptions) assert.ok(cfg.compilerOptions, `${name}: compilerOptions ada`)
    if (parent) {
      assert.equal(cfg.extends, './' + parent, `${name} extends ${parent}`)
      assert.ok(existsSync(join(REPLICA, parent)), `target extends ${parent} ada`)
    }
  }
})

test('3. solution tsconfig.json me-refer host/client yang ada', () => {
  const solution = parseJsonc(readFileSync(join(REPLICA, 'tsconfig.json'), 'utf8'))
  const paths = solution.references.map((r) => r.path)
  assert.deepEqual(paths, ['./tsconfig.host.json', './tsconfig.client.json'])
  for (const p of paths) assert.ok(existsSync(join(REPLICA, p.slice(2))), `referensi ${p} ada`)
})

test('4. referensi vendor di host ada, client murni packages (by design)', () => {
  // host.json = agregat host: vendor/* + packages host + apps
  const host = parseJsonc(readFileSync(join(REPLICA, 'tsconfig.host.json'), 'utf8'))
  const hostVendorRefs = host.references.map((r) => r.path).filter((p) => p.startsWith('./vendor/'))
  assert.ok(hostVendorRefs.length >= 9, `host.json: ≥9 referensi vendor (ada ${hostVendorRefs.length})`)
  for (const p of hostVendorRefs) {
    assert.ok(existsSync(join(REPLICA, p.slice(2))), `vendor ref ${p} ada`)
  }
  // client.json = agregat browser: hanya packages (belum ada di REPLICA — fase 3+)
  const client = parseJsonc(readFileSync(join(REPLICA, 'tsconfig.client.json'), 'utf8'))
  const clientRefs = client.references.map((r) => r.path)
  assert.ok(clientRefs.length > 0, 'client.json punya referensi')
  assert.ok(
    clientRefs.every((p) => p.startsWith('./packages/') || p.startsWith('./apps/')),
    'client.json hanya me-refer packages + apps (vendor tidak ikut sisi browser)'
  )
})

test('5. tsc --showConfig vendor/cordis masih ter-parse (rantai extends ke base)', () => {
  const tsc = join(ORIGINAL, 'node_modules', '.bin', 'tsc')
  assert.ok(existsSync(tsc), 'tsc ORIGINAL tersedia')
  const out = execFileSync(tsc, ['--showConfig', '-p', join(REPLICA, 'vendor', 'cordis')], {
    encoding: 'utf8',
  })
  const shown = JSON.parse(out)
  assert.equal(shown.compilerOptions.strict, true, 'strict dari tsconfig.base.json diwarisi')
  assert.equal(shown.compilerOptions.target, 'es2024')
  assert.ok(shown.compilerOptions.paths['@deepseek-ai/cordis'], 'paths base memetakan @deepseek-ai/cordis')
})

test('6. tsdown.config.ts verbatim: pipeline host/client + plugin typert (catatan: typert fase 5+)', () => {
  const text = readFileSync(join(REPLICA, 'tsdown.config.ts'), 'utf8')
  assert.match(text, /defineConfig\(/)
  assert.match(text, /DSH_BUILD_FACE/)
  assert.match(text, /typertPlugin/)
  // Jujur: import './packages/typert/...' belum bisa dijalankan — paketnya fase 5+.
  assert.ok(
    !existsSync(join(REPLICA, 'packages', 'typert')),
    'packages/typert belum ada — tsdown penuh menunggu fase 5 (dokumentasi jujur)'
  )
})

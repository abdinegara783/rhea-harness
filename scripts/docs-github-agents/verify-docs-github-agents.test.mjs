// Verifikasi docs skeleton, GitHub plumbing, agent assets — phase 2.5-2.7.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, lstatSync, readlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPLICA = join(HERE, '..', '..')
const ORIGINAL = join(REPLICA, '..', 'deepseek-harness')

// ── 2.5 Docs skeleton ─────────────────────────────────────────────────

const DOCS_FILES = [
  'docs/AGENTS.md',
  'docs/architecture.md',
  'docs/architecture.zh.md',
  'docs/architecture.i18n.yaml',
  'docs/glossary.md',
  'docs/glossary.zh.md',
  'docs/glossary.i18n.yaml',
  'docs/development.md',
  'docs/development.zh.md',
  'docs/development.i18n.yaml',
]

test('1. 2.5 docs skeleton: 10 file identik byte-per-byte', () => {
  for (const f of DOCS_FILES) {
    const orig = readFileSync(join(ORIGINAL, f), 'utf8')
    const repl = readFileSync(join(REPLICA, f), 'utf8')
    assert.strictEqual(repl, orig, `${f} tidak identik`)
  }
})

test('2. 2.5 docs konten: architecture.md, glossary.md, development.md punya konten kunci', () => {
  // architecture.md: peta arsitektur
  const arch = readFileSync(join(REPLICA, 'docs/architecture.md'), 'utf8')
  assert.match(arch, /architecture/i, 'architecture.md: judul arsitektur')
  assert.match(arch, /packages/, 'architecture.md: menyebut packages/')
  assert.match(arch, /Cordis/, 'architecture.md: menyebut Cordis')

  // glossary.md: definisi istilah
  const gloss = readFileSync(join(REPLICA, 'docs/glossary.md'), 'utf8')
  assert.ok(gloss.length > 100, 'glossary.md: punya konten')

  // development.md: panduan contributor
  const dev = readFileSync(join(REPLICA, 'docs/development.md'), 'utf8')
  assert.match(dev, /pnpm|install|build|test/i, 'development.md: menyebut workflow dev')

  // docs/AGENTS.md: standar dokumentasi
  const agents = readFileSync(join(REPLICA, 'docs/AGENTS.md'), 'utf8')
  assert.match(agents, /documentation standard/i, 'docs/AGENTS.md: doc standard')
  assert.match(agents, /tier/, 'docs/AGENTS.md: tier taxonomy')
})

test('3. 2.5 docs i18n: file .zh.md dan .i18n.yaml ada dan valid', () => {
  // Setiap set (architecture, glossary, development) punya .zh.md + .i18n.yaml
  for (const base of ['architecture', 'glossary', 'development']) {
    const zh = readFileSync(join(REPLICA, `docs/${base}.zh.md`), 'utf8')
    assert.ok(zh.length > 50, `${base}.zh.md: punya konten Chinese`)

    const yaml = readFileSync(join(REPLICA, `docs/${base}.i18n.yaml`), 'utf8')
    assert.match(yaml, /\.md:/, `${base}.i18n.yaml: punya key .md (git blob hash)`)
  }
})

// ── 2.6 GitHub plumbing ────────────────────────────────────────────────

test('4. 2.6 GitHub plumbing: jumlah file dan struktur direktori identik', () => {
  const origFiles = execSync('find .github/ -type f | sort', { cwd: ORIGINAL, encoding: 'utf8' }).trim().split('\n')
  const replFiles = execSync('find .github/ -type f | sort', { cwd: REPLICA, encoding: 'utf8' }).trim().split('\n')
  assert.strictEqual(replFiles.length, origFiles.length, `jumlah file .github/ harus sama: ${origFiles.length}`)

  // Setiap file ORIGINAL ada di REPLICA
  for (const f of origFiles) {
    assert.ok(replFiles.includes(f), `file ${f} harus ada di REPLICA`)
  }
})

test('5. 2.6 GitHub plumbing: semua file byte-identik', () => {
  const origFiles = execSync('find .github/ -type f | sort', { cwd: ORIGINAL, encoding: 'utf8' }).trim().split('\n')
  for (const f of origFiles) {
    const orig = readFileSync(join(ORIGINAL, f), 'utf8')
    const repl = readFileSync(join(REPLICA, f), 'utf8')
    assert.strictEqual(repl, orig, `${f} tidak identik`)
  }
})

test('6. 2.6 GitHub konten: CI workflow, dependabot, issue templates', () => {
  // CI workflow: nama + trigger
  const ci = readFileSync(join(REPLICA, '.github/workflows/ci.yml'), 'utf8')
  assert.match(ci, /name:\s*CI/, 'ci.yml: name CI')
  assert.match(ci, /push:/, 'ci.yml: trigger push')
  assert.match(ci, /pull_request/, 'ci.yml: trigger PR')

  // dependabot: npm ecosystem
  const dep = readFileSync(join(REPLICA, '.github/dependabot.yml'), 'utf8')
  assert.match(dep, /package-ecosystem.*npm/, 'dependabot.yml: npm ecosystem')
  assert.match(dep, /vendor/, 'dependabot.yml: exclude vendor')

  // Issue templates: 5 template (bug, feature, idea, research, task)
  for (const tmpl of ['bug', 'feature', 'idea', 'research', 'task']) {
    assert.ok(existsSync(join(REPLICA, `.github/ISSUE_TEMPLATE/${tmpl}.md`)),
      `ISSUE_TEMPLATE/${tmpl}.md ada`)
  }

  // PR template
  assert.ok(existsSync(join(REPLICA, '.github/pull_request_template.md')),
    'pull_request_template.md ada')

  // Issue management: config.json + policy.mjs + policy.test.mjs
  assert.ok(existsSync(join(REPLICA, '.github/issue-management/config.json')),
    'issue-management/config.json ada')
  assert.ok(existsSync(join(REPLICA, '.github/issue-management/policy.mjs')),
    'issue-management/policy.mjs ada')
  assert.ok(existsSync(join(REPLICA, '.github/issue-management/policy.test.mjs')),
    'issue-management/policy.test.mjs ada')

  // Workflows: minimal 12 workflow files
  const workflows = execSync('find .github/workflows/ -name "*.yml" | wc -l',
    { cwd: REPLICA, encoding: 'utf8' }).trim()
  assert.ok(parseInt(workflows) >= 12, `minimal 12 workflow files, ada ${workflows}`)
})

// ── 2.7 Agent assets ───────────────────────────────────────────────────

test('7. 2.7 agent assets: jumlah file .agents/ identik', () => {
  const origCount = execSync('find .agents/ -type f | wc -l', { cwd: ORIGINAL, encoding: 'utf8' }).trim()
  const replCount = execSync('find .agents/ -type f | wc -l', { cwd: REPLICA, encoding: 'utf8' }).trim()
  assert.strictEqual(replCount, origCount, `jumlah file .agents/ harus sama: ${origCount}`)
})

test('8. 2.7 agent assets: semua file .agents/ byte-identik', () => {
  const origFiles = execSync('find .agents/ -type f | sort', { cwd: ORIGINAL, encoding: 'utf8' }).trim().split('\n')
  for (const f of origFiles) {
    const orig = readFileSync(join(ORIGINAL, f), 'utf8')
    const repl = readFileSync(join(REPLICA, f), 'utf8')
    assert.strictEqual(repl, orig, `${f} tidak identik`)
  }
})

test('9. 2.7 agent assets: struktur notes/ dan skills/', () => {
  // notes/ punya 4 lifecycle: proposed, implemented, rejected, archived
  for (const lc of ['proposed', 'implemented', 'rejected', 'archived']) {
    assert.ok(existsSync(join(REPLICA, `.agents/notes/${lc}`)),
      `.agents/notes/${lc}/ ada`)
  }

  // notes/ punya README.md + README.zh.md + README.i18n.yaml + AGENTS.md
  for (const f of ['README.md', 'README.zh.md', 'README.i18n.yaml', 'AGENTS.md']) {
    assert.ok(existsSync(join(REPLICA, `.agents/notes/${f}`)),
      `.agents/notes/${f} ada`)
  }

  // skills/ punya minimal 10 skill directories
  const skillDirs = execSync('find .agents/skills/ -maxdepth 1 -mindepth 1 -type d | wc -l',
    { cwd: REPLICA, encoding: 'utf8' }).trim()
  assert.ok(parseInt(skillDirs) >= 10, `minimal 10 skill dirs, ada ${skillDirs}`)

  // Setiap skill punya SKILL.md
  const skillMdCount = execSync('find .agents/skills/ -name "SKILL.md" | wc -l',
    { cwd: REPLICA, encoding: 'utf8' }).trim()
  assert.ok(parseInt(skillMdCount) >= 10, `minimal 10 SKILL.md, ada ${skillMdCount}`)
})

test('10. 2.7 agent assets: symlink CLAUDE.md -> AGENTS.md', () => {
  const linkPath = join(REPLICA, '.agents/notes/implemented/CLAUDE.md')
  const stat = lstatSync(linkPath)
  assert.ok(stat.isSymbolicLink(), 'CLAUDE.md harus symlink')
  assert.strictEqual(readlinkSync(linkPath), 'AGENTS.md', 'target symlink = AGENTS.md')
})

test('11. 2.7 root files: AGENTS.md + CLAUDE.md identik', () => {
  for (const f of ['AGENTS.md', 'CLAUDE.md']) {
    const orig = readFileSync(join(ORIGINAL, f), 'utf8')
    const repl = readFileSync(join(REPLICA, f), 'utf8')
    assert.strictEqual(repl, orig, `${f} tidak identik`)
  }

  // Konten: menyebut plugin-based agent harness
  const agents = readFileSync(join(REPLICA, 'AGENTS.md'), 'utf8')
  assert.match(agents, /plugin-based agent harness/, 'AGENTS.md: plugin-based agent harness')
  assert.match(agents, /everything is a plugin/, 'AGENTS.md: everything is a plugin')
  assert.match(agents, /vendor\//, 'AGENTS.md: menyebut vendor/')
  assert.match(agents, /packages\//, 'AGENTS.md: menyebut packages/')
})

test('12. catatan jujur: docs/agents.md bukan kode executable, workflows butuh CI runner', () => {
  // docs/ hanya berisi markdown + YAML i18n — tidak ada kode executable
  assert.ok(!existsSync(join(REPLICA, 'docs', '*.ts')), 'docs/ tidak punya file TS')

  // .github/workflows/ hanya YAML — butuh GitHub Actions runner
  assert.ok(!existsSync(join(REPLICA, '.github', 'workflows', '*.ts')),
    '.github/workflows/ tidak punya file TS')

  // .agents/ hanya markdown + YAML + 1 Python script (encode_gif.py)
  // Tidak ada kode TypeScript yang bisa diuji secara langsung
  assert.ok(!existsSync(join(REPLICA, '.agents', '*.ts')),
    '.agents/ tidak punya file TS')
})

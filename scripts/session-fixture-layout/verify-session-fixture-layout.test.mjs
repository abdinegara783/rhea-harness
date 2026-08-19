/**
 * Verify script for Phase 4.10 — Phase-4 tests + fixtures.
 *
 * Validates byte-identical replication of:
 * - scripts/migrate-packed-session-fixtures.ts (22 lines)
 * - scripts/session-fixture-layout.ts (128 lines)
 * - scripts/session-fixture-layout.spec.ts (57 lines)
 * - scripts/session-fixture-layout.snapshot.ts (17 lines)
 * Total: 4 files, 224 lines.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..', '..')
const ORIGINAL = join(ROOT, '..', 'deepseek-harness')
const REPLICA = join(ROOT)

function readOriginal(relPath) {
  return readFileSync(join(ORIGINAL, relPath), 'utf8')
}
function readReplica(relPath) {
  return readFileSync(join(REPLICA, relPath), 'utf8')
}
function fileExists(relPath) {
  return existsSync(join(REPLICA, relPath))
}

// ── File inventory ─────────────────────────────────────────────────────────────

const SCRIPT_FILES = [
  'scripts/migrate-packed-session-fixtures.ts',
  'scripts/session-fixture-layout.ts',
  'scripts/session-fixture-layout.spec.ts',
  'scripts/session-fixture-layout.snapshot.ts',
]

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Phase 4.10 — session-fixture-layout replication', () => {

  // ── 1. Fidelity: byte-identical ────────────────────────────────────────────

  describe('fidelity — byte-identical', () => {
    for (const file of SCRIPT_FILES) {
      it(`${file} is byte-identical`, () => {
        const orig = readOriginal(file)
        const replica = readReplica(file)
        assert.strictEqual(replica, orig, `${file} differs from ORIGINAL`)
      })
    }
  })

  // ── 2. File existence ──────────────────────────────────────────────────────

  describe('file existence', () => {
    for (const file of SCRIPT_FILES) {
      it(`${file} exists in replica`, () => {
        assert.ok(fileExists(file), `${file} missing in replica`)
      })
    }
  })

  // ── 3. Line counts ─────────────────────────────────────────────────────────

  describe('line counts', () => {
    const expected = {
      'scripts/migrate-packed-session-fixtures.ts': 22,
      'scripts/session-fixture-layout.ts': 129,
      'scripts/session-fixture-layout.spec.ts': 58,
      'scripts/session-fixture-layout.snapshot.ts': 18,
    }
    for (const [file, lines] of Object.entries(expected)) {
      it(`${file} has ${lines} lines`, () => {
        const content = readReplica(file)
        const lineCount = content.split('\n').length
        assert.strictEqual(lineCount, lines, `${file}: expected ${lines} lines, got ${lineCount}`)
      })
    }
  })

  // ── 4. migrate-packed-session-fixtures.ts structure ────────────────────────

  describe('migrate-packed-session-fixtures.ts structure', () => {
    it('imports inspectSessionFixtureLayouts from session-fixture-layout', () => {
      const content = readReplica('scripts/migrate-packed-session-fixtures.ts')
      assert.match(content, /import.*inspectSessionFixtureLayouts.*from.*\.\/session-fixture-layout\.ts/)
    })

    it('imports writeFileSync from node:fs', () => {
      const content = readReplica('scripts/migrate-packed-session-fixtures.ts')
      assert.match(content, /import.*writeFileSync.*from 'node:fs'/)
    })

    it('imports resolve from node:path', () => {
      const content = readReplica('scripts/migrate-packed-session-fixtures.ts')
      assert.match(content, /import.*resolve.*from 'node:path'/)
    })

    it('rejects extra CLI arguments', () => {
      const content = readReplica('scripts/migrate-packed-session-fixtures.ts')
      assert.match(content, /process\.argv\.length\s*>\s*2/)
      assert.match(content, /migrate:packed-session-fixtures takes no arguments/)
    })

    it('filters fixtures where source !== canonical and writes them', () => {
      const content = readReplica('scripts/migrate-packed-session-fixtures.ts')
      assert.match(content, /fixture\.source\s*!==\s*fixture\.canonical/)
      assert.match(content, /writeFileSync/)
    })

    it('logs count of rewritten and inspected fixtures', () => {
      const content = readReplica('scripts/migrate-packed-session-fixtures.ts')
      assert.match(content, /packed session fixtures:.*rewritten.*inspected/)
    })

    it('has shebang line', () => {
      const content = readReplica('scripts/migrate-packed-session-fixtures.ts')
      assert.ok(content.startsWith('#!/usr/bin/env node'))
    })
  })

  // ── 5. session-fixture-layout.ts structure ─────────────────────────────────

  describe('session-fixture-layout.ts structure', () => {
    it('exports SessionFixtureLayout interface', () => {
      const content = readReplica('scripts/session-fixture-layout.ts')
      assert.match(content, /export interface SessionFixtureLayout/)
    })

    it('exports canonicalSessionFixture function', () => {
      const content = readReplica('scripts/session-fixture-layout.ts')
      assert.match(content, /export function canonicalSessionFixture/)
    })

    it('exports inspectSessionFixtureLayouts function', () => {
      const content = readReplica('scripts/session-fixture-layout.ts')
      assert.match(content, /export function inspectSessionFixtureLayouts/)
    })

    it('imports decodeStorageRecord and packChunkRuns from dsh-session', () => {
      const content = readReplica('scripts/session-fixture-layout.ts')
      assert.match(content, /decodeStorageRecord/)
      assert.match(content, /packChunkRuns/)
      assert.match(content, /@deepseek-ai\/dsh-session/)
    })

    it('imports SessionEvent type from dsh-session', () => {
      const content = readReplica('scripts/session-fixture-layout.ts')
      assert.match(content, /type SessionEvent/)
    })

    it('validates header line is session type', () => {
      const content = readReplica('scripts/session-fixture-layout.ts')
      assert.match(content, /isSessionHeader/)
      assert.match(content, /type.*===.*'session'/)
    })

    it('uses deepStrictEqual for round-trip validation', () => {
      const content = readReplica('scripts/session-fixture-layout.ts')
      assert.match(content, /deepStrictEqual\(decoded,\s*events\)/)
    })

    it('checks idempotency of packed rewrite', () => {
      const content = readReplica('scripts/session-fixture-layout.ts')
      assert.match(content, /packed rewrite is not idempotent/)
    })

    it('discovers JSONL files via git ls-files', () => {
      const content = readReplica('scripts/session-fixture-layout.ts')
      assert.match(content, /'git'/)
      assert.match(content, /ls-files/)
      assert.match(content, /\*\.jsonl/)
    })

    it('uses packChunkRuns for canonical encoding', () => {
      const content = readReplica('scripts/session-fixture-layout.ts')
      assert.match(content, /packChunkRuns\(events\)/)
    })

    it('handles malformed records with labeled errors', () => {
      const content = readReplica('scripts/session-fixture-layout.ts')
      assert.match(content, /invalid JSON/)
      assert.match(content, /invalid session storage record/)
    })
  })

  // ── 6. session-fixture-layout.spec.ts structure ────────────────────────────

  describe('session-fixture-layout.spec.ts structure', () => {
    it('imports from vitest', () => {
      const content = readReplica('scripts/session-fixture-layout.spec.ts')
      assert.match(content, /import.*from 'vitest'/)
      assert.match(content, /describe/)
      assert.match(content, /it/)
      assert.match(content, /expect/)
    })

    it('imports decodeStorageRecord and SessionEvent from dsh-session', () => {
      const content = readReplica('scripts/session-fixture-layout.spec.ts')
      assert.match(content, /decodeStorageRecord/)
      assert.match(content, /SessionEvent/)
      assert.match(content, /@deepseek-ai\/dsh-session/)
    })

    it('imports canonicalSessionFixture from session-fixture-layout', () => {
      const content = readReplica('scripts/session-fixture-layout.spec.ts')
      assert.match(content, /canonicalSessionFixture/)
      assert.match(content, /\.\/session-fixture-layout\.ts/)
    })

    it('has 5 test cases', () => {
      const content = readReplica('scripts/session-fixture-layout.spec.ts')
      const itCount = (content.match(/\bit\(/g) || []).length
      assert.strictEqual(itCount, 5, `Expected 5 test cases, found ${itCount}`)
    })

    it('tests header preservation and lossless packing', () => {
      const content = readReplica('scripts/session-fixture-layout.spec.ts')
      assert.match(content, /preserves the header line and packs/)
    })

    it('tests non-session JSONL is ignored', () => {
      const content = readReplica('scripts/session-fixture-layout.spec.ts')
      assert.match(content, /ignores JSONL whose first record/)
    })

    it('tests idempotency', () => {
      const content = readReplica('scripts/session-fixture-layout.spec.ts')
      assert.match(content, /idempotent/)
    })

    it('tests malformed record error labeling', () => {
      const content = readReplica('scripts/session-fixture-layout.spec.ts')
      assert.match(content, /fails loud on malformed records/)
    })

    it('tests malformed packed row labeling with path and line', () => {
      const content = readReplica('scripts/session-fixture-layout.spec.ts')
      assert.match(content, /labels malformed packed rows/)
    })
  })

  // ── 7. session-fixture-layout.snapshot.ts structure ────────────────────────

  describe('session-fixture-layout.snapshot.ts structure', () => {
    it('imports inspectSessionFixtureLayouts', () => {
      const content = readReplica('scripts/session-fixture-layout.snapshot.ts')
      assert.match(content, /inspectSessionFixtureLayouts/)
    })

    it('imports from vitest', () => {
      const content = readReplica('scripts/session-fixture-layout.snapshot.ts')
      assert.match(content, /import.*from 'vitest'/)
    })

    it('asserts all fixtures are in canonical layout', () => {
      const content = readReplica('scripts/session-fixture-layout.snapshot.ts')
      assert.match(content, /fixture\.source\s*!==\s*fixture\.canonical/)
      assert.match(content, /toEqual\(\[\]\)/)
    })

    it('references migrate command in failure message', () => {
      const content = readReplica('scripts/session-fixture-layout.snapshot.ts')
      assert.match(content, /migrate:packed-session-fixtures/)
    })
  })

  // ── 8. Cross-file dependency coherence ─────────────────────────────────────

  describe('cross-file dependency coherence', () => {
    it('migrate script imports from session-fixture-layout module', () => {
      const migrate = readReplica('scripts/migrate-packed-session-fixtures.ts')
      const layout = readReplica('scripts/session-fixture-layout.ts')
      // The migrate script imports inspectSessionFixtureLayouts
      assert.match(migrate, /inspectSessionFixtureLayouts/)
      // The layout module exports it
      assert.match(layout, /export function inspectSessionFixtureLayouts/)
    })

    it('spec file imports canonicalSessionFixture from layout module', () => {
      const spec = readReplica('scripts/session-fixture-layout.spec.ts')
      const layout = readReplica('scripts/session-fixture-layout.ts')
      assert.match(spec, /canonicalSessionFixture/)
      assert.match(layout, /export function canonicalSessionFixture/)
    })

    it('snapshot file imports inspectSessionFixtureLayouts from layout module', () => {
      const snapshot = readReplica('scripts/session-fixture-layout.snapshot.ts')
      const layout = readReplica('scripts/session-fixture-layout.ts')
      assert.match(snapshot, /inspectSessionFixtureLayouts/)
      assert.match(layout, /export function inspectSessionFixtureLayouts/)
    })
  })

  // ── 9. Total line count ────────────────────────────────────────────────────

  describe('total line count', () => {
    it('totals 227 lines across 4 files', () => {
      let total = 0
      for (const file of SCRIPT_FILES) {
        total += readReplica(file).split('\n').length
      }
      assert.strictEqual(total, 227, `Expected 227 total lines, got ${total}`)
    })
  })

  // ── 10. package.json script reference ──────────────────────────────────────

  describe('package.json script reference', () => {
    it('ORIGINAL package.json has migrate:packed-session-fixtures script', () => {
      const pkg = readOriginal('package.json')
      assert.match(pkg, /migrate:packed-session-fixtures/)
    })

    it('REPLICA package.json has migrate:packed-session-fixtures script', () => {
      const pkg = readReplica('package.json')
      assert.match(pkg, /migrate:packed-session-fixtures/)
    })

    it('both package.json scripts point to same tsx command', () => {
      const origPkg = JSON.parse(readOriginal('package.json'))
      const replicaPkg = JSON.parse(readReplica('package.json'))
      assert.strictEqual(
        origPkg.scripts['migrate:packed-session-fixtures'],
        replicaPkg.scripts['migrate:packed-session-fixtures'],
      )
    })
  })
})

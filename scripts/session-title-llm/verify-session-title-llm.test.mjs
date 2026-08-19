/**
 * Verify script for Phase 4.7 — session-title-llm packages.
 *
 * Validates byte-identical replication of:
 * - packages/session/session-title-llm (8 files)
 * - packages/session/session-title-first-prompt-llm (10 files)
 * - packages/session/session-title-all-prompts-llm (8 files)
 * Total: 26 files.
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

const SESSION_TITLE_LLM_FILES = [
  'packages/session/session-title-llm/README.i18n.yaml',
  'packages/session/session-title-llm/README.md',
  'packages/session/session-title-llm/README.zh.md',
  'packages/session/session-title-llm/package.json',
  'packages/session/session-title-llm/src/index.ts',
  'packages/session/session-title-llm/src/invariant.ts',
  'packages/session/session-title-llm/tests/llm.spec.ts',
  'packages/session/session-title-llm/tsconfig.json',
]

const FIRST_PROMPT_LLM_FILES = [
  'packages/session/session-title-first-prompt-llm/README.i18n.yaml',
  'packages/session/session-title-first-prompt-llm/README.md',
  'packages/session/session-title-first-prompt-llm/README.zh.md',
  'packages/session/session-title-first-prompt-llm/package.json',
  'packages/session/session-title-first-prompt-llm/src/index.ts',
  'packages/session/session-title-first-prompt-llm/src/invariant.ts',
  'packages/session/session-title-first-prompt-llm/tests/loader-composition.spec.ts',
  'packages/session/session-title-first-prompt-llm/tests/provider.e2e.ts',
  'packages/session/session-title-first-prompt-llm/tests/provider.spec.ts',
  'packages/session/session-title-first-prompt-llm/tsconfig.json',
]

const ALL_PROMPTS_LLM_FILES = [
  'packages/session/session-title-all-prompts-llm/README.i18n.yaml',
  'packages/session/session-title-all-prompts-llm/README.md',
  'packages/session/session-title-all-prompts-llm/README.zh.md',
  'packages/session/session-title-all-prompts-llm/package.json',
  'packages/session/session-title-all-prompts-llm/src/index.ts',
  'packages/session/session-title-all-prompts-llm/src/invariant.ts',
  'packages/session/session-title-all-prompts-llm/tests/provider.spec.ts',
  'packages/session/session-title-all-prompts-llm/tsconfig.json',
]

const ALL_FILES = [
  ...SESSION_TITLE_LLM_FILES,
  ...FIRST_PROMPT_LLM_FILES,
  ...ALL_PROMPTS_LLM_FILES,
]

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Phase 4.7 — session-title-llm packages', () => {
  describe('File inventory', () => {
    it('has exactly 26 files across 3 packages', () => {
      assert.equal(ALL_FILES.length, 26)
      for (const f of ALL_FILES) {
        assert.ok(fileExists(f), `missing: ${f}`)
      }
    })

    it('session-title-llm has 8 files', () => {
      assert.equal(SESSION_TITLE_LLM_FILES.length, 8)
    })

    it('session-title-first-prompt-llm has 10 files', () => {
      assert.equal(FIRST_PROMPT_LLM_FILES.length, 10)
    })

    it('session-title-all-prompts-llm has 8 files', () => {
      assert.equal(ALL_PROMPTS_LLM_FILES.length, 8)
    })
  })

  describe('Byte-identical source files', () => {
    for (const f of ALL_FILES) {
      it(`${f} matches ORIGINAL`, () => {
        const orig = readOriginal(f)
        const rep = readReplica(f)
        assert.equal(orig, rep)
      })
    }
  })

  describe('session-title-llm package.json', () => {
    it('has correct name and version', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-title-llm/package.json'))
      assert.equal(pkg.name, '@deepseek-ai/dsh-session-title-llm')
      assert.equal(pkg.version, '0.1.0-rc.5')
    })

    it('has correct peer dependencies', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-title-llm/package.json'))
      const peers = Object.keys(pkg.peerDependencies)
      assert.ok(peers.includes('@deepseek-ai/dsh-invariants'))
      assert.ok(peers.includes('@deepseek-ai/dsh-llm'))
      assert.ok(peers.includes('@deepseek-ai/dsh-session'))
      assert.ok(peers.includes('@deepseek-ai/dsh-session-title'))
      assert.ok(peers.includes('@deepseek-ai/dsh-timeout'))
      assert.ok(peers.includes('@deepseek-ai/cordis'))
    })

    it('has correct exports', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-title-llm/package.json'))
      assert.ok(pkg.exports['.'])
      assert.ok(pkg.exports['./invariant'])
      assert.ok(pkg.exports['./src/*'])
      assert.ok(pkg.exports['./package.json'])
    })
  })

  describe('session-title-llm tsconfig.json', () => {
    it('has correct references', () => {
      const tsconfig = JSON.parse(readReplica('packages/session/session-title-llm/tsconfig.json'))
      const refs = tsconfig.references.map(r => r.path)
      assert.ok(refs.includes('../../../vendor/cosmokit'))
      assert.ok(refs.includes('../../../vendor/cordis'))
      assert.ok(refs.includes('../../../vendor/schemastery'))
      assert.ok(refs.includes('../../runtime-diagnostics/invariants'))
      assert.ok(refs.includes('../../llm/llm'))
      assert.ok(refs.includes('../../util/timeout'))
      assert.ok(refs.includes('../session-title'))
    })
  })

  describe('session-title-llm src/index.ts', () => {
    it('exports required symbols', () => {
      const src = readReplica('packages/session/session-title-llm/src/index.ts')
      assert.match(src, /export interface SessionTitleLlmRequestEventData/)
      assert.match(src, /export const SESSION_TITLE_TIMEOUT_CODE/)
      assert.match(src, /export interface SessionTitleLlmConfig/)
      assert.match(src, /export interface ResolvedSessionTitleLlmConfig/)
      assert.match(src, /export const SessionTitleLlmConfigFields/)
      assert.match(src, /export const SessionTitleLlmConfigSchema/)
      assert.match(src, /export function resolveSessionTitleLlmConfig/)
      assert.match(src, /export type SessionTitleLlmMessageSelector/)
      assert.match(src, /export function registerSessionTitleLlmProvider/)
      assert.match(src, /export async function generateSessionTitleWithLlm/)
    })

    it('has correct config validation logic', () => {
      const src = readReplica('packages/session/session-title-llm/src/index.ts')
      assert.match(src, /assertPositiveInteger/)
      assert.match(src, /CONFIG_KEYS/)
      assert.match(src, /unknown config key/)
      assert.match(src, /provider and model must be supplied together/)
      assert.match(src, /overrides must be non-empty strings/)
      assert.match(src, /timeoutMs must not exceed/)
    })

    it('has correct LLM call logic', () => {
      const src = readReplica('packages/session/session-title-llm/src/index.ts')
      assert.match(src, /frameMessages/)
      assert.match(src, /systemPrompt/)
      assert.match(src, /finishError/)
      assert.match(src, /BlockAssembler/)
      assert.match(src, /normalizeSessionTitle/)
      assert.match(src, /session\/title-llm-request/)
    })
  })

  describe('session-title-llm tests', () => {
    it('llm.spec.ts has 12 test cases (7 it + 2 it.each expanding to 5)', () => {
      const src = readReplica('packages/session/session-title-llm/tests/llm.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      const itEachMatches = src.match(/^\s*it\.each\(/gm) || []
      // 7 regular it() + 2 it.each() (one with 2 items, one with 3 items) = 12 runtime tests
      assert.equal(itMatches.length, 7, 'regular it() calls')
      assert.equal(itEachMatches.length, 2, 'it.each() calls')
    })
  })

  describe('session-title-first-prompt-llm package.json', () => {
    it('has correct name and version', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-title-first-prompt-llm/package.json'))
      assert.equal(pkg.name, '@deepseek-ai/dsh-session-title-first-prompt-llm')
      assert.equal(pkg.version, '0.1.0-rc.5')
    })

    it('has correct peer dependencies', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-title-first-prompt-llm/package.json'))
      const peers = Object.keys(pkg.peerDependencies)
      assert.ok(peers.includes('@deepseek-ai/dsh-session-title-llm'))
      assert.ok(peers.includes('@deepseek-ai/dsh-session-title'))
    })
  })

  describe('session-title-first-prompt-llm src/index.ts', () => {
    it('exports correct plugin metadata', () => {
      const src = readReplica('packages/session/session-title-first-prompt-llm/src/index.ts')
      assert.match(src, /export const name = 'session-title-first-prompt-llm'/)
      assert.match(src, /export const inject = \['sessionTitle', 'llm', 'sessions'\]/)
      assert.match(src, /export function apply/)
      assert.match(src, /registerSessionTitleLlmProvider/)
      assert.match(src, /'first-prompt'/)
    })

    it('selects only the first message', () => {
      const src = readReplica('packages/session/session-title-first-prompt-llm/src/index.ts')
      assert.match(src, /messages\[0\]/)
      assert.match(src, /requires one human message/)
    })
  })

  describe('session-title-first-prompt-llm tests', () => {
    it('loader-composition.spec.ts has 1 test', () => {
      const src = readReplica('packages/session/session-title-first-prompt-llm/tests/loader-composition.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      assert.equal(itMatches.length, 1)
    })

    it('provider.spec.ts has 2 tests', () => {
      const src = readReplica('packages/session/session-title-first-prompt-llm/tests/provider.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      assert.equal(itMatches.length, 2)
    })

    it('provider.e2e.ts has 1 test', () => {
      const src = readReplica('packages/session/session-title-first-prompt-llm/tests/provider.e2e.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      assert.equal(itMatches.length, 1)
    })
  })

  describe('session-title-all-prompts-llm package.json', () => {
    it('has correct name and version', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-title-all-prompts-llm/package.json'))
      assert.equal(pkg.name, '@deepseek-ai/dsh-session-title-all-prompts-llm')
      assert.equal(pkg.version, '0.1.0-rc.5')
    })

    it('has correct peer dependencies', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-title-all-prompts-llm/package.json'))
      const peers = Object.keys(pkg.peerDependencies)
      assert.ok(peers.includes('@deepseek-ai/dsh-session-title-llm'))
      assert.ok(peers.includes('@deepseek-ai/dsh-session-title'))
    })
  })

  describe('session-title-all-prompts-llm src/index.ts', () => {
    it('exports correct plugin metadata', () => {
      const src = readReplica('packages/session/session-title-all-prompts-llm/src/index.ts')
      assert.match(src, /export const name = 'session-title-all-prompts-llm'/)
      assert.match(src, /export const inject = \['sessionTitle', 'llm', 'sessions'\]/)
      assert.match(src, /export function apply/)
      assert.match(src, /registerSessionTitleLlmProvider/)
      assert.match(src, /'all-prompts'/)
    })

    it('selects all messages', () => {
      const src = readReplica('packages/session/session-title-all-prompts-llm/src/index.ts')
      assert.match(src, /messages => messages/)
    })
  })

  describe('session-title-all-prompts-llm tests', () => {
    it('provider.spec.ts has 1 test', () => {
      const src = readReplica('packages/session/session-title-all-prompts-llm/tests/provider.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      assert.equal(itMatches.length, 1)
    })
  })

  describe('Invariant companions', () => {
    for (const pkg of ['session-title-llm', 'session-title-first-prompt-llm', 'session-title-all-prompts-llm']) {
      it(`${pkg}/src/invariant.ts has correct structure`, () => {
        const src = readReplica(`packages/session/${pkg}/src/invariant.ts`)
        assert.match(src, /PACKAGE_NAME/)
        assert.match(src, /export const name = /)
        assert.match(src, /export const inject = \['invariants'\]/)
        assert.match(src, /InvariantInstaller/)
        assert.match(src, /ctx\.invariants\.register/)
      })
    }
  })

  describe('README files', () => {
    for (const pkg of ['session-title-llm', 'session-title-first-prompt-llm', 'session-title-all-prompts-llm']) {
      it(`${pkg} has README.md, README.zh.md, README.i18n.yaml`, () => {
        const md = readReplica(`packages/session/${pkg}/README.md`)
        const zh = readReplica(`packages/session/${pkg}/README.zh.md`)
        const yaml = readReplica(`packages/session/${pkg}/README.i18n.yaml`)
        assert.ok(md.length > 0)
        assert.ok(zh.length > 0)
        assert.ok(yaml.length > 0)
      })
    }
  })
})

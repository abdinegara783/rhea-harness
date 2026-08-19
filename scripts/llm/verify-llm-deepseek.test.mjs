/**
 * Verify script for Phase 5.2 — packages/llm/llm-deepseek.
 *
 * Validates byte-identical replication of the DeepSeek provider package:
 * - 7 src/*.ts files
 * - 9 tests/* files
 * - 5 config/doc files (package.json, tsconfig.json, 3 READMEs)
 * Total: 21 files.
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

const CONFIG_FILES = [
  'packages/llm/llm-deepseek/package.json',
  'packages/llm/llm-deepseek/tsconfig.json',
  'packages/llm/llm-deepseek/README.md',
  'packages/llm/llm-deepseek/README.zh.md',
  'packages/llm/llm-deepseek/README.i18n.yaml',
]

const SRC_FILES = [
  'packages/llm/llm-deepseek/src/adapter.ts',
  'packages/llm/llm-deepseek/src/index.ts',
  'packages/llm/llm-deepseek/src/invariant.ts',
  'packages/llm/llm-deepseek/src/serialize.ts',
  'packages/llm/llm-deepseek/src/sse.ts',
  'packages/llm/llm-deepseek/src/translate.ts',
  'packages/llm/llm-deepseek/src/types.ts',
]

const TEST_FILES = [
  'packages/llm/llm-deepseek/tests/adapter.e2e.ts',
  'packages/llm/llm-deepseek/tests/adapter.spec.ts',
  'packages/llm/llm-deepseek/tests/assemble.ts',
  'packages/llm/llm-deepseek/tests/dynamic-config.spec.ts',
  'packages/llm/llm-deepseek/tests/loader-composition.spec.ts',
  'packages/llm/llm-deepseek/tests/mock-server.ts',
  'packages/llm/llm-deepseek/tests/serialize.spec.ts',
  'packages/llm/llm-deepseek/tests/sse.spec.ts',
  'packages/llm/llm-deepseek/tests/translate.spec.ts',
]

const ALL_FILES = [...CONFIG_FILES, ...SRC_FILES, ...TEST_FILES]

// ── Fidelity: byte-identical ───────────────────────────────────────────────────

describe('byte-identical fidelity', () => {
  for (const file of ALL_FILES) {
    it(`replica ${file} is byte-identical to original`, () => {
      const original = readOriginal(file)
      const replica = readReplica(file)
      assert.strictEqual(replica, original, `${file} differs from original`)
    })
  }
})

// ── File existence ─────────────────────────────────────────────────────────────

describe('file existence', () => {
  it('21 files total in replica', () => {
    assert.strictEqual(ALL_FILES.length, 21)
  })

  for (const file of ALL_FILES) {
    it(`${file} exists in replica`, () => {
      assert.ok(fileExists(file), `${file} not found`)
    })
  }
})

// ── Package metadata ───────────────────────────────────────────────────────────

describe('package.json metadata', () => {
  const pkg = JSON.parse(readReplica('packages/llm/llm-deepseek/package.json'))

  it('has correct package name', () => {
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-llm-deepseek')
  })

  it('has correct description', () => {
    assert.ok(pkg.description.includes('DeepSeek chat-completions adapter'))
  })

  it('declares module type', () => {
    assert.strictEqual(pkg.type, 'module')
  })

  it('has main entry', () => {
    assert.strictEqual(pkg.main, 'lib/index.js')
  })

  it('has types entry', () => {
    assert.strictEqual(pkg.types, 'lib/types/index.d.ts')
  })

  it('exports 4 entry points (., ./invariant, ./src/*, ./package.json)', () => {
    const keys = Object.keys(pkg.exports)
    assert.deepStrictEqual(keys, ['.', './invariant', './src/*', './package.json'])
  })

  it('declares eventsource-parser as dependency', () => {
    assert.ok('eventsource-parser' in pkg.dependencies)
  })

  it('declares schemastery as dependency', () => {
    assert.strictEqual(pkg.dependencies['@deepseek-ai/schemastery'], 'workspace:^')
  })

  it('declares llm, credentials, settings, timeout, cordis as peer dependencies', () => {
    assert.ok('@deepseek-ai/dsh-llm' in pkg.peerDependencies)
    assert.ok('@deepseek-ai/dsh-credentials' in pkg.peerDependencies)
    assert.ok('@deepseek-ai/dsh-settings' in pkg.peerDependencies)
    assert.ok('@deepseek-ai/dsh-timeout' in pkg.peerDependencies)
    assert.ok('@deepseek-ai/cordis' in pkg.peerDependencies)
  })

  it('declares launch-environment, invariants, anonymous-user-id as peer dependencies', () => {
    assert.ok('@deepseek-ai/dsh-launch-environment' in pkg.peerDependencies)
    assert.ok('@deepseek-ai/dsh-invariants' in pkg.peerDependencies)
    assert.ok('@deepseek-ai/dsh-anonymous-user-id' in pkg.peerDependencies)
  })
})

// ── Exports API ────────────────────────────────────────────────────────────────

describe('exports API', () => {
  const index = readReplica('packages/llm/llm-deepseek/src/index.ts')

  it('re-exports DeepSeekAdapter and constants from adapter', () => {
    assert.ok(index.includes("DeepSeekAdapter"))
    assert.ok(index.includes("DEFAULT_CONTEXT_WINDOW"))
    assert.ok(index.includes("DEFAULT_MAX_TOKENS"))
    assert.ok(index.includes("DEFAULT_STREAM_IDLE_TIMEOUT_MS"))
  })

  it('exports Config interface and schema', () => {
    assert.ok(index.includes('export interface Config'))
    assert.ok(index.includes('export const Config'))
  })

  it('exports resolveAdapterOptions function', () => {
    assert.ok(index.includes('export function resolveAdapterOptions'))
  })

  it('exports apply function (Cordis plugin contract)', () => {
    assert.ok(index.includes('export function apply'))
  })

  it('declares plugin name and inject', () => {
    assert.ok(index.includes("export const name = 'llm-deepseek'"))
    assert.ok(index.includes("export const inject = ['llm']"))
  })

  it('exports PUBLIC_BASE_URL constant', () => {
    assert.ok(index.includes("export const PUBLIC_BASE_URL"))
  })

  it('does NOT export wire helpers (serialize, sse, translate)', () => {
    // Wire helpers are internal; only the plugin contract + adapter are public.
    assert.ok(!index.includes("export * from './serialize.ts'"))
    assert.ok(!index.includes("export * from './sse.ts'"))
    assert.ok(!index.includes("export * from './translate.ts'"))
  })
})

// ── Source structure ───────────────────────────────────────────────────────────

describe('source structure', () => {
  const adapter = readReplica('packages/llm/llm-deepseek/src/adapter.ts')
  const serialize = readReplica('packages/llm/llm-deepseek/src/serialize.ts')
  const sse = readReplica('packages/llm/llm-deepseek/src/sse.ts')
  const translate = readReplica('packages/llm/llm-deepseek/src/translate.ts')
  const types = readReplica('packages/llm/llm-deepseek/src/types.ts')

  it('adapter.ts defines DeepSeekAdapter class extending LlmAdapter', () => {
    assert.ok(adapter.includes('export class DeepSeekAdapter extends LlmAdapter'))
  })

  it('adapter.ts defines httpErrorCode function', () => {
    assert.ok(adapter.includes('export function httpErrorCode'))
  })

  it('adapter.ts defines connection and adapter option interfaces', () => {
    assert.ok(adapter.includes('export interface DeepSeekConnectionOptions'))
    assert.ok(adapter.includes('export interface DeepSeekAdapterOptions'))
    assert.ok(adapter.includes('export interface DeepSeekCatalogModel'))
  })

  it('serialize.ts defines serializeMessages and serializeRequest', () => {
    assert.ok(serialize.includes('export function serializeMessages'))
    assert.ok(serialize.includes('export function serializeRequest'))
  })

  it('sse.ts defines parseSse and DONE sentinel', () => {
    assert.ok(sse.includes("export const DONE = '[DONE]'"))
    assert.ok(sse.includes('export async function* parseSse'))
  })

  it('translate.ts defines translate, mapFinishReason, mapUsage', () => {
    assert.ok(translate.includes('export async function* translate'))
    assert.ok(translate.includes('export function mapFinishReason'))
    assert.ok(translate.includes('export function mapUsage'))
  })

  it('types.ts defines wire format interfaces', () => {
    assert.ok(types.includes('export interface WireRequest'))
    assert.ok(types.includes('export interface WireMessage') || types.includes('export type WireMessage'))
    assert.ok(types.includes('export interface WireChunk'))
    assert.ok(types.includes('export interface WireUsage'))
    assert.ok(types.includes('export interface WireError'))
  })
})

// ── Test file spec counts ──────────────────────────────────────────────────────

describe('test file spec counts', () => {
  function countSpecs(relPath) {
    const content = readReplica(relPath)
    const itMatches = content.match(/\bit\(/g) ?? []
    const itEachMatches = content.match(/\bit\.each\(/g) ?? []
    return itMatches.length + itEachMatches.length
  }

  it('adapter.spec.ts has at least 30 test cases', () => {
    assert.ok(countSpecs('packages/llm/llm-deepseek/tests/adapter.spec.ts') >= 30)
  })

  it('serialize.spec.ts has at least 15 test cases', () => {
    assert.ok(countSpecs('packages/llm/llm-deepseek/tests/serialize.spec.ts') >= 15)
  })

  it('sse.spec.ts has at least 5 test cases', () => {
    assert.ok(countSpecs('packages/llm/llm-deepseek/tests/sse.spec.ts') >= 5)
  })

  it('translate.spec.ts has at least 15 test cases', () => {
    assert.ok(countSpecs('packages/llm/llm-deepseek/tests/translate.spec.ts') >= 15)
  })

  it('dynamic-config.spec.ts has at least 5 test cases', () => {
    assert.ok(countSpecs('packages/llm/llm-deepseek/tests/dynamic-config.spec.ts') >= 5)
  })

  it('loader-composition.spec.ts has at least 3 test cases', () => {
    assert.ok(countSpecs('packages/llm/llm-deepseek/tests/loader-composition.spec.ts') >= 3)
  })

  it('adapter.e2e.ts has at least 4 test cases', () => {
    assert.ok(countSpecs('packages/llm/llm-deepseek/tests/adapter.e2e.ts') >= 4)
  })
})

// ── README content ─────────────────────────────────────────────────────────────

describe('README content', () => {
  const readme = readReplica('packages/llm/llm-deepseek/README.md')

  it('mentions DeepSeek chat-completions adapter', () => {
    assert.ok(readme.includes('DeepSeek chat-completions adapter'))
  })

  it('documents the deepseek-official provider route', () => {
    assert.ok(readme.includes('deepseek-official'))
  })

  it('documents thinking mode configuration', () => {
    assert.ok(readme.includes('thinking'))
    assert.ok(readme.includes('reasoningEffort'))
  })

  it('documents dynamic configuration (settings + credentials)', () => {
    assert.ok(readme.includes('Dynamic configuration'))
    assert.ok(readme.includes('ctx.settings'))
    assert.ok(readme.includes('ctx.credentials'))
  })

  it('documents error codes', () => {
    assert.ok(readme.includes('AUTH'))
    assert.ok(readme.includes('RATE_LIMIT'))
    assert.ok(readme.includes('TRANSPORT'))
    assert.ok(readme.includes('STREAM_CLOSED'))
  })

  it('documents wire-format notes', () => {
    assert.ok(readme.includes('[DONE]'))
    assert.ok(readme.includes('stream_options'))
  })
})

// ── tsconfig references ────────────────────────────────────────────────────────

describe('tsconfig references', () => {
  const tsconfig = JSON.parse(readReplica('packages/llm/llm-deepseek/tsconfig.json'))

  it('extends tsconfig.base.json', () => {
    assert.ok(tsconfig.extends.includes('tsconfig.base.json'))
  })

  it('has rootDir set to src', () => {
    assert.strictEqual(tsconfig.compilerOptions.rootDir, 'src')
  })

  it('references llm, cordis, schemastery, credentials, settings, timeout, invariants, anonymous-user-id, launch-environment', () => {
    const paths = tsconfig.references.map(r => r.path)
    assert.ok(paths.some(p => p.includes('llm/llm')))
    assert.ok(paths.some(p => p.includes('cordis')))
    assert.ok(paths.some(p => p.includes('schemastery')))
    assert.ok(paths.some(p => p.includes('credentials')))
    assert.ok(paths.some(p => p.includes('settings')))
    assert.ok(paths.some(p => p.includes('timeout')))
    assert.ok(paths.some(p => p.includes('invariants')))
    assert.ok(paths.some(p => p.includes('anonymous-user-id')))
    assert.ok(paths.some(p => p.includes('launch-environment')))
  })
})

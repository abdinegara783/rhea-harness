/**
 * Verify script for Phase 5.1 — packages/llm/llm.
 *
 * Validates byte-identical replication of the LLM service definition package:
 * - 14 src/*.ts files
 * - 11 tests/*.spec.ts files  
 * - 5 config/doc files (package.json, tsconfig.json, 3 READMEs)
 * Total: 30 files.
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
  'packages/llm/llm/package.json',
  'packages/llm/llm/tsconfig.json',
  'packages/llm/llm/README.md',
  'packages/llm/llm/README.zh.md',
  'packages/llm/llm/README.i18n.yaml',
]

const SRC_FILES = [
  'packages/llm/llm/src/adapter-failure.ts',
  'packages/llm/llm/src/api-key.ts',
  'packages/llm/llm/src/assembler.ts',
  'packages/llm/llm/src/attribution.ts',
  'packages/llm/llm/src/brand.ts',
  'packages/llm/llm/src/call-config.ts',
  'packages/llm/llm/src/content.ts',
  'packages/llm/llm/src/error.ts',
  'packages/llm/llm/src/index.ts',
  'packages/llm/llm/src/invariant.ts',
  'packages/llm/llm/src/message.ts',
  'packages/llm/llm/src/never.ts',
  'packages/llm/llm/src/retry-policy.ts',
  'packages/llm/llm/src/types.ts',
]

const TEST_FILES = [
  'packages/llm/llm/tests/adapter-failure.spec.ts',
  'packages/llm/llm/tests/api-key.spec.ts',
  'packages/llm/llm/tests/assembler.spec.ts',
  'packages/llm/llm/tests/attribution.spec.ts',
  'packages/llm/llm/tests/call-config.spec.ts',
  'packages/llm/llm/tests/invariant.spec.ts',
  'packages/llm/llm/tests/message.spec.ts',
  'packages/llm/llm/tests/properties.spec.ts',
  'packages/llm/llm/tests/retry-policy.spec.ts',
  'packages/llm/llm/tests/service.spec.ts',
  'packages/llm/llm/tests/topology.spec.ts',
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
  it('30 files total in replica', () => {
    assert.strictEqual(ALL_FILES.length, 30)
  })

  for (const file of ALL_FILES) {
    it(`${file} exists in replica`, () => {
      assert.ok(fileExists(file), `${file} not found`)
    })
  }
})

// ── Package metadata ───────────────────────────────────────────────────────────

describe('package.json metadata', () => {
  const pkg = JSON.parse(readReplica('packages/llm/llm/package.json'))

  it('has correct package name', () => {
    assert.strictEqual(pkg.name, '@deepseek-ai/dsh-llm')
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

  it('exports 7 entry points', () => {
    const keys = Object.keys(pkg.exports)
    assert.deepStrictEqual(keys, ['.', './invariant', './types', './brand', './message', './src/*', './package.json'])
  })

  it('declares schemastery as dependency', () => {
    assert.strictEqual(pkg.dependencies['@deepseek-ai/schemastery'], 'workspace:^')
  })

  it('declares cordis, brand, invariants, timeout, attachment as peer dependencies', () => {
    assert.ok('@deepseek-ai/cordis' in pkg.peerDependencies)
    assert.ok('@deepseek-ai/dsh-brand' in pkg.peerDependencies)
    assert.ok('@deepseek-ai/dsh-invariants' in pkg.peerDependencies)
    assert.ok('@deepseek-ai/dsh-timeout' in pkg.peerDependencies)
    assert.ok('@deepseek-ai/dsh-attachment' in pkg.peerDependencies)
  })
})

// ── Exports API ────────────────────────────────────────────────────────────────

describe('exports API', () => {
  const index = readReplica('packages/llm/llm/src/index.ts')

  it('re-exports attribution, brand, never, error, api-key, types, content, message, retry-policy', () => {
    assert.ok(index.includes("export * from './attribution.ts'"))
    assert.ok(index.includes("export * from './brand.ts'"))
    assert.ok(index.includes("export * from './never.ts'"))
    assert.ok(index.includes("export * from './error.ts'"))
    assert.ok(index.includes("export * from './api-key.ts'"))
    assert.ok(index.includes("export * from './types.ts'"))
    assert.ok(index.includes("export * from './content.ts'"))
    assert.ok(index.includes("export * from './message.ts'"))
    assert.ok(index.includes("export * from './retry-policy.ts'"))
  })

  it('exports BlockAssembler from assembler', () => {
    assert.ok(index.includes("export { BlockAssembler } from './assembler.ts'"))
  })

  it('exports callConfigEquals, deepFreeze, isAgentLoopRequest, markAgentLoopRequest from call-config', () => {
    assert.ok(index.includes("export { callConfigEquals, deepFreeze, isAgentLoopRequest, markAgentLoopRequest } from './call-config.ts'"))
  })

  it('exports LlmCallConfig, LlmCallConfigAdapterDefaults types', () => {
    assert.ok(index.includes("export type { LlmCallConfig, LlmCallConfigAdapterDefaults } from './call-config.ts'"))
  })

  it('declares cordis module augmentation for llm context key', () => {
    assert.ok(index.includes("declare module '@deepseek-ai/cordis'"))
    assert.ok(index.includes('llm: LlmRuntime'))
  })

  it('declares llm/stream waterfall event', () => {
    assert.ok(index.includes("'llm/stream'"))
    assert.ok(index.includes('waterfall'))
  })

  it('declares llm/adapters-updated emit event in types.ts', () => {
    const types = readReplica('packages/llm/llm/src/types.ts')
    assert.ok(types.includes("'llm/adapters-updated'"))
    assert.ok(types.includes('emit'))
  })

  it('exports LlmRuntime as default', () => {
    assert.ok(index.includes('export default LlmRuntime'))
  })
})

// ── Key types ──────────────────────────────────────────────────────────────────

describe('key types', () => {
  it('LlmAdapter is abstract with stream() required', () => {
    const index = readReplica('packages/llm/llm/src/index.ts')
    assert.ok(index.includes('export abstract class LlmAdapter'))
    assert.ok(index.includes('abstract stream(options: GenerateOptions): AsyncIterable<StreamChunk>'))
  })

  it('LlmError extends HarnessError', () => {
    const index = readReplica('packages/llm/llm/src/index.ts')
    assert.ok(index.includes('export class LlmError extends HarnessError'))
    assert.ok(index.includes('readonly failure: LlmFailure'))
  })

  it('HarnessError base class in error.ts', () => {
    const error = readReplica('packages/llm/llm/src/error.ts')
    assert.ok(error.includes('export class HarnessError extends Error'))
    assert.ok(error.includes('readonly code: string'))
  })

  it('BlockAssembler in assembler.ts', () => {
    const assembler = readReplica('packages/llm/llm/src/assembler.ts')
    assert.ok(assembler.includes('export class BlockAssembler'))
    assert.ok(assembler.includes('push(chunk: StreamChunk)'))
    assert.ok(assembler.includes('blocks(): ContentBlock[]'))
    assert.ok(assembler.includes('message(source: MessageSource'))
  })

  it('Message creation helpers in message.ts', () => {
    const msg = readReplica('packages/llm/llm/src/message.ts')
    assert.ok(msg.includes('export function createMessage'))
    assert.ok(msg.includes('export function createUserMessage'))
    assert.ok(msg.includes('export function createAssistantMessage'))
    assert.ok(msg.includes('export function createToolResultMessage'))
    assert.ok(msg.includes('export function freezeMessage'))
  })

  it('ContentBlock types in types.ts', () => {
    const types = readReplica('packages/llm/llm/src/types.ts')
    assert.ok(types.includes('TextBlock'))
    assert.ok(types.includes('ReasoningBlock'))
    assert.ok(types.includes('ImageBlock'))
    assert.ok(types.includes('ToolCallBlock'))
    assert.ok(types.includes('ToolResultBlock'))
  })

  it('StreamChunk union in types.ts', () => {
    const types = readReplica('packages/llm/llm/src/types.ts')
    assert.ok(types.includes('block-start'))
    assert.ok(types.includes('text-delta'))
    assert.ok(types.includes('reasoning-delta'))
    assert.ok(types.includes('tool-call-delta'))
    assert.ok(types.includes('block-end'))
    assert.ok(types.includes('usage'))
    assert.ok(types.includes('finish'))
  })

  it('GenerateOptions in types.ts', () => {
    const types = readReplica('packages/llm/llm/src/types.ts')
    assert.ok(types.includes('export interface GenerateOptions'))
    assert.ok(types.includes('provider: string'))
    assert.ok(types.includes('model: string'))
    assert.ok(types.includes('messages: Message[]'))
    assert.ok(types.includes('signal?: AbortSignal'))
  })

  it('branded types (MessageId, CallId, ProviderRequestId, ReasoningEffortId)', () => {
    const brand = readReplica('packages/llm/llm/src/brand.ts')
    assert.ok(brand.includes('export type MessageId'))
    assert.ok(brand.includes('export function MessageId'))
    assert.ok(brand.includes('export type CallId'))
    assert.ok(brand.includes('export function CallId'))
    assert.ok(brand.includes('export type ProviderRequestId'))
    assert.ok(brand.includes('export function ProviderRequestId'))
    assert.ok(brand.includes('export type ReasoningEffortId'))
    assert.ok(brand.includes('export function ReasoningEffortId'))
  })

  it('retry policy with normal and always modes', () => {
    const rp = readReplica('packages/llm/llm/src/retry-policy.ts')
    assert.ok(rp.includes("export function resolveRetryPolicy"))
    assert.ok(rp.includes("mode: 'normal'"))
    assert.ok(rp.includes("mode: 'always'"))
    assert.ok(rp.includes("export const RetryPolicySchema"))
  })

  it('invariant companion plugin', () => {
    const inv = readReplica('packages/llm/llm/src/invariant.ts')
    assert.ok(inv.includes("export const name = 'llm-invariant'"))
    assert.ok(inv.includes("export const inject = ['invariants']"))
    assert.ok(inv.includes('export const apply'))
  })
})

// ── README content ─────────────────────────────────────────────────────────────

describe('README content', () => {
  const readme = readReplica('packages/llm/llm/README.md')

  it('describes the LlmRuntime service', () => {
    assert.ok(readme.includes('LlmRuntime'))
    assert.ok(readme.includes('ctx key: `llm`'))
  })

  it('documents registerAdapter API', () => {
    assert.ok(readme.includes('registerAdapter'))
  })

  it('documents llm/stream waterfall event', () => {
    assert.ok(readme.includes('llm/stream'))
    assert.ok(readme.includes('waterfall'))
  })

  it('documents BlockAssembler', () => {
    assert.ok(readme.includes('BlockAssembler'))
  })

  it('documents adapter failure normalization', () => {
    assert.ok(readme.includes('normalizes failures from final adapter'))
  })

  it('has Chinese translation', () => {
    const zh = readReplica('packages/llm/llm/README.zh.md')
    assert.ok(zh.includes('dsh-llm'))
    assert.ok(zh.includes('LlmRuntime'))
    assert.ok(zh.includes('中文'))
  })

  it('has i18n consistency record', () => {
    const i18n = readReplica('packages/llm/llm/README.i18n.yaml')
    assert.ok(i18n.includes('README.md:'))
    assert.ok(i18n.includes('README.zh.md:'))
  })
})

// ── Test spec count ────────────────────────────────────────────────────────────

describe('test spec count', () => {
  it('has 11 test files total', () => {
    assert.strictEqual(TEST_FILES.length, 11)
  })

  it('adapter-failure.spec.ts has 5 tests', () => {
    const match = readReplica('packages/llm/llm/tests/adapter-failure.spec.ts').match(/^\s*it(?:\.each)?\(/gm)
    assert.strictEqual(match?.length, 5)
  })

  it('api-key.spec.ts has 10 tests', () => {
    const match = readReplica('packages/llm/llm/tests/api-key.spec.ts').match(/^\s*it(?:\.each)?\(/gm)
    assert.strictEqual(match?.length, 10)
  })

  it('assembler.spec.ts has 14 tests', () => {
    const match = readReplica('packages/llm/llm/tests/assembler.spec.ts').match(/^\s*it(?:\.each)?\(/gm)
    assert.strictEqual(match?.length, 14)
  })

  it('attribution.spec.ts has 6 tests', () => {
    const match = readReplica('packages/llm/llm/tests/attribution.spec.ts').match(/^\s*it(?:\.each)?\(/gm)
    assert.strictEqual(match?.length, 6)
  })

  it('call-config.spec.ts has 6 tests', () => {
    const match = readReplica('packages/llm/llm/tests/call-config.spec.ts').match(/^\s*it(?:\.each)?\(/gm)
    assert.strictEqual(match?.length, 6)
  })

  it('invariant.spec.ts has 6 tests', () => {
    const match = readReplica('packages/llm/llm/tests/invariant.spec.ts').match(/^\s*it(?:\.each)?\(/gm)
    assert.strictEqual(match?.length, 6)
  })

  it('message.spec.ts has 4 tests', () => {
    const match = readReplica('packages/llm/llm/tests/message.spec.ts').match(/^\s*it(?:\.each)?\(/gm)
    assert.strictEqual(match?.length, 4)
  })

  it('properties.spec.ts has 4 tests', () => {
    const match = readReplica('packages/llm/llm/tests/properties.spec.ts').match(/^\s*it(?:\.each)?\(/gm)
    assert.strictEqual(match?.length, 4)
  })

  it('retry-policy.spec.ts has 4 tests', () => {
    const match = readReplica('packages/llm/llm/tests/retry-policy.spec.ts').match(/^\s*it(?:\.each)?\(/gm)
    assert.strictEqual(match?.length, 4)
  })

  it('service.spec.ts has 56 tests', () => {
    const match = readReplica('packages/llm/llm/tests/service.spec.ts').match(/^\s*it(?:\.each)?\(/gm)
    assert.strictEqual(match?.length, 56)
  })

  it('topology.spec.ts has 17 tests', () => {
    const match = readReplica('packages/llm/llm/tests/topology.spec.ts').match(/^\s*it(?:\.each)?\(/gm)
    assert.strictEqual(match?.length, 17)
  })
})

// ── tsconfig references ────────────────────────────────────────────────────────

describe('tsconfig references', () => {
  const tsconfig = JSON.parse(readReplica('packages/llm/llm/tsconfig.json'))

  it('extends base tsconfig', () => {
    assert.strictEqual(tsconfig.extends, '../../../tsconfig.base.json')
  })

  it('references 6 packages', () => {
    assert.strictEqual(tsconfig.references.length, 6)
  })

  it('references cosmokit, cordis, brand, attachment, invariants, timeout', () => {
    const paths = tsconfig.references.map(r => r.path)
    assert.ok(paths.includes('../../../vendor/cosmokit'))
    assert.ok(paths.includes('../../../vendor/cordis'))
    assert.ok(paths.includes('../../util/brand'))
    assert.ok(paths.includes('../../attachment/attachment'))
    assert.ok(paths.includes('../../runtime-diagnostics/invariants'))
    assert.ok(paths.includes('../../util/timeout'))
  })
})

// ── Error codes ────────────────────────────────────────────────────────────────

describe('error codes', () => {
  const error = readReplica('packages/llm/llm/src/error.ts')

  it('defines CONTEXT_WINDOW_EXCEEDED_CODE', () => {
    assert.ok(error.includes("export const CONTEXT_WINDOW_EXCEEDED_CODE = 'CONTEXT_WINDOW_EXCEEDED'"))
  })

  it('defines QUOTA_EXCEEDED_CODE', () => {
    assert.ok(error.includes("export const QUOTA_EXCEEDED_CODE = 'QUOTA'"))
  })

  it('defines EMPTY_RESPONSE_CODE', () => {
    assert.ok(error.includes("export const EMPTY_RESPONSE_CODE = 'EMPTY_RESPONSE'"))
  })

  it('defines INVALID_CREDENTIAL_CODE', () => {
    assert.ok(error.includes("export const INVALID_CREDENTIAL_CODE = 'INVALID_CREDENTIAL'"))
  })

  it('has isContextWindowExceededError classifier', () => {
    assert.ok(error.includes('export function isContextWindowExceededError'))
  })

  it('has isQuotaExceededError classifier', () => {
    assert.ok(error.includes('export function isQuotaExceededError'))
  })

  it('has errorChain rendering', () => {
    assert.ok(error.includes('export function errorChain'))
  })

  it('has isHarnessError narrowing', () => {
    assert.ok(error.includes('export function isHarnessError'))
  })
})

// ── API key validation ─────────────────────────────────────────────────────────

describe('api key validation', () => {
  const ak = readReplica('packages/llm/llm/src/api-key.ts')

  it('has normalizeApiKey function', () => {
    assert.ok(ak.includes('export function normalizeApiKey'))
  })

  it('defines LEGAL_API_KEY regex', () => {
    assert.ok(ak.includes('LEGAL_API_KEY'))
  })

  it('defines ApiKeyCheck type', () => {
    assert.ok(ak.includes('export type ApiKeyCheck'))
  })
})

// ── Attribution ────────────────────────────────────────────────────────────────

describe('attribution', () => {
  const attr = readReplica('packages/llm/llm/src/attribution.ts')

  it('has APP_IDENTITY', () => {
    assert.ok(attr.includes('export const APP_IDENTITY'))
  })

  it('has userAgent function', () => {
    assert.ok(attr.includes('export function userAgent'))
  })

  it('has attributionHeaders function', () => {
    assert.ok(attr.includes('export function attributionHeaders'))
  })
})

// ── Content helper ─────────────────────────────────────────────────────────────

describe('content helper', () => {
  const content = readReplica('packages/llm/llm/src/content.ts')

  it('has contentHasImage function', () => {
    assert.ok(content.includes('export function contentHasImage'))
  })
})

// ── assertNever ────────────────────────────────────────────────────────────────

describe('assertNever', () => {
  const never = readReplica('packages/llm/llm/src/never.ts')

  it('has assertNever function', () => {
    assert.ok(never.includes('export function assertNever'))
  })
})
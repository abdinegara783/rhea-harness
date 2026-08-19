/**
 * Verify script for packages/core/session (Phase 4.2).
 *
 * Checks that every source file, export, class, type, and constant from the
 * ORIGINAL @deepseek-ai/dsh-session package is present byte-identical in the
 * REPLICA. 29 tests total.
 */

import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPLICA = resolve(__dirname, '../../packages/core/session')
const ORIGINAL = resolve(__dirname, '../../../deepseek-harness/packages/core/session')

function readBoth(rel) {
  return {
    orig: readFileSync(resolve(ORIGINAL, rel), 'utf8'),
    repl: readFileSync(resolve(REPLICA, rel), 'utf8'),
  }
}

function fileExists(rel) {
  return existsSync(resolve(REPLICA, rel))
}

// ─── 1. File existence (29 files) ──────────────────────────────────────────

const ROOT_FILES = [
  'package.json', 'tsconfig.json', 'tsdown.config.ts',
  'README.md', 'README.zh.md', 'README.i18n.yaml',
]
const SRC_FILES = [
  'index.ts', 'types.ts', 'surface.ts', 'invariant.ts',
  'chunk-rows.ts', 'json.ts', 'repair.ts', 'request-header.ts',
  'preparation.ts', 'known-event-types.ts',
]
const TEST_FILES = [
  'chunk-rows.spec.ts', 'derived-cache.spec.ts', 'fork.spec.ts',
  'gen-persistence-catalog.spec.ts', 'invariant.spec.ts', 'json.spec.ts',
  'properties.spec.ts', 'repair.spec.ts', 'request-header.spec.ts',
  'scoped.spec.ts', 'session.spec.ts', 'surface.spec.ts', 'typert.spec.ts',
]

describe('core/session — file layout', () => {
  it('has every root config and README file', () => {
    for (const f of ROOT_FILES) expect(fileExists(f), `missing ${f}`).toBe(true)
  })

  it('has every src/ source file', () => {
    for (const f of SRC_FILES) expect(fileExists(`src/${f}`), `missing src/${f}`).toBe(true)
  })

  it('has every tests/ spec file', () => {
    for (const f of TEST_FILES) expect(fileExists(`tests/${f}`), `missing tests/${f}`).toBe(true)
  })

  // ─── 2. Byte-identity ──────────────────────────────────────────────────────

  it('root files are byte-identical to ORIGINAL', () => {
    for (const f of ROOT_FILES) {
      const { orig, repl } = readBoth(f)
      expect(repl, `${f} differs`).toBe(orig)
    }
  })

  it('src/ files are byte-identical to ORIGINAL', () => {
    for (const f of SRC_FILES) {
      const { orig, repl } = readBoth(`src/${f}`)
      expect(repl, `src/${f} differs`).toBe(orig)
    }
  })

  it('tests/ files are byte-identical to ORIGINAL', () => {
    for (const f of TEST_FILES) {
      const { orig, repl } = readBoth(`tests/${f}`)
      expect(repl, `tests/${f} differs`).toBe(orig)
    }
  })

  // ─── 3. Package metadata ───────────────────────────────────────────────────

  it('package.json has correct name and version', () => {
    const pkg = JSON.parse(readFileSync(resolve(REPLICA, 'package.json'), 'utf8'))
    expect(pkg.name).toBe('@deepseek-ai/dsh-session')
    expect(pkg.version).toBe('0.1.0-rc.5')
  })

  it('exports all required subpath entries', () => {
    const pkg = JSON.parse(readFileSync(resolve(REPLICA, 'package.json'), 'utf8'))
    expect(pkg.exports).toHaveProperty('.')
    expect(pkg.exports).toHaveProperty('./invariant')
    expect(pkg.exports).toHaveProperty('./types')
    expect(pkg.exports).toHaveProperty('./surface')
    expect(pkg.exports).toHaveProperty('./src/*')
    expect(pkg.exports).toHaveProperty('./package.json')
  })

  it('declares the correct peer dependencies', () => {
    const pkg = JSON.parse(readFileSync(resolve(REPLICA, 'package.json'), 'utf8'))
    const peers = Object.keys(pkg.peerDependencies || {})
    expect(peers).toContain('@deepseek-ai/dsh-brand')
    expect(peers).toContain('@deepseek-ai/dsh-invariants')
    expect(peers).toContain('@deepseek-ai/dsh-llm')
    expect(peers).toContain('@deepseek-ai/dsh-scope')
    expect(peers).toContain('@deepseek-ai/dsh-typert-protocol')
    expect(peers).toContain('@deepseek-ai/cordis')
  })

  // ─── 4. src/index.ts — main Session class and SessionStore ─────────────────

  it('index.ts exports Session class with key methods', () => {
    const src = readFileSync(resolve(REPLICA, 'src/index.ts'), 'utf8')
    expect(src).toMatch(/export class Session/)
    expect(src).toMatch(/append\s*</) // generic append method
    expect(src).toMatch(/deriveMessages\s*\(/)
    expect(src).toMatch(/deriveEventMessage\s*\(/)
    expect(src).toMatch(/get events\s*\(\)/)
    expect(src).toMatch(/get seq\s*\(\)/)
    expect(src).toMatch(/get id\s*\(\)/)
    expect(src).toMatch(/get surface\s*\(\)/)
    expect(src).toMatch(/requestHeader\s*\(/)
    expect(src).toMatch(/requestContext\s*\(/)
    expect(src).toMatch(/static create\s*\(/)
    expect(src).toMatch(/static fromRestore\s*\(/)
    expect(src).toMatch(/readonly firstLiveSeq/)
    expect(src).toMatch(/readonly header:\s*SessionHeader/)
  })

  it('index.ts exports SessionStore class with key methods', () => {
    const src = readFileSync(resolve(REPLICA, 'src/index.ts'), 'utf8')
    expect(src).toMatch(/export class SessionStore extends Service/)
    expect(src).toMatch(/create\s*\(/)
    expect(src).toMatch(/prepare\s*\(/)
    expect(src).toMatch(/enter\s*\(/)
    expect(src).toMatch(/announce\s*\(/)
    expect(src).toMatch(/async flush\s*\(/)
    expect(src).toMatch(/get\s*\(/)
    expect(src).toMatch(/list\s*\(\)/)
    expect(src).toMatch(/fork\s*\(/)
  })

  it('index.ts re-exports from all submodules', () => {
    const src = readFileSync(resolve(REPLICA, 'src/index.ts'), 'utf8')
    expect(src).toMatch(/export \* from '\.\/types\.ts'/)
    expect(src).toMatch(/export \{ SessionPreparation \}/)
    expect(src).toMatch(/export \{ isJsonValue, snapshotJsonValue \}/)
    expect(src).toMatch(/export \{ interruptedTurnClosers, TOOL_NOT_STARTED, TOOL_OUTCOME_UNKNOWN \}/)
    expect(src).toMatch(/export \{ decodeStorageRecord, packChunkRuns \}/)
    expect(src).toMatch(/export \{ deriveEventMessage, foldSurface/)
    expect(src).toMatch(/export \{ canonicalHeader, foldRequestHeader, headerEquals \}/)
    expect(src).toMatch(/export \{ KNOWN_SESSION_EVENT_TYPES \}/)
  })

  it('index.ts declares Cordis module augmentations', () => {
    const src = readFileSync(resolve(REPLICA, 'src/index.ts'), 'utf8')
    expect(src).toMatch(/declare module '@deepseek-ai\/cordis'/)
    expect(src).toMatch(/sessions: SessionStore/)
    expect(src).toMatch(/'session\/created'/)
    expect(src).toMatch(/'session\/disposed'/)
    expect(src).toMatch(/'session\/event'/)
    expect(src).toMatch(/'session\/flush'/)
  })

  it('index.ts declares Typert module augmentation', () => {
    const src = readFileSync(resolve(REPLICA, 'src/index.ts'), 'utf8')
    expect(src).toMatch(/declare module '@deepseek-ai\/dsh-typert-protocol'/)
    expect(src).toMatch(/TypertLookupMap/)
    expect(src).toMatch(/session: TypertLookup<Session, SessionId>/)
  })

  it('index.ts has SessionForkError and fork helpers', () => {
    const src = readFileSync(resolve(REPLICA, 'src/index.ts'), 'utf8')
    expect(src).toMatch(/export type SessionForkSource/)
    expect(src).toMatch(/export type SessionForkErrorCode/)
    expect(src).toMatch(/export class SessionForkError/)
    expect(src).toMatch(/SESSION_NOT_FOUND/)
    expect(src).toMatch(/SESSION_NOT_LIVE/)
    expect(src).toMatch(/SESSION_ALREADY_EXISTS/)
    expect(src).toMatch(/INVALID_BOUNDARY/)
    expect(src).toMatch(/OPEN_TURN/)
  })

  it('index.ts has adoptSessionEvent and snapshotSessionEvent', () => {
    const src = readFileSync(resolve(REPLICA, 'src/index.ts'), 'utf8')
    expect(src).toMatch(/export function adoptSessionEvent/)
    expect(src).toMatch(/export function snapshotSessionEvent/)
  })

  // ─── 5. src/types.ts ──────────────────────────────────────────────────────

  it('types.ts defines SessionId brand and SESSION_FORMAT_VERSION', () => {
    const src = readFileSync(resolve(REPLICA, 'src/types.ts'), 'utf8')
    expect(src).toMatch(/export type SessionId = Branded<'SessionId'>/)
    expect(src).toMatch(/export function SessionId\(id: string\)/)
    expect(src).toMatch(/export const SESSION_FORMAT_VERSION = 0/)
  })

  it('types.ts defines SessionHeader with all fields', () => {
    const src = readFileSync(resolve(REPLICA, 'src/types.ts'), 'utf8')
    expect(src).toMatch(/export interface SessionHeader/)
    expect(src).toMatch(/readonly version: number/)
    expect(src).toMatch(/readonly id: SessionId/)
    expect(src).toMatch(/readonly createdAt: number/)
    expect(src).toMatch(/readonly cwd\?:/)
    expect(src).toMatch(/readonly parentSession\?:/)
    expect(src).toMatch(/readonly seedLength\?:/)
    expect(src).toMatch(/readonly origin\?:/)
    expect(src).toMatch(/readonly delegationDepth\?:/)
    expect(src).toMatch(/readonly agentPreset\?:/)
  })

  it('types.ts defines SessionEventMap with 16 event types', () => {
    const src = readFileSync(resolve(REPLICA, 'src/types.ts'), 'utf8')
    const eventTypes = [
      'turn/start', 'turn/end', 'step/start', 'step/end',
      'user/message', 'assistant/chunk', 'assistant/message',
      'tool/call', 'tool/result', 'todo/write',
      'request/header', 'request/context', 'session/end-seed',
    ]
    for (const t of eventTypes) {
      expect(src, `missing event type: ${t}`).toMatch(new RegExp(`'${t.replace('/', '\\/')}'`))
    }
  })

  it('types.ts defines SurfaceEventType, SurfaceOp, SurfaceIntent, SessionEvent', () => {
    const src = readFileSync(resolve(REPLICA, 'src/types.ts'), 'utf8')
    expect(src).toMatch(/export type SurfaceEventType/)
    expect(src).toMatch(/export type SurfaceOp/)
    expect(src).toMatch(/export interface SurfaceIntent/)
    expect(src).toMatch(/export type SessionEvent<T/)
    expect(src).toMatch(/export type SessionEventType/)
    expect(src).toMatch(/export type SurfaceEvent/)
  })

  it('types.ts defines TurnEndReasonMap, TodoItem, EpochHeader, RequestContext', () => {
    const src = readFileSync(resolve(REPLICA, 'src/types.ts'), 'utf8')
    expect(src).toMatch(/export interface TurnEndReasonMap/)
    expect(src).toMatch(/export type TurnEndReason/)
    expect(src).toMatch(/export type AgentCancelCause/)
    expect(src).toMatch(/export interface TodoItem/)
    expect(src).toMatch(/export interface EpochHeader/)
    expect(src).toMatch(/export interface RequestContext/)
    expect(src).toMatch(/export type RequestHeaderReason/)
  })

  // ─── 6. src/surface.ts ────────────────────────────────────────────────────

  it('surface.ts exports fold functions and SurfaceManager class', () => {
    const src = readFileSync(resolve(REPLICA, 'src/surface.ts'), 'utf8')
    expect(src).toMatch(/export function isSurfaceEligibleType/)
    expect(src).toMatch(/export function isSurfaceEvent/)
    expect(src).toMatch(/export function isAppendSurfaceEvent/)
    expect(src).toMatch(/export function isReplacementSurfaceEvent/)
    expect(src).toMatch(/export function deriveEventMessage/)
    expect(src).toMatch(/export function foldSurface/)
    expect(src).toMatch(/export class SurfaceManager/)
    expect(src).toMatch(/validateNext/)
    expect(src).toMatch(/get nodes\(\)/)
    expect(src).toMatch(/get replaceGeneration\(\)/)
  })

  // ─── 7. src/invariant.ts ──────────────────────────────────────────────────

  it('invariant.ts has companion plugin structure', () => {
    const src = readFileSync(resolve(REPLICA, 'src/invariant.ts'), 'utf8')
    expect(src).toMatch(/export const name = 'session-invariant'/)
    expect(src).toMatch(/export const inject = \['invariants'\]/)
    expect(src).toMatch(/function validateEvent/)
    expect(src).toMatch(/function applyTransition/)
    expect(src).toMatch(/const install/)
    expect(src).toMatch(/export const apply/)
    expect(src).toMatch(/SessionTrace/)
  })

  // ─── 8. src/chunk-rows.ts ─────────────────────────────────────────────────

  it('chunk-rows.ts exports pack/unpack codec', () => {
    const src = readFileSync(resolve(REPLICA, 'src/chunk-rows.ts'), 'utf8')
    expect(src).toMatch(/export function packChunkRuns/)
    expect(src).toMatch(/export function decodeStorageRecord/)
    expect(src).toMatch(/export type ChunkRow/)
    expect(src).toMatch(/export type StorageRecord/)
    expect(src).toMatch(/MIN_RUN/)
    expect(src).toMatch(/text-chunks/)
    expect(src).toMatch(/reasoning-chunks/)
    expect(src).toMatch(/tool-call-chunks/)
  })

  // ─── 9. src/json.ts ───────────────────────────────────────────────────────

  it('json.ts exports lossless JSON utilities', () => {
    const src = readFileSync(resolve(REPLICA, 'src/json.ts'), 'utf8')
    expect(src).toMatch(/export type JsonValue/)
    expect(src).toMatch(/export function snapshotJsonValue/)
    expect(src).toMatch(/export function isJsonValue/)
  })

  // ─── 10. src/repair.ts ────────────────────────────────────────────────────

  it('repair.ts exports crash recovery constants and function', () => {
    const src = readFileSync(resolve(REPLICA, 'src/repair.ts'), 'utf8')
    expect(src).toMatch(/export const TOOL_NOT_STARTED/)
    expect(src).toMatch(/export const TOOL_OUTCOME_UNKNOWN/)
    expect(src).toMatch(/export function interruptedTurnClosers/)
  })

  // ─── 11. src/request-header.ts ────────────────────────────────────────────

  it('request-header.ts exports header utilities', () => {
    const src = readFileSync(resolve(REPLICA, 'src/request-header.ts'), 'utf8')
    expect(src).toMatch(/export function canonicalHeader/)
    expect(src).toMatch(/export function headerEquals/)
    expect(src).toMatch(/export function foldRequestHeader/)
  })

  // ─── 12. src/preparation.ts ───────────────────────────────────────────────

  it('preparation.ts exports SessionPreparation class', () => {
    const src = readFileSync(resolve(REPLICA, 'src/preparation.ts'), 'utf8')
    expect(src).toMatch(/export class SessionPreparation/)
    expect(src).toMatch(/Symbol\.dispose/)
    expect(src).toMatch(/static create/)
  })

  // ─── 13. src/known-event-types.ts ─────────────────────────────────────────

  it('known-event-types.ts exports KNOWN_SESSION_EVENT_TYPES with 43 entries', () => {
    const src = readFileSync(resolve(REPLICA, 'src/known-event-types.ts'), 'utf8')
    expect(src).toMatch(/export const KNOWN_SESSION_EVENT_TYPES/)
    expect(src).toMatch(/ReadonlySet<string>/)
    // Spot-check a few event types
    expect(src).toMatch(/'agent-preset\/selected'/)
    expect(src).toMatch(/'assistant\/chunk'/)
    expect(src).toMatch(/'tool\/call'/)
    expect(src).toMatch(/'turn\/start'/)
    expect(src).toMatch(/'session\/end-seed'/)
  })

  // ─── 14. tsconfig.json references ─────────────────────────────────────────

  it('tsconfig.json has correct project references', () => {
    const tsconfig = JSON.parse(readFileSync(resolve(REPLICA, 'tsconfig.json'), 'utf8'))
    const refs = tsconfig.references.map(r => r.path)
    expect(refs).toContain('../../util/brand')
    expect(refs).toContain('../../llm/llm')
    expect(refs).toContain('../../core/scope')
    expect(refs).toContain('../../runtime-diagnostics/invariants')
    expect(refs).toContain('../../typert/protocol')
  })

  // ─── 15. tsdown.config.ts entries ─────────────────────────────────────────

  it('tsdown.config.ts has two entry points', () => {
    const src = readFileSync(resolve(REPLICA, 'tsdown.config.ts'), 'utf8')
    expect(src).toMatch(/lib\/types\/index\.js/)
    expect(src).toMatch(/lib\/types\/invariant\.js/)
  })
})

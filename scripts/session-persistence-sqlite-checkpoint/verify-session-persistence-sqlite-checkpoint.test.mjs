import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '../..')
const REPLICA = ROOT
const ORIGINAL = resolve(ROOT, '../deepseek-harness')

function read(rel) { return readFileSync(resolve(REPLICA, rel), 'utf8') }

function jsonParse(rel) {
  return JSON.parse(read(rel))
}

// ─── 1. Byte-identity fidelity ───────────────────────────────────────────────

const SQLITE_FILES = [
  'packages/session/session-persistence-sqlite/README.i18n.yaml',
  'packages/session/session-persistence-sqlite/README.md',
  'packages/session/session-persistence-sqlite/README.zh.md',
  'packages/session/session-persistence-sqlite/package.json',
  'packages/session/session-persistence-sqlite/tsconfig.json',
  'packages/session/session-persistence-sqlite/src/index.ts',
  'packages/session/session-persistence-sqlite/src/schema.ts',
  'packages/session/session-persistence-sqlite/src/invariant.ts',
  'packages/session/session-persistence-sqlite/tests/sqlite.spec.ts',
]

const CHECKPOINT_FILES = [
  'packages/session/session-checkpoint-policy/README.i18n.yaml',
  'packages/session/session-checkpoint-policy/README.md',
  'packages/session/session-checkpoint-policy/README.zh.md',
  'packages/session/session-checkpoint-policy/package.json',
  'packages/session/session-checkpoint-policy/tsconfig.json',
  'packages/session/session-checkpoint-policy/src/index.ts',
  'packages/session/session-checkpoint-policy/src/invariant.ts',
  'packages/session/session-checkpoint-policy/tests/session-checkpoint-policy.spec.ts',
  'packages/session/session-checkpoint-policy/tests/crash-recovery.e2e.ts',
  'packages/session/session-checkpoint-policy/tests/fixtures/crash-child.ts',
]

const ALL_FILES = [...SQLITE_FILES, ...CHECKPOINT_FILES]

describe('phase 4.4: session-persistence-sqlite + session-checkpoint-policy', () => {
  it('has all 19 files byte-identical to ORIGINAL', () => {
    for (const f of ALL_FILES) {
      const result = execSync(`diff -q "${ORIGINAL}/${f}" "${REPLICA}/${f}"`, { encoding: 'utf8' })
      expect(result.trim()).toBe('')
    }
  })

  // ─── 2. session-persistence-sqlite package metadata ──────────────────────

  it('session-persistence-sqlite package.json metadata', () => {
    const pkg = jsonParse('packages/session/session-persistence-sqlite/package.json')
    expect(pkg.name).toBe('@deepseek-ai/dsh-session-persistence-sqlite')
    expect(pkg.version).toBe('0.1.0-rc.5')
    expect(pkg.type).toBe('module')
    expect(pkg.peerDependencies).toHaveProperty('@deepseek-ai/dsh-session-persistence')
    expect(pkg.peerDependencies).toHaveProperty('@deepseek-ai/dsh-session')
    expect(pkg.peerDependencies).toHaveProperty('@deepseek-ai/cordis')
    expect(pkg.dependencies).toHaveProperty('@deepseek-ai/schemastery')
  })

  it('session-persistence-sqlite exports map', () => {
    const pkg = jsonParse('packages/session/session-persistence-sqlite/package.json')
    expect(pkg.exports['.'].default).toBe('./lib/index.js')
    expect(pkg.exports['./invariant'].default).toBe('./lib/invariant.js')
    expect(pkg.exports['./src/*']).toBe('./src/*')
  })

  // ─── 3. session-persistence-sqlite source structure ──────────────────────

  it('schema.ts exports SCHEMA_VERSION and APPLICATION_ID', () => {
    const schema = read('packages/session/session-persistence-sqlite/src/schema.ts')
    expect(schema).toContain('export const SCHEMA_VERSION = 15')
    expect(schema).toContain('export const SESSION_PERSISTENCE_SQLITE_APPLICATION_ID = 0x44534850')
  })

  it('schema.ts defines SessionRow and EventRow interfaces', () => {
    const schema = read('packages/session/session-persistence-sqlite/src/schema.ts')
    expect(schema).toContain('export interface SessionRow')
    expect(schema).toContain('export interface EventRow')
    expect(schema).toContain('export type JournalMode')
  })

  it('schema.ts exports openDatabase, rowToMeta, rowToEvent, scanRows', () => {
    const schema = read('packages/session/session-persistence-sqlite/src/schema.ts')
    expect(schema).toContain('export function openDatabase')
    expect(schema).toContain('export function rowToMeta')
    expect(schema).toContain('export function rowToEvent')
    expect(schema).toContain('export function scanRows')
  })

  it('schema.ts DDL has persistence_state, sessions, events tables', () => {
    const schema = read('packages/session/session-persistence-sqlite/src/schema.ts')
    expect(schema).toContain('CREATE TABLE IF NOT EXISTS persistence_state')
    expect(schema).toContain('CREATE TABLE IF NOT EXISTS sessions')
    expect(schema).toContain('CREATE TABLE IF NOT EXISTS events')
    expect(schema).toContain('STRICT')
  })

  it('index.ts exports SqliteSessionPersistence class extending SessionPersistence', () => {
    const index = read('packages/session/session-persistence-sqlite/src/index.ts')
    expect(index).toContain('export class SqliteSessionPersistence extends SessionPersistence')
    expect(index).toContain('implements PersistenceBackend<number>')
  })

  it('index.ts has Config interface with path, journalMode, cache, batch delay', () => {
    const index = read('packages/session/session-persistence-sqlite/src/index.ts')
    expect(index).toContain('export interface Config')
    expect(index).toContain('path: string')
    expect(index).toContain('journalMode?: JournalMode')
    expect(index).toContain('preparedSessionCacheSize?: number')
    expect(index).toContain('writeBatchMaxDelayMs?: number')
  })

  it('index.ts has PersistenceCoordinator delegation methods', () => {
    const index = read('packages/session/session-persistence-sqlite/src/index.ts')
    expect(index).toContain('create(meta: SessionHeader)')
    expect(index).toContain('append(id: SessionId')
    expect(index).toContain('load(id: SessionId)')
    expect(index).toContain('inspect(id: SessionId')
    expect(index).toContain('readFrom(id: SessionId')
  })

  it('index.ts has backend hooks: appendBatch, commitRepair, list, listSnapshots, close', () => {
    const index = read('packages/session/session-persistence-sqlite/src/index.ts')
    expect(index).toContain('async appendBatch')
    expect(index).toContain('async commitRepair')
    expect(index).toContain('async list(')
    expect(index).toContain('async listSnapshots')
    expect(index).toContain('async close()')
  })

  it('index.ts locate() returns undefined (shared database)', () => {
    const index = read('packages/session/session-persistence-sqlite/src/index.ts')
    expect(index).toMatch(/locate\(_meta.*SessionLocation \| undefined/)
    expect(index).toContain('return undefined')
  })

  // ─── 4. session-checkpoint-policy package metadata ───────────────────────

  it('session-checkpoint-policy package.json metadata', () => {
    const pkg = jsonParse('packages/session/session-checkpoint-policy/package.json')
    expect(pkg.name).toBe('@deepseek-ai/dsh-session-checkpoint-policy')
    expect(pkg.version).toBe('0.1.0-rc.5')
    expect(pkg.type).toBe('module')
    expect(pkg.peerDependencies).toHaveProperty('@deepseek-ai/dsh-session')
    expect(pkg.peerDependencies).toHaveProperty('@deepseek-ai/dsh-session-persistence')
    expect(pkg.peerDependencies).toHaveProperty('@deepseek-ai/dsh-llm')
    expect(pkg.peerDependencies).toHaveProperty('@deepseek-ai/dsh-tools')
    expect(pkg.peerDependencies).toHaveProperty('@deepseek-ai/dsh-agent')
    expect(pkg.peerDependencies).toHaveProperty('@deepseek-ai/cordis')
  })

  // ─── 5. session-checkpoint-policy source structure ───────────────────────

  it('checkpoint-policy exports name and inject', () => {
    const index = read('packages/session/session-checkpoint-policy/src/index.ts')
    expect(index).toContain("export const name = 'session-checkpoint-policy'")
    expect(index).toContain("export const inject = ['llm', 'sessionPersistence', 'sessions', 'tools']")
  })

  it('checkpoint-policy apply() installs llm/stream, tools/execute, agent/pre-step listeners', () => {
    const index = read('packages/session/session-checkpoint-policy/src/index.ts')
    expect(index).toContain("ctx.on('llm/stream'")
    expect(index).toContain("ctx.on('tools/execute'")
    expect(index).toContain("ctx.on('agent/pre-step'")
  })

  it('checkpoint-policy has afterCheckpoint that flushes before stream', () => {
    const index = read('packages/session/session-checkpoint-policy/src/index.ts')
    expect(index).toContain('function afterCheckpoint')
    expect(index).toContain('await ctx.sessions.flush(session)')
    expect(index).toContain('yield* next()')
  })

  it('checkpoint-policy handles aborted-before-dispatch', () => {
    const index = read('packages/session/session-checkpoint-policy/src/index.ts')
    expect(index).toContain('function abortedBeforeDispatchResult')
    expect(index).toContain('TOOL_ABORTED_BEFORE_DISPATCH')
    expect(index).toContain('exec.signal.aborted')
  })

  it('checkpoint-policy skips nested tool dispatches', () => {
    const index = read('packages/session/session-checkpoint-policy/src/index.ts')
    expect(index).toContain('exec.parent !== undefined')
  })

  // ─── 6. Invariant companions ─────────────────────────────────────────────

  it('both packages have invariant companion with correct names', () => {
    const sqliteInv = read('packages/session/session-persistence-sqlite/src/invariant.ts')
    expect(sqliteInv).toContain("PACKAGE_NAME = '@deepseek-ai/dsh-session-persistence-sqlite'")
    expect(sqliteInv).toContain("name = 'session-persistence-sqlite-invariant'")

    const cpInv = read('packages/session/session-checkpoint-policy/src/invariant.ts')
    expect(cpInv).toContain("PACKAGE_NAME = '@deepseek-ai/dsh-session-checkpoint-policy'")
    expect(cpInv).toContain("name = 'session-checkpoint-policy-invariant'")
  })

  // ─── 7. Test spec counts ─────────────────────────────────────────────────

  it('sqlite.spec.ts has the expected test count', () => {
    const spec = read('packages/session/session-persistence-sqlite/tests/sqlite.spec.ts')
    const its = spec.match(/\bit\(/g)
    expect(its.length).toBeGreaterThanOrEqual(25)
  })

  it('session-checkpoint-policy.spec.ts has the expected test count', () => {
    const spec = read('packages/session/session-checkpoint-policy/tests/session-checkpoint-policy.spec.ts')
    const its = spec.match(/\bit\(/g)
    expect(its.length).toBeGreaterThanOrEqual(10)
  })

  it('crash-recovery.e2e.ts exists with crash test choreography', () => {
    const e2e = read('packages/session/session-checkpoint-policy/tests/crash-recovery.e2e.ts')
    expect(e2e).toContain('crashAt')
    expect(e2e).toContain('SIGKILL')
    expect(e2e).toContain('semantic checkpoint hard-crash recovery')
  })

  it('crash-child.ts fixture exists with CrashAdapter', () => {
    const child = read('packages/session/session-checkpoint-policy/tests/fixtures/crash-child.ts')
    expect(child).toContain('class CrashAdapter extends LlmAdapter')
    expect(child).toContain('waitForCrash')
    expect(child).toContain('crash_tool')
  })

  // ─── 8. tsconfig references ──────────────────────────────────────────────

  it('session-persistence-sqlite tsconfig has 6 references', () => {
    const tsconfig = jsonParse('packages/session/session-persistence-sqlite/tsconfig.json')
    expect(tsconfig.references).toHaveLength(6)
    const paths = tsconfig.references.map(r => r.path)
    expect(paths).toContain('../../../vendor/cosmokit')
    expect(paths).toContain('../../../vendor/cordis')
    expect(paths).toContain('../../../vendor/schemastery')
    expect(paths).toContain('../../core/session')
    expect(paths).toContain('../session-persistence')
    expect(paths).toContain('../../runtime-diagnostics/invariants')
  })

  it('session-checkpoint-policy tsconfig has 8 references', () => {
    const tsconfig = jsonParse('packages/session/session-checkpoint-policy/tsconfig.json')
    expect(tsconfig.references).toHaveLength(8)
    const paths = tsconfig.references.map(r => r.path)
    expect(paths).toContain('../../../vendor/cosmokit')
    expect(paths).toContain('../../../vendor/cordis')
    expect(paths).toContain('../../core/agent')
    expect(paths).toContain('../../llm/llm')
    expect(paths).toContain('../../core/session')
    expect(paths).toContain('../session-persistence')
    expect(paths).toContain('../../runtime-diagnostics/invariants')
    expect(paths).toContain('../../core/tools')
  })

  // ─── 9. README content ───────────────────────────────────────────────────

  it('session-persistence-sqlite README describes SQLite backend', () => {
    const readme = read('packages/session/session-persistence-sqlite/README.md')
    expect(readme).toContain('SQLite durable session-persistence backend')
    expect(readme).toContain('SCHEMA_VERSION')
    expect(readme).toContain('node:sqlite')
  })

  it('session-checkpoint-policy README describes semantic checkpoints', () => {
    const readme = read('packages/session/session-checkpoint-policy/README.md')
    expect(readme).toContain('Semantic durability policy')
    expect(readme).toContain('session-checkpoint-policy')
    expect(readme).toContain('TOOL_OUTCOME_UNKNOWN')
  })

  // ─── 10. SQLite-specific schema details ──────────────────────────────────

  it('schema.ts has schema version validation logic', () => {
    const schema = read('packages/session/session-persistence-sqlite/src/schema.ts')
    expect(schema).toContain('onDisk !== SCHEMA_VERSION')
    expect(schema).toContain('incompatible with this build')
    expect(schema).toContain('unversioned schema or application identity')
  })

  it('schema.ts scanRows handles torn tail and committed corruption', () => {
    const schema = read('packages/session/session-persistence-sqlite/src/schema.ts')
    expect(schema).toContain('tornFrom')
    expect(schema).toContain('corrupt session log')
    expect(schema).toContain('lastTurnEnd')
  })
})

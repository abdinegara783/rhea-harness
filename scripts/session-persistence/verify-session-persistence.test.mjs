import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '../..')
const REPLICA = ROOT
const ORIGINAL = resolve(ROOT, '../deepseek-harness')

function read(rel) { return readFileSync(resolve(REPLICA, rel), 'utf8') }
function readOrig(rel) { return readFileSync(resolve(ORIGINAL, rel), 'utf8') }
function exists(rel) { return existsSync(resolve(REPLICA, rel)) }

// --- File lists ---
const SP_FILES = [
  'packages/session/session-persistence/package.json',
  'packages/session/session-persistence/tsconfig.json',
  'packages/session/session-persistence/README.md',
  'packages/session/session-persistence/README.zh.md',
  'packages/session/session-persistence/README.i18n.yaml',
  'packages/session/session-persistence/src/index.ts',
  'packages/session/session-persistence/src/coordinator.ts',
  'packages/session/session-persistence/src/invariant.ts',
  'packages/session/session-persistence/src/preparations.ts',
  'packages/session/session-persistence/src/revision.ts',
  'packages/session/session-persistence/src/write-behind.ts',
  'packages/session/session-persistence/tests/contract.ts',
  'packages/session/session-persistence/tests/coordinator-contract.ts',
  'packages/session/session-persistence/tests/persistence.spec.ts',
  'packages/session/session-persistence/tests/preparations.spec.ts',
  'packages/session/session-persistence/tests/write-behind.spec.ts',
]
const JSONL_FILES = [
  'packages/session/session-persistence-jsonl/package.json',
  'packages/session/session-persistence-jsonl/tsconfig.json',
  'packages/session/session-persistence-jsonl/README.md',
  'packages/session/session-persistence-jsonl/README.zh.md',
  'packages/session/session-persistence-jsonl/README.i18n.yaml',
  'packages/session/session-persistence-jsonl/src/index.ts',
  'packages/session/session-persistence-jsonl/src/format.ts',
  'packages/session/session-persistence-jsonl/src/invariant.ts',
  'packages/session/session-persistence-jsonl/src/win32.ts',
  'packages/session/session-persistence-jsonl/src/zstd.ts',
  'packages/session/session-persistence-jsonl/src/zstd-private-decoder.ts',
  'packages/session/session-persistence-jsonl/src/zstd-public-decoder.ts',
  'packages/session/session-persistence-jsonl/tests/jsonl.spec.ts',
  'packages/session/session-persistence-jsonl/tests/win32.spec.ts',
  'packages/session/session-persistence-jsonl/tests/zstd.compat.spec.ts',
  'packages/session/session-persistence-jsonl/tests/zstd.spec.ts',
]
const ALL_FILES = [...SP_FILES, ...JSONL_FILES]

describe('4.3 Session Persistence — file existence', () => {
  it('has all 32 files', () => {
    const missing = ALL_FILES.filter(f => !exists(f))
    expect(missing).toEqual([])
    expect(ALL_FILES.length).toBe(32)
  })
})

describe('4.3 Session Persistence — byte-identity', () => {
  it('all files match ORIGINAL byte-for-byte', () => {
    for (const f of ALL_FILES) {
      const replica = read(f)
      const orig = readOrig(f)
      expect(replica, `${f} differs`).toBe(orig)
    }
  })
})

describe('4.3 Session Persistence — metadata', () => {
  it('session-persistence package.json', () => {
    const pkg = JSON.parse(read('packages/session/session-persistence/package.json'))
    expect(pkg.name).toBe('@deepseek-ai/dsh-session-persistence')
    expect(pkg.version).toBe('0.1.0-rc.5')
    expect(pkg.exports['.']).toBeDefined()
    expect(pkg.exports['./invariant']).toBeDefined()
    expect(pkg.exports['./src/*']).toBe('./src/*')
    expect(pkg.peerDependencies['@deepseek-ai/dsh-brand']).toBeDefined()
    expect(pkg.peerDependencies['@deepseek-ai/dsh-session']).toBeDefined()
    expect(pkg.peerDependencies['@deepseek-ai/dsh-timeout']).toBeDefined()
  })

  it('session-persistence-jsonl package.json', () => {
    const pkg = JSON.parse(read('packages/session/session-persistence-jsonl/package.json'))
    expect(pkg.name).toBe('@deepseek-ai/dsh-session-persistence-jsonl')
    expect(pkg.version).toBe('0.1.0-rc.5')
    expect(pkg.dependencies.koffi).toBeDefined()
    expect(pkg.dependencies['@deepseek-ai/schemastery']).toBeDefined()
    expect(pkg.peerDependencies['@deepseek-ai/dsh-session-persistence']).toBeDefined()
  })
})

describe('4.3 Session Persistence — exports', () => {
  it('session-persistence index.ts exports', () => {
    const src = read('packages/session/session-persistence/src/index.ts')
    expect(src).toContain('export abstract class SessionPersistence')
    expect(src).toContain('export { SessionPersistenceRevision }')
    expect(src).toContain('PersistenceCoordinator')
    expect(src).toContain('SessionFormatUnsupportedError')
    expect(src).toContain('SessionPersistenceCorruptionError')
    expect(src).toContain('sessionFormatVersionRefusal')
    expect(src).toContain('DEFAULT_PREPARED_SESSION_CACHE_SIZE')
    expect(src).toContain('DEFAULT_WRITE_BATCH_MAX_DELAY_MS')
    expect(src).toContain('MAX_WRITE_BATCH_DELAY_MS')
    expect(src).toContain('SessionPersistenceSnapshot')
    expect(src).toContain('SessionInspection')
    expect(src).toContain('SessionRawArtifact')
    expect(src).toContain('SessionLocation')
    expect(src).toContain('declare module')
  })

  it('session-persistence-jsonl index.ts exports', () => {
    const src = read('packages/session/session-persistence-jsonl/src/index.ts')
    expect(src).toContain('export class JsonlSessionPersistence')
    expect(src).toContain('export const JsonlCompressionSchema')
    expect(src).toContain('export type { JsonlCompression }')
    expect(src).toContain('extends SessionPersistence')
    expect(src).toContain('implements PersistenceBackend<JsonlTornMarker>')
  })

  it('format.ts exports', () => {
    const src = read('packages/session/session-persistence-jsonl/src/format.ts')
    expect(src).toContain('export function encodeSegment')
    expect(src).toContain('export function projectKey')
    expect(src).toContain('export function projectDir')
    expect(src).toContain('export function sessionDir')
    expect(src).toContain('export function logPath')
    expect(src).toContain('export function logSuffix')
    expect(src).toContain('export function toHeaderLine')
    expect(src).toContain('export function fromHeaderLine')
    expect(src).toContain('export function eventLines')
    expect(src).toContain('export function scanLog')
    expect(src).toContain('export function parseHeaderMeta')
    expect(src).toContain('export class SessionLogScanner')
  })

  it('zstd.ts exports', () => {
    const src = read('packages/session/session-persistence-jsonl/src/zstd.ts')
    expect(src).toContain('export function scanZstdFrames')
    expect(src).toContain('export async function compressZstdFrame')
    expect(src).toContain('export async function decompressZstdFrame')
    expect(src).toContain('export async function decompressZstdPrefix')
    expect(src).toContain('export function createZstdFrameDecoder')
    expect(src).toContain('export interface ZstdFrameDecoder')
    expect(src).toContain('export interface ZstdFrameRange')
    expect(src).toContain('export interface ZstdFrameScan')
  })

  it('win32.ts exports', () => {
    const src = read('packages/session/session-persistence-jsonl/src/win32.ts')
    expect(src).toContain('export async function publishNewFileWin32')
    expect(src).toContain('export async function ensureDurableDirectoryWin32')
  })
})

describe('4.3 Session Persistence — coordinator structure', () => {
  it('PersistenceCoordinator class', () => {
    const src = read('packages/session/session-persistence/src/coordinator.ts')
    expect(src).toContain('export class PersistenceCoordinator')
    expect(src).toContain('create(meta: SessionHeader): Promise<void>')
    expect(src).toContain('async append(id: SessionId')
    expect(src).toContain('async prepare(id: SessionId')
    expect(src).toContain('async load(id: SessionId')
    expect(src).toContain('async inspect(id: SessionId')
    expect(src).toContain('readFrom(id: SessionId')
    expect(src).toContain('private serialize<T>')
    expect(src).toContain('private async adopt')
    expect(src).toContain('private async onCreated')
    expect(src).toContain('private retire(session: Session)')
    expect(src).toContain('private async flush')
    expect(src).toContain('private installWritePath')
  })

  it('constants', () => {
    const src = read('packages/session/session-persistence/src/coordinator.ts')
    expect(src).toContain('DEFAULT_PREPARED_SESSION_CACHE_SIZE = 5')
    expect(src).toContain('DEFAULT_WRITE_BATCH_MAX_DELAY_MS = 200')
    expect(src).toContain('MAX_WRITE_BATCH_DELAY_MS = MAX_TIMER_DELAY_MS')
  })

  it('error classes', () => {
    const src = read('packages/session/session-persistence/src/coordinator.ts')
    expect(src).toContain("class SessionPersistenceCorruptionError extends Error")
    expect(src).toContain("this.name = 'SessionPersistenceCorruptionError'")
    expect(src).toContain("class SessionFormatUnsupportedError extends Error")
    expect(src).toContain("this.name = 'SessionFormatUnsupportedError'")
    expect(src).toContain('readonly location?: SessionLocation')
  })

  it('sessionFormatVersionRefusal function', () => {
    const src = read('packages/session/session-persistence/src/coordinator.ts')
    expect(src).toContain('export function sessionFormatVersionRefusal')
    expect(src).toContain('version > SESSION_FORMAT_VERSION')
    expect(src).toContain('upgrade the harness')
  })

  it('PersistenceBackend interface', () => {
    const src = read('packages/session/session-persistence/src/coordinator.ts')
    expect(src).toContain('export interface PersistenceBackend')
    expect(src).toContain('loadStored(')
    expect(src).toContain('readStoredRevision(')
    expect(src).toContain('appendBatch(')
    expect(src).toContain('commitRepair(')
  })

  it('StoredPrefix and StoredSuffix interfaces', () => {
    const src = read('packages/session/session-persistence/src/coordinator.ts')
    expect(src).toContain('export interface StoredPrefix')
    expect(src).toContain('export interface StoredSuffix')
  })
})

describe('4.3 Session Persistence — write-behind structure', () => {
  it('SessionWriteBehind class', () => {
    const src = read('packages/session/session-persistence/src/write-behind.ts')
    expect(src).toContain('export class SessionWriteBehind')
    expect(src).toContain('enqueue(event: SessionEvent)')
    expect(src).toContain('flush(): Promise<void>')
    expect(src).toContain('cancelAutomaticWait()')
    expect(src).toContain('get hasWork()')
  })
})

describe('4.3 Session Persistence — preparations structure', () => {
  it('SessionPreparations class', () => {
    const src = read('packages/session/session-persistence/src/preparations.ts')
    expect(src).toContain('export class SessionPreparations')
    expect(src).toContain('has(id: SessionId)')
    expect(src).toContain('async inspect(')
    expect(src).toContain('async reserve(')
    expect(src).toContain('reservationFor(session: Session)')
    expect(src).toContain('attach(reservation:')
    expect(src).toContain('discard(reservation:')
    expect(src).toContain('release(')
    expect(src).toContain('invalidate(id: SessionId)')
    expect(src).toContain('discardReady(')
    expect(src).toContain('assertWritable(id: SessionId)')
    expect(src).toContain('takeReady(id: SessionId)')
    expect(src).toContain('export function observeQueuedAbort')
  })
})

describe('4.3 Session Persistence — revision', () => {
  it('branded revision type', () => {
    const src = read('packages/session/session-persistence/src/revision.ts')
    expect(src).toContain("export type SessionPersistenceRevision = Branded<'SessionPersistenceRevision'>")
    expect(src).toContain('export function SessionPersistenceRevision(value: string)')
  })
})

describe('4.3 Session Persistence — format helpers', () => {
  it('encodeSegment', () => {
    const src = read('packages/session/session-persistence-jsonl/src/format.ts')
    expect(src).toContain("if (raw === '.') return '~002E'")
    expect(src).toContain("if (raw === '..') return '~002E~002E'")
    expect(src).toContain("throw new Error('cannot encode an empty path segment')")
  })

  it('projectKey', () => {
    const src = read('packages/session/session-persistence-jsonl/src/format.ts')
    expect(src).toContain('export function projectKey')
    expect(src).toContain("return `--${slug.slice(0, 251)}--`")
  })

  it('SessionLogScanner class', () => {
    const src = read('packages/session/session-persistence-jsonl/src/format.ts')
    expect(src).toContain('export class SessionLogScanner')
    expect(src).toContain('write(chunk: Buffer)')
    expect(src).toContain('checkpoint()')
    expect(src).toContain('finish(): SessionLogScan')
  })

  it('HeaderLine interface', () => {
    const src = read('packages/session/session-persistence-jsonl/src/format.ts')
    expect(src).toContain('export interface HeaderLine')
    expect(src).toContain("type: 'session'")
    expect(src).toContain('delegationDepth: number')
  })
})

describe('4.3 Session Persistence — zstd primitives', () => {
  it('ZSTD magic constant', () => {
    const src = read('packages/session/session-persistence-jsonl/src/zstd.ts')
    expect(src).toContain('const ZSTD_MAGIC = 0xFD2FB528')
  })

  it('scanZstdFrames function', () => {
    const src = read('packages/session/session-persistence-jsonl/src/zstd.ts')
    expect(src).toContain('export function scanZstdFrames(buffer: Buffer')
    expect(src).toContain('ZSTD_MAGIC')
    expect(src).toContain('tornStart')
  })

  it('ZstdFrameDecoder interface', () => {
    const src = read('packages/session/session-persistence-jsonl/src/zstd.ts')
    expect(src).toContain('export interface ZstdFrameDecoder')
    expect(src).toContain('decode(source: Buffer, frames: readonly ZstdFrameRange[]): Generator')
    expect(src).toContain('close(): void')
  })
})

describe('4.3 Session Persistence — private decoder', () => {
  it('NodePrivateZstdFrameDecoder', () => {
    const src = read('packages/session/session-persistence-jsonl/src/zstd-private-decoder.ts')
    expect(src).toContain('export class NodePrivateZstdFrameDecoder implements ZstdFrameDecoder')
    expect(src).toContain('static create()')
    expect(src).toContain('public *decode(')
    expect(src).toContain('close(): void')
  })
})

describe('4.3 Session Persistence — public decoder', () => {
  it('PublicZstdFrameDecoder', () => {
    const src = read('packages/session/session-persistence-jsonl/src/zstd-public-decoder.ts')
    expect(src).toContain('export class PublicZstdFrameDecoder implements ZstdFrameDecoder')
    expect(src).toContain('zstdDecompressSync')
    expect(src).toContain('public *decode(')
  })
})

describe('4.3 Session Persistence — win32 constants', () => {
  it('Win32 API constants', () => {
    const src = read('packages/session/session-persistence-jsonl/src/win32.ts')
    expect(src).toContain('MOVEFILE_WRITE_THROUGH = 0x00000008')
    expect(src).toContain('ERROR_FILE_NOT_FOUND = 2')
    expect(src).toContain('ERROR_PATH_NOT_FOUND = 3')
    expect(src).toContain('ERROR_ACCESS_DENIED = 5')
    expect(src).toContain('ERROR_NOT_SAME_DEVICE = 17')
    expect(src).toContain('ERROR_FILE_EXISTS = 80')
    expect(src).toContain('ERROR_INVALID_NAME = 123')
    expect(src).toContain('ERROR_ALREADY_EXISTS = 183')
    expect(src).toContain('MoveFileExW')
    expect(src).toContain('kernel32.dll')
  })
})

describe('4.3 Session Persistence — test specs', () => {
  it('session-persistence test files', () => {
    const lines = {
      'packages/session/session-persistence/tests/contract.ts': 432,
      'packages/session/session-persistence/tests/coordinator-contract.ts': 1482,
      'packages/session/session-persistence/tests/persistence.spec.ts': 1938,
      'packages/session/session-persistence/tests/preparations.spec.ts': 360,
      'packages/session/session-persistence/tests/write-behind.spec.ts': 275,
    }
    for (const [file, expectedLines] of Object.entries(lines)) {
      const content = read(file)
      const actual = content.split('\n').length
      expect(actual, `${file} line count`).toBeGreaterThanOrEqual(expectedLines - 5)
      expect(actual, `${file} line count`).toBeLessThanOrEqual(expectedLines + 5)
    }
  })

  it('session-persistence-jsonl test files', () => {
    const lines = {
      'packages/session/session-persistence-jsonl/tests/jsonl.spec.ts': 1621,
      'packages/session/session-persistence-jsonl/tests/win32.spec.ts': 210,
      'packages/session/session-persistence-jsonl/tests/zstd.compat.spec.ts': 39,
      'packages/session/session-persistence-jsonl/tests/zstd.spec.ts': 750,
    }
    for (const [file, expectedLines] of Object.entries(lines)) {
      const content = read(file)
      const actual = content.split('\n').length
      expect(actual, `${file} line count`).toBeGreaterThanOrEqual(expectedLines - 5)
      expect(actual, `${file} line count`).toBeLessThanOrEqual(expectedLines + 5)
    }
  })
})

describe('4.3 Session Persistence — tsconfig references', () => {
  it('session-persistence tsconfig', () => {
    const cfg = JSON.parse(read('packages/session/session-persistence/tsconfig.json'))
    const refs = cfg.references.map(r => r.path)
    expect(refs).toContain('../../../vendor/cosmokit')
    expect(refs).toContain('../../../vendor/cordis')
    expect(refs).toContain('../../util/brand')
    expect(refs).toContain('../../core/session')
    expect(refs).toContain('../../runtime-diagnostics/invariants')
  })

  it('session-persistence-jsonl tsconfig', () => {
    const cfg = JSON.parse(read('packages/session/session-persistence-jsonl/tsconfig.json'))
    const refs = cfg.references.map(r => r.path)
    expect(refs).toContain('../../../vendor/cosmokit')
    expect(refs).toContain('../../../vendor/cordis')
    expect(refs).toContain('../../../vendor/schemastery')
    expect(refs).toContain('../../core/session')
    expect(refs).toContain('../session-persistence')
    expect(refs).toContain('../../runtime-diagnostics/invariants')
  })
})

describe('4.3 Session Persistence — invariant companions', () => {
  it('session-persistence invariant', () => {
    const src = read('packages/session/session-persistence/src/invariant.ts')
    expect(src).toContain("const PACKAGE_NAME = '@deepseek-ai/dsh-session-persistence'")
    expect(src).toContain("export const name = 'session-persistence-invariant'")
    expect(src).toContain("export const inject = ['invariants']")
  })

  it('session-persistence-jsonl invariant', () => {
    const src = read('packages/session/session-persistence-jsonl/src/invariant.ts')
    expect(src).toContain("const PACKAGE_NAME = '@deepseek-ai/dsh-session-persistence-jsonl'")
    expect(src).toContain("export const name = 'session-persistence-jsonl-invariant'")
    expect(src).toContain("export const inject = ['invariants']")
  })
})

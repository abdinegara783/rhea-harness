/**
 * Verify structural fidelity of packages/session/session-projection and
 * packages/session/session-projection-cache between ORIGINAL and REPLICA.
 * 32 tests covering byte-identity, package metadata, exports, registry
 * surface, projection-cache cold-read ladder, and README content.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPLICA = resolve(HERE, '../..')
const ORIGINAL = process.env.ORIGINAL_ROOT ?? resolve(REPLICA, '../deepseek-harness')

function readOriginal(rel) {
  return readFileSync(resolve(ORIGINAL, rel))
}
function readReplica(rel) {
  return readFileSync(resolve(REPLICA, rel))
}

// ─── session-projection ──────────────────────────────────────────────

const PROJECTION_FILES = [
  'packages/session/session-projection/src/index.ts',
  'packages/session/session-projection/src/types.ts',
  'packages/session/session-projection/src/invariant.ts',
  'packages/session/session-projection/tests/registry.spec.ts',
  'packages/session/session-projection/package.json',
  'packages/session/session-projection/tsconfig.json',
  'packages/session/session-projection/README.md',
  'packages/session/session-projection/README.i18n.yaml',
  'packages/session/session-projection/README.zh.md',
]

describe('session-projection byte-identity', () => {
  for (const f of PROJECTION_FILES) {
    it(`matches ORIGINAL: ${f}`, () => {
      const orig = readOriginal(f)
      const repl = readReplica(f)
      assert.equal(Buffer.compare(orig, repl), 0)
    })
  }
})

describe('session-projection package metadata', () => {
  const pkg = JSON.parse(readReplica('packages/session/session-projection/package.json').toString())

  it('has the correct package name', () => {
    assert.equal(pkg.name, '@deepseek-ai/dsh-session-projection')
  })

  it('declares the correct version', () => {
    assert.equal(pkg.version, '0.1.0-rc.5')
  })

  it('exports ., ./invariant, ./types, ./src/*, ./package.json', () => {
    assert.deepEqual(Object.keys(pkg.exports).sort(),
      ['.', './invariant', './package.json', './src/*', './types'].sort())
  })

  it('has zod as a direct dependency', () => {
    assert.ok(pkg.dependencies.zod)
  })

  it('has dsh-invariants, dsh-session, cordis as peer deps', () => {
    const peers = Object.keys(pkg.peerDependencies)
    assert.ok(peers.includes('@deepseek-ai/dsh-invariants'))
    assert.ok(peers.includes('@deepseek-ai/dsh-session'))
    assert.ok(peers.includes('@deepseek-ai/cordis'))
  })
})

describe('session-projection source surface', () => {
  const indexSrc = () => readReplica('packages/session/session-projection/src/index.ts').toString()

  it('exports SessionProjectionRegistry class', () => {
    assert.match(indexSrc(), /export class SessionProjectionRegistry/)
  })

  it('defines ProjectionDefinition interface with key, schema, init, apply, view, stateVersion', () => {
    const src = indexSrc()
    assert.match(src, /interface ProjectionDefinition/)
    assert.match(src, /key: K/)
    assert.match(src, /init\(\): S/)
    assert.match(src, /apply\(state: S, event: SessionEvent\): S/)
    assert.match(src, /view\(state: S\)/)
    assert.match(src, /stateVersion: number/)
  })

  it('defines ProjectionSnapshot interface with asOfSeq and values', () => {
    const src = indexSrc()
    assert.match(src, /interface ProjectionSnapshot/)
    assert.match(src, /asOfSeq: number/)
    assert.match(src, /values: Partial<SessionProjectionMap>/)
  })

  it('defines ProjectionCheckpointRow with ver, seq, val', () => {
    const src = indexSrc()
    assert.match(src, /interface ProjectionCheckpointRow/)
    assert.match(src, /ver: number/)
    assert.match(src, /seq: number/)
    assert.match(src, /val: unknown/)
  })

  it('subscribes to session/event in the constructor', () => {
    assert.match(indexSrc(), /ctx\.on\('session\/event'/)
  })

  it('has register, onChanged, snapshot, checkpoint, restoreFloor, viewCheckpoint, restore methods', () => {
    const src = indexSrc()
    for (const m of ['register', 'onChanged', 'snapshot', 'checkpoint', 'restoreFloor', 'viewCheckpoint', 'restore']) {
      assert.match(src, new RegExp(`\\b${m}\\b`))
    }
  })

  it('types.ts exports SessionProjectionMap interface', () => {
    const types = readReplica('packages/session/session-projection/src/types.ts').toString()
    assert.match(types, /export interface SessionProjectionMap/)
  })
})

describe('session-projection tsconfig', () => {
  it('references cosmokit, cordis, session, invariants', () => {
    const tsconfig = JSON.parse(readReplica('packages/session/session-projection/tsconfig.json').toString())
    const paths = tsconfig.references.map((r) => r.path)
    assert.ok(paths.includes('../../../vendor/cosmokit'))
    assert.ok(paths.includes('../../../vendor/cordis'))
    assert.ok(paths.includes('../../core/session'))
    assert.ok(paths.includes('../../runtime-diagnostics/invariants'))
  })
})

describe('session-projection test spec count', () => {
  it('registry.spec.ts has 20 test cases', () => {
    const spec = readReplica('packages/session/session-projection/tests/registry.spec.ts').toString()
    const matches = spec.match(/^\s*it\(/gm)
    assert.ok(matches !== null)
    assert.equal(matches.length, 20)
  })
})

// ─── session-projection-cache ────────────────────────────────────────

const CACHE_FILES = [
  'packages/session/session-projection-cache/src/index.ts',
  'packages/session/session-projection-cache/src/spec.ts',
  'packages/session/session-projection-cache/src/invariant.ts',
  'packages/session/session-projection-cache/tests/cache.spec.ts',
  'packages/session/session-projection-cache/package.json',
  'packages/session/session-projection-cache/tsconfig.json',
  'packages/session/session-projection-cache/README.md',
  'packages/session/session-projection-cache/README.i18n.yaml',
  'packages/session/session-projection-cache/README.zh.md',
]

describe('session-projection-cache byte-identity', () => {
  for (const f of CACHE_FILES) {
    it(`matches ORIGINAL: ${f}`, () => {
      const orig = readOriginal(f)
      const repl = readReplica(f)
      assert.equal(Buffer.compare(orig, repl), 0)
    })
  }
})

describe('session-projection-cache package metadata', () => {
  const pkg = JSON.parse(readReplica('packages/session/session-projection-cache/package.json').toString())

  it('has the correct package name', () => {
    assert.equal(pkg.name, '@deepseek-ai/dsh-session-projection-cache')
  })

  it('declares the correct version', () => {
    assert.equal(pkg.version, '0.1.0-rc.5')
  })

  it('exports ., ./invariant, ./src/*, ./package.json', () => {
    assert.deepEqual(Object.keys(pkg.exports).sort(),
      ['.', './invariant', './package.json', './src/*'].sort())
  })

  it('has schemastery and zod as dependencies', () => {
    assert.ok(pkg.dependencies['@deepseek-ai/schemastery'])
    assert.ok(pkg.dependencies.zod)
  })

  it('has dsh-session, dsh-session-persistence, dsh-session-projection, dsh-storage-domain, cordis as peer deps', () => {
    const peers = Object.keys(pkg.peerDependencies)
    assert.ok(peers.includes('@deepseek-ai/dsh-session'))
    assert.ok(peers.includes('@deepseek-ai/dsh-session-persistence'))
    assert.ok(peers.includes('@deepseek-ai/dsh-session-projection'))
    assert.ok(peers.includes('@deepseek-ai/dsh-storage-domain'))
    assert.ok(peers.includes('@deepseek-ai/cordis'))
  })
})

describe('session-projection-cache source surface', () => {
  const indexSrc = () => readReplica('packages/session/session-projection-cache/src/index.ts').toString()

  it('exports SessionProjectionCache class', () => {
    assert.match(indexSrc(), /export class SessionProjectionCache/)
  })

  it('defines Config with writeEveryEvents and writeIntervalMs', () => {
    const src = indexSrc()
    assert.match(src, /writeEveryEvents: number/)
    assert.match(src, /writeIntervalMs: number/)
  })

  it('injects storageDomain, sessionProjections, sessionPersistence, sessions', () => {
    assert.match(indexSrc(), /static inject = \['storageDomain', 'sessionProjections', 'sessionPersistence', 'sessions'\]/)
  })

  it('has write, coldSnapshot, cachedSnapshot methods', () => {
    const src = indexSrc()
    assert.match(src, /async write\(/)
    assert.match(src, /async coldSnapshot\(/)
    assert.match(src, /cachedSnapshot\(/)
  })

  it('spec.ts defines checkpointRow, checkpointIdentity, checkpointRecord, projectionCacheDomainSpec', () => {
    const spec = readReplica('packages/session/session-projection-cache/src/spec.ts').toString()
    assert.match(spec, /export const checkpointRow/)
    assert.match(spec, /export const checkpointIdentity/)
    assert.match(spec, /export const checkpointRecord/)
    assert.match(spec, /export const projectionCacheDomainSpec/)
  })

  it('domain spec uses name session_projcache, version 3', () => {
    const spec = readReplica('packages/session/session-projection-cache/src/spec.ts').toString()
    assert.match(spec, /name: 'session_projcache'/)
    assert.match(spec, /version: 3/)
  })
})

describe('session-projection-cache tsconfig', () => {
  it('references cosmokit, cordis, schemastery, session, session-persistence, session-projection, storage, storage-domain, invariants', () => {
    const tsconfig = JSON.parse(readReplica('packages/session/session-projection-cache/tsconfig.json').toString())
    const paths = tsconfig.references.map((r) => r.path)
    assert.ok(paths.includes('../../../vendor/cosmokit'))
    assert.ok(paths.includes('../../../vendor/cordis'))
    assert.ok(paths.includes('../../../vendor/schemastery'))
    assert.ok(paths.includes('../../core/session'))
    assert.ok(paths.includes('../session-persistence'))
    assert.ok(paths.includes('../session-projection'))
    assert.ok(paths.includes('../../storage/storage'))
    assert.ok(paths.includes('../../storage/storage-domain'))
    assert.ok(paths.includes('../../runtime-diagnostics/invariants'))
  })
})

describe('session-projection-cache test spec count', () => {
  it('cache.spec.ts has 18 test cases', () => {
    const spec = readReplica('packages/session/session-projection-cache/tests/cache.spec.ts').toString()
    const matches = spec.match(/^\s*it\(/gm)
    assert.ok(matches !== null)
    assert.equal(matches.length, 18)
  })
})

describe('README content', () => {
  it('session-projection README mentions SessionProjectionRegistry and merge-extensible type table', () => {
    const readme = readReplica('packages/session/session-projection/README.md').toString()
    assert.match(readme, /SessionProjectionRegistry/)
    assert.match(readme, /merge-extensible type table/)
  })

  it('session-projection-cache README mentions cold read ladder and fail-soft', () => {
    const readme = readReplica('packages/session/session-projection-cache/README.md').toString()
    assert.match(readme, /cold read/)
    assert.match(readme, /fail-soft/)
  })

  it('session-projection Chinese README exists and mentions 会话投影', () => {
    const readme = readReplica('packages/session/session-projection/README.zh.md').toString()
    assert.match(readme, /会话投影/)
  })

  it('session-projection-cache Chinese README exists and mentions 持久投影缓存', () => {
    const readme = readReplica('packages/session/session-projection-cache/README.zh.md').toString()
    assert.match(readme, /持久投影缓存/)
  })
})

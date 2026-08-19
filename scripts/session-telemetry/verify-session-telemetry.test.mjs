/**
 * Verify script for Phase 4.8 — session-telemetry packages.
 *
 * Validates byte-identical replication of:
 * - packages/session/session-telemetry (10 files)
 * - packages/session/session-telemetry-otel (9 files)
 * Total: 19 files.
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

const SESSION_TELEMETRY_FILES = [
  'packages/session/session-telemetry/README.i18n.yaml',
  'packages/session/session-telemetry/README.md',
  'packages/session/session-telemetry/README.zh.md',
  'packages/session/session-telemetry/package.json',
  'packages/session/session-telemetry/src/coordinator.ts',
  'packages/session/session-telemetry/src/index.ts',
  'packages/session/session-telemetry/src/invariant.ts',
  'packages/session/session-telemetry/tests/redact.spec.ts',
  'packages/session/session-telemetry/tests/telemetry.spec.ts',
  'packages/session/session-telemetry/tsconfig.json',
]

const SESSION_TELEMETRY_OTEL_FILES = [
  'packages/session/session-telemetry-otel/README.i18n.yaml',
  'packages/session/session-telemetry-otel/README.md',
  'packages/session/session-telemetry-otel/README.zh.md',
  'packages/session/session-telemetry-otel/package.json',
  'packages/session/session-telemetry-otel/src/index.ts',
  'packages/session/session-telemetry-otel/src/invariant.ts',
  'packages/session/session-telemetry-otel/tests/loader-composition.e2e.ts',
  'packages/session/session-telemetry-otel/tests/otel.spec.ts',
  'packages/session/session-telemetry-otel/tsconfig.json',
]

const ALL_FILES = [
  ...SESSION_TELEMETRY_FILES,
  ...SESSION_TELEMETRY_OTEL_FILES,
]

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Phase 4.8 — session-telemetry packages', () => {
  describe('File inventory', () => {
    it('has exactly 19 files across 2 packages', () => {
      assert.equal(ALL_FILES.length, 19)
      for (const f of ALL_FILES) {
        assert.ok(fileExists(f), `missing: ${f}`)
      }
    })

    it('session-telemetry has 10 files', () => {
      assert.equal(SESSION_TELEMETRY_FILES.length, 10)
    })

    it('session-telemetry-otel has 9 files', () => {
      assert.equal(SESSION_TELEMETRY_OTEL_FILES.length, 9)
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

  describe('session-telemetry package.json', () => {
    it('has correct name and version', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-telemetry/package.json'))
      assert.equal(pkg.name, '@deepseek-ai/dsh-session-telemetry')
      assert.equal(pkg.version, '0.1.0-rc.5')
    })

    it('has correct peer dependencies', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-telemetry/package.json'))
      const peers = Object.keys(pkg.peerDependencies)
      assert.ok(peers.includes('@deepseek-ai/dsh-agent'))
      assert.ok(peers.includes('@deepseek-ai/dsh-invariants'))
      assert.ok(peers.includes('@deepseek-ai/dsh-session'))
      assert.ok(peers.includes('@deepseek-ai/cordis'))
    })

    it('has correct exports', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-telemetry/package.json'))
      assert.ok(pkg.exports['.'])
      assert.ok(pkg.exports['./invariant'])
      assert.ok(pkg.exports['./src/*'])
      assert.ok(pkg.exports['./package.json'])
    })
  })

  describe('session-telemetry tsconfig.json', () => {
    it('has correct references', () => {
      const tsconfig = JSON.parse(readReplica('packages/session/session-telemetry/tsconfig.json'))
      const refs = tsconfig.references.map(r => r.path)
      assert.ok(refs.includes('../../../vendor/cosmokit'))
      assert.ok(refs.includes('../../../vendor/cordis'))
      assert.ok(refs.includes('../../core/session'))
      assert.ok(refs.includes('../../core/agent'))
      assert.ok(refs.includes('../../runtime-diagnostics/invariants'))
    })
  })

  describe('session-telemetry src/index.ts', () => {
    it('exports required symbols', () => {
      const src = readReplica('packages/session/session-telemetry/src/index.ts')
      assert.match(src, /export type SessionTelemetrySeverity/)
      assert.match(src, /export interface SessionTelemetryRecord/)
      assert.match(src, /export interface SessionTelemetrySink/)
      assert.match(src, /export type SessionTelemetrySharingStatus/)
      assert.match(src, /export abstract class SessionTelemetryBackend/)
      assert.match(src, /SessionTelemetryCoordinator/)
      assert.match(src, /SessionTelemetryCapture/)
    })

    it('declares session-telemetry/record waterfall event', () => {
      const src = readReplica('packages/session/session-telemetry/src/index.ts')
      assert.match(src, /'session-telemetry\/record'/)
      assert.match(src, /waterfall/)
    })

    it('defines the backend abstract class with sharing, emit, flush, shutdown', () => {
      const src = readReplica('packages/session/session-telemetry/src/index.ts')
      assert.match(src, /abstract readonly sharing/)
      assert.match(src, /abstract emit/)
      assert.match(src, /flush\?\(\)/)
      assert.match(src, /abstract shutdown/)
    })
  })

  describe('session-telemetry src/coordinator.ts', () => {
    it('exports SessionTelemetryCoordinator class', () => {
      const src = readReplica('packages/session/session-telemetry/src/coordinator.ts')
      assert.match(src, /export class SessionTelemetryCoordinator/)
    })

    it('has capture, adopt, track, captureEvent, redact, deliver methods', () => {
      const src = readReplica('packages/session/session-telemetry/src/coordinator.ts')
      assert.match(src, /captureSession/)
      assert.match(src, /private adopt/)
      assert.match(src, /private track/)
      assert.match(src, /private captureEvent/)
      assert.match(src, /private redact/)
      assert.match(src, /private deliver/)
    })

    it('has handoff cursor WeakMap for HMR resilience', () => {
      const src = readReplica('packages/session/session-telemetry/src/coordinator.ts')
      assert.match(src, /handoffCursor.*WeakMap/)
    })

    it('has severityOf, errorDetail, identityOf, shutdownRecord helpers', () => {
      const src = readReplica('packages/session/session-telemetry/src/coordinator.ts')
      assert.match(src, /function severityOf/)
      assert.match(src, /function errorDetail/)
      assert.match(src, /function identityOf/)
      assert.match(src, /function shutdownRecord/)
    })

    it('implements chunk projection (first chunk per turn:step)', () => {
      const src = readReplica('packages/session/session-telemetry/src/coordinator.ts')
      assert.match(src, /assistant\/chunk/)
      assert.match(src, /chunkSeen/)
      assert.match(src, /turn.*step/)
    })
  })

  describe('session-telemetry tests', () => {
    it('telemetry.spec.ts has 24 it + 1 it.each', () => {
      const src = readReplica('packages/session/session-telemetry/tests/telemetry.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      const itEachMatches = src.match(/^\s*it\.each\(/gm) || []
      assert.equal(itMatches.length, 24, 'regular it() calls')
      assert.equal(itEachMatches.length, 1, 'it.each() calls')
    })

    it('redact.spec.ts has 6 test cases', () => {
      const src = readReplica('packages/session/session-telemetry/tests/redact.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      assert.equal(itMatches.length, 6)
    })
  })

  describe('session-telemetry-otel package.json', () => {
    it('has correct name and version', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-telemetry-otel/package.json'))
      assert.equal(pkg.name, '@deepseek-ai/dsh-session-telemetry-otel')
      assert.equal(pkg.version, '0.1.0-rc.5')
    })

    it('has OTel SDK dependencies', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-telemetry-otel/package.json'))
      const deps = Object.keys(pkg.dependencies)
      assert.ok(deps.includes('@opentelemetry/api'))
      assert.ok(deps.includes('@opentelemetry/api-logs'))
      assert.ok(deps.includes('@opentelemetry/exporter-logs-otlp-http'))
      assert.ok(deps.includes('@opentelemetry/sdk-logs'))
      assert.ok(deps.includes('@opentelemetry/resources'))
    })

    it('has correct peer dependencies', () => {
      const pkg = JSON.parse(readReplica('packages/session/session-telemetry-otel/package.json'))
      const peers = Object.keys(pkg.peerDependencies)
      assert.ok(peers.includes('@deepseek-ai/dsh-session-telemetry'))
      assert.ok(peers.includes('@deepseek-ai/dsh-session'))
      assert.ok(peers.includes('@deepseek-ai/dsh-anonymous-user-id'))
    })
  })

  describe('session-telemetry-otel tsconfig.json', () => {
    it('has correct references', () => {
      const tsconfig = JSON.parse(readReplica('packages/session/session-telemetry-otel/tsconfig.json'))
      const refs = tsconfig.references.map(r => r.path)
      assert.ok(refs.includes('../../../vendor/cosmokit'))
      assert.ok(refs.includes('../../../vendor/cordis'))
      assert.ok(refs.includes('../../../vendor/schemastery'))
      assert.ok(refs.includes('../../core/session'))
      assert.ok(refs.includes('../../feedback/command-feedback'))
      assert.ok(refs.includes('../../llm/llm'))
      assert.ok(refs.includes('../session-telemetry'))
      assert.ok(refs.includes('../../identity/anonymous-user-id'))
      assert.ok(refs.includes('../../runtime-diagnostics/invariants'))
    })
  })

  describe('session-telemetry-otel src/index.ts', () => {
    it('exports OpenTelemetrySessionBackend class', () => {
      const src = readReplica('packages/session/session-telemetry-otel/src/index.ts')
      assert.match(src, /export class OpenTelemetrySessionBackend/)
      assert.match(src, /extends SessionTelemetryBackend/)
    })

    it('exports SessionTelemetryMode enum', () => {
      const src = readReplica('packages/session/session-telemetry-otel/src/index.ts')
      assert.match(src, /export enum SessionTelemetryMode/)
      assert.match(src, /FULL/)
      assert.match(src, /FEEDBACK_ONLY/)
      assert.match(src, /DISABLED/)
    })

    it('has config validation and URL checks', () => {
      const src = readReplica('packages/session/session-telemetry-otel/src/index.ts')
      assert.match(src, /exporter\.url is required/)
      assert.match(src, /not a valid URL/)
      assert.match(src, /must be http\(s\)/)
      assert.match(src, /maxExportBatchSize/)
      assert.match(src, /shutdownTimeoutMillis/)
    })

    it('has sharing status disclosure', () => {
      const src = readReplica('packages/session/session-telemetry-otel/src/index.ts')
      assert.match(src, /sharingStatusFor/)
      assert.match(src, /'full'/)
      assert.match(src, /'feedback-only'/)
      assert.match(src, /'disabled'/)
    })

    it('has OTel SDK pipeline setup', () => {
      const src = readReplica('packages/session/session-telemetry-otel/src/index.ts')
      assert.match(src, /LoggerProvider/)
      assert.match(src, /BatchLogRecordProcessor/)
      assert.match(src, /OTLPLogExporter/)
      assert.match(src, /resourceFromAttributes/)
    })

    it('has default export', () => {
      const src = readReplica('packages/session/session-telemetry-otel/src/index.ts')
      assert.match(src, /export default OpenTelemetrySessionBackend/)
    })
  })

  describe('session-telemetry-otel tests', () => {
    it('otel.spec.ts has 15 it + 1 it.each', () => {
      const src = readReplica('packages/session/session-telemetry-otel/tests/otel.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      const itEachMatches = src.match(/^\s*it\.each\(/gm) || []
      assert.equal(itMatches.length, 15, 'regular it() calls')
      assert.equal(itEachMatches.length, 1, 'it.each() calls')
    })

    it('loader-composition.e2e.ts has 3 test cases', () => {
      const src = readReplica('packages/session/session-telemetry-otel/tests/loader-composition.e2e.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      assert.equal(itMatches.length, 3)
    })
  })

  describe('Invariant companions', () => {
    for (const pkg of ['session-telemetry', 'session-telemetry-otel']) {
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
    for (const pkg of ['session-telemetry', 'session-telemetry-otel']) {
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

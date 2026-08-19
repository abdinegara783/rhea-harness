/**
 * Verify script for Phase 4.9 — session-query packages.
 *
 * Validates byte-identical replication of:
 * - packages/session-query/session-query (20 files)
 * - packages/session-query/session-query-sqlite (12 files)
 * - packages/session-query/session-log-export (22 files)
 * - packages/session-query/tool-session-query (14 files)
 * - packages/session-query root READMEs (3 files)
 * Total: 71 files.
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

const ROOT_README_FILES = [
  'packages/session-query/README.i18n.yaml',
  'packages/session-query/README.md',
  'packages/session-query/README.zh.md',
]

const SESSION_QUERY_FILES = [
  'packages/session-query/session-query/package.json',
  'packages/session-query/session-query/tsconfig.json',
  'packages/session-query/session-query/README.i18n.yaml',
  'packages/session-query/session-query/README.md',
  'packages/session-query/session-query/README.zh.md',
  'packages/session-query/session-query/src/config.ts',
  'packages/session-query/session-query/src/corpus.ts',
  'packages/session-query/session-query/src/cursor.ts',
  'packages/session-query/session-query/src/documents.ts',
  'packages/session-query/session-query/src/extraction.ts',
  'packages/session-query/session-query/src/filters.ts',
  'packages/session-query/session-query/src/index.ts',
  'packages/session-query/session-query/src/invariant.ts',
  'packages/session-query/session-query/src/sources.ts',
  'packages/session-query/session-query/src/tracing.ts',
  'packages/session-query/session-query/src/types.ts',
  'packages/session-query/session-query/tests/search-helpers.spec.ts',
  'packages/session-query/session-query/tests/session-query.spec.ts',
  'packages/session-query/session-query/tests/test-service.ts',
  'packages/session-query/session-query/tests/tracing.spec.ts',
]

const SESSION_QUERY_SQLITE_FILES = [
  'packages/session-query/session-query-sqlite/package.json',
  'packages/session-query/session-query-sqlite/tsconfig.json',
  'packages/session-query/session-query-sqlite/README.i18n.yaml',
  'packages/session-query/session-query-sqlite/README.md',
  'packages/session-query/session-query-sqlite/README.zh.md',
  'packages/session-query/session-query-sqlite/src/index.ts',
  'packages/session-query/session-query-sqlite/src/invariant.ts',
  'packages/session-query/session-query-sqlite/src/query.ts',
  'packages/session-query/session-query-sqlite/src/schema.ts',
  'packages/session-query/session-query-sqlite/tests/load-path.e2e.ts',
  'packages/session-query/session-query-sqlite/tests/query.spec.ts',
  'packages/session-query/session-query-sqlite/tests/sqlite.spec.ts',
]

const SESSION_LOG_EXPORT_FILES = [
  'packages/session-query/session-log-export/package.json',
  'packages/session-query/session-log-export/tsconfig.json',
  'packages/session-query/session-log-export/tsdown.config.ts',
  'packages/session-query/session-log-export/README.i18n.yaml',
  'packages/session-query/session-log-export/README.md',
  'packages/session-query/session-log-export/README.zh.md',
  'packages/session-query/session-log-export/src/index.ts',
  'packages/session-query/session-log-export/src/invariant.ts',
  'packages/session-query/session-log-export/src/css-modules.d.ts',
  'packages/session-query/session-log-export/src/client/controller.ts',
  'packages/session-query/session-log-export/src/client/index.ts',
  'packages/session-query/session-log-export/src/client/locales.ts',
  'packages/session-query/session-log-export/src/client/Dialog.tsx',
  'packages/session-query/session-log-export/src/client/HeaderAction.tsx',
  'packages/session-query/session-log-export/src/client/HeaderAction.module.css',
  'packages/session-query/session-log-export/tests/client-apply.client.spec.tsx',
  'packages/session-query/session-log-export/tests/command.client.spec.ts',
  'packages/session-query/session-log-export/tests/controller.client.spec.ts',
  'packages/session-query/session-log-export/tests/dialog.client.spec.tsx',
  'packages/session-query/session-log-export/tests/header-action.client.spec.tsx',
  'packages/session-query/session-log-export/tests/invariant.client.spec.ts',
  'packages/session-query/session-log-export/tests/loader-composition.client.spec.ts',
]

const TOOL_SESSION_QUERY_FILES = [
  'packages/session-query/tool-session-query/package.json',
  'packages/session-query/tool-session-query/tsconfig.json',
  'packages/session-query/tool-session-query/README.i18n.yaml',
  'packages/session-query/tool-session-query/README.md',
  'packages/session-query/tool-session-query/README.zh.md',
  'packages/session-query/tool-session-query/src/index.ts',
  'packages/session-query/tool-session-query/src/input.ts',
  'packages/session-query/tool-session-query/src/invariant.ts',
  'packages/session-query/tool-session-query/src/operations.ts',
  'packages/session-query/tool-session-query/src/presentation.ts',
  'packages/session-query/tool-session-query/src/service-boundary.ts',
  'packages/session-query/tool-session-query/src/workspace-access.ts',
  'packages/session-query/tool-session-query/tests/sqlite-integration.spec.ts',
  'packages/session-query/tool-session-query/tests/tool-session-query.spec.ts',
]

const ALL_FILES = [
  ...ROOT_README_FILES,
  ...SESSION_QUERY_FILES,
  ...SESSION_QUERY_SQLITE_FILES,
  ...SESSION_LOG_EXPORT_FILES,
  ...TOOL_SESSION_QUERY_FILES,
]

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Phase 4.9 — session-query packages', () => {
  describe('File inventory', () => {
    it('has exactly 71 files across 4 packages + root READMEs', () => {
      assert.equal(ALL_FILES.length, 71)
      for (const f of ALL_FILES) {
        assert.ok(fileExists(f), `missing: ${f}`)
      }
    })

    it('root READMEs have 3 files', () => {
      assert.equal(ROOT_README_FILES.length, 3)
    })

    it('session-query has 20 files', () => {
      assert.equal(SESSION_QUERY_FILES.length, 20)
    })

    it('session-query-sqlite has 12 files', () => {
      assert.equal(SESSION_QUERY_SQLITE_FILES.length, 12)
    })

    it('session-log-export has 22 files', () => {
      assert.equal(SESSION_LOG_EXPORT_FILES.length, 22)
    })

    it('tool-session-query has 14 files', () => {
      assert.equal(TOOL_SESSION_QUERY_FILES.length, 14)
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

  // ── session-query ──────────────────────────────────────────────────────────

  describe('session-query package.json', () => {
    it('has correct name and version', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/session-query/package.json'))
      assert.equal(pkg.name, '@deepseek-ai/dsh-session-query')
      assert.equal(pkg.version, '0.1.0-rc.5')
    })

    it('has correct peer dependencies', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/session-query/package.json'))
      const peers = Object.keys(pkg.peerDependencies)
      assert.ok(peers.includes('@deepseek-ai/dsh-session'))
      assert.ok(peers.includes('@deepseek-ai/dsh-session-title'))
      assert.ok(peers.includes('@deepseek-ai/dsh-session-persistence'))
      assert.ok(peers.includes('@deepseek-ai/dsh-invariants'))
      assert.ok(peers.includes('@deepseek-ai/dsh-llm'))
      assert.ok(peers.includes('@deepseek-ai/cordis'))
    })

    it('has optional session-persistence peer', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/session-query/package.json'))
      assert.equal(pkg.peerDependenciesMeta['@deepseek-ai/dsh-session-persistence'].optional, true)
    })

    it('has correct exports', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/session-query/package.json'))
      assert.ok(pkg.exports['.'])
      assert.ok(pkg.exports['./invariant'])
      assert.ok(pkg.exports['./src/*'])
      assert.ok(pkg.exports['./package.json'])
    })
  })

  describe('session-query tsconfig.json', () => {
    it('has correct references', () => {
      const tsconfig = JSON.parse(readReplica('packages/session-query/session-query/tsconfig.json'))
      const refs = tsconfig.references.map(r => r.path)
      assert.ok(refs.includes('../../../vendor/cosmokit'))
      assert.ok(refs.includes('../../../vendor/cordis'))
      assert.ok(refs.includes('../../util/brand'))
      assert.ok(refs.includes('../../llm/llm'))
      assert.ok(refs.includes('../../core/session'))
      assert.ok(refs.includes('../../session/session-title'))
      assert.ok(refs.includes('../../session/session-persistence'))
      assert.ok(refs.includes('../../runtime-diagnostics/invariants'))
    })
  })

  describe('session-query src/index.ts', () => {
    it('exports SessionQueryEngine abstract class extending Service', () => {
      const src = readReplica('packages/session-query/session-query/src/index.ts')
      assert.match(src, /export abstract class SessionQueryEngine extends Service/)
      assert.match(src, /static inject = \['sessions'\]/)
    })

    it('has abstract searchSessions and searchEvents methods', () => {
      const src = readReplica('packages/session-query/session-query/src/index.ts')
      assert.match(src, /abstract searchSessions/)
      assert.match(src, /abstract searchEvents/)
    })

    it('has concrete listSessions, readSession, filterSessions methods', () => {
      const src = readReplica('packages/session-query/session-query/src/index.ts')
      assert.match(src, /listSessions/)
      assert.match(src, /readSession/)
      assert.match(src, /filterSessions/)
    })

    it('has readTitle and readTitleSnapshot methods', () => {
      const src = readReplica('packages/session-query/session-query/src/index.ts')
      assert.match(src, /async readTitle/)
      assert.match(src, /readTitleSnapshot/)
    })

    it('has traceSession and traceEvent methods', () => {
      const src = readReplica('packages/session-query/session-query/src/index.ts')
      assert.match(src, /traceSession/)
      assert.match(src, /traceEvent/)
    })

    it('re-exports types, config, cursor, documents, extraction, filters, sources', () => {
      const src = readReplica('packages/session-query/session-query/src/index.ts')
      assert.match(src, /export type \* from '\.\/types\.ts'/)
      assert.match(src, /export \{ SessionSearchCursor \}/)
      assert.match(src, /export \{[^}]*SessionQueryError/)
      assert.match(src, /export \{ extractSessionEventText \}/)
      assert.match(src, /export \{[^}]*buildSessionEventRecords/)
      assert.match(src, /export \{[^}]*compileSessionTextFilter/)
      assert.match(src, /export \{ assertSessionHeadersCompatible \}/)
    })
  })

  describe('session-query src/types.ts', () => {
    it('defines core session record and search types', () => {
      const src = readReplica('packages/session-query/session-query/src/types.ts')
      assert.match(src, /SessionRecord/)
      assert.match(src, /SessionLineageTrace/)
      assert.match(src, /SessionSearchRequest/)
      assert.match(src, /SessionSearchHit/)
      assert.match(src, /SessionSearchPage/)
      assert.match(src, /SessionEventSearchRequest/)
      assert.match(src, /SessionEventSearchHit/)
    })
  })

  describe('session-query src/config.ts', () => {
    it('defines SessionQueryError with error codes', () => {
      const src = readReplica('packages/session-query/session-query/src/config.ts')
      assert.match(src, /SessionQueryError/)
      assert.match(src, /SessionQueryErrorCode/)
    })
  })

  describe('session-query src/corpus.ts', () => {
    it('defines SessionCorpus for live/persisted resolution', () => {
      const src = readReplica('packages/session-query/session-query/src/corpus.ts')
      assert.match(src, /class SessionCorpus/)
      assert.match(src, /listSessions/)
      assert.match(src, /load/)
    })
  })

  describe('session-query tests', () => {
    it('session-query.spec.ts has 31 test cases', () => {
      const src = readReplica('packages/session-query/session-query/tests/session-query.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      assert.equal(itMatches.length, 31)
    })

    it('search-helpers.spec.ts has 9 test cases', () => {
      const src = readReplica('packages/session-query/session-query/tests/search-helpers.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      assert.equal(itMatches.length, 9)
    })

    it('tracing.spec.ts has 11 it + 1 it.each', () => {
      const src = readReplica('packages/session-query/session-query/tests/tracing.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      const itEachMatches = src.match(/^\s*it\.each\(/gm) || []
      assert.equal(itMatches.length, 11)
      assert.equal(itEachMatches.length, 1)
    })
  })

  // ── session-query-sqlite ───────────────────────────────────────────────────

  describe('session-query-sqlite package.json', () => {
    it('has correct name and version', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/session-query-sqlite/package.json'))
      assert.equal(pkg.name, '@deepseek-ai/dsh-session-query-sqlite')
      assert.equal(pkg.version, '0.1.0-rc.5')
    })

    it('has schemastery dependency', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/session-query-sqlite/package.json'))
      assert.ok(pkg.dependencies['@deepseek-ai/schemastery'])
    })

    it('has correct peer dependencies', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/session-query-sqlite/package.json'))
      const peers = Object.keys(pkg.peerDependencies)
      assert.ok(peers.includes('@deepseek-ai/dsh-session-query'))
      assert.ok(peers.includes('@deepseek-ai/dsh-session'))
      assert.ok(peers.includes('@deepseek-ai/dsh-session-persistence'))
      assert.ok(peers.includes('@deepseek-ai/cordis'))
    })
  })

  describe('session-query-sqlite tsconfig.json', () => {
    it('has correct references', () => {
      const tsconfig = JSON.parse(readReplica('packages/session-query/session-query-sqlite/tsconfig.json'))
      const refs = tsconfig.references.map(r => r.path)
      assert.ok(refs.includes('../../../vendor/cosmokit'))
      assert.ok(refs.includes('../../../vendor/cordis'))
      assert.ok(refs.includes('../../../vendor/schemastery'))
      assert.ok(refs.includes('../../core/session'))
      assert.ok(refs.includes('../../session/session-persistence'))
      assert.ok(refs.includes('../../runtime-diagnostics/invariants'))
      assert.ok(refs.includes('../session-query'))
    })
  })

  describe('session-query-sqlite src/index.ts', () => {
    it('exports SqliteSessionQueryEngine extending SessionQueryEngine', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/src/index.ts')
      assert.match(src, /class SqliteSessionQueryEngine extends SessionQueryEngine/)
    })

    it('exports schema version and application ID constants', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/src/index.ts')
      assert.match(src, /SESSION_QUERY_SQLITE_SCHEMA_VERSION/)
      assert.match(src, /SESSION_QUERY_SQLITE_APPLICATION_ID/)
    })

    it('implements searchSessions and searchEvents', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/src/index.ts')
      assert.match(src, /searchSessions/)
      assert.match(src, /searchEvents/)
    })

    it('has FTS5 full-text search integration', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/src/index.ts')
      assert.match(src, /Fts5/)
      assert.match(src, /snippet/)
    })

    it('has openAt policy (startup, first-search, never)', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/src/index.ts')
      assert.match(src, /openAt/)
      assert.match(src, /'startup'/)
      assert.match(src, /'first-search'/)
      assert.match(src, /'never'/)
    })

    it('has reconciliation with stable observation', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/src/index.ts')
      assert.match(src, /STABLE_OBSERVATION/)
      assert.match(src, /reconcil/)
    })
  })

  describe('session-query-sqlite src/schema.ts', () => {
    it('defines SQLite schema with FTS5 tables', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/src/schema.ts')
      assert.match(src, /SESSION_QUERY_SQLITE_SCHEMA_VERSION/)
      assert.match(src, /APPLICATION_ID/)
      assert.match(src, /fts5/)
      assert.match(src, /openSearchDatabase/)
    })
  })

  describe('session-query-sqlite src/query.ts', () => {
    it('has SQL predicate builders and FTS helpers', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/src/query.ts')
      assert.match(src, /buildSessionWhere/)
      assert.match(src, /buildEventWhere/)
      assert.match(src, /quoteFtsData/)
      assert.match(src, /sanitizeFtsText/)
      assert.match(src, /makeSnippet/)
      assert.match(src, /requestFingerprint/)
    })

    it('has cursor encode/decode', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/src/query.ts')
      assert.match(src, /cursor/)
    })
  })

  describe('session-query-sqlite tests', () => {
    it('sqlite.spec.ts has 54 it + 3 it.each', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/tests/sqlite.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      const itEachMatches = src.match(/^\s*it\.each\(/gm) || []
      assert.equal(itMatches.length, 54, 'regular it() calls')
      assert.equal(itEachMatches.length, 3, 'it.each() calls')
    })

    it('query.spec.ts has 10 test cases', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/tests/query.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      assert.equal(itMatches.length, 10)
    })

    it('load-path.e2e.ts has 1 test case', () => {
      const src = readReplica('packages/session-query/session-query-sqlite/tests/load-path.e2e.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      assert.equal(itMatches.length, 1)
    })
  })

  // ── session-log-export ─────────────────────────────────────────────────────

  describe('session-log-export package.json', () => {
    it('has correct name and version', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/session-log-export/package.json'))
      assert.equal(pkg.name, '@deepseek-ai/dsh-session-log-export')
      assert.equal(pkg.version, '0.1.0-rc.5')
    })

    it('has client-side peer dependencies', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/session-log-export/package.json'))
      const peers = Object.keys(pkg.peerDependencies)
      assert.ok(peers.includes('@deepseek-ai/dsh-client-locale'))
      assert.ok(peers.includes('@deepseek-ai/dsh-client-runtime'))
      assert.ok(peers.includes('@deepseek-ai/dsh-client-ui-commands'))
      assert.ok(peers.includes('@deepseek-ai/dsh-client-ui-conversation'))
      assert.ok(peers.includes('@deepseek-ai/dsh-client-ui-primitives'))
      assert.ok(peers.includes('@deepseek-ai/dsh-client-ui-slots'))
      assert.ok(peers.includes('react'))
    })

    it('has client export path', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/session-log-export/package.json'))
      assert.ok(pkg.exports['./client'])
    })

    it('has dsh client config with web platform', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/session-log-export/package.json'))
      assert.equal(pkg.dsh.client.platform, 'web')
    })
  })

  describe('session-log-export tsconfig.json', () => {
    it('extends client base config', () => {
      const tsconfig = readReplica('packages/session-query/session-log-export/tsconfig.json')
      assert.match(tsconfig, /tsconfig\.base\.client\.json/)
    })

    it('has correct references', () => {
      const tsconfig = JSON.parse(readReplica('packages/session-query/session-log-export/tsconfig.json'))
      const refs = tsconfig.references.map(r => r.path)
      assert.ok(refs.includes('../../../vendor/cordis'))
      assert.ok(refs.includes('../../interaction/commands'))
      assert.ok(refs.includes('../../client/locale'))
      assert.ok(refs.includes('../../client/runtime'))
      assert.ok(refs.includes('../../client/ui-commands'))
      assert.ok(refs.includes('../../client/ui-conversation'))
      assert.ok(refs.includes('../../client/ui-primitives'))
      assert.ok(refs.includes('../../client/ui-slots'))
      assert.ok(refs.includes('../../runtime-diagnostics/invariants'))
    })
  })

  describe('session-log-export src/index.ts', () => {
    it('registers session-log-download command', () => {
      const src = readReplica('packages/session-query/session-log-export/src/index.ts')
      assert.match(src, /session-log-download/)
      assert.match(src, /commands/)
    })
  })

  describe('session-log-export src/client/controller.ts', () => {
    it('defines SessionLogDownloadController class', () => {
      const src = readReplica('packages/session-query/session-log-export/src/client/controller.ts')
      assert.match(src, /class SessionLogDownloadController/)
      assert.match(src, /download/)
      assert.match(src, /dispose/)
      assert.match(src, /dismiss/)
    })

    it('has sessionLogZipFilename and downloadUrl helpers', () => {
      const src = readReplica('packages/session-query/session-log-export/src/client/controller.ts')
      assert.match(src, /sessionLogZipFilename/)
      assert.match(src, /downloadUrl/)
    })
  })

  describe('session-log-export src/client/Dialog.tsx', () => {
    it('defines SessionLogDownloadDialog React component', () => {
      const src = readReplica('packages/session-query/session-log-export/src/client/Dialog.tsx')
      assert.match(src, /SessionLogDownloadDialog/)
      assert.match(src, /Modal/)
    })
  })

  describe('session-log-export src/client/HeaderAction.tsx', () => {
    it('defines SessionLogDownloadHeaderAction React component', () => {
      const src = readReplica('packages/session-query/session-log-export/src/client/HeaderAction.tsx')
      assert.match(src, /SessionLogDownloadHeaderAction/)
    })
  })

  describe('session-log-export tests', () => {
    it('has 7 test files with 18 total test cases', () => {
      const testFiles = [
        'packages/session-query/session-log-export/tests/client-apply.client.spec.tsx',
        'packages/session-query/session-log-export/tests/command.client.spec.ts',
        'packages/session-query/session-log-export/tests/controller.client.spec.ts',
        'packages/session-query/session-log-export/tests/dialog.client.spec.tsx',
        'packages/session-query/session-log-export/tests/header-action.client.spec.tsx',
        'packages/session-query/session-log-export/tests/invariant.client.spec.ts',
        'packages/session-query/session-log-export/tests/loader-composition.client.spec.ts',
      ]
      assert.equal(testFiles.length, 7)
      let total = 0
      for (const f of testFiles) {
        const src = readReplica(f)
        total += (src.match(/^\s*it\(/gm) || []).length
      }
      assert.equal(total, 18)
    })
  })

  // ── tool-session-query ─────────────────────────────────────────────────────

  describe('tool-session-query package.json', () => {
    it('has correct name and version', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/tool-session-query/package.json'))
      assert.equal(pkg.name, '@deepseek-ai/dsh-tool-session-query')
      assert.equal(pkg.version, '0.1.0-rc.5')
    })

    it('has correct peer dependencies', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/tool-session-query/package.json'))
      const peers = Object.keys(pkg.peerDependencies)
      assert.ok(peers.includes('@deepseek-ai/dsh-session-query'))
      assert.ok(peers.includes('@deepseek-ai/dsh-session'))
      assert.ok(peers.includes('@deepseek-ai/dsh-tools'))
      assert.ok(peers.includes('@deepseek-ai/dsh-system-prompt'))
      assert.ok(peers.includes('@deepseek-ai/dsh-llm'))
      assert.ok(peers.includes('@deepseek-ai/dsh-timeout'))
      assert.ok(peers.includes('@deepseek-ai/cordis'))
    })

    it('has schemastery dependency', () => {
      const pkg = JSON.parse(readReplica('packages/session-query/tool-session-query/package.json'))
      assert.ok(pkg.dependencies['@deepseek-ai/schemastery'])
    })
  })

  describe('tool-session-query tsconfig.json', () => {
    it('has correct references', () => {
      const tsconfig = JSON.parse(readReplica('packages/session-query/tool-session-query/tsconfig.json'))
      const refs = tsconfig.references.map(r => r.path)
      assert.ok(refs.includes('../../../vendor/cosmokit'))
      assert.ok(refs.includes('../../../vendor/cordis'))
      assert.ok(refs.includes('../../../vendor/schemastery'))
      assert.ok(refs.includes('../../llm/llm'))
      assert.ok(refs.includes('../../core/session'))
      assert.ok(refs.includes('../../core/tools'))
      assert.ok(refs.includes('../../core/system-prompt'))
      assert.ok(refs.includes('../session-query'))
      assert.ok(refs.includes('../../runtime-diagnostics/invariants'))
      assert.ok(refs.includes('../../util/timeout'))
    })
  })

  describe('tool-session-query src/index.ts', () => {
    it('registers five tools with correct names', () => {
      const src = readReplica('packages/session-query/tool-session-query/src/index.ts')
      assert.match(src, /session_search/)
      assert.match(src, /session_event_search/)
      assert.match(src, /session_trace/)
      assert.match(src, /session_event_trace/)
      assert.match(src, /session_event_read/)
    })

    it('has Config with maxSearchResults and searchTimeoutMs', () => {
      const src = readReplica('packages/session-query/tool-session-query/src/index.ts')
      assert.match(src, /maxSearchResults/)
      assert.match(src, /searchTimeoutMs/)
      assert.match(src, /DEFAULT_MAX_SEARCH_RESULTS.*100/)
      assert.match(src, /DEFAULT_SEARCH_TIMEOUT_MS.*30.000/)
    })

    it('injects tools, systemPrompt, sessionQuery', () => {
      const src = readReplica('packages/session-query/tool-session-query/src/index.ts')
      assert.match(src, /inject = \['tools', 'systemPrompt', 'sessionQuery'\]/)
    })
  })

  describe('tool-session-query src/input.ts', () => {
    it('has toolInput with search parameters and filter builders', () => {
      const src = readReplica('packages/session-query/tool-session-query/src/input.ts')
      assert.match(src, /toolInput/)
      assert.match(src, /sessionSearchParameters/)
      assert.match(src, /eventSearchParameters/)
      assert.match(src, /buildSessionFilters/)
      assert.match(src, /buildEventFilters/)
      assert.match(src, /normalizeQuery/)
    })
  })

  describe('tool-session-query src/operations.ts', () => {
    it('has operations for all five tools', () => {
      const src = readReplica('packages/session-query/tool-session-query/src/operations.ts')
      assert.match(src, /executeSessionSearch/)
      assert.match(src, /executeEventSearch/)
      assert.match(src, /executeSessionTrace/)
      assert.match(src, /executeEventTrace/)
      assert.match(src, /executeEventRead/)
    })
  })

  describe('tool-session-query src/presentation.ts', () => {
    it('has format and presentCall functions', () => {
      const src = readReplica('packages/session-query/tool-session-query/src/presentation.ts')
      assert.match(src, /formatSessionSearch/)
      assert.match(src, /formatEventSearch/)
      assert.match(src, /formatSessionTrace/)
      assert.match(src, /formatEventTrace/)
      assert.match(src, /formatEventRead/)
      assert.match(src, /presentSessionSearchCall/)
      assert.match(src, /presentEventSearchCall/)
    })
  })

  describe('tool-session-query src/service-boundary.ts', () => {
    it('has error containment and model-safe translation', () => {
      const src = readReplica('packages/session-query/tool-session-query/src/service-boundary.ts')
      assert.match(src, /serviceBoundary/)
      assert.match(src, /unauthorizedTarget/)
      assert.match(src, /sanitizeError/)
      assert.match(src, /SAFE_SESSION_QUERY_FAILURES/)
    })

    it('maps all 17 SessionQueryError codes to model-safe messages', () => {
      const src = readReplica('packages/session-query/tool-session-query/src/service-boundary.ts')
      assert.match(src, /SESSION_QUERY_ABORTED/)
      assert.match(src, /SESSION_QUERY_CORRUPT_SESSION/)
      assert.match(src, /SESSION_QUERY_EVENT_NOT_FOUND/)
      assert.match(src, /SESSION_QUERY_INDEX_FAILED/)
      assert.match(src, /SESSION_QUERY_INVALID_CURSOR/)
      assert.match(src, /SESSION_QUERY_INVALID_FILTER/)
      assert.match(src, /SESSION_QUERY_INVALID_QUERY/)
      assert.match(src, /SESSION_QUERY_PERSISTENCE_FAILED/)
      assert.match(src, /SESSION_QUERY_SEARCH_DISABLED/)
      assert.match(src, /SESSION_QUERY_SESSION_NOT_FOUND/)
      assert.match(src, /SESSION_QUERY_STALE_CURSOR/)
    })
  })

  describe('tool-session-query src/workspace-access.ts', () => {
    it('has authorization and workspace scoping', () => {
      const src = readReplica('packages/session-query/tool-session-query/src/workspace-access.ts')
      assert.match(src, /workspaceAccess/)
      assert.match(src, /callerOf/)
      assert.match(src, /authorizeTarget/)
      assert.match(src, /recordAuthorized/)
      assert.match(src, /assertObservedTargetAuthorized/)
    })

    it('has descendant traversal with iterative DFS', () => {
      const src = readReplica('packages/session-query/tool-session-query/src/workspace-access.ts')
      assert.match(src, /visitDescendants/)
      assert.match(src, /descendantIds/)
    })
  })

  describe('tool-session-query tests', () => {
    it('tool-session-query.spec.ts has 54 it + 8 it.each', () => {
      const src = readReplica('packages/session-query/tool-session-query/tests/tool-session-query.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      const itEachMatches = src.match(/^\s*it\.each\(/gm) || []
      assert.equal(itMatches.length, 54, 'regular it() calls')
      assert.equal(itEachMatches.length, 8, 'it.each() calls')
    })

    it('sqlite-integration.spec.ts has 2 test cases', () => {
      const src = readReplica('packages/session-query/tool-session-query/tests/sqlite-integration.spec.ts')
      const itMatches = src.match(/^\s*it\(/gm) || []
      assert.equal(itMatches.length, 2)
    })
  })

  // ── Invariant companions ────────────────────────────────────────────────────

  describe('Invariant companions', () => {
    for (const pkg of ['session-query', 'session-query-sqlite', 'tool-session-query']) {
      it(`${pkg}/src/invariant.ts has correct structure`, () => {
        const src = readReplica(`packages/session-query/${pkg}/src/invariant.ts`)
        assert.match(src, /PACKAGE_NAME/)
        assert.match(src, /export const name = /)
        assert.match(src, /export const inject = \['invariants'\]/)
      })
    }

    it('session-log-export/src/invariant.ts has correct structure', () => {
      const src = readReplica('packages/session-query/session-log-export/src/invariant.ts')
      assert.match(src, /PACKAGE_NAME/)
      assert.match(src, /export const name = /)
      assert.match(src, /export const inject = \['invariants'\]/)
    })
  })

  describe('README files', () => {
    const packages = [
      { dir: 'session-query', label: 'session-query' },
      { dir: 'session-query-sqlite', label: 'session-query-sqlite' },
      { dir: 'session-log-export', label: 'session-log-export' },
      { dir: 'tool-session-query', label: 'tool-session-query' },
    ]
    for (const { dir, label } of packages) {
      it(`${label} has README.md, README.zh.md, README.i18n.yaml`, () => {
        const md = readReplica(`packages/session-query/${dir}/README.md`)
        const zh = readReplica(`packages/session-query/${dir}/README.zh.md`)
        const yaml = readReplica(`packages/session-query/${dir}/README.i18n.yaml`)
        assert.ok(md.length > 0)
        assert.ok(zh.length > 0)
        assert.ok(yaml.length > 0)
      })
    }
  })
})

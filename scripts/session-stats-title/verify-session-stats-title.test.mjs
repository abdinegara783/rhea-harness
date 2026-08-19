/**
 * Verify Phase 4.6: packages/session/session-stats + session-title.
 * 29 files, byte-identical fidelity, structural assertions.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..', '..')
const ORIGINAL = join(ROOT, '..', 'deepseek-harness')

/** Files that must be byte-identical (excluding node_modules and lib). */
const FILES = [
  // session-stats (12 files)
  'packages/session/session-stats/README.i18n.yaml',
  'packages/session/session-stats/README.md',
  'packages/session/session-stats/README.zh.md',
  'packages/session/session-stats/package.json',
  'packages/session/session-stats/src/client.ts',
  'packages/session/session-stats/src/index.ts',
  'packages/session/session-stats/src/invariant.ts',
  'packages/session/session-stats/src/projection.ts',
  'packages/session/session-stats/src/types.ts',
  'packages/session/session-stats/tests/loader-composition.spec.ts',
  'packages/session/session-stats/tests/projection.spec.ts',
  'packages/session/session-stats/tsconfig.json',
  // session-title (17 files)
  'packages/session/session-title/README.i18n.yaml',
  'packages/session/session-title/README.md',
  'packages/session/session-title/README.zh.md',
  'packages/session/session-title/package.json',
  'packages/session/session-title/src/client.ts',
  'packages/session/session-title/src/index.ts',
  'packages/session/session-title/src/invariant.ts',
  'packages/session/session-title/src/normalize.ts',
  'packages/session/session-title/src/types.ts',
  'packages/session/session-title/tests/invariant.spec.ts',
  'packages/session/session-title/tests/persistence.spec.ts',
  'packages/session/session-title/tests/projection.spec.ts',
  'packages/session/session-title/tests/provider.spec.ts',
  'packages/session/session-title/tests/rename.spec.ts',
  'packages/session/session-title/tests/service-contracts.spec.ts',
  'packages/session/session-title/tests/session-title.spec.ts',
  'packages/session/session-title/tsconfig.json',
]

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8')
}

describe('Phase 4.6 — session-stats + session-title fidelity', () => {
  it('copies all 29 files byte-identical', () => {
    for (const rel of FILES) {
      const replica = readFileSync(join(ROOT, rel))
      const original = readFileSync(join(ORIGINAL, rel))
      assert.ok(replica.equals(original), `${rel} differs`)
    }
  })

  it('session-stats package.json metadata', () => {
    const pkg = JSON.parse(read('packages/session/session-stats/package.json'))
    assert.equal(pkg.name, '@deepseek-ai/dsh-session-stats')
    assert.equal(pkg.version, '0.1.0-rc.5')
    assert.equal(pkg.type, 'module')
    assert.ok(pkg.exports['.'])
    assert.ok(pkg.exports['./invariant'])
    assert.ok(pkg.exports['./types'])
    assert.ok(pkg.exports['./client'])
    assert.equal(pkg.peerDependencies['@deepseek-ai/dsh-session-projection'], 'workspace:^')
    assert.equal(pkg.peerDependencies['@deepseek-ai/dsh-llm'], 'workspace:^')
    assert.ok(pkg.dependencies.zod)
  })

  it('session-title package.json metadata', () => {
    const pkg = JSON.parse(read('packages/session/session-title/package.json'))
    assert.equal(pkg.name, '@deepseek-ai/dsh-session-title')
    assert.equal(pkg.version, '0.1.0-rc.5')
    assert.equal(pkg.type, 'module')
    assert.ok(pkg.exports['.'])
    assert.ok(pkg.exports['./invariant'])
    assert.ok(pkg.exports['./types'])
    assert.ok(pkg.exports['./client'])
    assert.equal(pkg.peerDependencies['@deepseek-ai/dsh-session-projection'], 'workspace:^')
    assert.equal(pkg.peerDependencies['@deepseek-ai/dsh-llm'], 'workspace:^')
    assert.equal(pkg.dependencies['@deepseek-ai/schemastery'], 'workspace:^')
    assert.ok(pkg.dependencies.zod)
  })

  it('session-stats projection defines sessionStats key with fold logic', () => {
    const src = read('packages/session/session-stats/src/projection.ts')
    assert.ok(src.includes("key: 'sessionStats'"))
    assert.ok(src.includes('stateVersion: 1'))
    assert.ok(src.includes('step/start'))
    assert.ok(src.includes('step/end'))
    assert.ok(src.includes('assistant/chunk'))
    assert.ok(src.includes('assistant/message'))
    assert.ok(src.includes('tool/call'))
    assert.ok(src.includes('tool/result'))
    assert.ok(src.includes('turn/end'))
    assert.ok(src.includes('isTokenDelta'))
    assert.ok(src.includes('usageOutputTokens'))
    assert.ok(src.includes('pendingCalls'))
  })

  it('session-stats index registers the projection via apply()', () => {
    const src = read('packages/session/session-stats/src/index.ts')
    assert.ok(src.includes("name = 'session-stats'"))
    assert.ok(src.includes("inject = ['sessionProjections']"))
    assert.ok(src.includes('sessionStatsProjectionDefinition'))
  })

  it('session-stats types augment SessionProjectionMap', () => {
    const src = read('packages/session/session-stats/src/types.ts')
    assert.ok(src.includes('SessionStatsProjection'))
    assert.ok(src.includes('SessionProjectionMap'))
    assert.ok(src.includes('sessionStats'))
    assert.ok(src.includes('turns: number'))
    assert.ok(src.includes('steps: number'))
    assert.ok(src.includes('llmMs: number'))
    assert.ok(src.includes('toolMs: number'))
    assert.ok(src.includes('ttftMs: number'))
    assert.ok(src.includes('decodeMs: number'))
    assert.ok(src.includes('decodeTokens: number'))
  })

  it('session-title index defines SessionTitleService with full API', () => {
    const src = read('packages/session/session-title/src/index.ts')
    assert.ok(src.includes('class SessionTitleService extends Service'))
    assert.ok(src.includes("static inject = ['sessions']"))
    assert.ok(src.includes('get(session'))
    assert.ok(src.includes('rename(session'))
    assert.ok(src.includes('refresh(session'))
    assert.ok(src.includes('register(provider'))
    assert.ok(src.includes('foldSessionTitle'))
    assert.ok(src.includes('collectSessionTitleMessages'))
    assert.ok(src.includes('SessionTitleInvalidError'))
    assert.ok(src.includes('SessionTitleProviderId'))
    assert.ok(src.includes("key: 'title'"))
    assert.ok(src.includes('fallbackSessionTitle'))
    assert.ok(src.includes('normalizeSessionTitle'))
  })

  it('session-title normalize provides UTF-8 safe truncation', () => {
    const src = read('packages/session/session-title/src/normalize.ts')
    assert.ok(src.includes('truncateTitleUtf8'))
    assert.ok(src.includes('normalizeSessionTitle'))
    assert.ok(src.includes('fallbackSessionTitle'))
    assert.ok(src.includes('OSC_SEQUENCE'))
    assert.ok(src.includes('CSI_SEQUENCE'))
    assert.ok(src.includes('CONTROL_CHARACTER'))
    assert.ok(src.includes('DIRECTIONAL_CONTROL'))
  })

  it('session-title types augment SessionProjectionMap with title key', () => {
    const src = read('packages/session/session-title/src/types.ts')
    assert.ok(src.includes('SessionProjectionMap'))
    assert.ok(src.includes('title: string | null'))
  })

  it('session-title invariant checks messageSeqs/source relationship', () => {
    const src = read('packages/session/session-title/src/invariant.ts')
    assert.ok(src.includes("name = 'session-title-invariant'"))
    assert.ok(src.includes('internal/dispatch'))
    assert.ok(src.includes('session/title'))
    assert.ok(src.includes('messageSeqs'))
    assert.ok(src.includes('source.kind'))
  })

  it('session-stats test files contain expected test counts', () => {
    const loader = read('packages/session/session-stats/tests/loader-composition.spec.ts')
    assert.equal((loader.match(/^\s*it\(/gm) || []).length, 2)

    const projection = read('packages/session/session-stats/tests/projection.spec.ts')
    assert.equal((projection.match(/^\s*it\(/gm) || []).length, 15)
  })

  it('session-title test files contain expected test counts', () => {
    const invariant = read('packages/session/session-title/tests/invariant.spec.ts')
    assert.equal((invariant.match(/^\s*it\(/gm) || []).length, 2)

    const persistence = read('packages/session/session-title/tests/persistence.spec.ts')
    assert.equal((persistence.match(/^\s*it\(/gm) || []).length, 2)

    const projection = read('packages/session/session-title/tests/projection.spec.ts')
    assert.equal((projection.match(/^\s*it\(/gm) || []).length, 4)

    const provider = read('packages/session/session-title/tests/provider.spec.ts')
    assert.equal((provider.match(/^\s*it\(/gm) || []).length, 7)

    const rename = read('packages/session/session-title/tests/rename.spec.ts')
    assert.equal((rename.match(/^\s*it\(/gm) || []).length, 6)

    const contracts = read('packages/session/session-title/tests/service-contracts.spec.ts')
    assert.equal((contracts.match(/^\s*it\(/gm) || []).length, 15)

    const title = read('packages/session/session-title/tests/session-title.spec.ts')
    assert.equal((title.match(/^\s*it\(/gm) || []).length, 6)
  })

  it('session-stats tsconfig references are correct', () => {
    const tsconfig = JSON.parse(read('packages/session/session-stats/tsconfig.json'))
    const paths = tsconfig.references.map(r => r.path)
    assert.ok(paths.includes('../../../vendor/cosmokit'))
    assert.ok(paths.includes('../../../vendor/cordis'))
    assert.ok(paths.includes('../../runtime-diagnostics/invariants'))
    assert.ok(paths.includes('../../llm/llm'))
    assert.ok(paths.includes('../../core/session'))
    assert.ok(paths.includes('../session-projection'))
  })

  it('session-title tsconfig references are correct', () => {
    const tsconfig = JSON.parse(read('packages/session/session-title/tsconfig.json'))
    const paths = tsconfig.references.map(r => r.path)
    assert.ok(paths.includes('../../../vendor/cosmokit'))
    assert.ok(paths.includes('../../../vendor/cordis'))
    assert.ok(paths.includes('../../../vendor/schemastery'))
    assert.ok(paths.includes('../../util/brand'))
    assert.ok(paths.includes('../../runtime-diagnostics/invariants'))
    assert.ok(paths.includes('../../llm/llm'))
    assert.ok(paths.includes('../../core/session'))
    assert.ok(paths.includes('../session-projection'))
  })

  it('session-stats README describes fold semantics', () => {
    const readme = read('packages/session/session-stats/README.md')
    assert.ok(readme.includes('@deepseek-ai/dsh-session-stats'))
    assert.ok(readme.includes('Fold semantics'))
    assert.ok(readme.includes('step/end'))
    assert.ok(readme.includes('sessionStats'))
    assert.ok(readme.includes('Composition'))
  })

  it('session-title README describes service API and provider contract', () => {
    const readme = read('packages/session/session-title/README.md')
    assert.ok(readme.includes('@deepseek-ai/dsh-session-title'))
    assert.ok(readme.includes('SessionTitleService'))
    assert.ok(readme.includes('foldSessionTitle'))
    assert.ok(readme.includes('Provider contract'))
    assert.ok(readme.includes('Configuration'))
  })

  it('Chinese translations exist and carry key terms', () => {
    const statsZh = read('packages/session/session-stats/README.zh.md')
    assert.ok(statsZh.includes('中文'))
    assert.ok(statsZh.includes('sessionStats'))
    assert.ok(statsZh.includes('折叠语义'))

    const titleZh = read('packages/session/session-title/README.zh.md')
    assert.ok(titleZh.includes('中文'))
    assert.ok(titleZh.includes('SessionTitleService'))
    assert.ok(titleZh.includes('提供方约定'))
  })

  it('i18n YAML files record blob hashes', () => {
    const statsYaml = read('packages/session/session-stats/README.i18n.yaml')
    assert.ok(statsYaml.includes('README.md:'))
    assert.ok(statsYaml.includes('README.zh.md:'))

    const titleYaml = read('packages/session/session-title/README.i18n.yaml')
    assert.ok(titleYaml.includes('README.md:'))
    assert.ok(titleYaml.includes('README.zh.md:'))
  })
})

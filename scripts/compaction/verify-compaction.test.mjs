/**
 * Verification: Phase 5.8 — packages/compaction/*
 * 4 packages: compaction, compaction-basic, command-compact, compaction-tool-result-pruner
 * 54 files total (excluding node_modules and lib).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'

const ORIGINAL = join(process.cwd(), '../deepseek-harness/packages/compaction')
const REPLICA = join(process.cwd(), 'packages/compaction')

const PACKAGES = [
  'compaction',
  'compaction-basic',
  'command-compact',
  'compaction-tool-result-pruner',
]

const SRC_FILES = {
  compaction: ['index.ts', 'brand.ts', 'checkpoint.ts', 'invariant.ts', 'tool-pairing.ts', 'types.ts'],
  'compaction-basic': ['index.ts', 'config.ts', 'invariant.ts', 'region.ts', 'summarizer.ts', 'types.ts'],
  'command-compact': ['index.ts', 'invariant.ts'],
  'compaction-tool-result-pruner': ['index.ts', 'config.ts', 'invariant.ts', 'types.ts'],
}

const TEST_FILES = {
  compaction: ['compaction.spec.ts', 'tool-pairing.spec.ts', 'invariant.spec.ts'],
  'compaction-basic': ['compaction-basic.spec.ts', 'compaction-loop-repro.spec.ts', 'loader-composition.spec.ts', 'manual-compaction.spec.ts'],
  'command-compact': ['command-compact.spec.ts', 'invariant.spec.ts', 'loader-composition.spec.ts'],
  'compaction-tool-result-pruner': ['tool-result-pruner.spec.ts', 'loader-composition.spec.ts'],
}

function fidelity(pkg, relPath) {
  const orig = readFileSync(join(ORIGINAL, pkg, relPath), 'utf8')
  const copy = readFileSync(join(REPLICA, pkg, relPath), 'utf8')
  return orig === copy
}

describe('Phase 5.8 — compaction fidelity', () => {
  for (const pkg of PACKAGES) {
    it(`${pkg}: source files byte-identical`, () => {
      for (const file of SRC_FILES[pkg]) {
        assert.ok(fidelity(pkg, `src/${file}`), `src/${file} mismatch`)
      }
    })

    it(`${pkg}: test files byte-identical`, () => {
      for (const file of TEST_FILES[pkg]) {
        assert.ok(fidelity(pkg, `tests/${file}`), `tests/${file} mismatch`)
      }
    })

    it(`${pkg}: package.json byte-identical`, () => {
      assert.ok(fidelity(pkg, 'package.json'))
    })

    it(`${pkg}: tsconfig.json byte-identical`, () => {
      assert.ok(fidelity(pkg, 'tsconfig.json'))
    })
  }

  it('compaction/tsdown.config.ts byte-identical', () => {
    assert.ok(fidelity('compaction', 'tsdown.config.ts'))
  })

  it('root README files byte-identical', () => {
    for (const f of ['README.md', 'README.zh.md', 'README.i18n.yaml']) {
      const orig = readFileSync(join(ORIGINAL, f), 'utf8')
      const copy = readFileSync(join(REPLICA, f), 'utf8')
      assert.ok(orig === copy, `${f} mismatch`)
    }
  })
})

describe('Phase 5.8 — package metadata', () => {
  it('compaction has correct name and 4 exports', () => {
    const pkg = JSON.parse(readFileSync(join(REPLICA, 'compaction/package.json'), 'utf8'))
    assert.equal(pkg.name, '@deepseek-ai/dsh-compaction')
    assert.ok(pkg.exports['.'])
    assert.ok(pkg.exports['./invariant'])
    assert.ok(pkg.exports['./types'])
    assert.ok(pkg.exports['./checkpoint'])
  })

  it('compaction-basic has optional peer dep on tool-result-pruner', () => {
    const pkg = JSON.parse(readFileSync(join(REPLICA, 'compaction-basic/package.json'), 'utf8'))
    assert.equal(pkg.name, '@deepseek-ai/dsh-compaction-basic')
    assert.equal(pkg.peerDependenciesMeta?.['@deepseek-ai/dsh-compaction-tool-result-pruner']?.optional, true)
  })

  it('command-compact has correct name', () => {
    const pkg = JSON.parse(readFileSync(join(REPLICA, 'command-compact/package.json'), 'utf8'))
    assert.equal(pkg.name, '@deepseek-ai/dsh-command-compact')
  })

  it('compaction-tool-result-pruner has correct name', () => {
    const pkg = JSON.parse(readFileSync(join(REPLICA, 'compaction-tool-result-pruner/package.json'), 'utf8'))
    assert.equal(pkg.name, '@deepseek-ai/dsh-compaction-tool-result-pruner')
  })
})

describe('Phase 5.8 — source exports', () => {
  it('compaction exports CompactionEngine, brand, checkpoint, tool-pairing', () => {
    const src = readFileSync(join(REPLICA, 'compaction/src/index.ts'), 'utf8')
    assert.ok(src.includes('export abstract class CompactionEngine'))
    assert.ok(src.includes("export { CompactionId } from './brand.ts'"))
    assert.ok(src.includes("export { compactCheckpointSource, isCompactCheckpointSource } from './checkpoint.ts'"))
    assert.ok(src.includes("export { toolPairingBalancedAfter, toolPairingBalancedBefore } from './tool-pairing.ts'"))
  })

  it('compaction-basic exports BasicCompactionEngine', () => {
    const src = readFileSync(join(REPLICA, 'compaction-basic/src/index.ts'), 'utf8')
    assert.ok(src.includes('export class BasicCompactionEngine extends CompactionEngine'))
  })

  it('command-compact exports apply and name', () => {
    const src = readFileSync(join(REPLICA, 'command-compact/src/index.ts'), 'utf8')
    assert.ok(src.includes("export const name = 'command-compact'"))
    assert.ok(src.includes('export function apply(ctx: Context): void'))
  })

  it('compaction-tool-result-pruner exports ToolResultPruner service', () => {
    const src = readFileSync(join(REPLICA, 'compaction-tool-result-pruner/src/index.ts'), 'utf8')
    assert.ok(src.includes('export class ToolResultPruner extends Service'))
    assert.ok(src.includes("static inject = ['tokenMeter']"))
  })
})

describe('Phase 5.8 — test spec counts', () => {
  for (const pkg of PACKAGES) {
    it(`${pkg} has ${TEST_FILES[pkg].length} test files`, () => {
      for (const file of TEST_FILES[pkg]) {
        assert.ok(existsSync(join(REPLICA, pkg, 'tests', file)), `missing tests/${file}`)
      }
    })
  }
})

describe('Phase 5.8 — total file count', () => {
  it('has 54 files (excluding node_modules and lib)', () => {
    const count = Number(execSync(
      `find ${REPLICA} -type f ! -path '*/node_modules/*' ! -path '*/lib/*' | wc -l`,
    ).toString().trim())
    assert.equal(count, 54)
  })
})

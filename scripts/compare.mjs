#!/usr/bin/env node
/**
 * compare.mjs — Parity checker for deepseek-harness → learn-harness replication.
 *
 * Walks every top-level folder in ORIGINAL and REPLICA, counts source lines
 * (excluding node_modules, dist, .git, coverage, test-plans, tmp, assets,
 * .pnpm-store, vendor/landlock-run build artifacts), and prints a parity table.
 *
 * Usage:  node scripts/compare.mjs
 */

import { readdirSync, statSync, lstatSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const ORIGINAL = join(ROOT, '..', 'deepseek-harness');
const REPLICA = ROOT; // learn-harness

// ── Source file extensions we count ──────────────────────────────────────────
const SOURCE_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.yaml', '.yml', '.toml',
  '.md', '.css', '.scss', '.html', '.vue', '.svelte',
  '.py', '.sh', '.bash', '.zsh',
  '.c', '.h', '.cpp', '.hpp',
  '.patch', '.cfg', '.ini', '.editorconfig', '.gitattributes',
  '.gitignore', '.npmrc',
]);

// ── Directories to skip ─────────────────────────────────────────────────────
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'lib', 'coverage', '.nyc_output',
  'test-plans', 'tmp', '.pnpm-store', '.qoder', '.claude',
  'venv', '.pytest_cache', '__pycache__',
]);

// ── Helpers ──────────────────────────────────────────────────────────────────

function countLines(filePath) {
  try {
    const buf = readFileSync(filePath, 'utf8');
    return buf.split('\n').length;
  } catch {
    return 0;
  }
}

function isSourceFile(name) {
  const ext = extname(name).toLowerCase();
  if (SOURCE_EXTS.has(ext)) return true;
  // Dotfiles with no extension
  const base = name.replace(/\\/g, '/').split('/').pop();
  if (base.startsWith('.') && !ext) return true;
  return false;
}

/**
 * Recursively count source lines under `dir`, skipping ignored dirs.
 * Returns { lines, files }.
 */
function walkDir(dir, result = { lines: 0, files: 0 }) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return result;
  }
  for (const entry of entries) {
    const name = entry.name || entry;
    const fullPath = join(dir, name);
    let st;
    try {
      const lst = lstatSync(fullPath);
      // Skip symlinks to avoid double-counting
      if (lst.isSymbolicLink()) continue;
      st = lst;
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walkDir(fullPath, result);
    } else if (st.isFile()) {
      if (isSourceFile(name)) {
        result.lines += countLines(fullPath);
        result.files += 1;
      }
    }
  }
  return result;
}

/**
 * List immediate subdirectories of `dir` (non-recursive).
 */
function subDirs(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isDirectory() && !SKIP_DIRS.has(e.name))
      .map(e => e.name)
      .sort();
  } catch {
    return [];
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

function topFolders(base) {
  // Root-level files (not dirs)
  const entries = readdirSync(base, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory() && !SKIP_DIRS.has(e.name)).map(e => e.name).sort();
  return dirs;
}

function run() {
  const origFolders = topFolders(ORIGINAL);
  const replFolders = topFolders(REPLICA);

  const allFolders = [...new Set([...origFolders, ...replFolders])].sort();

  const rows = [];
  let totalOrig = 0;
  let totalRepl = 0;

  // Root-level files
  {
    const origRoot = { lines: 0, files: 0 };
    const replRoot = { lines: 0, files: 0 };
    for (const e of readdirSync(ORIGINAL, { withFileTypes: true })) {
      if (e.isFile() && isSourceFile(e.name)) {
        origRoot.lines += countLines(join(ORIGINAL, e.name));
        origRoot.files++;
      }
    }
    for (const e of readdirSync(REPLICA, { withFileTypes: true })) {
      if (e.isFile() && isSourceFile(e.name)) {
        replRoot.lines += countLines(join(REPLICA, e.name));
        replRoot.files++;
      }
    }
    totalOrig += origRoot.lines;
    totalRepl += replRoot.lines;
    const pct = origRoot.lines > 0 ? ((replRoot.lines / origRoot.lines) * 100).toFixed(1) : '100.0';
    rows.push({ folder: '(root files)', orig: origRoot.lines, repl: replRoot.lines, pct: parseFloat(pct), origFiles: origRoot.files, replFiles: replRoot.files });
  }

  for (const folder of allFolders) {
    const origPath = join(ORIGINAL, folder);
    const replPath = join(REPLICA, folder);

    // For packages/, break down by sub-package
    if (folder === 'packages') {
      const origPkgs = subDirs(origPath);
      const replPkgs = subDirs(replPath);
      const allPkgs = [...new Set([...origPkgs, ...replPkgs])].sort();

      for (const pkg of allPkgs) {
        const o = walkDir(join(origPath, pkg));
        const r = walkDir(join(replPath, pkg));
        totalOrig += o.lines;
        totalRepl += r.lines;
        const pct = o.lines > 0 ? ((r.lines / o.lines) * 100).toFixed(1) : (r.lines > 0 ? '∞' : '100.0');
        rows.push({
          folder: `packages/${pkg}`,
          orig: o.lines, repl: r.lines,
          pct: pct === '∞' ? Infinity : parseFloat(pct),
          origFiles: o.files, replFiles: r.files,
        });
      }
      continue;
    }

    // For apps/, break down by sub-app
    if (folder === 'apps') {
      const origApps = subDirs(origPath);
      const replApps = subDirs(replPath);
      const allApps = [...new Set([...origApps, ...replApps])].sort();

      for (const app of allApps) {
        const o = walkDir(join(origPath, app));
        const r = walkDir(join(replPath, app));
        totalOrig += o.lines;
        totalRepl += r.lines;
        const pct = o.lines > 0 ? ((r.lines / o.lines) * 100).toFixed(1) : '100.0';
        rows.push({
          folder: `apps/${app}`,
          orig: o.lines, repl: r.lines,
          pct: parseFloat(pct),
          origFiles: o.files, replFiles: r.files,
        });
      }
      continue;
    }

    const o = walkDir(origPath);
    const r = walkDir(replPath);
    totalOrig += o.lines;
    totalRepl += r.lines;
    const pct = o.lines > 0 ? ((r.lines / o.lines) * 100).toFixed(1) : (r.lines > 0 ? '∞' : '100.0');
    rows.push({
      folder,
      orig: o.lines, repl: r.lines,
      pct: pct === '∞' ? Infinity : parseFloat(pct),
      origFiles: o.files, replFiles: r.files,
    });
  }

  // ── Print table ──────────────────────────────────────────────────────────
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║         deepseek-harness  →  learn-harness  Parity Report           ║');
  console.log('╠══════════════════════════════════════════════════════════════════════╣');
  console.log('');

  const pad = (s, n) => String(s).padStart(n);
  const padR = (s, n) => String(s).padEnd(n);

  console.log(`${padR('Folder', 40)} ${pad('Parity', 8)}  ${pad('Lines', 12)}/${pad('Lines', 12)}  ${padR('Status', 8)}`);
  console.log(`${'─'.repeat(40)} ${'─'.repeat(8)}  ${'─'.repeat(12)} ${'─'.repeat(12)}  ${'─'.repeat(8)}`);

  const gaps = [];

  for (const row of rows) {
    const pctStr = row.pct === Infinity ? '     ∞' : pad(row.pct.toFixed(1) + '%', 8);
    const status = row.pct === Infinity ? '✅' : row.pct >= 95 ? '✅' : row.pct >= 80 ? '⚠️' : '❌';
    console.log(`${padR(row.folder, 40)} ${pctStr}  ${pad(row.orig.toLocaleString(), 12)}/${pad(row.repl.toLocaleString(), 12)}  ${status}`);
    if (row.pct !== Infinity && row.pct < 95) {
      gaps.push(row);
    }
  }

  // Overall
  const overallPct = totalOrig > 0 ? ((totalRepl / totalOrig) * 100).toFixed(1) : '100.0';
  console.log(`${'─'.repeat(40)} ${'─'.repeat(8)}  ${'─'.repeat(12)} ${'─'.repeat(12)}  ${'─'.repeat(8)}`);
  console.log(`${padR('OVERALL', 40)} ${pad(overallPct + '%', 8)}  ${pad(totalOrig.toLocaleString(), 12)}/${pad(totalRepl.toLocaleString(), 12)}`);
  console.log('');

  // ── Gaps summary ─────────────────────────────────────────────────────────
  if (gaps.length > 0) {
    console.log('⚠️  Folders below 95% parity:');
    for (const g of gaps.sort((a, b) => a.pct - b.pct)) {
      const deficit = g.orig - g.repl;
      console.log(`  • ${g.folder}: ${g.pct.toFixed(1)}% (deficit: ${deficit.toLocaleString()} lines)`);
    }
    console.log('');
  } else {
    console.log('✅ All folders ≥ 95% parity!');
    console.log('');
  }

  // ── JSON output for programmatic consumption ──────────────────────────────
  const json = {
    generated: new Date().toISOString(),
    overall: { original: totalOrig, replica: totalRepl, parity: parseFloat(overallPct) },
    folders: rows.map(r => ({
      folder: r.folder,
      original: r.orig,
      replica: r.repl,
      parity: r.pct === Infinity ? null : r.pct,
      originalFiles: r.origFiles,
      replicaFiles: r.replFiles,
    })),
    gaps: gaps.map(g => ({
      folder: g.folder,
      parity: g.pct,
      deficit: g.orig - g.repl,
    })),
  };

  // Write JSON report
  const reportPath = join(ROOT, 'scripts', 'parity-report.json');
  writeFileSync(reportPath, JSON.stringify(json, null, 2) + '\n');
  console.log(`📄 JSON report: ${reportPath}`);
}

run();

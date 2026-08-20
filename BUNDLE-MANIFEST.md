# Bundle Manifest — Phase 3.3

```yaml
phase: "3.3"
version: "v0.3.2"
tagline: "Saya Bisa Cari di Isi File"
features:
  - id: "3.3-1"
    description: "Cari kata/frasa di seluruh project menggunakan grep tool"
    packages:
      - name: "@deepseek-ai/dsh-tool-fs-search"
        path: "packages/fs/tool-fs-search/"
        exists: true
        build_cmd: "pre-built lib/ present"
        role: "Provides glob and grep model-facing tools backed by @vscode/ripgrep"
  - id: "3.3-2"
    description: "Hasil pencarian: nama file, nomor baris, cuplikan kode"
    packages:
      - name: "@vscode/ripgrep"
        path: "node_modules/@vscode/ripgrep/"
        exists: true
        build_cmd: "npm binary dependency"
        role: "Packaged ripgrep binary that powers glob/grep tool execution"
  - id: "3.3-3"
    description: "Regex support untuk pencarian konten file"
    packages:
      - name: "@deepseek-ai/dsh-tool-fs-search"
        path: "packages/fs/tool-fs-search/"
        exists: true
        build_cmd: "pre-built lib/ present"
        role: "grep tool accepts regex patterns, spawns rg with --json output"
  - id: "3.3-4"
    description: "Batasi pencarian ke folder tertentu"
    packages:
      - name: "@deepseek-ai/dsh-tool-fs-search"
        path: "packages/fs/tool-fs-search/"
        exists: true
        build_cmd: "pre-built lib/ present"
        role: "glob/grep tools accept optional path parameter as search root"
dependencies:
  - phase: "3.1"
    tracker_status: "created"
    status: "satisfied"
acceptance_criteria:
  - "'cari function di *.ts' → hasil dengan baris & cuplikan"
  - "Regex 'TODO:.*' → semua TODO comments ditemukan"
  - "Hasil: nama file, nomor baris, highlight cuplikan"
  - "Batasi ke src/ → hanya file di src/ yang muncul"
  - "Cepat untuk ratusan file"
compliance_notes:
  - "ripgrep — MIT/Unlicensed. Cek ReDoS (regex denial of service)."
  - "@vscode/ripgrep ships binary — verify license in node_modules."
risk_assessment:
  level: "low"
  factors:
    - "Package already deployed in Phase 3.1 — just verifying search works"
    - "@vscode/ripgrep binary now installed (was noted missing in Phase 3.1)"
    - "No new code changes — verification-only phase"
```

## SAD Findings — Journey Summary Discrepancy

The journey summary listed 4 packages for Phase 3.3, **all with wrong paths**:

| Journey Summary | Real Package |
|---|---|
| `@deepseek-ai/dsh-fs-grep` at `packages/fs/grep/` | `@deepseek-ai/dsh-tool-fs-search` at `packages/fs/tool-fs-search/` |
| `@deepseek-ai/dsh-fs-glob` at `packages/fs/glob/` | Same package — `tool-fs-search` provides BOTH glob and grep |
| `@deepseek-ai/dsh-client-search` at `packages/client/search/` | Does not exist as separate package — search results rendered in `ui-conversation` |
| `@deepseek-ai/dsh-client-ui-search-results` at `packages/client/ui-search-results/` | Does not exist — search results displayed inline in chat |

## Package Verification

- `packages/fs/tool-fs-search/` ✅ exists, `lib/index.js` built
- `node_modules/@vscode/ripgrep/` ✅ exists (binary installed)
- `cordis.patch.yml` (base bundle) ✅ registers `tool-fs-search` plugin
- Tool config: `sampleOverCapGlobResults: false`, `globMaxResults: 100`, `grepMaxMatches: 250`

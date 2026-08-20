# Bundle Manifest — Phase 3.1

## Phase

- **Phase:** 3.1
- **Version:** v0.3.0
- **Tagline:** Saya Bisa Baca & Cari File
- **Date:** 2026-08-20

## Features

| ID | Description |
|---|---|
| F1 | AI can read file contents (read tool) |
| F2 | AI can list files in a directory (list tool) |
| F3 | AI can search files by name pattern (glob tool) |
| F4 | AI can search file contents by text/regex (grep tool) |
| F5 | Workspace folder can be set and managed |

## Packages

| Package | Path | Role |
|---|---|---|
| @deepseek-ai/dsh-fs | packages/fs/fs/ | Abstract filesystem capability seam (ctx.fs) — vocabulary types, FileSystem service |
| @deepseek-ai/dsh-fs-local | packages/fs/fs-local/ | Local-filesystem implementation of ctx.fs |
| @deepseek-ai/dsh-fs-sandbox | packages/fs/fs-sandbox/ | Sandbox-enforcing FS implementation (write fences by sandbox mode) |
| @deepseek-ai/dsh-fs-observation-policy | packages/fs/fs-observation-policy/ | File-context policy plugin (observed-state, read-before-edit, version-guarded writes) |
| @deepseek-ai/dsh-tool-fs | packages/fs/tool-fs/ | Model-facing filesystem tools (read, write, edit) over ctx.fs |
| @deepseek-ai/dsh-tool-fs-search | packages/fs/tool-fs-search/ | Model-facing discovery tools (glob, grep) backed by packaged ripgrep |
| @deepseek-ai/dsh-tool-str-replace-editor | packages/fs/tool-str-replace-editor/ | Model-facing view, create, replace, and line insert tools |
| @deepseek-ai/dsh-workspace | packages/workspace/workspace/ | Workspace entity registry (ctx.workspaceRegistry) with durable records |
| @deepseek-ai/dsh-client-ui-workspace | packages/client/ui-workspace/ | Workspace picker plugin (sidebar + empty-state slot) |

## Dependencies

| Phase | Status |
|---|---|
| 2.1 (Saya Bisa Chat dengan AI) | satisfied ✅ |

## Acceptance Criteria

1. "baca file package.json" → AI displays file contents
2. "cari file *.ts di src/" → lists matching files
3. "cari 'TODO' di semua file" → shows files & matching lines
4. Set workspace folder → AI knows the context
5. Relative & absolute paths both work

## Compliance Notes

- FS access requires permission boundary disclosure
- `@vscode/ripgrep` — MIT licensed, platform-specific binary packages
- `koffi` (in dsh-fs-local) — MIT licensed (native FFI for atomic operations)
- No DeepSeek branding in user-visible FS tool output

## Runtime Dependency

- `@vscode/ripgrep` — required by `dsh-tool-fs-search` for glob/grep at runtime.
  Lazily loaded; build succeeds without it but search tools fail at runtime.

## Journey Summary Discrepancy

The journey summary listed 7 packages with paths like `packages/fs/read/`,
`packages/fs/list/`, `packages/fs/glob/`, `packages/fs/grep/`. These
sub-paths do NOT exist. The real structure is:
- `packages/fs/fs/` — abstract seam (combines read/list/write/edit vocabulary)
- `packages/fs/fs-local/` — local FS implementation
- `packages/fs/tool-fs/` — model-facing read/write/edit tools
- `packages/fs/tool-fs-search/` — model-facing glob/grep tools
- `packages/fs/tool-str-replace-editor/` — model-facing str-replace tools
- `packages/fs/fs-sandbox/` — sandbox enforcement layer
- `packages/fs/fs-observation-policy/` — observation policy layer

The journey summary's `packages/client/workspace/` path is also wrong.
Real path: `packages/client/ui-workspace/`.

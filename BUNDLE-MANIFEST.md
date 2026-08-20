# Bundle Manifest — Phase 3.2

## Phase

- **Phase:** 3.2
- **Version:** v0.3.1
- **Tagline:** Saya Bisa Edit File Lewat AI
- **Date:** 2026-08-20

## Features

| ID | Description |
|---|---|
| F1 | AI can replace text in a file (str_replace) |
| F2 | AI can insert lines at a specific position |
| F3 | AI can create new files |
| F4 | Read-before-edit policy enforced (observation policy) |
| F5 | Write operations sandbox-fenced to workspace root |
| F6 | User approval required for file mutations |

## Packages

| Package | Path | Role |
|---|---|---|
| @deepseek-ai/dsh-tool-fs | packages/fs/tool-fs/ | Model-facing write/edit tools over ctx.fs |
| @deepseek-ai/dsh-tool-str-replace-editor | packages/fs/tool-str-replace-editor/ | Model-facing str_replace/insert/view/create tools |
| @deepseek-ai/dsh-fs-observation-policy | packages/fs/fs-observation-policy/ | Read-before-edit + version-guarded write policy |
| @deepseek-ai/dsh-fs-sandbox | packages/fs/fs-sandbox/ | Sandbox-enforced write fences (workspace-write mode) |
| @deepseek-ai/dsh-user-approval | packages/interaction/user-approval/ | Permission decisions (ask before file mutations) |
| @deepseek-ai/dsh-repeat-tool-reminder | packages/guard/repeat-tool-reminder/ | Guard against repeated identical tool calls |
| @deepseek-ai/dsh-tool-call-timeout-policy | packages/guard/timeout-policy/ | Timeout enforcement for tool calls |

## Dependencies

| Phase | Status |
|---|---|
| 3.1 (Saya Bisa Baca & Cari File) | satisfied ✅ |

## Acceptance Criteria

1. "ubah README.md baris pertama" → AI shows diff
2. Accept → changes applied
3. Reject → cancelled
4. "buat file baru.txt" → file created
5. Edit does not corrupt other files

## Compliance Notes

- All packages MIT licensed
- User-approval seam is fail-closed by default (secure)
- Sandbox fences writes to workspace root (no escape)
- Observation policy ensures read-before-edit (audit trail)

## Journey Summary Discrepancy

Journey summary listed 6 packages with wrong paths:
- `packages/fs/write/` → doesn't exist. Write/edit is in `packages/fs/tool-fs/`
- `packages/fs/edit/` → doesn't exist. Edit is in `packages/fs/tool-fs/`
- `packages/fs/patch/` → doesn't exist. Patch is in `packages/fs/tool-str-replace-editor/`
- `packages/client/ui-diff/` → doesn't exist. No separate diff UI package
- `packages/guard/` → exists but has `repeat-tool-reminder/` and `timeout-policy/`
- `packages/client/ui-approval/` → doesn't exist. Real: `packages/interaction/user-approval/`

Real edit packages: tool-fs (write/edit), tool-str-replace-editor (str_replace/insert),
fs-observation-policy (read-before-edit), fs-sandbox (write fences),
user-approval (permission decisions), guard/* (tool guards).

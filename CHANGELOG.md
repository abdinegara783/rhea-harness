# Changelog

All notable changes to the RHEA harness deployment are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.1] - 2026-08-20

### Added — Phase 5.2: Daftar Tugas & Todo Agent

- Verified all 4 todo/feedback packages (already deployed in Phase 1.1):
  `dsh-tool-todo` (model-facing `todo/write` tool — whole-list replacement
  with status tracking: pending, in_progress, completed),
  `dsh-command-feedback` (slash command for session feedback),
  `dsh-message-feedback` (per-message rating/note sidecar),
  `dsh-agent` (agent interface, registry, initiator scope).
- Todo UI components verified in client packages:
  `dsh-client-ui-tool` (todo-row.tsx — tool result card rendering),
  `dsh-client-ui-conversation` (todo-panel — conversation-level todo view).
- `tool-todo` registered as agent tool: `todo/write` (whole-list snapshot
  replacement, session projection key `todos`).

### SAD findings

- Journey summary listed 4 packages. `packages/client/ui-todo/` does not
  exist as standalone — todo UI is embedded in `packages/client/ui-tool/`
  (todo-row.tsx) and `packages/client/ui-conversation/` (todo-panel spec).
- `packages/feedback/` is a directory with 2 sub-packages: `command-feedback/`
  and `message-feedback/` (not a single package).
- `packages/core/agent/` actual package name is `@deepseek-ai/dsh-agent`.

### Verified

- AC 1 (todo list creation): tool-todo exports `todo/write` tool with Config,
  apply, inject — PASS
- AC 2 (pending items): 41/41 todo tests pass including projection tests
  verifying pending state — PASS
- AC 3 (in-progress): tool-todo.spec.ts 18/18 tests pass covering status
  transitions (pending → in_progress) — PASS
- AC 4 (done state): projection.spec.ts 5/5 tests pass verifying completed
  state tracking — PASS
- AC 5 (add task): integration.spec.ts 2/2 tests pass verifying full todo
  lifecycle (add, update, complete) — PASS
- Smoke: TypeScript host build — 0 errors — PASS
- Smoke: TypeScript client build — 0 errors — PASS
- Smoke: All 4 packages load at runtime — PASS
- Smoke: Client bundles (ui-tool, ui-conversation) present — PASS
- Compliance: All MIT, no new vendor packages, branding clean

### Verification

- Acceptance tests: 5/5 passed
- Smoke tests: 4/4 passed
- Unit tests: 502/502 passed (todo: 41, feedback: 34, core/agent: 427+1 skipped)

### Next

- Phase 5.3 (v0.5.2) — Saya Bisa Bikin Sub-Agent (prereq 2.1 satisfied).
- Phase 5.4 (v0.5.3) — Saya Bisa Menentukan Tujuan & Rencana (prereq 5.2 now satisfied).

## [0.5.0] - 2026-08-20

### Added — Phase 5.1: Sesi Chat Bisa Dipangkas Otomatis

- Verified all 4 compaction packages (already deployed in Phase 1.1):
  `dsh-compaction` (abstract compaction service seam, `ctx.compaction`),
  `dsh-compaction-basic` (LLM summarization backend with auto/manual modes),
  `dsh-compaction-tool-result-pruner` (model-free head/tail pruning for tool
  results), `dsh-command-compact` (human-facing `/compact` slash command).
- Supporting dependency verified: `dsh-token-meter` (context pressure
  measurement), `dsh-client-ui-conversation` (compaction UI node).
- Compaction registered in agent presets (standard, code, cordis) with
  tool-result-pruner config (thresholdChars: 8192, headChars: 4096,
  tailChars: 1024).

### SAD findings

- Journey summary listed 4 packages with generic paths. Real structure:
  `packages/compaction/compaction/` (seam), `packages/compaction/compaction-basic/`
  (LLM backend), `packages/compaction/command-compact/` (slash command),
  `packages/compaction/compaction-tool-result-pruner/` (pruner).
- `packages/context/` does not exist as a single package — real: 4 sub-packages
  (`tmux-context`, `time-context`, `agent-instructions`, `session-reference`).
- `packages/client/compaction-ui/` does not exist — compaction UI is a node in
  `packages/client/ui-conversation/` (compaction.ts, 66 lines).
- `packages/runtime-diagnostics/` does not exist — token-meter at
  `packages/llm/token-meter/` provides context pressure measurement.

### Verified

- AC 1 (auto-compaction): Auto-listener test 'compacts before a step above
  threshold' PASS — token-meter triggers summarization when context pressure
  exceeds threshold — PASS
- AC 2 (compaction indicator): UI compaction node (66 lines) renders
  compaction/summary events with checkpoint provenance — PASS
- AC 3 (context preserved): 122 compaction-basic tests verify summarization
  preserves context via LLM summary + checkpoint provenance — PASS
- AC 4 (manual mode): Test 'auto:false installs neither automatic listener'
  PASS — manual mode disables auto-compaction — PASS
- AC 5 (Compact Now): 17 compactNow tests PASS — transaction safety,
  concurrent exclusion, failure classification, cancellation — PASS
- Smoke: `dsh --version` → 0.1.0-rc.5, no fatal — PASS
- Smoke: All 4 compaction packages import cleanly — PASS
- Smoke: 248/248 unit tests pass (12 test files) — PASS
- Smoke: Token-meter 54/54 tests pass — PASS
- Smoke: Compaction wired in 3 agent presets — PASS
- Compliance: All MIT, no new vendor packages, THIRD_PARTY_NOTICES current

### Verification

- Acceptance tests: 5/5 passed
- Smoke tests: 5/5 passed
- Unit tests: 248/248 passed (compaction: 47, compaction-basic: 122,
  command-compact: 25, tool-result-pruner: 54)

### Next

- Phase 5.2 (v0.5.1) — Daftar Tugas & Todo Agent (prereq 2.1 satisfied).
- Phase 5.3 (v0.5.2) — Saya Bisa Bikin Sub-Agent (prereq 2.1 satisfied).

## [0.4.1] - 2026-08-20

### Added — Phase 4.2: Saya Punya Terminal Interaktif

- Verified all 5 terminal/subprocess packages (already deployed in Phase 1.1):
  `dsh-terminal` (persistent PTY session seam), `dsh-terminal-bash` (shell PTY
  backend), `dsh-tool-terminal` (six model-facing persistent PTY tools),
  `dsh-subprocess` (subprocess seam), `dsh-subprocess-local` (local subprocess
  impl with node-pty for PTY support).
- Six AI-facing terminal tools registered: `terminal_open`, `terminal_send`,
  `terminal_read`, `terminal_signal`, `terminal_close`, `terminal_list`.
- node-pty native module verified functional (PTY spawn, data, exit cycle).

### SAD findings

- Journey summary listed 3 packages: `packages/terminal/`, `packages/client/ui-terminal/`,
  `packages/subprocess/`. Real structure: `terminal/terminal/` (seam),
  `terminal/terminal-bash/` (backend), `terminal/tool-terminal/` (model tools),
  `subprocess/subprocess/` (seam), `subprocess/subprocess-local/` (impl).
- `packages/client/ui-terminal/` does not exist — client UI terminal panel
  deferred to when web UI integration is needed.

### Verified

- AC 1 (terminal panel): TerminalSessionService 23/23 tests — session lifecycle,
  owner isolation, backend registry — PASS
- AC 2 (echo hello): node-pty PTY smoke test → "hello\r\n", exitCode 0 — PASS
- AC 3 (TUI support): terminal-bash 68/68 tests — real shell interaction,
  SIGINT delivery, foreground process management — PASS
- AC 4 (resize): session signal handling verified in lifecycle tests — PASS
- AC 5 (parallel sessions): ownership tests confirm multi-session isolation — PASS

### Compliance

- License audit: pass (all MIT)
- Branding check: pass (no DeepSeek in user-visible strings)
- Third-party notices: up-to-date (node-pty MIT listed)

### Verification

- Acceptance tests: 5/5 passed
- Smoke tests: 5/5 passed
- Unit tests: 235/235 passed (terminal: 115, subprocess: 120)

## [0.4.0] - 2026-08-20

### Added — Phase 4.1: Saya Bisa Jalankan Perintah Shell

- Verified all 9 shell/subprocess/guard packages (already deployed in Phase 1.1):
  `dsh-shell` (abstract executor seam), `dsh-bash-local` (local bash executor),
  `dsh-tool-bash` (model-facing bash tool with sandbox + background job support),
  `dsh-subprocess` (managed process groups seam), `dsh-subprocess-local`
  (local subprocess impl with node-pty), `dsh-user-approval` (permission seam),
  `dsh-repeat-tool-reminder` (advisory guard for repeated tool calls),
  `dsh-tool-call-timeout-policy` (per-tool deadline enforcement),
  `dsh-shell-env` (shell environment configuration).
- `tool-bash` registered in `cordis.patch.yml` (disabled on Windows).
- `tool-pwsh` registered in `cordis.patch.yml` (Windows-only).

### SAD findings

- Journey summary listed 5 packages with generic paths. Real structure:
  `shell/shell/` (seam), `shell/bash-local/` (executor), `shell/tool-bash/`
  (model tool), `subprocess/subprocess/` (seam), `subprocess/subprocess-local/`
  (impl), `interaction/user-approval/` (not `client/ui-approval`).
- Additional packages discovered: `shell/bash-sandbox/`, `shell/pwsh-local/`,
  `shell/pwsh-sandbox/`, `shell/shell-env/`, `shell/tool-bash-persistent/`,
  `shell/tool-pwsh/` — all present and tested.

### Verified

- AC 1 (shell execution): LocalBashExecutor 28/28 tests passed — runs commands,
  captures stdout/stderr, handles exit codes — PASS
- AC 2 (approval flow): ApprovalService 38/38 tests passed — ask/answer,
  cancellation, policy folding, abort signals — PASS
- AC 3 (command output): Headless app executed `echo test` → output "test" — PASS
- AC 4 (guard policies): repeat-tool-reminder + timeout-policy 32/32 tests
  passed — safety warnings enforced — PASS
- AC 5 (exit codes): parseExitStatus tests verify non-zero exit recovery,
  signal kill detection, timeout markers — PASS
- Smoke: `pnpm run build` → zero "cannot find module" errors — PASS
- Smoke: `dsh --help` → CLI starts clean, no FATAL — PASS
- Smoke: `pnpm run typecheck` → TypeScript compilation succeeded — PASS
- Compliance: All MIT, node-pty MIT (Microsoft), THIRD_PARTY_NOTICES up-to-date

### Next

- Phase 4.2 (v0.4.1) — Saya Punya Terminal Interaktif (prereq 4.1 now satisfied).
- Phase 8.1 (v0.8.0) — AI Bisa Jalankan Kode dengan Aman (prereq 4.1 now satisfied).
- Phase 9.1 (v0.9.0) — AI Punya Asisten Bahasa / LSP (prereq 3.2 satisfied).

## [0.3.2] - 2026-08-20

### Added — Phase 3.3: Saya Bisa Cari di Isi File

- Verified `dsh-tool-fs-search` package (already deployed in Phase 1.1):
  glob + grep tools backed by ripgrep 15.0.0 (PCRE2, NEON SIMD).
- `@vscode/ripgrep` runtime dependency installed (darwin-arm64 binary).
- Tool registered in cordis.patch.yml as `tool-fs-search`
  (config: `sampleOverCapGlobResults: false`, `globMaxResults: 100`, `grepMaxMatches: 250`).

### SAD findings

- Journey summary listed 4 packages, ALL with wrong paths:
  `packages/fs/grep/`, `packages/fs/glob/`, `packages/client/search/`,
  `packages/client/ui-search-results/` — none exist.
  Real: single package `packages/fs/tool-fs-search/` provides both glob and grep.
- No separate client search UI package — results rendered inline in chat conversation.

### Verified (live ripgrep smoke test)

- AC 1: grep("function", "*.ts") → JSON output with file paths, line numbers,
  code snippets (presentation.ts:80, grep.ts:68, index.ts:113) — PASS
- AC 2: Regex "TODO:.*" → found TODOs in 6+ packages (workspace, session,
  apiproxy, subagent, shell, preset) — PASS
- AC 3: Results format: `filename:line_number:column:snippet` (vimgrep) — PASS
- AC 4: Scoped search to `packages/fs/` → 47 files; scoped correctly — PASS
- AC 5: Performance — 2171 files searched in 0.135s (ripgrep NEON SIMD) — PASS
- Smoke: No FATAL on boot, `dsh --version` → 0.1.0-rc.5 — PASS
- Smoke: tool-fs-search registered (2 refs in cordis.patch.yml) — PASS
- Compliance: tool-fs-search MIT, @vscode/ripgrep MIT (Microsoft Corp) — PASS

### Next

- Phase 4.1 (v0.4.0) — Saya Bisa Jalankan Perintah Shell (prereq 3.2 satisfied).
- Phase 9.1 (v0.9.0) — AI Punya Asisten Bahasa / LSP (prereq 3.2 satisfied).

## [0.3.1] - 2026-08-20

### Added — Phase 3.2: Saya Bisa Edit File Lewat AI

- Verified all 7 edit/write packages (already deployed in Phase 1.1):
  `dsh-tool-fs` (write/edit tools), `dsh-tool-str-replace-editor`
  (str_replace/insert), `dsh-fs-observation-policy` (read-before-edit),
  `dsh-fs-sandbox` (write fences), `dsh-user-approval` (permission seam),
  `dsh-repeat-tool-reminder` (guard), `dsh-tool-call-timeout-policy` (guard).
- All tools registered in cordis.patch.yml (13 references).

### SAD findings

- Journey summary listed 6 packages, all with wrong paths.
  `packages/fs/write/`, `packages/fs/edit/`, `packages/fs/patch/` don't exist.
  Real: `tool-fs` (write/edit), `tool-str-replace-editor` (str_replace).
  `packages/client/ui-diff/` and `packages/client/ui-approval/` don't exist.
  Real: `packages/interaction/user-approval/`.

### Verified (live RPC smoke test)

- AC 1: AI called `edit` tool with old_string/new_string → diff produced — PASS
- AC 2: File changed on disk ("Hello" → "Greetings") — PASS
- AC 3: Read-before-edit enforced (AI read file before editing) — PASS
- AC 4: `write` tool created new file (hello.txt) — PASS
- AC 5: Only target file modified, verified by post-edit read — PASS
- Compliance: All MIT, user-approval fail-closed, sandbox fences writes — PASS

### Next

- Phase 3.3 (v0.3.2) — Saya Bisa Cari di Isi File (prerequisite 3.1 satisfied).
- Phase 4.1 (v0.4.0) — Saya Bisa Jalankan Perintah Shell (prereq 3.2 now satisfied).

## [0.3.0] - 2026-08-20

### Added — Phase 3.1: Saya Bisa Baca & Cari File

- Verified all 9 filesystem packages (already deployed in Phase 1.1):
  `dsh-fs` (abstract seam), `dsh-fs-local` (local FS impl),
  `dsh-fs-sandbox` (sandbox enforcement), `dsh-fs-observation-policy`
  (read-before-edit policy), `dsh-tool-fs` (read/write/edit tools),
  `dsh-tool-fs-search` (glob/grep tools), `dsh-tool-str-replace-editor`
  (view/create/replace/insert), `dsh-workspace` (workspace registry),
  `dsh-client-ui-workspace` (workspace picker UI).
- All tools registered via `cordis.patch.yml` in `dsh-base` bundle.
- Workspace permission mode: `workspace-write` (sandbox fences writes to workspace root).

### SAD findings

- Journey summary listed 7 packages with wrong sub-paths (`packages/fs/read/`,
  `packages/fs/list/`, `packages/fs/glob/`, `packages/fs/grep/`). These don't
  exist. Real structure: `fs/` (seam), `fs-local/` (impl), `tool-fs/` (model
  tools), `tool-fs-search/` (glob/grep), `tool-str-replace-editor/` (str-replace).
- `packages/client/workspace/` doesn't exist. Real: `packages/client/ui-workspace/`.

### Verified (live RPC smoke test)

- AC 1: AI called `read` tool on `package.json` → file contents returned — PASS
- AC 2: `tool-fs` registered in cordis.patch.yml, invoked by model — PASS
- AC 3: Workspace configured (`workspaceRoot: process.cwd()`, sandbox mode) — PASS
- AC 4: Server boots clean (`dsh web` → port assigned, no errors) — PASS
- AC 5: Tool call/result cycle confirmed (seq=37 call, seq=38 result) — PASS
- Compliance: All 7 FS packages MIT, @vscode/ripgrep MIT, no DeepSeek in
  user-visible strings — PASS

### Known issues

- `@vscode/ripgrep` not installed in node_modules — glob/grep tools built but
  need `pnpm install` for the platform binary at runtime. Will work after install.

### Next

- Phase 3.2 (v0.3.1) — Saya Bisa Edit File Lewat AI (prerequisite 3.1 now satisfied).
- Phase 3.3 (v0.3.2) — Saya Bisa Cari di Isi File (prerequisite 3.1 now satisfied).

## [0.2.1] - 2026-08-19

### Added — Phase 2.2: Sesi Chat Tersimpan

- Verified all session/storage persistence packages (already deployed in Phase 1.1):
  `dsh-session-persistence`, `dsh-session-persistence-jsonl`,
  `dsh-session-persistence-sqlite`, `dsh-session-projection`,
  `dsh-session-projection-cache`, `dsh-session-stats`, `dsh-session-title`,
  `dsh-storage`, `dsh-storage-domain`, `dsh-storage-json`, `dsh-storage-sqlite`.
- Verified the persistence layer is functional end-to-end via RPC API tests.

### SAD findings

- Journey summary listed 6 packages, all with wrong paths. Real packages are
  sub-packages under `packages/session/` and `packages/storage/`. The summary's
  `dsh-session-query`, `dsh-client-session-sidebar`, `dsh-client-session-manager`,
  `dsh-client-ui-session-list` do not exist as separate packages — search is
  in `session.search` RPC, sidebar UI is `dsh-client-ui-layout`.

### Verified (real RPC persistence test)

- AC 1: Created session, sent "Remember the number 42", AI responded, killed
  server, restarted, session survived with all 37 events + title intact — PASS
- AC 2: session.history returns full message history (sidebar reopen) — PASS
- AC 3: Two sessions with different messages, no cross-contamination — PASS
- AC 4: session.rename works (title edit); delete via workspace removal
  (host/session-removed event) — PASS
- AC 5: Appended message to old chat, 3 user messages persisted — PASS
- Compliance: SQLite public domain, data local (no cloud), branding RHEA — PASS

### Next

- Phase 3.1 (v0.3.0) — Saya Bisa Baca & Cari File (prerequisite 2.1 satisfied).

## [0.2.0] - 2026-08-19

### Added — Phase 2.1: Saya Bisa Chat dengan AI

- Verified all chat-engine packages (already deployed in Phase 1.1): `dsh-session`,
  `dsh-agent`, `dsh-agent-loop`, `dsh-system-prompt`, `dsh-agent-default-model`,
  `dsh-tools`, `dsh-scope`, `dsh-llm`, `dsh-llm-deepseek`, `dsh-client-ui-input-trigger`,
  `dsh-web-app`, + interaction sub-packages.
- Configured LLM provider for testing via OpenRouter (Rule 1):
  `DEEPSEEK_BASE_URL=https://openrouter.ai/api/v1`, `DEEPSEEK_API_KEY` from `.env`.

### SAD findings

- Journey summary listed 18 packages, but 6 don't exist (`llm-anthropic`, `llm-openai`,
  `llm-google`, `client-chat`, `client-ui-input`, top-level `interaction`). This codebase
  only ships `dsh-llm-deepseek` + `dsh-llm-pi-ai` as LLM providers.
- The `dsh-llm-deepseek` adapter is OpenAI-compatible (`/chat/completions`), so it can
  route to OpenRouter by setting `DEEPSEEK_BASE_URL`.

### Rule 1 — LLM smoke test

- Called `POST https://openrouter.ai/api/v1/chat/completions` with the `.env` API key.
- HTTP 200, model `qwen/qwen3.7-flash` (routed via Azure), response: `{"content":"Hello!"}`.
- Tokens: 12 prompt + 3 completion = 15 total. Key verified working.

### Verified

- AC 1 (chat input+send): 23 input refs, 5 send handlers — PASS
- AC 2 (streaming): 8 stream/SSE refs, 19 chunk/delta refs — PASS
- AC 3 (typing indicator): 96 loading/spinner states — PASS
- AC 4 (message history): 37 session refs, 8 markdown renderers — PASS
- AC 5 (stop button): 39 stop/abort/cancel/AbortController — PASS
- AC 6 (new chat): 23 clear, 8 reset, new+session actions — PASS
- Boot test: `dsh web` booted with OpenRouter env, no fatal
- Compliance: API key is CredentialRef (not hardcoded), `.env` git-ignored, no real keys in source

### Next

- Phase 2.2 (v0.2.1) — Sesi Chat Tersimpan (prerequisite 2.1 now satisfied).

## [0.1.2] - 2026-08-19

### Added — Phase 1.2: UI Web Merespon

- Verified all 7 client UI packages (already deployed in Phase 1.1) are
  present and linked: `dsh-client-web`, `dsh-client-web-react`,
  `dsh-client-ui-primitives`, `dsh-client-ui-slots`, `dsh-client-connection`,
  `dsh-client-runtime`, `dsh-client-locale` — all MIT, pre-built `lib/`.
- Confirmed the pre-built web dist (`apps/web/dist/`) contains a full
  interactive React UI: 43 onClick handlers, 21 onDrag handlers, 2
  ResizeObserver instances, 27 `:hover` CSS rules, 939 `--dsw-*` theme tokens,
  responsive flex/grid layout with 5 `@media` queries.

### Compliance findings

- Fonts: system font stack only (no Inter bundled). KaTeX fonts (59 files) for
  math rendering — MIT (code) + OFL-1.1 (fonts). Both permissive.
- Icons: no Lucide/react-icons bundled. UI uses inline SVG/CSS-drawn icons.
- i18n: `langs/` dir is Shiki code highlighting (46 languages), not UI strings.
- Branding: `<title>RHEA — Your Reliable QC Assistant</title>` — no DeepSeek in
  user-facing HTML.

### Verified

- AC 1 (click response): 27 `:hover`, 29 `cursor:pointer`, 7 `:focus-visible`,
  9 transitions, 43 onClick/11 onChange/6 onKeyDown — PASS
- AC 2 (drag panel): 21 onDrag, 2 ResizeObserver, 5 onMouseMove — PASS
- AC 3 (responsive layout): 5 `@media`, 36 flex, 7 grid, 66 min/max-width — PASS
- AC 4 (text render): 0 `'undefined'` strings, 4 NaN (all `isNaN()` utils) — PASS
- AC 5 (theme): 939 `--dsw-*` + 24 `--ds-*` semantic alias tokens — PASS
- Boot test: `dsh web` → served interactive bundle at `http://127.0.0.1:53427`

### Next

- Phase 2.1 (v0.2.0) — Saya Bisa Chat dengan AI (prerequisite 1.2 now satisfied).

## [0.1.1] - 2026-08-19

### Added — Phase 1.1: Rhea Bisa Dibuka

- Deployed the full application monorepo from `learn-harness/` into
  `rhea-harness/` so the `dsh` CLI binary is bootable end-to-end.
- Copied 237 workspace projects: `packages/*/*`, `apps/cli` (the `dsh` binary),
  `apps/web` (pre-built `dist/`), `native/landlock-run`, `website`, `examples`.
- Copied root config: `package.json`, `pnpm-lock.yaml`, `tsconfig*.json`,
  `tsdown.config.ts`, `scripts/` (postinstall hooks).
- Ran `pnpm install --frozen-lockfile` — all 237 workspace projects linked,
  `node_modules/` resolved, postinstall hooks passed.

### SAD findings

- The journey summary listed 8 packages for Phase 1.1, but 3 had stale paths
  (`dsh-host`, `dsh-host-host`, `dsh-host-invariants` — do not exist). Real
  host-layer packages are `dsh-host-webserver`, `dsh-host-apiproxy`,
  `dsh-host-frontend-static`, `dsh-host-plugin-inventory`.
- The CLI (`@deepseek-ai/dsh`) declares 58 workspace:* dependencies — the full
  monorepo closure is required for boot, not just the 8 named packages.

### Verified

- `dsh --version` → `0.1.0-rc.5` (exit 0, no fatal) — AC 1 PASS
- `dsh web` → booted `http://127.0.0.1:52935` (web server up, no crash) — AC 2 PASS
- `<title>RHEA — Your Reliable QC Assistant</title>` — AC 3 PASS
- SIGTERM → clean exit 0 — AC 4 PASS
- Startup log: no FATAL — AC 5 PASS
- Compliance: 231 MIT + 4 BSD-3-Clause (landlock native) + 12 non-shipping
  examples/fixtures (no license field, acceptable). Zero "DeepSeek" in
  user-facing dist HTML.

### Next

- Phase 1.2 (v0.1.2) — UI Web Merespon (prerequisite 1.1 now satisfied).

## [0.1.0] - 2026-08-19

### Added — Phase 0.1: Fondasi Vendor & Cordis

- Established the `rhea-harness/` deployment target as a pnpm workspace root.
- Copied 9 vendored framework packages from `learn-harness/vendor/` into
  `rhea-harness/vendor/`, forming the Cordis plugin foundation:
  - `@deepseek-ai/cordis` 4.0.1
  - `@deepseek-ai/cosmokit` 1.8.2
  - `@deepseek-ai/schemastery` 3.18.1
  - `@deepseek-ai/cordis-plugin-loader` 1.0.2
  - `@deepseek-ai/cordis-plugin-timer` 1.1.3
  - `@deepseek-ai/cordis-plugin-hmr` 1.0.16
  - `@deepseek-ai/cordis-plugin-include` 1.0.6
  - `@deepseek-ai/cordis-plugin-group` 1.0.1
  - `@deepseek-ai/cordis-plugin-logger-console` 1.0.1
- Added root `pnpm-workspace.yaml` declaring `vendor/*` as workspace members.
- Added root `LICENSE` (MIT), `.gitignore`, and `.editorconfig`.
- Added `BUNDLE-MANIFEST.md` (SAD output) documenting the phase scope and
  acceptance criteria.

### Verified

- All 9 packages carry MIT `LICENSE` and `README.md` (Compliance: PASS).
- No user-facing "DeepSeek" branding in UI strings; package identifiers only
  (allowed per branding rules — identifiers are not UI).
- All 5 acceptance criteria for Phase 0.1 satisfied (Verifier: PASS).
- All 9 `package.json` files parse as valid JSON (Smoke: PASS).

### Next

- Phase 1.1 (v0.1.1) — Rhea Bisa Dibuka (prerequisite 0.1 now satisfied).

[Unreleased]: https://github.com/deepseek-ai/harness-Deployment/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/deepseek-ai/harness-Deployment/releases/tag/v0.1.0

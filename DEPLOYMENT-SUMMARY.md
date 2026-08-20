# RHEA Harness — Deployment Summary

> Living document updated by the Dokumenter agent after each phase.
> Source of truth for phase status: `phase-tracker.md` in the pipeline skill.

## Current Version

**v0.4.1** — Phase 4.2: Saya Punya Terminal Interaktif (created)

## API Service Catalog

Consolidated index of all API services exposed by deployed RHEA phases.
Updated by the Dokumenter after each phase (Rule 3).

| Phase | Service | Type | Endpoint / Method | Notes |
|---|---|---|---|---|
| 1.1 | Web UI | HTTP (static) | `GET /`, `GET /assets/*` | SPA served by dsh-host-frontend-static |
| 1.1 | Web server | HTTP | `http://127.0.0.1:<port>` | dsh-host-webserver, port=0 (OS-assigned) or explicit |
| 1.1 | WebSocket upgrade | WS | `/ws` upgrade | dsh-host-webserver upgrade handler |
| 1.1 | CLI `dsh` | CLI | `dsh web`, `dsh --profile <name>` | Binary: apps/cli/lib/bin.js |
| 1.1 | RPC transport | HTTP | `POST /api/<namespace>.<method>` | dsh-host-apiproxy RPC router |
| 2.1 | Session create | RPC | `POST /api/session.create` | Start a new chat session |
| 2.1 | Session prompt | RPC | `POST /api/session.prompt` | Send message, get streaming AI response (SSE) |
| 2.1 | Session cancel | RPC | `POST /api/session.cancel` | Stop AI generation (stop button) |
| 2.1 | Session history | RPC | `POST /api/session.history` | Retrieve message history (riwayat pesan) |
| 2.1 | Session list | RPC | `POST /api/session.list` | List all conversations (sidebar) |
| 2.1 | Session search | RPC | `POST /api/session.search` | Search past conversations |
| 2.1 | Session rename | RPC | `POST /api/session.rename` | Rename a conversation |
| 2.1 | Session fork | RPC | `POST /api/session.fork` | Fork a conversation |
| 2.1 | Session attachment | RPC | `POST /api/session.attachment` | Attach file to session |
| 2.1 | Session models | RPC | `POST /api/session.models` | List available models for session |
| 2.1 | LLM providers | RPC | `POST /api/llm.providers` | List configured LLM providers |
| 2.1 | LLM models | RPC | `POST /api/llm.models` | List models from active provider |
| 2.1 | Host describe | RPC | `POST /api/host.describe` | Host info / capabilities |
| 2.1 | Workspace CRUD | RPC | `POST /api/workspace.{create,list,rename,delete}` | Workspace management |
| 2.1 | Skill list | RPC | `POST /api/skill.list` | List installed skills |
| 2.1 | Goal CRUD | RPC | `POST /api/goal.{create,edit,complete,clear,pause,resume}` | Goal tracking |
| 2.1 | Settings | RPC | `POST /api/settings.{describe,update,replace,mutate}` | Settings management |
| 2.1 | Credentials | RPC | `POST /api/credentials.{describe,set,unset}` | API key management |
| 2.1 | Subagent | RPC | `POST /api/subagent.{list,history,interrupt,prompt}` | Subagent dispatch/control |
| 2.1 | Respond (client) | HTTP | `POST /api/respond` | Client-response channel (approvals, questions) |
| 2.2 | Session persistence | Storage (local) | `session.*` RPC + `dsh-storage-{sqlite,json}` backends | Sessions survive server restart (SQLite/JSONL) |
| 2.2 | Session removed (host) | Event | `host/session-removed` | Emitted on workspace session deletion (delete surface) |
| 3.1 | FS read tool | Agent tool | `read(file_path)` | AI reads file contents via ctx.fs seam |
| 3.1 | FS write tool | Agent tool | `write(file_path, content)` | AI creates/overwrites files |
| 3.1 | FS edit tool | Agent tool | `edit(file_path, edits)` | AI edits files with diff preview |
| 3.1 | FS glob tool | Agent tool | `glob(pattern, cwd?)` | AI searches files by name pattern (needs @vscode/ripgrep) |
| 3.1 | FS grep tool | Agent tool | `grep(regex, cwd?)` | AI searches file contents by regex (needs @vscode/ripgrep) |
| 3.1 | Str-replace editor | Agent tool | `view/create/str_replace/insert` | AI view, create, replace, insert file operations |
| 3.1 | Workspace registry | RPC | `POST /api/workspace.{create,list,rename,delete}` | Workspace entity registry with durable records |
| 3.2 | FS write tool | Agent tool | `write(file_path, content)` | AI creates files (confirmed: hello.txt created on disk) |
| 3.2 | FS edit tool | Agent tool | `edit(file_path, old_string, new_string)` | AI replaces text in files with diff (confirmed: "Hello"→"Greetings") |
| 3.2 | Observation policy | Policy | read-before-edit enforced | AI must read file before editing (audit trail) |
| 3.2 | User approval | Policy | `ctx.approval` fail-closed | Permission seam for file mutations (ask policy) |
| 3.3 | FS grep tool (verified) | Agent tool | `grep(pattern, include?, cwd?)` | AI searches file contents by regex (confirmed: TODO search in *.ts) |
| 3.3 | FS glob tool (verified) | Agent tool | `glob(pattern, cwd?)` | AI finds files by name pattern (confirmed: **/*.ts → 4 files) |
| 3.3 | ripgrep runtime | Dep | `@vscode/ripgrep` 15.0.0 | Platform binary installed (darwin-arm64), PCRE2 enabled |
| 4.1 | Bash tool | Agent tool | `bash(command, cwd?, timeout?)` | AI runs shell commands via ctx.shell seam (tool-bash in cordis.patch.yml) |
| 4.1 | PowerShell tool | Agent tool | `pwsh(command, cwd?, timeout?)` | AI runs PowerShell commands (Windows-only, tool-pwsh in cordis.patch.yml) |
| 4.1 | Persistent bash | Agent tool | Background bash sessions | tool-bash-persistent: long-lived shell sessions across calls |
| 4.1 | Shell env | Config | Shell environment setup | dsh-shell-env: PATH, env vars for shell execution context |
| 4.1 | Background jobs | Agent tool | `job_*` producers (bash, pwsh, pty-send) | Background shell processes via dsh-tool-jobs (output streaming) |
| 4.1 | Approval policy | Policy | `ctx.approval` for shell commands | Permission seam for shell execution (ask policy, fail-closed) |
| 4.1 | Timeout guard | Policy | Per-tool deadline enforcement | dsh-tool-call-timeout-policy: arms deadline on exec.signal |
| 4.1 | Repeat guard | Policy | Advisory reminder on repeated calls | dsh-repeat-tool-reminder: warns when agent loops on identical tool calls |
| 4.2 | terminal_open | Agent tool | `terminal_open(type, name?, cwd?)` | Create persistent owner-isolated PTY session |
| 4.2 | terminal_send | Agent tool | `terminal_send(id, text, wait?)` | Send text to persistent terminal, wait for output |
| 4.2 | terminal_read | Agent tool | `terminal_read(id, bytes?)` | Read bounded output page from terminal |
| 4.2 | terminal_signal | Agent tool | `terminal_signal(id, signal)` | Send signal to foreground process group |
| 4.2 | terminal_close | Agent tool | `terminal_close(id)` | Close terminal and await process tree cleanup |
| 4.2 | terminal_list | Agent tool | `terminal_list()` | List owned persistent terminal sessions |

## Deployed Phases

### Phase 4.2 — Saya Punya Terminal Interaktif  ✅

- **Version:** v0.4.1
- **Date:** 2026-08-20
- **What was deployed:** No new packages — all 5 terminal/subprocess packages
  already present from Phase 1.1 monorepo deployment. Verified the interactive
  terminal pipeline works end-to-end via unit tests and node-pty smoke test.
- **What works:**
  - AI opens persistent terminal sessions via `terminal_open` tool (PTY seam)
  - AI sends commands and reads output via `terminal_send` / `terminal_read`
  - AI signals foreground processes via `terminal_signal` (SIGINT, SIGTERM)
  - AI closes terminals and lists owned sessions (`terminal_close`, `terminal_list`)
  - node-pty native module functional (PTY spawn → data → exit cycle verified)
  - TerminalSessionService: owner-scoped isolation, backend registry, lifecycle
  - BashTerminalBackend: real shell PTY with cwd persistence, env scrubbing
  - 6 model-facing tools registered with owner isolation and background-job integration
- **Proof:** Ran `npx vitest` on terminal packages (23/23 session + 68/68 bash +
  24/24 tool tests pass), subprocess packages (3/3 core + 117/117 local pass).
  node-pty smoke: `echo hello` → "hello\r\n", exitCode 0. Headless app boots
  without import errors.
- **Journey summary discrepancy:** All 3 listed packages had generic paths.
  Real: `terminal/terminal/` (seam), `terminal/terminal-bash/` (backend),
  `terminal/tool-terminal/` (model tools), `subprocess/subprocess/` (seam),
  `subprocess/subprocess-local/` (impl). `packages/client/ui-terminal/` does
  not exist.
- **API Services produced:**
  - Agent tools: `terminal_open`, `terminal_send`, `terminal_read`,
    `terminal_signal`, `terminal_close`, `terminal_list` (persistent PTY
    sessions with owner isolation)
  - Runtime dep: `node-pty` 1.1.0 (MIT, Microsoft Corp)
- **Pipeline reports:**
  - SAD → Bundle Manifest (5 packages, all exist, deps satisfied)
  - Integrator → build success, 235/235 Phase 4.2 tests passed, typecheck pass
  - Compliance → PASS (all MIT, node-pty MIT, THIRD_PARTY_NOTICES current)
  - Verifier → PASS (10/10 tests: 5 AC + 5 smoke)

### Phase 4.1 — Saya Bisa Jalankan Perintah Shell  ✅

- **Version:** v0.4.0
- **Date:** 2026-08-20
- **What was deployed:** No new packages — all 9 shell/subprocess/guard packages
  already present from Phase 1.1 monorepo deployment. Verified the shell execution
  pipeline works end-to-end via unit tests and headless smoke test.
- **What works:**
  - AI runs shell commands via `bash` tool (LocalBashExecutor, stdout/stderr capture)
  - Background process handles (start, readOutput, kill escalation)
  - Approval flow for shell commands (ask policy, cancellation, abort signals)
  - Guard policies: repeat-tool-reminder + timeout-policy enforcement
  - Exit code rendering (non-zero, signal kill, timeout markers)
  - `tool-bash` registered in cordis.patch.yml (disabled on Windows)
  - `tool-pwsh` registered for Windows-only environments
  - node-pty native module installed (MIT, Microsoft Corp)
- **Proof:** Ran `npx vitest` on shell/bash-local (28/28 pass), interaction/user-approval
  (38/38 pass), guard packages (32/32 pass), subprocess core (3/3 pass). Headless app
  executed `echo test` → output "test". Full build + typecheck clean.
- **Journey summary discrepancy:** All 5 listed packages had generic paths.
  Real: `shell/shell/`, `shell/bash-local/`, `shell/tool-bash/`,
  `subprocess/subprocess/`, `subprocess/subprocess-local/`, `interaction/user-approval/`.
  Additional packages discovered: bash-sandbox, pwsh-local, pwsh-sandbox, shell-env,
  tool-bash-persistent, tool-pwsh.
- **API Services produced:**
  - Agent tools: `bash(command, cwd?, timeout?)` (shell execution),
    `pwsh(command, cwd?, timeout?)` (PowerShell, Windows-only)
  - Background jobs: `job_*` producers (bash, pwsh, pty-send) via dsh-tool-jobs
  - Policies: approval (ask), timeout (per-tool deadline), repeat-tool-reminder
- **Pipeline reports:**
  - SAD → Bundle Manifest (9 packages, all exist, deps satisfied)
  - Integrator → build success, 393/393 Phase 4.1 tests passed, typecheck pass
  - Compliance → PASS (all MIT, node-pty MIT, THIRD_PARTY_NOTICES current)
  - Verifier → PASS (12/12 tests: 5 AC + 4 smoke + 3 package suites)

### Phase 3.3 — Saya Bisa Cari di Isi File  ✅

- **Version:** v0.3.2
- **Date:** 2026-08-20
- **What was deployed:** No new packages — `dsh-tool-fs-search` already present
  from Phase 1.1. `@vscode/ripgrep` runtime dependency installed (platform binary
  darwin-arm64, ripgrep 15.0.0 with PCRE2 + NEON SIMD). Verified glob + grep
  tools work end-to-end via live ripgrep smoke tests.
- **What works:**
  - AI searches file contents via `grep` tool (regex, scoped to directory)
  - AI finds files via `glob` tool (pattern matching, VCS excludes)
  - Results include filename, line number, column, match snippet
  - ripgrep 15.0.0 with PCRE2 + NEON SIMD (2171 files in 0.135s)
  - Tool config: `globMaxResults: 100`, `grepMaxMatches: 250`, `grepMaxLineBytes: 2000`
- **Proof:** Ran `rg --json "function" --glob "*.ts"` → JSON output with
  `line_number`, `lines.text`, `submatches`. Ran `rg --files --glob "*.ts"` →
  8 source files found. Scoped search to `packages/fs/` → 47 files matched.
  Performance: 2171 files with `import` in 0.135s.
- **Journey summary discrepancy:** All 4 listed packages had wrong paths.
  `packages/fs/grep/`, `packages/fs/glob/`, `packages/client/search/`,
  `packages/client/ui-search-results/` — none exist.
  Real: single package `packages/fs/tool-fs-search/`.
- **API Services produced:**
  - Agent tools: `grep(pattern, include?, cwd?)` (content search via ripgrep),
    `glob(pattern, cwd?)` (file discovery via ripgrep)
  - Runtime dep: `@vscode/ripgrep` 15.0.0 (darwin-arm64, PCRE2, NEON)
- **Pipeline reports:**
  - SAD → `BUNDLE-MANIFEST.md`
  - Integrator → 1/1 package verified, ripgrep binary present, boot test pass
  - Compliance → PASS (MIT, ripgrep MIT Microsoft Corp)
  - Verifier → PASS (7/7 tests: 5 AC + 2 smoke)

### Phase 3.2 — Saya Bisa Edit File Lewat AI  ✅

- **Version:** v0.3.1
- **Date:** 2026-08-20
- **What was deployed:** No new packages — all 7 edit/write packages already
  present from Phase 1.1. Verified write/edit tools work end-to-end.
- **What works:**
  - AI creates files via `write` tool (hello.txt created with correct content)
  - AI edits files via `edit` tool (str_replace: "Hello" → "Greetings")
  - Read-before-edit policy enforced (AI reads before editing)
  - Diff metadata included in tool results
  - Post-edit verification read confirms changes
- **Proof:** Created session → "Create hello.txt" → `write` tool → file on disk.
  Then "Replace Hello with Greetings" → `read` → `edit` → `read` → confirmed.
- **Journey summary discrepancy:** All 6 listed packages had wrong paths.
  Real: `tool-fs` (write/edit), `tool-str-replace-editor` (str_replace),
  `interaction/user-approval` (not `client/ui-approval`).
- **API Services produced:**
  - Agent tools: `write` (create files), `edit` (str_replace in files)
  - Policy: read-before-edit enforced, sandbox write fences active
- **Pipeline reports:**
  - SAD → `BUNDLE-MANIFEST.md`
  - Integrator → 7/7 packages verified, 13 cordis references
  - Compliance → PASS (all MIT, fail-closed approval)
  - Verifier → PASS (5/5 AC, live write+edit smoke test)

### Phase 3.1 — Saya Bisa Baca & Cari File  ✅

- **Version:** v0.3.0
- **Date:** 2026-08-20
- **What was deployed:** No new packages — all 9 FS/workspace packages already
  present from Phase 1.1 monorepo deployment. Verified the filesystem tool layer
  is wired and functional.
- **What works:**
  - AI reads files via `read` tool (confirmed via live RPC test)
  - Tool call → result cycle works (seq=37 call, seq=38 result)
  - Workspace permission mode: `workspace-write` (sandbox fences writes)
  - All tools registered in `cordis.patch.yml` (dsh-base bundle)
  - Agent instructions include FS tool documentation
- **Proof:** Created session → asked AI "Read package.json" → AI invoked `read`
  tool with correct path → tool returned full file contents → AI summarized.
- **Journey summary discrepancy:** 7 of 7 listed packages had wrong paths.
  Real structure: `fs/` (seam), `fs-local/` (impl), `tool-fs/` (model tools),
  `tool-fs-search/` (glob/grep), `tool-str-replace-editor/` (str-replace).
  `packages/client/workspace/` → real: `packages/client/ui-workspace/`.
- **Known issues:** `@vscode/ripgrep` not installed — glob/grep tools need
  `pnpm install` for the platform binary at runtime.
- **API Services produced:**
  - Agent tools: `read`, `write`, `edit`, `glob`, `grep`, `view`, `create`,
    `str_replace`, `insert` (all via ctx.fs seam, sandbox-enforced)
  - No new RPC methods — workspace RPC already registered in Phase 2.1
- **Pipeline reports:**
  - SAD → `BUNDLE-MANIFEST.md` (with discrepancy notes)
  - Integrator → 9/9 packages verified, bundle wiring confirmed, boot test
  - Compliance → PASS (all MIT, no DeepSeek in user-visible strings)
  - Verifier → PASS (5/5 AC, live tool call smoke test)

### Phase 2.2 — Sesi Chat Tersimpan  ✅

- **Version:** v0.2.1
- **Date:** 2026-08-19
- **What was deployed:** No new packages — all 11 session/storage persistence
  packages already present from Phase 1.1. Verified the persistence layer works.
- **What works:**
  - Sessions persist across server restart (SQLite/JSONL backend)
  - session.list shows all conversations in sidebar (auto-generated titles)
  - session.history reopens a chat with full message history
  - Multiple sessions don't mix up (distinct histories)
  - session.rename edits chat title in sidebar
  - New messages appended to old chats persist
- **Proof:** Created session → sent "Remember the number 42" → AI responded →
  killed server → restarted → session survived with 37 events + title intact.
- **Journey summary discrepancy:** All 6 listed packages had wrong paths. Real:
  `session/session-persistence*`, `storage/storage*` sub-packages.
- **API Services produced:** No new RPC methods — all `session.*` methods
  registered in Phase 2.1. Phase 2.2 activates the persistence backend so
  sessions survive restarts. The `host/session-removed` event (workspace
  session deletion) is the delete surface.
- **Pipeline reports:** SAD → `BUNDLE-MANIFEST.md`; Integrator → 11 packages
  verified + boot test; Compliance → PASS (SQLite public domain, local data);
  Verifier → PASS (5/5 AC, real restart persistence test).

### Phase 2.1 — Saya Bisa Chat dengan AI  ✅

- **Version:** v0.2.0
- **Date:** 2026-08-19
- **What was deployed:** No new packages — all chat-engine packages already
  present from Phase 1.1. Configured LLM provider env for OpenRouter testing.
- **What works:**
  - Chat input + send (23 input refs, 5 send handlers in bundle)
  - Streaming responses (8 stream/SSE, 19 chunk/delta refs)
  - Typing indicator (96 loading states)
  - Message history (37 session refs, markdown rendering)
  - Stop button (39 stop/abort/cancel/AbortController)
  - New chat (23 clear, 8 reset actions)
  - LLM smoke test: OpenRouter API returned `"Hello!"` (HTTP 200)
- **API Services produced:** (all RPC methods via `POST /api/<ns>.<method>`)
  - `session.create`, `session.prompt` (streaming chat), `session.cancel` (stop),
    `session.history` (riwayat), `session.list` (sidebar list), `session.search`,
    `session.rename`, `session.fork`, `session.attachment`, `session.models`
  - `llm.providers`, `llm.models` (model picker)
  - `host.describe`, `workspace.{create,list,rename,delete}`
  - `skill.list`, `goal.{create,edit,complete,clear,pause,resume}`
  - `settings.{describe,update,replace,mutate}`, `credentials.{describe,set,unset}`
  - `subagent.{list,history,interrupt,prompt}`, `POST /api/respond` (client channel)
  - LLM provider: `DEEPSEEK_BASE_URL` + `DEEPSEEK_API_KEY` (env vars, OpenRouter-compatible)
- **LLM provider:** `dsh-llm-deepseek` adapter (OpenAI-compatible).
  Routed to OpenRouter for testing via `DEEPSEEK_BASE_URL` + `DEEPSEEK_API_KEY`.
  Production uses DeepSeek's own API.
- **Journey summary discrepancy:** 6 of 18 listed packages don't exist
  (`llm-anthropic`, `llm-openai`, `llm-google`, `client-chat`, `client-ui-input`,
  `interaction`). Real chat engine wired via `dsh-base` bundle.
- **Pipeline reports:**
  - SAD → `BUNDLE-MANIFEST.md` (with discrepancy + LLM config notes)
  - Integrator → verified 17 packages, configured OpenRouter env, boot test
  - Compliance → PASS (CredentialRef, .env ignored, no hardcoded keys, branding)
  - Verifier → PASS (6/6 AC + Rule 1 LLM smoke test)

### Phase 1.2 — UI Web Merespon  ✅

- **Version:** v0.1.2
- **Date:** 2026-08-19
- **What was deployed:** No new packages — all 7 client UI packages were
  already present from Phase 1.1 (full monorepo). This phase verified the
  pre-built web dist is interactive.
- **What works:**
  - Click/hover/focus visual response (27 `:hover`, 29 `cursor:pointer`, 43 onClick)
  - Drag/resize panels (21 onDrag, 2 ResizeObserver, 5 onMouseMove)
  - Responsive layout (5 `@media`, 36 flex, 7 grid, 66 min/max-width)
  - Clean text rendering (no undefined/NaN render bugs)
  - Consistent theming (939 `--dsw-*` semantic tokens)
- **API Services produced:** No new API services. (UI interactivity layer only —
  the HTTP/RPC endpoints from Phase 1.1 are now interactive but no new
  endpoints are added.)
- **Compliance:** System fonts (no Inter bundled), KaTeX MIT+OFL, no icon
  library, no DeepSeek in UI HTML.
- **Pipeline reports:**
  - SAD → `BUNDLE-MANIFEST.md` (verify-only, no new packages)
  - Integrator → verified 7 packages + dist present, web boots
  - Compliance → PASS (fonts/icons/i18n/branding all clean)
  - Verifier → PASS (5/5 acceptance criteria)

### Phase 1.1 — Rhea Bisa Dibuka  ✅

- **Version:** v0.1.1
- **Date:** 2026-08-19
- **What was deployed:** The full application monorepo — 237 workspace projects
  copied from `learn-harness/` (packages/*/*, apps/cli, apps/web, native/,
  website, examples, scripts) with pre-built `lib/` + `dist/` artifacts. Ran
  `pnpm install --frozen-lockfile` to link all workspace deps.
- **What works:**
  - `dsh --version` → `0.1.0-rc.5`
  - `dsh web` → boots web server, serves UI at `http://127.0.0.1:<port>`
  - Page title: `RHEA — Your Reliable QC Assistant`
  - Clean SIGTERM shutdown
- **Journey summary discrepancy:** 3 of 8 listed packages had stale paths
  (`dsh-host`, `dsh-host-host`, `dsh-host-invariants`). The real closure is 58
  workspace deps — full monorepo deployed to satisfy them all.
- **What does NOT work yet (by design):**
  - UI doesn't respond to clicks (Phase 1.2)
  - No AI chat (Phase 2.1+)
- **API Services produced:**
  - **CLI `dsh`** — binary entry: `dsh web` (web profile), `dsh --profile <name>`,
    `dsh --version`, `dsh --help`
  - **Web server** — HTTP server on `127.0.0.1:<port>` (dsh-host-webserver);
    `port=0` requests OS-assigned port
  - **Static SPA** — `GET /`, `GET /assets/*`, `GET /manifest.webmanifest`
    (served by dsh-host-frontend-static, SPA fallback to index.html)
  - **WebSocket upgrade** — `/ws` path upgrade for real-time bidirectional
    communication (dsh-host-webserver upgrade handler)
  - **RPC transport** — `POST /api/<namespace>.<method>` router
    (dsh-host-apiproxy, RPC methods registered by Phase 2.1)
  - **Download endpoint** — `POST /api/respond` (client-response channel)
- **Pipeline reports:**
  - SAD → `BUNDLE-MANIFEST.md` (with discrepancy notes)
  - Integrator → 237 projects + root config + pnpm install
  - Compliance → PASS (231 MIT + 4 BSD + 12 non-shipping; no UI branding)
  - Verifier → PASS (5/5 acceptance criteria)

### Phase 0.1 — Fondasi Vendor & Cordis  ✅

- **Version:** v0.1.0
- **Date:** 2026-08-19
- **What was deployed:** The 9 vendored Cordis framework packages that form the
  plugin foundation. These are unmodified copies of `learn-harness/vendor/*`
  into `rhea-harness/vendor/*`, with a workspace root so they resolve.
- **What works:**
  - `rhea-harness/vendor/` contains all 9 packages with `package.json`,
    `LICENSE`, and `README.md`.
  - `rhea-harness/pnpm-workspace.yaml` declares `vendor/*` as members.
  - All packages are MIT-licensed and parse as valid JSON.
- **What does NOT work yet (by design, this phase):**
  - No host/client build (deferred to Phase 1.1).
  - No UI layer (Phase 1.2+).
  - No AI chat (Phase 2.1+).
- **API Services produced:** No new API services (library packages only).
  The Cordis framework packages are internal dependencies, not network services.
- **What does NOT work yet (by design, this phase):**
  - No host/client build (deferred to Phase 1.1).
  - No UI layer (Phase 1.2+).
  - No AI chat (Phase 2.1+).
- **Pipeline reports:**
  - SAD → `BUNDLE-MANIFEST.md`
  - Integrator → 9 dirs copied + root config
  - Compliance → PASS (all MIT, no UI branding)
  - Verifier → PASS (5/5 acceptance criteria, smoke PASS)
- **Artifacts:** `BUNDLE-MANIFEST.md`, `CHANGELOG.md`

## Upcoming Phases

| Phase | Version | Title | Prerequisite | Status |
|---|---|---|---|---|
| 5.1 | v0.5.0 | Sesi Chat Bisa Dipangkas Otomatis | 2.2 | next |
| 8.1 | v0.8.0 | AI Bisa Jalankan Kode dengan Aman | 4.2 | next |
| 9.1 | v0.9.0 | AI Punya Asisten Bahasa (LSP) | 3.2 | pending |

## How to continue

Run `/deploy` again — the pipeline auto-detects the next pending phase.
Phases 5.1 (Compaction), 5.2 (Todo Agent), 6.1 (Model Picker), 7.1 (Web Browse), 8.1 (Code Execution), 10.1 (Cordis Plugins), 10.2 (MCP Server), and 11.1 (Skills) are now unblocked.

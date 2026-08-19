# RHEA Harness — Deployment Summary

> Living document updated by the Dokumenter agent after each phase.
> Source of truth for phase status: `phase-tracker.md` in the pipeline skill.

## Current Version

**v0.2.1** — Phase 2.2: Sesi Chat Tersimpan (created)

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

## Deployed Phases

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
| 1.1 | v0.1.1 | Rhea Bisa Dibuka | 0.1 | created |
| 1.2 | v0.1.2 | UI Web Merespon | 1.1 | created |
| 2.1 | v0.2.0 | Saya Bisa Chat dengan AI | 1.2 | created |
| 2.2 | v0.2.1 | Sesi Chat Tersimpan | 2.1 | pending |

## How to continue

Run `/deploy` again — the pipeline auto-detects Phase 2.2 as the next pending
phase (its prerequisite 2.1 is now `created`).

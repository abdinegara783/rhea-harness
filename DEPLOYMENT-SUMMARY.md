# RHEA Harness — Deployment Summary

> Living document updated by the Dokumenter agent after each phase.
> Source of truth for phase status: `phase-tracker.md` in the pipeline skill.

## Current Version

**v0.2.0** — Phase 2.1: Saya Bisa Chat dengan AI (created)

## Deployed Phases

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

# Changelog

All notable changes to the RHEA harness deployment are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

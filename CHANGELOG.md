# Changelog

All notable changes to the RHEA harness deployment are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

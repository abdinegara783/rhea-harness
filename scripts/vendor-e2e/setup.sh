#!/usr/bin/env bash
# Bootstrap node_modules minimal untuk e2e vendor boot (phase 1.10).
# Jujur: pnpm install penuh belum bisa jalan — root workspace mereferensikan
# paket fase 2-11 (mis. @deepseek-ai/dsh-tool-session-query) yang belum ada.
# Setup ini meniru apa yang pnpm linkWorkspacePackages lakukan:
#   - node_modules/@deepseek-ai/* → symlink ke vendor/
#   - dep npm runtime jalur boot (js-yaml, chokidar, esbuild, ...) disalin
#     dari ORIGINAL node_modules (versi = yang dideklarasikan package.json)
#   - lib/*.js = shim re-export sementara (tsdown bundling = phase 2.1)
set -euo pipefail
cd "$(dirname "$0")/../.."

# tsc: pakai binary ORIGINAL bila ada (versi sama), fallback npx.
TSC=(npx -y -p typescript@6.0.3 tsc)
if [ -x ../deepseek-harness/node_modules/.bin/tsc ]; then
  TSC=(../deepseek-harness/node_modules/.bin/tsc)
fi

echo "[1/4] tsc -b vendor (9 paket: cosmokit schemastery cordis group loader include timer hmr logger-console)"
"${TSC[@]}" -b \
  vendor/cosmokit vendor/schemastery vendor/cordis vendor/group vendor/loader \
  vendor/include vendor/timer vendor/hmr vendor/logger-console

echo "[2/4] shim lib (re-export dari lib/types, nama file = exports map)"
for p in cosmokit schemastery cordis group loader include timer hmr logger-console; do
  # Nama output mengikuti package.json exports (tsdown: index.mjs/cjs/js).
  out=$(node -e "const e=require('./vendor/$p/package.json').exports?.['.'];\
    console.log((e?.import ?? e?.node ?? e?.default ?? './lib/index.js').replace('./', ''))")
  if grep -q "export default" "vendor/$p/src/index.ts"; then
    printf "export * from './types/index.js'\nexport { default } from './types/index.js'\n" > "vendor/$p/$out"
  else
    printf "export * from './types/index.js'\n" > "vendor/$p/$out"
  fi
  echo "  $p → $out"
done

echo "[3/4] node_modules/@deepseek-ai/* symlink"
mkdir -p node_modules/@deepseek-ai
for p in cosmokit schemastery cordis; do ln -sfn ../../vendor/$p node_modules/@deepseek-ai/$p; done
ln -sfn ../../vendor/group node_modules/@deepseek-ai/cordis-plugin-group
ln -sfn ../../vendor/loader node_modules/@deepseek-ai/cordis-plugin-loader
ln -sfn ../../vendor/include node_modules/@deepseek-ai/cordis-plugin-include
ln -sfn ../../vendor/timer node_modules/@deepseek-ai/cordis-plugin-timer
ln -sfn ../../vendor/hmr node_modules/@deepseek-ai/cordis-plugin-hmr
ln -sfn ../../vendor/logger-console node_modules/@deepseek-ai/cordis-plugin-logger-console

echo "[4/4] npm deps dari ORIGINAL node_modules (versi sesuai package.json vendor)"
mkdir -p node_modules/@babel node_modules/@types
SRC=../deepseek-harness/node_modules/.pnpm
copy_dep() { # $1 = src rel di .pnpm, $2 = dst
  cp -rn "$SRC/$1" "node_modules/$2" 2>/dev/null || true
}
copy_dep js-yaml@4.2.0/node_modules/js-yaml js-yaml
copy_dep argparse@2.0.1/node_modules/argparse argparse
copy_dep chokidar@4.0.3/node_modules/chokidar chokidar
copy_dep readdirp@4.1.2/node_modules/readdirp readdirp
copy_dep picomatch@4.0.4/node_modules/picomatch picomatch
copy_dep glob-parent@6.0.2/node_modules/glob-parent glob-parent
copy_dep is-glob@4.0.3/node_modules/is-glob is-glob
copy_dep is-extglob@2.1.1/node_modules/is-extglob is-extglob
copy_dep supports-color@9.4.0/node_modules/supports-color supports-color
copy_dep has-flag@4.0.0/node_modules/has-flag has-flag
copy_dep esbuild@0.28.1/node_modules/esbuild esbuild
copy_dep @babel+code-frame@7.29.7/node_modules/@babel/code-frame @babel/code-frame
copy_dep @babel+helper-validator-identifier@7.29.7/node_modules/@babel/helper-validator-identifier @babel/helper-validator-identifier
copy_dep js-tokens@4.0.0/node_modules/js-tokens js-tokens
copy_dep picocolors@1.1.1/node_modules/picocolors picocolors
copy_dep @types+picomatch@3.0.2/node_modules/@types/picomatch @types/picomatch
copy_dep @types+babel__code-frame@7.27.0/node_modules/@types/babel__code-frame @types/babel__code-frame

echo "OK — jalankan: node --test \"scripts/vendor-e2e/**/*.test.mjs\""

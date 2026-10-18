#!/usr/bin/env bash
# One-time setup of the HyperFrames route (references/hyperframes-route.md) for a project.
#
#   bash setup.sh <project dir> [--tools <dir>]
#
# - installs hyperframes (pinned: HF_VERSION), GSAP and the fonts into <tools>
#   (default ${XDG_CACHE_HOME:-~/.cache}/explainer-video/hyperframes, shared by every project);
# - downloads the headless Chrome it renders with (hyperframes browser ensure) and runs doctor;
# - copies into <project>/scenes/_shared/:
#     fonts/fonts.css  Noto Sans SC, Noto Serif SC (variable, Chinese subsets) and IBM Plex Mono,
#                      as local files: renders never depend on a font CDN or on system fonts;
#     vendor/gsap.min.js  the GSAP the compositions load, so a render needs no network.
# Telemetry is off for every hyperframes command these scripts run.
set -euo pipefail
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1
HF_VERSION=${HF_VERSION:-0.8.172}
GSAP_VERSION=${GSAP_VERSION:-3.14.2}
proj=$(cd "$1" && pwd); shift
tools=${HF_TOOLS:-${XDG_CACHE_HOME:-$HOME/.cache}/explainer-video/hyperframes}
while [ $# -gt 0 ]; do
  case "$1" in
    --tools) tools="$2"; shift 2;;
    *) echo "unknown option $1"; exit 2;;
  esac
done
mkdir -p "$tools"
tools=$(cd "$tools" && pwd)
cd "$tools"
[ -f package.json ] || echo '{ "private": true }' > package.json
npm install --no-audit --no-fund --loglevel=error "hyperframes@$HF_VERSION" "gsap@$GSAP_VERSION" \
    @fontsource-variable/noto-sans-sc @fontsource-variable/noto-serif-sc @fontsource/ibm-plex-mono
hf="$tools/node_modules/.bin/hyperframes"
"$hf" browser ensure
"$hf" doctor || echo "doctor reported problems: read them before rendering" >&2

shared="$proj/scenes/_shared"
mkdir -p "$shared/fonts" "$shared/vendor"
for pkg in noto-sans-sc noto-serif-sc; do
  src="$tools/node_modules/@fontsource-variable/$pkg"
  rm -rf "$shared/fonts/$pkg"; mkdir -p "$shared/fonts/$pkg/files"
  cp "$src/index.css" "$shared/fonts/$pkg/"
  cp "$src"/files/*.woff2 "$shared/fonts/$pkg/files/"
done
mkdir -p "$shared/fonts/ibm-plex-mono"
for w in 400 600; do
  cp "$tools/node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-$w-normal.woff2" "$shared/fonts/ibm-plex-mono/"
done
cat > "$shared/fonts/fonts.css" <<'EOF'
/* Written by scripts/hyperframes/setup.sh. Families: "Noto Sans SC Variable", "Noto Serif SC Variable", "Plex Mono". */
@import url("noto-sans-sc/index.css");
@import url("noto-serif-sc/index.css");
@font-face { font-family: "Plex Mono"; src: url(ibm-plex-mono/ibm-plex-mono-latin-400-normal.woff2) format("woff2"); font-weight: 400; }
@font-face { font-family: "Plex Mono"; src: url(ibm-plex-mono/ibm-plex-mono-latin-600-normal.woff2) format("woff2"); font-weight: 600; }
EOF
cp "$tools/node_modules/gsap/dist/gsap.min.js" "$shared/vendor/gsap.min.js"
echo "ok: hyperframes $("$hf" --version 2>/dev/null | head -1) in $tools; fonts and GSAP in $shared"

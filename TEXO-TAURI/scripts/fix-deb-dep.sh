#!/usr/bin/env bash
set -euo pipefail

# Rewrite the generated deb Depends to target WebKitGTK 4.1 (Ubuntu 24.04).
# Usage: run after `pnpm build` from repo root or TEXO-TAURI.

cd "$(dirname "$0")/../src-tauri/target/release/bundle/deb"

deb=${1:-}
if [[ -z "$deb" ]]; then
  # default to first matching deb
  deb=$(ls texo-desktop_*_amd64.deb 2>/dev/null | head -n1 || true)
fi

if [[ -z "$deb" || ! -f "$deb" ]]; then
  echo "No deb found (expected texo-desktop_*_amd64.deb). Pass the deb name as argument if needed."
  exit 1
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

dpkg-deb -R "$deb" "$tmp"

control="$tmp/DEBIAN/control"
if [[ ! -f "$control" ]]; then
  echo "No control file found in $deb"
  exit 1
fi

depends_line="Depends: libwebkit2gtk-4.1-0, libjavascriptcoregtk-4.1-0, libayatana-appindicator3-1, libgtk-3-0, libasound2, libx11-6, libxcb1, libxrandr2, libxtst6, libnotify4, libgdk-pixbuf-2.0-0, libpango-1.0-0, libglib2.0-0, libssl3"

# Replace Depends line while preserving other metadata (Package/Version/etc).
if grep -q '^Depends:' "$control"; then
  sed -i "s/^Depends:.*/$depends_line/" "$control"
else
  printf '\n%s\n' "$depends_line" >>"$control"
fi

dpkg-deb -b "$tmp" "$deb" >/dev/null
echo "Rewritten Depends for $deb"

#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# Render architecture diagrams for each version folder.
# Supports:
#   - docs/arch/releases/vX.Y.Z/*.mmd   (preferred)
#   - docs/arch/vX.Y.Z/*.mmd            (fallback)
# Outputs SVGs to docs/img/<version>/ and mirrors to docs/img/latest/.
# If PUPPETEER_EXECUTABLE_PATH is present, a puppeteer config is generated.
# Also auto-discovers Chrome in .chromium/ or chrome/ if env var is missing.
# -----------------------------------------------------------------------------

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCH_DIR="${ROOT_DIR}/docs/arch"
IMG_DIR="${ROOT_DIR}/docs/img"
PPTR_CFG="${ROOT_DIR}/tooling/puppeteer.mmdc.json"

# Pick base dir
if [ -d "${ARCH_DIR}/releases" ]; then
  BASE_DIR="${ARCH_DIR}/releases"
else
  BASE_DIR="${ARCH_DIR}"
fi

mkdir -p "${IMG_DIR}"

# Try to auto-discover Chromium if env var is empty
if [ -z "${PUPPETEER_EXECUTABLE_PATH:-}" ]; then
  for base in ".chromium" "chrome"; do
    CAND=$(ls -d "${ROOT_DIR}/${base}/linux-"*/chrome-linux*/chrome 2>/dev/null | head -n1 || true)
    if [ -n "${CAND}" ]; then
      export PUPPETEER_EXECUTABLE_PATH="${CAND}"
      break
    fi
  done
fi

# Fail fast if no Chromium executable was found
if [ -z "${PUPPETEER_EXECUTABLE_PATH:-}" ]; then
  echo "❌ No Chromium found. Set PUPPETEER_EXECUTABLE_PATH or ensure 'chrome/' or '.chromium/' exists." >&2
  exit 1
fi

# Clean any stale config (prevents bad JSON from previous runs)
rm -f "${PPTR_CFG}"

# Prepare puppeteer config for mermaid-cli (if Chromium path is available)
MMDC_P_FLAG=""
if [ -n "${PUPPETEER_EXECUTABLE_PATH:-}" ]; then
  mkdir -p "${ROOT_DIR}/tooling"
  cat > "${PPTR_CFG}" <<EOF
{
  "executablePath": "${PUPPETEER_EXECUTABLE_PATH//\"/\\\"}",
  "args": [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-zygote"
  ]
}
EOF
  MMDC_P_FLAG="-p ${PPTR_CFG}"
fi

echo "📘 Rendering architecture diagrams based on folders in: ${BASE_DIR}"
echo "───────────────────────────────────────────────"

LATEST_VERSION=""
shopt -s nullglob

# Find version folders matching v*
for VERSION_PATH in "${BASE_DIR}"/v*/; do
  [ -d "${VERSION_PATH}" ] || continue

  VERSION="$(basename "${VERSION_PATH}")"
  SRC_DIR="${VERSION_PATH%/}"
  OUT_DIR="${IMG_DIR}/${VERSION}"

  mkdir -p "${OUT_DIR}"
  echo "🧩 Rendering diagrams for version: ${VERSION}"
  echo "→ Source: ${SRC_DIR}"
  echo "→ Output: ${OUT_DIR}"

  found_any=false
  for MMD in "${SRC_DIR}"/*.mmd; do
    [ -f "${MMD}" ] || continue
    found_any=true
    BASENAME="$(basename "${MMD}" .mmd)"
    echo "   Rendering ${BASENAME}.mmd ..."
    npx -y @mermaid-js/mermaid-cli mmdc \
      ${MMDC_P_FLAG} \
      -i "${MMD}" \
      -o "${OUT_DIR}/${BASENAME}.svg"
  done

  if [ "${found_any}" = false ]; then
    echo "   ⚠️  No .mmd files in ${SRC_DIR} (skipped)"
  fi

  LATEST_VERSION="${VERSION}"
  echo "───────────────────────────────────────────────"
done

# Copy most recent version to 'latest'
if [ -n "${LATEST_VERSION}" ]; then
  echo "📦 Copying latest version (${LATEST_VERSION}) diagrams to docs/img/latest/"
  rm -rf "${IMG_DIR}/latest"
  cp -r "${IMG_DIR}/${LATEST_VERSION}" "${IMG_DIR}/latest"
else
  echo "⚠️  No version folders found in ${BASE_DIR}"
fi

echo "🏁 All versioned diagrams rendered."
echo "ℹ️  Latest diagrams: docs/img/latest/"

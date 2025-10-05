#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# Render architecture diagrams for each version folder
# Supports both:
#   docs/arch/v1.0.0/
#   docs/arch/releases/v1.0.0/
# -----------------------------------------------------------------------------

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCH_DIR="${ROOT_DIR}/docs/arch"
IMG_DIR="${ROOT_DIR}/docs/img"
P_CFG="${ROOT_DIR}/tooling/puppeteer-config.json"

# Prefer releases/ if it exists, else use arch root
if [ -d "${ARCH_DIR}/releases" ]; then
  BASE_DIR="${ARCH_DIR}/releases"
else
  BASE_DIR="${ARCH_DIR}"
fi

mkdir -p "${IMG_DIR}"

echo "📘 Rendering architecture diagrams based on folders in: ${BASE_DIR}"

LATEST_VERSION=""

# Find version folders matching v*
for VERSION_PATH in "${BASE_DIR}"/v*/; do
  [ -d "${VERSION_PATH}" ] || continue

  VERSION=$(basename "${VERSION_PATH}")
  OUT_DIR="${IMG_DIR}/${VERSION}"

  mkdir -p "${OUT_DIR}"
  echo "───────────────────────────────────────────────"
  echo "🧩 Rendering diagrams for version: ${VERSION}"
  echo "→ Source: ${VERSION_PATH}"
  echo "→ Output: ${OUT_DIR}"

  for NAME in context containers sequence_a2e deployment_k8s; do
    SRC="${VERSION_PATH}/${NAME}.mmd"
    OUT="${OUT_DIR}/${NAME}.svg"
    if [ -f "${SRC}" ]; then
      echo "   Rendering ${NAME}.mmd ..."
      mmdc -p "${P_CFG}" -i "${SRC}" -o "${OUT}"
    else
      echo "   ⚠️  Missing: ${SRC} (skipped)"
    fi
  done

  LATEST_VERSION="${VERSION}"
done

# Copy the most recent version into "latest"
if [ -n "${LATEST_VERSION}" ]; then
  echo "───────────────────────────────────────────────"
  echo "📦 Copying latest version (${LATEST_VERSION}) diagrams to docs/img/latest/"
  rm -rf "${IMG_DIR}/latest"
  cp -r "${IMG_DIR}/${LATEST_VERSION}" "${IMG_DIR}/latest"
else
  echo "⚠️  No version folders found in ${BASE_DIR}"
fi

echo "───────────────────────────────────────────────"
echo "🏁 All versioned diagrams rendered successfully."
echo "Latest diagrams: docs/img/latest/"

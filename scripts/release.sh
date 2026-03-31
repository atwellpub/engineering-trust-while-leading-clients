#!/usr/bin/env bash
set -euo pipefail

VERSION="1.0.3"

# Resolve project root (one level up from scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ZIP_NAME="engineering-trust-v${VERSION}.zip"
ZIP_PATH="${PROJECT_ROOT}/${ZIP_NAME}"

cd "$PROJECT_ROOT"

# Remove previous zip with the same name
rm -f "$ZIP_PATH"

# Create zip excluding build/git artifacts and zip files
if command -v zip &>/dev/null; then
  zip -r "$ZIP_PATH" . \
    -x ".git/*" \
    -x ".data/*" \
    -x ".snapshots/*" \
    -x "*.zip"
else
  python3 -c "
import zipfile, os, fnmatch

excluded = ['.git', '.data', '.snapshots']

def is_excluded(path):
    parts = path.split(os.sep)
    for exc in excluded:
        if exc in parts:
            return True
    if fnmatch.fnmatch(os.path.basename(path), '*.zip'):
        return True
    return False

with zipfile.ZipFile('$ZIP_NAME', 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in excluded]
        for f in files:
            filepath = os.path.join(root, f)
            if not is_excluded(filepath):
                zf.write(filepath)
"
fi

# Tag the release (fail if tag already exists)
if git tag -l "v${VERSION}" | grep -q "v${VERSION}"; then
  echo "Error: Tag v${VERSION} already exists. Bump VERSION in this script before re-running."
  exit 1
fi

git tag -a "v${VERSION}" -m "Release v${VERSION}"

# Summary
ZIP_SIZE=$(du -h "$ZIP_PATH" | cut -f1)
echo ""
echo "Release v${VERSION} complete"
echo "  Zip: ${ZIP_NAME} (${ZIP_SIZE})"
echo "  Tag: v${VERSION} created"
echo ""
echo "To push the tag: git push origin v${VERSION}"

#!/bin/bash
# ──────────────────────────────────────────────────────────
# edit_paper.sh — live-edit the docs with auto-refresh.
#
#   ./scripts/edit_paper.sh           # serves on http://127.0.0.1:8000
#   ./scripts/edit_paper.sh 8123      # pick another port
#
# Then: edit any docs/*.md in your editor → SAVE → the browser tab
# auto-refreshes (mkdocs livereload). Ctrl+C here stops it.
#
# --dirty = rebuild ONLY the page you changed (sub-second) instead of the
# whole site (~8s). Nav / cross-page links can go stale in --dirty mode;
# restart this script (Ctrl+C, run again) for a clean full build.
# ──────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")/.."          # repo root, wherever this is run from

PORT="${1:-8000}"
VENV=".venv"

# one-time venv + mkdocs-material install
[ -d "$VENV" ] || python3 -m venv "$VENV"
"$VENV/bin/python" -c "import material" 2>/dev/null || "$VENV/bin/pip" install --quiet mkdocs-material
"$VENV/bin/python" -c "import mkdocs_static_i18n" 2>/dev/null || "$VENV/bin/pip" install --quiet mkdocs-static-i18n==1.3.1   # the language chooser (DOCS_I18N.md §6d)

# free the port — kill any mkdocs already holding it (no "address in use")
pkill -f "mkdocs serve.*:$PORT" 2>/dev/null || true
sleep 1

echo ""
echo "  Live docs — edit docs/*.md, save, watch the tab refresh"
echo "  http://127.0.0.1:$PORT/MigrateComparisonPaper/"
echo "  (Ctrl+C to stop)"
echo ""

exec "$VENV/bin/mkdocs" serve --dirty -a "127.0.0.1:$PORT"

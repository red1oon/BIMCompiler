#!/bin/bash
# ──────────────────────────────────────────────────────────
# serve_docs.sh — Launch the BIM Intent Compiler docs site
#
# Usage:
#   ./scripts/serve_docs.sh          # http://localhost:8000
#   ./scripts/serve_docs.sh 9000     # http://localhost:9000
#
# First run installs mkdocs-material into .venv/ (one-time).
# ──────────────────────────────────────────────────────────

set -e

PORT="${1:-8000}"
VENV_DIR=".venv"

# Create venv if missing
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Install mkdocs-material if missing
if ! "$VENV_DIR/bin/python" -c "import material" 2>/dev/null; then
    echo "Installing mkdocs-material (one-time)..."
    "$VENV_DIR/bin/pip" install --quiet mkdocs-material
fi
# the language chooser's plugin (prompts/DOCS_I18N.md §6d), pinned
"$VENV_DIR/bin/python" -c "import mkdocs_static_i18n" 2>/dev/null || "$VENV_DIR/bin/pip" install --quiet mkdocs-static-i18n==1.3.1

echo ""
echo "  BIM Intent Compiler — Documentation"
echo "  http://localhost:$PORT"
echo ""
echo "  Press Ctrl+C to stop."
echo ""

"$VENV_DIR/bin/mkdocs" serve -a "127.0.0.1:$PORT"

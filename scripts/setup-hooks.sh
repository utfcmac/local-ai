#!/bin/bash
# Setup Git Hooks for Local AI project

set -e

echo "🔧 Setting up Git hooks..."

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configure git to use our hooks directory
git config core.hooksPath "$PROJECT_ROOT/.githooks"

echo "✅ Git hooks configured to use .githooks directory"
echo ""
echo "Active hooks:"
echo "  - pre-commit: Checks for unstaged files and git user"
echo "  - commit-msg: Validates conventional commit format"
echo ""
echo "To bypass hooks (not recommended):"
echo "  git commit --no-verify"
echo ""
echo "Done! 🎉"

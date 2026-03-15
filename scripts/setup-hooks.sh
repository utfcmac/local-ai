#!/bin/bash
# Setup Git Hooks for Local AI project

echo "🔧 Setting up Git hooks..."

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    echo "⚠️  Not a git repository, skipping hook setup (normal in CI/package installs)"
    exit 0
fi

# Configure git to use our hooks directory
if git config core.hooksPath "$PROJECT_ROOT/.githooks" 2>/dev/null; then
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
else
    echo "⚠️  Could not configure git hooks (this is normal in CI environments)"
    exit 0
fi

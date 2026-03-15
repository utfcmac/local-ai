# Setup for Maintainer

Follow these one-time setup steps to configure your local environment.

## 1. Enable Git User Checks (Recommended)

Add these lines to your shell profile:

### For Zsh (macOS default):
```bash
# Edit ~/.zshrc
echo 'export GIT_HOOK_USER="utfcmac"' >> ~/.zshrc
echo 'export GIT_HOOK_EMAIL="utfcmac@users.noreply.github.com"' >> ~/.zshrc

# Reload
source ~/.zshrc
```

### For Bash:
```bash
# Edit ~/.bashrc or ~/.bash_profile
echo 'export GIT_HOOK_USER="utfcmac"' >> ~/.bashrc
echo 'export GIT_HOOK_EMAIL="utfcmac@users.noreply.github.com"' >> ~/.bashrc

# Reload
source ~/.bashrc
```

### Verify:
```bash
echo $GIT_HOOK_USER     # Should output: utfcmac
echo $GIT_HOOK_EMAIL    # Should output: utfcmac@users.noreply.github.com
```

## 2. Alternative: Per-Project Setup

If you don't want global env vars, use `.env.githooks`:

```bash
# Already exists in the repo, just source it
source .env.githooks
```

**Note:** You'll need to source this file in each new terminal session.

## 3. Test the Setup

```bash
# Try committing (hooks should check your git user)
touch test.txt
git add test.txt
git commit -m "test: verify hooks"

# You should see:
# ✅ Pre-commit checks passed (no git user warning)

# Clean up
git reset HEAD~1
rm test.txt
```

## What This Does

With env vars set:
- ✅ Git hooks will verify you're committing as `utfcmac`
- ✅ Auto-fixes if git user is wrong
- ✅ Prevents accidental commits with wrong identity

Without env vars set (external contributors):
- ✅ Hooks still work (staged files check, commit format validation)
- ✅ No git user verification (they use their own identity)
- ✅ No confusion or blocking

## Summary

- **For you (maintainer)**: Set env vars once, hooks enforce your git identity
- **For contributors**: Hooks work automatically, no special setup needed
- **For everyone**: Conventional commits enforced, unstaged files prevented

---

After completing these steps, delete this file or keep it for reference.

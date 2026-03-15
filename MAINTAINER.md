# Maintainer Guide

This document contains information specific to project maintainers.

## Git User Configuration

### For Maintainer (@utfcmac)

To enable git user verification in hooks, add these to your shell profile:

```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.bash_profile
export GIT_HOOK_USER="utfcmac"
export GIT_HOOK_EMAIL="utfcmac@users.noreply.github.com"
```

Or source `.env.githooks` before committing:
```bash
source .env.githooks && git commit ...
```

### Why This is Local-Only

- `.env.githooks` is in `.gitignore` - never committed
- External contributors use their own git identities
- Git hooks check user ONLY if env vars are set
- Contributors are not forced to use specific usernames

## Release Workflow (Maintainer Only)

### Creating a Release

```bash
# 1. Update CHANGELOG.md
# Move [Unreleased] content to [X.Y.Z] - YYYY-MM-DD

# 2. Commit
git add CHANGELOG.md
git commit -m "chore(release): prepare vX.Y.Z"

# 3. Create tag
git tag -a vX.Y.Z -m "Release vX.Y.Z: Brief description"

# 4. Push (triggers automated GitHub Release)
git push origin main --tags
```

### Version Numbers

- **MAJOR** (2.0.0): Breaking changes
- **MINOR** (1.2.0): New features (backward compatible)
- **PATCH** (1.1.1): Bug fixes

### After Release

1. GitHub Actions creates the release automatically
2. Check https://github.com/utfcmac/local-ai/releases
3. Edit release notes if needed
4. Announce on social media (optional)

## Managing Contributors

### Pull Request Review Checklist

- [ ] Follows conventional commits
- [ ] CHANGELOG.md updated
- [ ] i18n added for UI text (de.json + en.json)
- [ ] Build succeeds
- [ ] Tests pass (when we have tests)
- [ ] Code follows project style

### Merging PRs

```bash
# Use GitHub's "Squash and merge" to maintain clean history
# Ensure final commit message follows conventional commits
```

## GitHub Actions

### Automated Workflows

**CI (`.github/workflows/ci.yml`)**
- Runs on every push to main
- Runs on every PR
- Checks: Build, TypeScript

**Release (`.github/workflows/release.yml`)**
- Triggered by version tags (v*.*.*)
- Creates GitHub Release
- Extracts changelog from CHANGELOG.md

### Troubleshooting CI

If CI fails:
1. Check GitHub Actions tab
2. Read error logs
3. Fix locally: `npm run build`
4. Push fix

## Secrets Management

### Environment Variables

**Production (.env.local on server):**
```bash
LOCAL_AI_API_KEY=your-production-key
```

**Never commit:**
- `.env.local`
- `.env.githooks`
- API keys or secrets

### Rotating API Keys

1. Generate new key: `openssl rand -hex 32`
2. Update server `.env.local`
3. Restart PM2: `pm2 restart local-ai`
4. Update blog platform configuration
5. Test endpoints

## Infrastructure

### Server Setup (macip.de)

```bash
# SSH to server
ssh user@macip.de

# Navigate to project
cd /path/to/local-ai

# Pull latest
git pull origin main

# Install deps
npm install

# Build
npm run build

# Restart
pm2 restart local-ai
```

### Monitoring

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs local-ai

# Monitor resources
pm2 monit

# Check Ollama
curl http://localhost:11434/api/tags
```

## AI Agent Configuration

### For AI Development (Local Only)

AI rules in `.clinerules` and `.cursorrules` include maintainer-specific instructions:
- Git user must be "utfcmac"
- These rules apply when YOU (maintainer) use AI agents
- External contributors' AI agents won't see these restrictions

### Updating AI Rules

When project conventions change:
1. Update `.clinerules` (for Cline/Claude Code)
2. Update `.cursorrules` (for Cursor)
3. Update `AI_DEVELOPMENT.md` (comprehensive guide)
4. Test with AI agent

## Backup & Recovery

### Database Backups

```bash
# Backup SQLite database
cp data/generations.db data/generations.db.backup-$(date +%Y%m%d)

# Restore
cp data/generations.db.backup-20260315 data/generations.db
```

### Code Backups

- GitHub is the source of truth
- Tags preserve release states
- Use `git tag` to find stable versions

## Troubleshooting Common Issues

### Hooks Not Working for You

```bash
# Verify env vars
echo $GIT_HOOK_USER
echo $GIT_HOOK_EMAIL

# Re-source .env.githooks
source .env.githooks

# Or export manually
export GIT_HOOK_USER="utfcmac"
export GIT_HOOK_EMAIL="utfcmac@users.noreply.github.com"
```

### Contributors Confused by Hooks

- Hooks are generic and don't mention your username
- Only YOU see git user checks (via env vars)
- Contributors see:
  - Unstaged files warnings
  - Conventional commit validation

No confusion! ✅

## Security

### Vulnerability Responses

1. Create security advisory on GitHub
2. Fix in private branch
3. Release patch version
4. Publish advisory after fix deployed

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update (test thoroughly!)
npm update

# Commit
git add package.json package-lock.json
git commit -m "chore(deps): update dependencies"
```

## Documentation Updates

When making major changes, update:
- [ ] README.md
- [ ] CHANGELOG.md
- [ ] AI_DEVELOPMENT.md
- [ ] CONTRIBUTING.md
- [ ] This file (MAINTAINER.md)

---

**This file is for maintainers only. It's committed to the repo but contains maintainer-specific information that may not apply to contributors.**

# AI Development Guide for Local AI

This guide is specifically for AI coding assistants (Claude Code, GitHub Copilot, Cursor, etc.) working on this project.

## 🤖 Quick Start for AI Agents

### Before ANY Git Operation

```bash
# ALWAYS verify and set correct git user first
git config user.name "utfcmac"
git config user.email "utfcmac@users.noreply.github.com"
```

### Standard Development Workflow

```bash
# 1. Make your changes
# 2. Update CHANGELOG.md under [Unreleased]
# 3. Test the build
npm run build

# 4. Commit with conventional commits
git add .
git commit -m "feat(scope): description of change"

# 5. Push
git push origin main
```

### Creating a Release

```bash
# 1. Update CHANGELOG.md (move [Unreleased] to [X.Y.Z] - YYYY-MM-DD)
# 2. Commit
git add CHANGELOG.md
git commit -m "chore(release): prepare vX.Y.Z"

# 3. Create annotated tag
git tag -a vX.Y.Z -m "Release vX.Y.Z: Brief description"

# 4. Push with tags (triggers automated release)
git push origin main --tags
```

## 📋 Decision Trees for Common Tasks

### When Adding a New Feature

```
1. Does it add new UI text?
   YES → Update src/messages/de.json AND src/messages/en.json
   NO  → Continue

2. Does it change the API?
   YES → Update README.md API Reference section
   NO  → Continue

3. Is it a breaking change?
   YES → Add "BREAKING CHANGE:" footer in commit message
   NO  → Continue

4. Update CHANGELOG.md under [Unreleased] → Added section

5. Commit message format:
   feat(scope): description

   Longer explanation if needed

   BREAKING CHANGE: description (if applicable)

6. Test: npm run build && npm run start:standalone

7. Push: git push origin main
```

### When Fixing a Bug

```
1. Reproduce the bug locally

2. Fix the code

3. Update CHANGELOG.md under [Unreleased] → Fixed section

4. Commit message:
   fix(scope): description of what was fixed

   Closes #issue-number (if applicable)

5. Test: npm run build && npm run start:standalone

6. Push: git push origin main
```

### When Updating Documentation

```
1. Make documentation changes

2. Update CHANGELOG.md under [Unreleased] → Changed section
   (only if it's significant, skip for typo fixes)

3. Commit message:
   docs(scope): what was documented

4. Push: git push origin main
```

### When Updating Dependencies

```
1. Update package.json

2. Run: npm install

3. Test: npm run build

4. Update CHANGELOG.md under [Unreleased]:
   - Changed section: for updates
   - Security section: for security patches

5. Commit message:
   chore(deps): update dependency-name to vX.Y.Z

6. Push: git push origin main
```

## 🎯 Version Number Selection

When creating a release, determine version number:

```
Current version: v1.1.0

Are there breaking changes?
├─ YES → v2.0.0 (MAJOR bump)
└─ NO
   │
   Are there new features?
   ├─ YES → v1.2.0 (MINOR bump)
   └─ NO
      │
      Only bug fixes?
      └─ YES → v1.1.1 (PATCH bump)
```

## 📝 CHANGELOG.md Format

Always maintain this structure:

```markdown
# Changelog

## [Unreleased]

### Added
- New features go here

### Changed
- Changes to existing features

### Fixed
- Bug fixes

### Security
- Security-related changes

## [X.Y.Z] - YYYY-MM-DD

### Added
- Feature A
- Feature B

### Changed
- Change A

[unreleased]: https://github.com/utfcmac/local-ai/compare/vX.Y.Z...HEAD
[X.Y.Z]: https://github.com/utfcmac/local-ai/compare/vA.B.C...vX.Y.Z
```

## 🔍 Code Patterns to Follow

### Adding i18n Text

```typescript
// ❌ BAD - Hardcoded text
<h1>System RAM</h1>

// ✅ GOOD - i18n
<h1>{t("memory.title")}</h1>

// And update translations:
// src/messages/de.json
{
  "memory": {
    "title": "Speicherverbrauch"
  }
}

// src/messages/en.json
{
  "memory": {
    "title": "Memory Usage"
  }
}
```

### API Endpoint Pattern

```typescript
// All protected API routes should follow this pattern:

export async function POST(request: Request) {
  // 1. Auth check
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { success: false, error: "Ungültiger API-Key" },
      { status: 401 }
    );
  }

  // 2. Parse body
  let body: RequestType;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültiger Request-Body" },
      { status: 400 }
    );
  }

  // 3. Validate required fields
  const { requiredField, optionalField = "default" } = body;
  if (!requiredField) {
    return NextResponse.json(
      { success: false, error: "requiredField ist Pflichtfeld" },
      { status: 400 }
    );
  }

  // 4. Track generation
  const genId = insertGeneration({ /* ... */ });

  // 5. Try/catch for generation
  try {
    const result = await generateSomething(/* ... */);
    updateGeneration(genId, { status: "success", /* ... */ });
    return NextResponse.json({ success: true, /* ... */ });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    updateGeneration(genId, { status: "error", error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
```

## 🚨 Common Mistakes to Avoid

### ❌ Don't Do This

```bash
# Wrong git user
git commit -m "fix: something"  # commits as MarcoCarstensen

# Non-conventional commit
git commit -m "fixed the bug"

# Missing CHANGELOG update
# (make code changes but forget CHANGELOG.md)

# Hardcoded paths
const dbPath = "/Users/mc/ij_workspace/local-ai/data/db.sqlite"

# Missing i18n
<p>This is English text only</p>

# Not testing build
git commit && git push  # without npm run build
```

### ✅ Do This Instead

```bash
# Set git user first
git config user.name "utfcmac"
git config user.email "utfcmac@users.noreply.github.com"

# Conventional commit
git commit -m "fix(api): correct error handling in generate endpoint"

# Update CHANGELOG.md under [Unreleased]
# Then commit

# Dynamic paths
import path from 'path'
const dbPath = path.join(process.cwd(), 'data', 'db.sqlite')

# i18n for all text
<p>{t("description.key")}</p>

# Always test
npm run build
npm run start:standalone  # verify it works
git push origin main
```

## 📦 File Modification Checklist

When you modify these files, update related files:

| Modified File | Also Update |
|--------------|-------------|
| `src/app/api/*/route.ts` | README.md (API Reference), CHANGELOG.md |
| `src/app/[locale]/page.tsx` | `src/messages/de.json`, `src/messages/en.json` |
| `src/components/**/*.tsx` | Translation files if text is added |
| `src/lib/ollama.ts` | README.md if API changes |
| `package.json` | CHANGELOG.md (dependencies) |
| Any breaking change | CHANGELOG.md, README.md, commit message footer |

## 🔄 Automated vs Manual

### ✅ Automated (GitHub Actions handles this)
- Creating GitHub Release (when tag is pushed)
- Running CI tests (on every push)
- Extracting changelog for release notes

### 🤚 Manual (AI must do this)
- Updating CHANGELOG.md
- Creating version tags
- Writing commit messages
- Updating documentation
- Testing builds locally

## 💡 Pro Tips for AI Agents

1. **Always check git user first** - It's the most common mistake
2. **CHANGELOG.md is not optional** - Every change needs an entry
3. **Test the build** - `npm run build` must succeed before pushing
4. **i18n is mandatory** - All user-facing text needs DE + EN
5. **Conventional commits** - No exceptions, ever
6. **Semantic versioning** - Breaking change = major bump
7. **API backward compatibility** - Default values for new parameters

## 🎓 Learning Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [next-intl Documentation](https://next-intl.dev/)

## ❓ Quick Reference

```bash
# Check git user
git config user.name && git config user.email

# Set correct user
git config user.name "utfcmac" && git config user.email "utfcmac@users.noreply.github.com"

# Test build
npm run build && npm run start:standalone

# Standard commit
git add . && git commit -m "type(scope): description"

# Create release
git tag -a v1.2.0 -m "Release v1.2.0: description"
git push origin main --tags

# View recent commits
git log --oneline -10

# View tags
git tag -l
```

---

**Remember**: You are part of an open-source project. Follow these guidelines strictly to maintain code quality and project consistency. The human maintainer trusts you to follow this workflow! 🤖✨

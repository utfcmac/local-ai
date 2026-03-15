# 🌍 v1.1.0 - Multilingual Support

## What's New

### ✨ Multilingual Dashboard & API
- **Language Switcher**: Toggle between German (DE) and English (EN) directly in the dashboard
- **i18n API**: Added optional `language` parameter to all generation endpoints
- **Smart Prompts**: Ollama uses language-specific system prompts for better results

### 🔧 Improvements
- **Memory Display**: Shows actual process heap usage instead of system RAM
- **Better Monitoring**: More relevant metrics for tracking application performance
- **Updated Docs**: README and screenshots reflect all new features

### 📸 Screenshots

![Dashboard with Language Switcher](https://raw.githubusercontent.com/utfcmac/local-ai/main/docs/dashboard-screenshot.png)

## API Changes

### New Optional Parameter: `language`

Both endpoints now accept an optional `language` parameter:

```json
{
  "title": "Your Blog Post",
  "content": "...",
  "language": "en"
}
```

**Supported values:**
- `"de"` - German (default)
- `"en"` - English

**Example:**

```bash
curl -X POST http://localhost:3100/api/generate \
  -H "x-api-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Docker Compose vs. Kubernetes",
    "content": "...",
    "language": "en"
  }'
```

## Technical Changes

- Added `next-intl` for internationalization
- Implemented locale-based routing with `[locale]` directory
- Created translation files: `de.json` and `en.json`
- Language-aware Ollama prompt generation
- Process memory tracking via `process.memoryUsage()`

## Migration Notes

⚠️ **Breaking Change**: Project structure reorganized with locale-based routing.

If you're consuming the dashboard programmatically:
- Old: `http://localhost:3100/`
- New: `http://localhost:3100/` (redirects to `/de`)
- English: `http://localhost:3100/en`

API endpoints remain unchanged and fully backward compatible.

## Upgrade Instructions

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart
npm run pm2:restart
```

## Full Changelog

See [CHANGELOG.md](https://github.com/utfcmac/local-ai/blob/main/CHANGELOG.md) for detailed changes.

---

**Full Diff**: https://github.com/utfcmac/local-ai/compare/v1.0.0...v1.1.0

## Contributors

Thanks to everyone who contributed to this release! 🙏

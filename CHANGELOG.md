# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-03-15

### Added
- **Multilingual Support**: German and English language support for dashboard and API
- **Language Switcher**: Toggle between DE/EN in dashboard header
- **i18n API Parameter**: Added optional `language` parameter to `/api/generate` and `/api/generate-image` endpoints
- **Language-Specific Prompts**: Ollama uses dedicated system prompts for German and English generation
- **Translation Files**: Complete German (`de.json`) and English (`en.json`) translations
- **next-intl Integration**: Implemented internationalization with next-intl middleware

### Changed
- **Memory Display**: Dashboard now shows process heap memory usage instead of system RAM
- **Project Structure**: Reorganized app directory for locale-based routing (`[locale]`)
- **Dashboard Screenshot**: Updated README with actual dashboard screenshot

### Technical
- Added `next-intl` dependency for i18n
- Created `src/i18n.ts` configuration
- Implemented `src/middleware.ts` for locale routing
- Added `LanguageSwitcher.tsx` component
- Updated `ollama.ts` with language-aware prompt generation
- Moved messages to `src/messages/` directory

## [1.0.0] - 2026-03-09

### Added
- **AI Tweet Generation**: Create engaging Twitter threads from blog content via Ollama
- **OG Image Generation**: AI-powered taglines for social media cards (1200×630)
- **Real-time Dashboard**: Monitor Ollama status, RAM usage, and generation history
- **SQLite Logging**: Complete history of all generations with performance metrics
- **API Key Authentication**: Secure endpoints with `x-api-key` header validation
- **PM2 Process Management**: Production-ready deployment with PM2
- **Modern UI**: Built with shadcn/ui v4 and Tailwind CSS v4
- **Automated Build Process**: Zero-config deployment with portable paths
- **Health Check Endpoint**: Public `/api/health` endpoint for monitoring

### Technical Stack
- Next.js 16 with App Router and Turbopack
- TypeScript 5.7
- Ollama with qwen2.5:7b model
- SQLite with better-sqlite3
- shadcn/ui v4 components
- Tailwind CSS v4
- Lucide React icons

### Documentation
- Comprehensive README with setup instructions
- API reference documentation
- Architecture diagrams
- Security best practices
- MIT License

[unreleased]: https://github.com/utfcmac/local-ai/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/utfcmac/local-ai/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/utfcmac/local-ai/releases/tag/v1.0.0

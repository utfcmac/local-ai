# local-ai

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![de](https://img.shields.io/badge/lang-de-blue.svg)](README.de.md)

---

Local AI services for macip.de. Runs on Mac Laptop and provides AI generation via Ollama (qwen2.5:7b).

## Architecture

```
macip.de (Web-Server)            Mac Laptop (LAN)
┌──────────────────────┐         ┌──────────────────────────┐
│  Blog-Editor         │         │  local-ai :3100          │
│  share-x Route ──────┼──HTTP──►│  /api/health             │
│  teaser-worker ──────┼──HTTP──►│  /api/generate           │
│  og-image ───────────┼──HTTP──►│  /api/generate-image     │
│                      │         │                          │
│  Supabase DB         │         │  Ollama :11434           │
│  (blog_posts)        │         │  qwen2.5:7b              │
│                      │         │  SQLite (History)        │
└──────────────────────┘         └──────────────────────────┘
```

**Teaser-Flow:**
1. User clicks "Generate Teaser" on macip.de
2. Server checks Mac reachability (Health-Check, 5s Timeout)
3. Mac reachable → synchronous generation → immediate result
4. Mac not reachable → Queue in Supabase → teaser-worker polls every 2 min

**Image-Flow:**
1. User clicks "Generate Teaser Image" on macip.de
2. Ollama generates creative tagline from blog content
3. next/og renders 1200×630 OG-Image (PNG) with title + tagline + branding
4. PNG is returned directly as response

## Stack

| Area       | Technology                      |
|------------|---------------------------------|
| Framework  | Next.js 16 (App Router)         |
| Language   | TypeScript                      |
| LLM        | Ollama (qwen2.5:7b)             |
| Database   | SQLite (better-sqlite3)         |
| Styling    | Tailwind CSS v4 (Dark-only)     |
| Process    | PM2 (Standalone Build)          |

## Prerequisites

- Node.js 22+
- Ollama installed and running as daemon (`brew services start ollama`)
- Model loaded: `ollama pull qwen2.5:7b`

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure API-Key (same key as on macip.de server)
echo 'LOCAL_AI_API_KEY=<your-shared-key>' > .env.local

# 3. Build
npm run build

# 4. Start with PM2 (Env-Vars must be loaded beforehand!)
set -a && source .env.local && set +a
pm2 start ecosystem.config.cjs
pm2 save

# 5. Set up autostart after reboot
pm2 startup
# → Execute the displayed sudo command
```

## API-Endpoints

### `GET /api/health`

No auth required. Checks Ollama status.

```bash
curl http://localhost:3100/api/health
```

**Response:**
```json
{
  "status": "ok",
  "ollamaRunning": true,
  "modelAvailable": true,
  "modelLoaded": false,
  "models": ["qwen2.5:7b", "..."],
  "runningModels": [],
  "stats": { "total": 42, "success": 40, "error": 2, "avgDurationMs": 8500 },
  "systemMemory": { "totalGb": 36, "freeGb": 12, "usedGb": 24 }
}
```

### `POST /api/generate`

Auth via `x-api-key` header.

```bash
curl -X POST http://localhost:3100/api/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: <your-key>" \
  -d '{
    "title": "My Blog Title",
    "excerpt": "Short description",
    "content": "Full MDX-Content...",
    "blogUrl": "https://www.macip.de/blog/my-slug",
    "blogPostId": "uuid-optional"
  }'
```

**Response:**
```json
{
  "success": true,
  "mainTweet": "Exciting teaser text (max 280 chars)",
  "replyTweet": "Additional thought (max 255 chars)",
  "durationMs": 7500,
  "model": "qwen2.5:7b"
}
```

### `POST /api/generate-image`

Auth via `x-api-key` header. Generates an OG teaser image (1200×630 PNG) with AI tagline.

```bash
curl -X POST http://localhost:3100/api/generate-image \
  -H "Content-Type: application/json" \
  -H "x-api-key: <your-key>" \
  -d '{
    "title": "My Blog Title",
    "excerpt": "Short description",
    "content": "Full MDX-Content...",
    "blogPostId": "uuid-optional"
  }' \
  --output teaser-image.png
```

**Response:** PNG image directly (`Content-Type: image/png`, 1200×630).

On error: JSON with `{ "success": false, "error": "..." }`.

The image contains:
- Blog title (large, white)
- AI-generated tagline (Ollama, max 80 chars)
- Gradient background (dark, matching the blog)
- macip.de branding

## Dashboard

The dashboard is accessible at `http://localhost:3100` and shows:

- Ollama status (running/stopped)
- Model loaded/unloaded (RAM usage)
- System RAM display
- Generation statistics (success/error/avg duration)
- Table of the last 20 generations

## Ollama RAM Management

The model is **not** manually started/stopped. Instead:

- `keep_alive: "5m"` per request → model unloads automatically after 5 min of inactivity
- Ollama runs permanently as daemon (`brew services start ollama`)
- Upon a request, the model is automatically loaded into RAM (~4.7 GB)
- Dashboard shows if model is currently loaded

## SQLite Database

All generations are logged in `data/generations.db`:

| Column         | Type    | Description                        |
|----------------|---------|------------------------------------|
| `id`           | INTEGER | Primary Key                        |
| `blog_post_id` | TEXT    | macip.de Blog-Post UUID            |
| `title`        | TEXT    | Blog Title                         |
| `type`         | TEXT    | `teaser` or `image`                |
| `main_tweet`   | TEXT    | Generated Main Tweet (Teaser)      |
| `reply_tweet`  | TEXT    | Generated Reply Tweet (Teaser)     |
| `tagline`      | TEXT    | AI-generated Tagline (Image)       |
| `model`        | TEXT    | Used Model                         |
| `duration_ms`  | INTEGER | Generation duration in ms          |
| `status`       | TEXT    | `pending` / `success` / `error`    |
| `error`        | TEXT    | Error message (on failure)         |
| `created_at`   | TEXT    | Timestamp                          |

## PM2 Commands

```bash
pm2 status                    # Show all processes
pm2 logs local-ai             # Live logs
pm2 restart local-ai          # Restart
pm2 stop local-ai             # Stop
pm2 delete local-ai           # Remove
```

## Development

```bash
npm run dev                   # Dev server on port 3100
```

## File Structure

```
local-ai/
├── package.json
├── next.config.ts             # output: "standalone"
├── ecosystem.config.cjs       # PM2 configuration
├── .env.local                 # LOCAL_AI_API_KEY
├── data/                      # SQLite DB (gitignored)
│   └── generations.db
└── src/
    ├── app/
    │   ├── globals.css        # Dark theme (macip.de subset)
    │   ├── layout.tsx
    │   ├── page.tsx           # Dashboard
    │   └── api/
    │       ├── health/
    │       │   └── route.ts       # GET: Ollama status
    │       ├── generate/
    │       │   └── route.ts       # POST: Generate teaser
    │       └── generate-image/
    │           └── route.tsx      # POST: Generate OG teaser image
    └── lib/
        ├── auth.ts            # API key validation
        ├── db.ts              # SQLite (better-sqlite3)
        └── ollama.ts          # Ollama API wrapper
```

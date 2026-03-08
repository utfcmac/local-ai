# local-ai

Lokale KI-Services fuer macip.de. Laeuft auf dem Mac Laptop und stellt KI-Generierung via Ollama (qwen2.5:7b) bereit.

## Architektur

```
macip.de (192.168.1.28)          Mac Laptop (192.168.1.114)
┌──────────────────────┐         ┌──────────────────────────┐
│  Blog-Editor         │         │  local-ai :3100          │
│  share-x Route ──────┼──HTTP──►│  /api/health             │
│  teaser-worker ──────┼──HTTP──►│  /api/generate           │
│                      │         │                          │
│  Supabase DB         │         │  Ollama :11434           │
│  (blog_posts)        │         │  qwen2.5:7b              │
│                      │         │  SQLite (History)        │
└──────────────────────┘         └──────────────────────────┘
```

**Flow:**
1. User klickt "Teaser generieren" auf macip.de
2. Server prueft Mac-Erreichbarkeit (Health-Check, 5s Timeout)
3. Mac erreichbar → synchrone Generierung → Ergebnis sofort
4. Mac nicht erreichbar → Queue in Supabase → teaser-worker pollt alle 2 Min

## Stack

| Bereich    | Technologie                    |
|------------|--------------------------------|
| Framework  | Next.js 16 (App Router)        |
| Sprache    | TypeScript                     |
| LLM        | Ollama (qwen2.5:7b)            |
| Datenbank  | SQLite (better-sqlite3)        |
| Styling    | Tailwind CSS v4 (Dark-only)    |
| Prozess    | PM2 (Standalone Build)         |

## Voraussetzungen

- Node.js 22+
- Ollama installiert und als Daemon laufend (`brew services start ollama`)
- Modell geladen: `ollama pull qwen2.5:7b`

## Setup

```bash
# 1. Dependencies installieren
npm install

# 2. API-Key konfigurieren (gleicher Key wie auf macip.de Server)
echo 'LOCAL_AI_API_KEY=<dein-shared-key>' > .env.local

# 3. Bauen
npm run build

# 4. Mit PM2 starten (Env-Vars muessen vorher geladen sein!)
set -a && source .env.local && set +a
pm2 start ecosystem.config.cjs
pm2 save

# 5. Autostart nach Reboot einrichten
pm2 startup
# → Angezeigten sudo-Befehl ausfuehren
```

## API-Endpoints

### `GET /api/health`

Kein Auth erforderlich. Prueft Ollama-Status.

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

Auth via `x-api-key` Header.

```bash
curl -X POST http://localhost:3100/api/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: <dein-key>" \
  -d '{
    "title": "Mein Blog-Titel",
    "excerpt": "Kurzbeschreibung",
    "content": "Voller MDX-Content...",
    "blogUrl": "https://www.macip.de/blog/mein-slug",
    "blogPostId": "uuid-optional"
  }'
```

**Response:**
```json
{
  "success": true,
  "mainTweet": "Spannender Teaser-Text (max 280 Zeichen)",
  "replyTweet": "Ergaenzender Gedanke (max 255 Zeichen)",
  "durationMs": 7500,
  "model": "qwen2.5:7b"
}
```

## Dashboard

Das Dashboard ist unter `http://localhost:3100` erreichbar und zeigt:

- Ollama-Status (laeuft/gestoppt)
- Modell geladen/entladen (RAM-Nutzung)
- System-RAM-Anzeige
- Generierungs-Statistiken (Erfolg/Fehler/Durchschnittsdauer)
- Tabelle der letzten 20 Generierungen

## Ollama RAM-Management

Das Modell wird **nicht** manuell gestartet/gestoppt. Stattdessen:

- `keep_alive: "5m"` pro Request → Modell entlaedt sich nach 5 Min Inaktivitaet automatisch
- Ollama laeuft dauerhaft als Daemon (`brew services start ollama`)
- Bei einem Request wird das Modell automatisch in den RAM geladen (~4.7 GB)
- Dashboard zeigt ob Modell gerade geladen ist

## SQLite-Datenbank

Alle Generierungen werden in `data/generations.db` geloggt:

| Spalte         | Typ     | Beschreibung                    |
|----------------|---------|---------------------------------|
| `id`           | INTEGER | Primaerschluessel               |
| `blog_post_id` | TEXT    | macip.de Blog-Post UUID         |
| `title`        | TEXT    | Blog-Titel                      |
| `main_tweet`   | TEXT    | Generierter Haupt-Tweet         |
| `reply_tweet`  | TEXT    | Generierter Antwort-Tweet       |
| `model`        | TEXT    | Verwendetes Modell              |
| `duration_ms`  | INTEGER | Generierungsdauer in ms         |
| `status`       | TEXT    | `pending` / `success` / `error` |
| `error`        | TEXT    | Fehlermeldung (bei Fehler)      |
| `created_at`   | TEXT    | Zeitstempel                     |

## PM2-Befehle

```bash
pm2 status                    # Alle Prozesse anzeigen
pm2 logs local-ai             # Live-Logs
pm2 restart local-ai          # Neustart
pm2 stop local-ai             # Stoppen
pm2 delete local-ai           # Entfernen
```

## Entwicklung

```bash
npm run dev                   # Dev-Server auf Port 3100
```

## Dateistruktur

```
local-ai/
├── package.json
├── next.config.ts             # output: "standalone"
├── ecosystem.config.cjs       # PM2-Konfiguration
├── .env.local                 # LOCAL_AI_API_KEY
├── data/                      # SQLite DB (gitignored)
│   └── generations.db
└── src/
    ├── app/
    │   ├── globals.css        # Dark-Theme (macip.de Subset)
    │   ├── layout.tsx
    │   ├── page.tsx           # Dashboard
    │   └── api/
    │       ├── health/
    │       │   └── route.ts   # GET: Ollama-Status
    │       └── generate/
    │           └── route.ts   # POST: Teaser generieren
    └── lib/
        ├── auth.ts            # API-Key Validierung
        ├── db.ts              # SQLite (better-sqlite3)
        └── ollama.ts          # Ollama API Wrapper
```

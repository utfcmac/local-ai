import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// ----- Types -----

export interface GenerationRow {
  id: number;
  blog_post_id: string | null;
  title: string;
  main_tweet: string | null;
  reply_tweet: string | null;
  model: string;
  duration_ms: number | null;
  status: "pending" | "success" | "error";
  error: string | null;
  created_at: string;
}

// ----- DB Singleton -----

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  // Stabiler Pfad: immer im Projekt-Root, nicht im standalone cwd
  const projectRoot =
    process.env.LOCAL_AI_DATA_DIR ??
    path.join(process.cwd(), "data");
  const dataDir = projectRoot.endsWith("data")
    ? projectRoot
    : path.join(projectRoot, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, "generations.db");
  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS generations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blog_post_id TEXT,
      title TEXT NOT NULL,
      main_tweet TEXT,
      reply_tweet TEXT,
      model TEXT NOT NULL DEFAULT 'qwen2.5:7b',
      duration_ms INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `);

  return _db;
}

// ----- Queries -----

export function insertGeneration(data: {
  blogPostId?: string | null;
  title: string;
  model?: string;
}): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO generations (blog_post_id, title, model)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(
    data.blogPostId ?? null,
    data.title,
    data.model ?? "qwen2.5:7b",
  );
  return Number(result.lastInsertRowid);
}

export function updateGeneration(
  id: number,
  data: {
    mainTweet?: string;
    replyTweet?: string;
    durationMs?: number;
    status: "success" | "error";
    error?: string;
  },
): void {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE generations
    SET main_tweet = ?, reply_tweet = ?, duration_ms = ?, status = ?, error = ?
    WHERE id = ?
  `);
  stmt.run(
    data.mainTweet ?? null,
    data.replyTweet ?? null,
    data.durationMs ?? null,
    data.status,
    data.error ?? null,
    id,
  );
}

export function getRecentGenerations(limit = 20): GenerationRow[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM generations
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(limit) as GenerationRow[];
}

export function getStats(): {
  total: number;
  success: number;
  error: number;
  avgDurationMs: number | null;
} {
  const db = getDb();
  const row = db
    .prepare(
      `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
      SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error,
      AVG(CASE WHEN status = 'success' THEN duration_ms END) as avg_duration_ms
    FROM generations
  `,
    )
    .get() as {
    total: number;
    success: number;
    error: number;
    avg_duration_ms: number | null;
  };
  return {
    total: row.total,
    success: row.success,
    error: row.error,
    avgDurationMs: row.avg_duration_ms
      ? Math.round(row.avg_duration_ms)
      : null,
  };
}

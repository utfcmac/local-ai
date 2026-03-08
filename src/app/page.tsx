import { checkOllamaHealth } from "@/lib/ollama";
import { getRecentGenerations, getStats } from "@/lib/db";
import os from "os";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const health = await checkOllamaHealth();
  const generations = getRecentGenerations(20);
  const stats = getStats();

  const totalGb = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
  const freeGb = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);

  return (
    <div className="mx-auto max-w-[960px] px-6 py-10 sm:px-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-bold text-text-heading">
          Local AI
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Lokale KI-Services fuer macip.de
        </p>
      </div>

      {/* Status Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Ollama Status */}
        <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                health.ollamaRunning ? "bg-accent-teal" : "bg-red-500"
              }`}
            />
            <span className="text-xs uppercase tracking-[0.12em] text-text-faint">
              Ollama
            </span>
          </div>
          <p className="text-sm font-medium text-text-heading">
            {health.ollamaRunning ? "Verbunden" : "Nicht erreichbar"}
          </p>
          {health.ollamaRunning && (
            <p className="mt-1 text-xs text-text-dim">
              {health.modelLoaded
                ? "qwen2.5:7b geladen"
                : health.modelAvailable
                  ? "qwen2.5:7b verfuegbar (nicht geladen)"
                  : "qwen2.5:7b nicht installiert"}
            </p>
          )}
        </div>

        {/* System */}
        <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
          <div className="mb-3">
            <span className="text-xs uppercase tracking-[0.12em] text-text-faint">
              System
            </span>
          </div>
          <p className="text-sm font-medium text-text-heading">
            {freeGb} GB frei
          </p>
          <p className="mt-1 text-xs text-text-dim">von {totalGb} GB RAM</p>
        </div>

        {/* Statistik */}
        <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
          <div className="mb-3">
            <span className="text-xs uppercase tracking-[0.12em] text-text-faint">
              Generierungen
            </span>
          </div>
          <p className="text-sm font-medium text-text-heading">
            {stats.success} / {stats.total}
          </p>
          <p className="mt-1 text-xs text-text-dim">
            {stats.avgDurationMs
              ? `\u00D8 ${(stats.avgDurationMs / 1000).toFixed(1)}s`
              : "Noch keine Daten"}
          </p>
        </div>
      </div>

      {/* Generierungen */}
      <div>
        <h2 className="mb-4 font-sans text-lg font-semibold text-text-heading">
          Letzte Generierungen
        </h2>

        {generations.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-surface-card p-10 text-center">
            <p className="text-sm text-text-dim">
              Noch keine Generierungen vorhanden.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className="rounded-lg border border-border-subtle bg-surface-card p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[11px] ${
                        gen.status === "success"
                          ? "border-accent-teal/20 bg-accent-teal/15 text-accent-teal"
                          : gen.status === "error"
                            ? "border-red-500/20 bg-red-500/15 text-red-400"
                            : "border-accent-blue/20 bg-accent-blue/15 text-accent-blue"
                      }`}
                    >
                      {gen.status === "success"
                        ? "Erfolgreich"
                        : gen.status === "error"
                          ? "Fehler"
                          : "Laeuft..."}
                    </span>
                    {gen.duration_ms && (
                      <span className="text-[11px] text-text-dim">
                        {(gen.duration_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-text-dim">
                    {gen.created_at}
                  </span>
                </div>

                <p className="mb-2 text-sm font-medium text-text-heading">
                  {gen.title}
                </p>

                {gen.status === "success" && gen.main_tweet && (
                  <div className="space-y-1.5">
                    <div className="rounded-md bg-surface p-2.5">
                      <p className="text-[11px] text-text-dim">Haupt-Tweet:</p>
                      <p className="mt-0.5 text-xs text-text-body">
                        {gen.main_tweet}
                      </p>
                    </div>
                    {gen.reply_tweet && (
                      <div className="rounded-md bg-surface p-2.5">
                        <p className="text-[11px] text-text-dim">Reply:</p>
                        <p className="mt-0.5 text-xs text-text-body">
                          {gen.reply_tweet}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {gen.status === "error" && gen.error && (
                  <div className="rounded-md bg-red-500/10 p-2.5">
                    <p className="text-xs text-red-400">{gen.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import os from "os";
import { checkOllamaHealth } from "@/lib/ollama";
import { getStats } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkOllamaHealth();
  const stats = getStats();

  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  return NextResponse.json({
    status: health.ollamaRunning ? "ok" : "ollama_down",
    ollamaRunning: health.ollamaRunning,
    modelAvailable: health.modelAvailable,
    modelLoaded: health.modelLoaded,
    models: health.models,
    runningModels: health.runningModels,
    stats,
    systemMemory: {
      totalGb: +(totalMem / 1024 / 1024 / 1024).toFixed(1),
      freeGb: +(freeMem / 1024 / 1024 / 1024).toFixed(1),
      usedGb: +((totalMem - freeMem) / 1024 / 1024 / 1024).toFixed(1),
    },
    uptime: Math.round(os.uptime()),
  });
}

import { checkOllamaHealth } from "@/lib/ollama";
import { getRecentGenerations, getStats } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Server, TrendingUp, Image, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const health = await checkOllamaHealth();
  const generations = getRecentGenerations(20);
  const stats = getStats();

  const processMemoryMb = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0);
  const processMemoryTotalMb = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(0);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Status Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {/* Ollama Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("ollama.title")}</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  health.ollamaRunning ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-2xl font-bold">
                {health.ollamaRunning ? t("ollama.connected") : t("ollama.offline")}
              </span>
            </div>
            {health.ollamaRunning && (
              <p className="mt-2 text-xs text-muted-foreground">
                {health.modelLoaded
                  ? t("ollama.modelLoaded")
                  : health.modelAvailable
                    ? t("ollama.modelAvailable")
                    : t("ollama.modelNotInstalled")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Process Memory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("memory.title")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processMemoryMb} MB
            </div>
            <p className="text-xs text-muted-foreground">
              {t("memory.heap", { total: processMemoryTotalMb })}
            </p>
          </CardContent>
        </Card>

        {/* Statistik */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("generations.title")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.success} / {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.avgDurationMs
                ? t("generations.average", {
                    duration: (stats.avgDurationMs / 1000).toFixed(1),
                  })
                : t("generations.noData")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Generierungen */}
      <Card>
        <CardHeader>
          <CardTitle>{t("history.title")}</CardTitle>
          <CardDescription>{t("history.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {generations.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">{t("history.empty")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generations.map((gen) => (
                <Card key={gen.id} className="border-muted">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {gen.type === "image" ? (
                          <Image className="h-4 w-4 text-purple-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-500" />
                        )}
                        <Badge variant="outline">
                          {gen.type === "image"
                            ? t("history.types.image")
                            : t("history.types.teaser")}
                        </Badge>
                        {gen.status === "success" ? (
                          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            {t("history.status.success")}
                          </Badge>
                        ) : gen.status === "error" ? (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            {t("history.status.error")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="mr-1 h-3 w-3" />
                            {t("history.status.pending")}
                          </Badge>
                        )}
                        {gen.duration_ms && (
                          <span className="text-xs text-muted-foreground">
                            {(gen.duration_ms / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {gen.created_at}
                      </span>
                    </div>
                    <CardTitle className="text-base">{gen.title}</CardTitle>
                  </CardHeader>

                  {(gen.tagline || gen.main_tweet || gen.error) && (
                    <CardContent className="pt-0">
                      {gen.status === "success" && gen.type === "image" && gen.tagline && (
                        <div className="rounded-md bg-muted p-3">
                          <p className="text-xs font-medium text-muted-foreground">
                            {t("history.tagline")}
                          </p>
                          <p className="mt-1 text-sm">{gen.tagline}</p>
                        </div>
                      )}

                      {gen.status === "success" && gen.type !== "image" && gen.main_tweet && (
                        <div className="space-y-2">
                          <div className="rounded-md bg-muted p-3">
                            <p className="text-xs font-medium text-muted-foreground">
                              {t("history.mainTweet")}
                            </p>
                            <p className="mt-1 text-sm">{gen.main_tweet}</p>
                          </div>
                          {gen.reply_tweet && (
                            <div className="rounded-md bg-muted p-3">
                              <p className="text-xs font-medium text-muted-foreground">
                                {t("history.reply")}
                              </p>
                              <p className="mt-1 text-sm">{gen.reply_tweet}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {gen.status === "error" && gen.error && (
                        <div className="rounded-md bg-destructive/10 p-3">
                          <p className="text-sm text-destructive">{gen.error}</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

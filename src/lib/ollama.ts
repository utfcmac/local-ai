/**
 * Ollama API Wrapper — generiert X.com-Teaser via qwen2.5:7b.
 *
 * Kommuniziert mit dem lokalen Ollama-Daemon auf http://localhost:11434.
 * Nutzt den gleichen deutschen Prompt wie zuvor die OpenAI-Version.
 */

const OLLAMA_BASE = "http://localhost:11434";
const MODEL = "qwen2.5:7b";
const KEEP_ALIVE = "5m";

// ----- Types -----

export interface TeaserResult {
  mainTweet: string;
  replyTweet: string;
}

export interface OllamaHealthInfo {
  ollamaRunning: boolean;
  modelAvailable: boolean;
  modelLoaded: boolean;
  models: string[];
  runningModels: string[];
}

interface OllamaChatResponse {
  message?: {
    content?: string;
  };
  done?: boolean;
}

// ----- Health -----

export async function checkOllamaHealth(): Promise<OllamaHealthInfo> {
  const info: OllamaHealthInfo = {
    ollamaRunning: false,
    modelAvailable: false,
    modelLoaded: false,
    models: [],
    runningModels: [],
  };

  try {
    // Pruefe ob Ollama-Daemon laeuft
    const tagsRes = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!tagsRes.ok) return info;
    info.ollamaRunning = true;

    const tagsData = (await tagsRes.json()) as {
      models?: { name: string }[];
    };
    info.models = (tagsData.models ?? []).map((m) => m.name);
    info.modelAvailable = info.models.some((m) => m.startsWith("qwen2.5"));

    // Pruefe ob Modell gerade geladen ist (im RAM)
    const psRes = await fetch(`${OLLAMA_BASE}/api/ps`, {
      signal: AbortSignal.timeout(3000),
    });
    if (psRes.ok) {
      const psData = (await psRes.json()) as {
        models?: { name: string }[];
      };
      info.runningModels = (psData.models ?? []).map((m) => m.name);
      info.modelLoaded = info.runningModels.some((m) =>
        m.startsWith("qwen2.5"),
      );
    }
  } catch {
    // Ollama nicht erreichbar
  }

  return info;
}

// ----- Generation -----

const SYSTEM_PROMPT = `Du bist ein Social-Media-Experte fuer Tech-Inhalte.
Du schreibst Tweets auf Deutsch fuer einen Software-Entwickler-Blog.
Dein Stil: Direkt, neugierig machend, technisch aber zugaenglich.
Nutze gelegentlich Emojis, aber dezent (max. 1-2 pro Tweet).
Schreibe IMMER auf Deutsch.
Antworte IMMER mit validem JSON. Kein Markdown, keine Code-Bloecke, nur JSON.`;

// ----- Tagline Generation -----

const TAGLINE_SYSTEM_PROMPT = `Du bist ein kreativer Texter fuer Tech-Blog-Inhalte.
Du erstellst kurze, praegnante Taglines auf Deutsch.
Antworte IMMER mit validem JSON. Kein Markdown, keine Code-Bloecke, nur JSON.`;

export async function generateTagline(
  title: string,
  excerpt: string,
  content: string,
): Promise<string> {
  const contentPreview = content.slice(0, 1500);

  const userPrompt = `Erstelle eine kreative, kurze Tagline fuer folgenden Blog-Beitrag.
Die Tagline soll neugierig machen und den Kern des Artikels einfangen.

Titel: ${title}
Kurzfassung: ${excerpt}
Inhalt (Auszug): ${contentPreview}

Anforderungen:
- Maximal 80 Zeichen
- Deutsch
- Kein Link, keine URL
- Praegnant und spannend

Antworte NUR mit validem JSON im Format:
{"tagline": "..."}`;

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: TAGLINE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      format: "json",
      stream: false,
      keep_alive: KEEP_ALIVE,
      options: {
        temperature: 0.9,
        num_predict: 100,
      },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama API Fehler (${res.status}): ${body}`);
  }

  const data = (await res.json()) as OllamaChatResponse;
  const raw = data.message?.content?.trim() ?? "";

  if (!raw) {
    throw new Error("Ollama gab eine leere Antwort zurueck (Tagline)");
  }

  const jsonStr = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  let parsed: { tagline: string };
  try {
    parsed = JSON.parse(jsonStr) as { tagline: string };
  } catch {
    throw new Error(`Tagline-Antwort ist kein valides JSON: ${raw.slice(0, 200)}`);
  }

  if (!parsed.tagline) {
    throw new Error("Tagline-Antwort fehlt das tagline-Feld");
  }

  // HTML-Entities und URLs entfernen, kuerzen
  let tagline = parsed.tagline
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s*https?:\/\/\S+/g, "")
    .trim();
  if (tagline.length > 80) {
    tagline = tagline.slice(0, 77) + "...";
  }

  return tagline;
}

// ----- Teaser Generation -----

export async function generateTeaser(
  title: string,
  excerpt: string,
  content: string,
  blogUrl: string,
): Promise<TeaserResult> {
  const contentPreview = content.slice(0, 2000);

  const userPrompt = `Erstelle zwei Tweets fuer folgenden Blog-Beitrag:

Titel: ${title}
Kurzfassung: ${excerpt}
Inhalt (Auszug): ${contentPreview}

Anforderungen:
1. "mainTweet": Ein spannender Teaser der neugierig macht und zum Weiterlesen animiert. WICHTIG: Kein Link, keine URL, kein "http", kein "macip.de" — der Link wird separat gepostet. Maximal 270 Zeichen.
2. "replyTweet": Ein ergaenzender Gedanke oder ein konkretes Highlight aus dem Artikel. WICHTIG: Kein Link, keine URL — der Link wird automatisch angehaengt. Maximal 250 Zeichen.

Antworte NUR mit validem JSON im Format:
{"mainTweet": "...", "replyTweet": "..."}`;

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      format: "json",
      stream: false,
      keep_alive: KEEP_ALIVE,
      options: {
        temperature: 0.8,
        num_predict: 400,
      },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama API Fehler (${res.status}): ${body}`);
  }

  const data = (await res.json()) as OllamaChatResponse;
  const raw = data.message?.content?.trim() ?? "";

  if (!raw) {
    throw new Error("Ollama gab eine leere Antwort zurueck");
  }

  // JSON parsen (Ollama mit format: "json" gibt reines JSON zurueck)
  const jsonStr = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  let parsed: TeaserResult;
  try {
    parsed = JSON.parse(jsonStr) as TeaserResult;
  } catch {
    throw new Error(`Ollama-Antwort ist kein valides JSON: ${raw.slice(0, 200)}`);
  }

  if (!parsed.mainTweet || !parsed.replyTweet) {
    throw new Error(
      "Ollama-Antwort fehlen mainTweet oder replyTweet Felder",
    );
  }

  // URLs aus beiden Tweets entfernen (kleine Modelle ignorieren "kein Link" oft)
  const stripUrls = (text: string) =>
    text.replace(/\s*https?:\/\/\S+/g, "").trim();
  parsed.mainTweet = stripUrls(parsed.mainTweet);
  parsed.replyTweet = stripUrls(parsed.replyTweet);

  // Zeichenlimits erzwingen
  if (parsed.mainTweet.length > 280) {
    parsed.mainTweet = parsed.mainTweet.slice(0, 277) + "...";
  }

  // Reply braucht Platz fuer "\n\n" + URL (23 Zeichen via t.co)
  const replyMaxLen = 280 - 2 - 23;
  if (parsed.replyTweet.length > replyMaxLen) {
    parsed.replyTweet = parsed.replyTweet.slice(0, replyMaxLen - 3) + "...";
  }

  return parsed;
}

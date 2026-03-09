import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { generateTagline } from "@/lib/ollama";
import { insertGeneration, updateGeneration } from "@/lib/db";

export const dynamic = "force-dynamic";

interface GenerateImageRequest {
  title: string;
  excerpt?: string;
  content: string;
  blogPostId?: string;
}

export async function POST(request: Request) {
  // Auth pruefen
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { success: false, error: "Ungültiger API-Key" },
      { status: 401 },
    );
  }

  let body: GenerateImageRequest;
  try {
    body = (await request.json()) as GenerateImageRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültiger Request-Body" },
      { status: 400 },
    );
  }

  const { title, excerpt, content, blogPostId } = body;

  if (!title || !content) {
    return NextResponse.json(
      { success: false, error: "title und content sind Pflichtfelder" },
      { status: 400 },
    );
  }

  // Generation in SQLite tracken
  const genId = insertGeneration({
    blogPostId: blogPostId ?? null,
    title,
    type: "image",
  });

  const startTime = Date.now();

  try {
    // Tagline via Ollama generieren
    const tagline = await generateTagline(title, excerpt ?? "", content);
    const durationMs = Date.now() - startTime;

    updateGeneration(genId, {
      tagline,
      durationMs,
      status: "success",
    });

    // OG-Image rendern
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Dekorative Akzentlinie oben */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)",
              display: "flex",
            }}
          />

          {/* Titel */}
          <div
            style={{
              fontSize: title.length > 60 ? 36 : title.length > 40 ? 44 : 52,
              fontWeight: 700,
              color: "#f1f5f9",
              lineHeight: 1.2,
              marginBottom: "24px",
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 24,
              color: "#94a3b8",
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            {tagline}
          </div>

          {/* Branding unten rechts */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "60px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#06b6d4",
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: 20,
                color: "#64748b",
                fontWeight: 500,
                display: "flex",
              }}
            >
              macip.de
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : String(err);

    updateGeneration(genId, {
      durationMs,
      status: "error",
      error: errorMessage,
    });

    return NextResponse.json(
      { success: false, error: errorMessage, durationMs },
      { status: 500 },
    );
  }
}

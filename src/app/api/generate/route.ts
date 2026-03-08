import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { generateTeaser } from "@/lib/ollama";
import { insertGeneration, updateGeneration } from "@/lib/db";

export const dynamic = "force-dynamic";

interface GenerateRequest {
  title: string;
  excerpt: string;
  content: string;
  blogUrl: string;
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

  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültiger Request-Body" },
      { status: 400 },
    );
  }

  const { title, excerpt, content, blogUrl, blogPostId } = body;

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
  });

  const startTime = Date.now();

  try {
    const result = await generateTeaser(title, excerpt ?? "", content, blogUrl ?? "");
    const durationMs = Date.now() - startTime;

    updateGeneration(genId, {
      mainTweet: result.mainTweet,
      replyTweet: result.replyTweet,
      durationMs,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      mainTweet: result.mainTweet,
      replyTweet: result.replyTweet,
      durationMs,
      model: "qwen2.5:7b",
    });
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

import { NextRequest, NextResponse } from "next/server";
import { retrieveKnowledge } from "@/services/rag/ragService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body?.query?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Query must be at least 2 characters." }, { status: 400 });
    }

    const result = retrieveKnowledge(query, {
      topicId: body.topicId,
      topK: Number(body.topK) || 3,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("RAG retrieval API error:", err);
    return NextResponse.json({ error: err?.message || "RAG retrieval failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const topicId = searchParams.get("topicId") || undefined;

    if (!query) {
      return NextResponse.json({ error: "Missing ?q= query parameter" }, { status: 400 });
    }

    const result = retrieveKnowledge(query, { topicId, topK: 3 });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to retrieve" }, { status: 500 });
  }
}

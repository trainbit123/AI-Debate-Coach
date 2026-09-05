import { NextRequest, NextResponse } from "next/server";
import { deleteDebate, getDebateById } from "@/database/db";

function isOfflineMode(): boolean {
  const hasGroq = Boolean(process.env.GROQ_API_KEY?.trim());
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim()
  );
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY?.trim());
  return !(hasGroq || hasGemini || hasOpenAI);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getDebateById(params.id);
    if (!session) {
      return NextResponse.json({ error: "Debate session not found" }, { status: 404 });
    }
    return NextResponse.json({
      session,
      isOffline: isOfflineMode(),
    });
  } catch (err: any) {
    console.error("Error fetching debate session:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteDebate(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Debate session not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Debate deleted" });
  } catch (err: any) {
    console.error("Error deleting debate session:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

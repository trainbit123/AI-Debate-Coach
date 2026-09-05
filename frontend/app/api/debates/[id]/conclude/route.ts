import { NextRequest, NextResponse } from "next/server";
import { getDebateById, saveDebate } from "@/database/db";
import { concludeDebateSession } from "@/services/debateEngine";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getDebateById(params.id);
    if (!session) {
      return NextResponse.json({ error: "Debate session not found" }, { status: 404 });
    }

    const concludedSession = concludeDebateSession(session);
    saveDebate(concludedSession);

    return NextResponse.json({
      session: concludedSession,
      finalVerdict: concludedSession.finalVerdict,
    });
  } catch (err: any) {
    console.error("Error concluding debate session:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to conclude debate session" },
      { status: 500 }
    );
  }
}

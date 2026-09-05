import { NextRequest, NextResponse } from "next/server";
import { getDebateById, saveDebate } from "@/database/db";
import { executeRoundTurn } from "@/services/debateEngine";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getDebateById(params.id);
    if (!session) {
      return NextResponse.json({ error: "Debate session not found" }, { status: 404 });
    }

    if (session.isComplete) {
      return NextResponse.json(
        { error: "This debate session is already complete." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const userArgument = body.userArgument;

    if (!userArgument || typeof userArgument !== "string" || userArgument.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a substantive argument of at least 5 characters." },
        { status: 400 }
      );
    }

    const { session: updatedSession, turnResult } = await executeRoundTurn(
      session,
      userArgument
    );

    saveDebate(updatedSession);

    return NextResponse.json({
      session: updatedSession,
      turnResult,
    });
  } catch (err: any) {
    console.error("Error processing debate turn:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

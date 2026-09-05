import { NextRequest, NextResponse } from "next/server";
import { getDebateById } from "@/database/db";
import { generateCrossExaminationQuestions } from "@/services/llmService";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getDebateById(params.id);
    if (!session) {
      return NextResponse.json({ error: "Debate session not found" }, { status: 404 });
    }

    const body = await req.json();
    const userArgument = body.userArgument || session.rounds[session.rounds.length - 1]?.userArgument;

    if (!userArgument || typeof userArgument !== "string" || userArgument.trim().length < 5) {
      return NextResponse.json(
        { error: "Provide a substantive argument to cross-examine." },
        { status: 400 }
      );
    }

    const questions = await generateCrossExaminationQuestions(
      session.topic,
      session.userPosition,
      session.aiPosition,
      userArgument.trim()
    );

    return NextResponse.json({ questions });
  } catch (err: any) {
    console.error("Error generating cross-examination:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate cross-examination questions" },
      { status: 500 }
    );
  }
}

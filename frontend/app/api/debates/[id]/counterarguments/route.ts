import { NextRequest, NextResponse } from "next/server";
import { getDebateById } from "@/database/db";
import { generateCounterarguments } from "@/services/llmService";

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
        { error: "Provide a substantive argument to analyze." },
        { status: 400 }
      );
    }

    const counterarguments = await generateCounterarguments(
      session.topic,
      session.aiPosition,
      userArgument.trim()
    );

    return NextResponse.json({ counterarguments });
  } catch (err: any) {
    console.error("Error generating counterarguments:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate counterarguments" },
      { status: 500 }
    );
  }
}

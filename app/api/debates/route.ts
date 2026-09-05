import { NextRequest, NextResponse } from "next/server";
import { createDebateSession } from "@/services/debateEngine";
import { getAllDebates, saveDebate } from "@/database/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, userPosition, difficulty, maxRounds, isEndless } = body;

    if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
      return NextResponse.json(
        { error: "Topic must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (userPosition !== "FOR" && userPosition !== "AGAINST") {
      return NextResponse.json(
        { error: "Position must be either 'FOR' or 'AGAINST'." },
        { status: 400 }
      );
    }

    const session = await createDebateSession({
      topic: topic.trim(),
      userPosition,
      difficulty: difficulty || "intermediate",
      maxRounds: Number(maxRounds) || 3,
      isEndless: Boolean(isEndless),
    });

    saveDebate(session);

    return NextResponse.json(session, { status: 201 });
  } catch (err: any) {
    console.error("Error creating debate:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create debate session" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") || undefined;
    const position = searchParams.get("position") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const outcome = searchParams.get("outcome") || undefined;

    const debates = getAllDebates({ topic, position, difficulty, outcome });
    return NextResponse.json({ debates });
  } catch (err: any) {
    console.error("Error fetching debates:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to list debates" },
      { status: 500 }
    );
  }
}

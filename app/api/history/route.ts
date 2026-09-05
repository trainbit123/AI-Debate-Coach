import { NextRequest, NextResponse } from "next/server";
import { getAllDebates } from "@/database/db";

export const dynamic = "force-dynamic";

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
    console.error("Error fetching debate history:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch history" },
      { status: 500 }
    );
  }
}

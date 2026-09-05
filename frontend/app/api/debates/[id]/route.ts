import { NextRequest, NextResponse } from "next/server";
import { deleteDebate, getDebateById } from "@/database/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getDebateById(params.id);
    if (!session) {
      return NextResponse.json({ error: "Debate session not found" }, { status: 404 });
    }
    return NextResponse.json({ session });
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

import { NextResponse } from "next/server";
import { getUserStats } from "@/database/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = getUserStats();
    return NextResponse.json({ stats });
  } catch (err: any) {
    console.error("Error computing user stats:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to retrieve stats" },
      { status: 500 }
    );
  }
}

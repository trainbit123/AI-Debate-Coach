import { NextRequest, NextResponse } from "next/server";
import { processVoiceSearch } from "@/services/intentService";
import { VoiceSearchRequest } from "@/lib/types/search";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: VoiceSearchRequest = await req.json();
    const query = body?.query?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Please speak or type a valid question or search request." },
        { status: 400 }
      );
    }

    const result = await processVoiceSearch(query, body.context);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Voice search API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process voice search" },
      { status: 500 }
    );
  }
}

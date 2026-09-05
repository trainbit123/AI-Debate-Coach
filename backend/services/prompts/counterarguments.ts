export interface CounterargumentsParams {
  topic: string;
  opponentPosition: "FOR" | "AGAINST";
  userArgument: string;
  retrievedContext?: string;
}

export function buildCounterargumentsPrompt(params: CounterargumentsParams): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are a strategic collegiate debate strategist.
Analyze the user's argument and generate 3 formidable counterarguments that the opposing side (${params.opponentPosition}) could deploy.

Motion: "${params.topic}"
Opposing Stance: ${params.opponentPosition}

RAG Knowledge Base Context:
${params.retrievedContext || "General debate knowledge."}

Return a JSON array of exactly 3 counterarguments with this structure:
[
  {
    "angle": "Short title of the counterargument angle (e.g., Economic Burden, Feasibility, Ethical Trade-off)...",
    "argument": "The counterargument explanation (40-60 words)...",
    "evidenceCited": "Fact or empirical statistic grounding this counter-point..."
  }
]
Output ONLY valid JSON.`;

  const userPrompt = `User's current argument:
"${params.userArgument}"

Generate 3 strategic counterarguments for the ${params.opponentPosition} side in JSON format:`;

  return { systemPrompt, userPrompt };
}

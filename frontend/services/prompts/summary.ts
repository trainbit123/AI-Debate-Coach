export interface SummaryParams {
  topic: string;
  userPosition: "FOR" | "AGAINST";
  aiPosition: "FOR" | "AGAINST";
  rounds: Array<{ round: number; userArgument: string; aiRebuttal: string }>;
  overallScore?: number;
}

export function buildSummaryPrompt(params: SummaryParams): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are a debate coach writing a concise post-match executive brief and personalized training roadmap.

Format your output strictly as a JSON object:
{
  "executiveSummary": "A crisp, 3-4 sentence narrative summary of the debate clash, key contentions, and turning points...",
  "decisiveMoment": "The single most pivotal exchange where the round was won or conceded...",
  "topRecommendations": [
    "Specific tactical recommendation 1...",
    "Specific tactical recommendation 2...",
    "Specific tactical recommendation 3..."
  ]
}
Output ONLY valid JSON.`;

  const transcript = params.rounds
    .map(
      (r) =>
        `Round ${r.round}:\nUser: ${r.userArgument}\nAI: ${r.aiRebuttal}`
    )
    .join("\n\n");

  const userPrompt = `Motion: "${params.topic}"
User (${params.userPosition}) vs AI (${params.aiPosition})
${params.overallScore ? `Final Score: ${params.overallScore}/100\n` : ""}
Debate Rounds:
${transcript}

Generate the executive summary and recommendations in JSON format:`;

  return { systemPrompt, userPrompt };
}

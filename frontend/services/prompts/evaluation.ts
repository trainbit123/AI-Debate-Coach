export interface EvaluationParams {
  topic: string;
  userPosition: "FOR" | "AGAINST";
  difficulty: string;
  transcriptRounds: Array<{ round: number; userArgument: string; aiRebuttal: string }>;
}

export function buildEvaluationPrompt(params: EvaluationParams): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are a certified Oxford Union Debate Adjudicator.
Evaluate the debater's performance across the entire match using the standard 5-metric rubric (each scored 0-100):
1. logic (weight 25%): Syllogistic validity, absence of non-sequiturs.
2. evidence (weight 20%): Quality of facts, statistics, citations.
3. relevance (weight 20%): Adherence to the core motion.
4. clarity (weight 15%): Articulation, signposting, structure.
5. rebuttal (weight 20%): Direct deconstruction of opposing points.

Output ONLY a JSON object:
{
  "scores": {
    "logic": 82,
    "evidence": 75,
    "relevance": 90,
    "clarity": 85,
    "rebuttal": 78
  },
  "overallScore": 81,
  "verdict": "USER_WON" | "AI_WON" | "DRAW",
  "strongestPoint": "Quote or summary of their most compelling argument...",
  "weakestPoint": "Point where their reasoning fell short or lacked evidence...",
  "coachFeedback": "2-3 sentences of encouraging, constructive advice for tournament improvement..."
}`;

  const transcriptText = params.transcriptRounds
    .map(
      (r) =>
        `Round ${r.round}:\n- User (${params.userPosition}): ${r.userArgument}\n- AI Opponent: ${r.aiRebuttal}`
    )
    .join("\n\n");

  const userPrompt = `Debate Motion: "${params.topic}"
Difficulty Level: ${params.difficulty}

Complete Transcript:
${transcriptText}

Generate the adjudicator scoring breakdown in JSON:`;

  return { systemPrompt, userPrompt };
}

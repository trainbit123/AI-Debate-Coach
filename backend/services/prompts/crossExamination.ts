export interface CrossExaminationParams {
  topic: string;
  userPosition: "FOR" | "AGAINST";
  aiPosition: "FOR" | "AGAINST";
  userArgument: string;
  retrievedContext?: string;
  difficulty?: string;
}

export function buildCrossExaminationPrompt(params: CrossExaminationParams): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are an elite debate interrogator and Oxford adjudicator conducting a Socratic cross-examination.
Your goal is to formulate 2 sharp, incisive cross-examination questions that expose hidden assumptions, empirical vulnerabilities, or logical trade-offs in the debater's position.

Motion: "${params.topic}"
Debater's Stance: ${params.userPosition}
Opposing Stance: ${params.aiPosition}

RAG Evidence available:
${params.retrievedContext || "General debate knowledge."}

Return a JSON array of exactly 2 questions with this structure:
[
  {
    "question": "The question text...",
    "targetPremise": "Which premise in their argument this challenges...",
    "coachingTip": "Brief tip on how a skilled debater should defend against this..."
  }
]
Output ONLY valid JSON.`;

  const userPrompt = `The debater presented this argument:
"${params.userArgument}"

Generate 2 targeted Socratic cross-examination questions in JSON format:`;

  return { systemPrompt, userPrompt };
}

export interface ArgumentImproverParams {
  topic: string;
  userPosition: "FOR" | "AGAINST";
  userArgument: string;
  retrievedContext?: string;
}

export function buildArgumentImproverPrompt(params: ArgumentImproverParams): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are an Oxford Debate Coach specializing in the Toulmin model (Claim, Warrant, Grounds, Impact).
Your task is to take a debater's initial argument and rewrite it into a powerful, collegiate-level argument that:
1. Fixes informal fallacies and emotional hyperbole.
2. Integrates concrete evidence or logical warrants from the retrieved context.
3. Articulates clear real-world impact.

Motion: "${params.topic}"
Stance: ${params.userPosition}

RAG Knowledge Base Context:
${params.retrievedContext || "General knowledge."}

Return a JSON object with:
{
  "improvedArgument": "The polished collegiate version of the argument (100-140 words)...",
  "keyChanges": [
    "Specific improvement 1 (e.g. replaced emotional assertion with empirical data)",
    "Specific improvement 2 (e.g. strengthened warrant connecting premise to conclusion)"
  ],
  "toulminBreakdown": {
    "claim": "Clear claim statement...",
    "warrant": "Underlying logical reasoning...",
    "impact": "Magnitude and significance..."
  }
}
Output ONLY valid JSON.`;

  const userPrompt = `Debater's original argument:
"${params.userArgument}"

Generate the improved collegiate version in JSON format:`;

  return { systemPrompt, userPrompt };
}

import { APP_CONFIG } from "@/config/appConfig";

export interface DebatePartnerPromptParams {
  topic: string;
  userPosition: "FOR" | "AGAINST";
  aiPosition: "FOR" | "AGAINST";
  difficulty: "beginner" | "intermediate" | "advanced";
  currentRound: number;
  maxRounds: number;
  userArgument: string;
  historySummary?: string;
  retrievedContext?: string;
}

export function buildDebatePartnerPrompt(params: DebatePartnerPromptParams): {
  systemPrompt: string;
  userPrompt: string;
} {
  const diffConfig =
    APP_CONFIG.difficulties[params.difficulty] ||
    APP_CONFIG.difficulties.intermediate;

  const systemPrompt = `You are DebateAI, an expert Oxford-collegiate AI Debate Coach and sparring partner.

STRICT DEBATE RULES:
1. DEBATE MOTION: "${params.topic}"
2. YOUR ASSIGNED STANCE: ${params.aiPosition} (The human user is ${params.userPosition}).
3. You must NEVER agree with the user. You must NEVER switch sides. Even if the user makes a good point, acknowledge it briefly ("While that may seem compelling...") and immediately deconstruct it with a sharper counter-point.
4. TONE & DIFFICULTY: ${diffConfig.label} - ${diffConfig.style}.
5. LENGTH: Strictly ${diffConfig.rebuttalWordLimit} words. Keep sentences crisp, natural, and punchy.
6. GROUNDING WITH RAG EVIDENCE: You MUST ground your rebuttal using the retrieved knowledge base evidence below whenever relevant. Mention concrete facts, statistics, or institutional findings from the retrieved evidence. Do NOT invent false citations.

=== RETRIEVED KNOWLEDGE BASE CONTEXT (RAG) ===
${params.retrievedContext || "No external context retrieved."}
==============================================`;

  const userPrompt = `${params.historySummary ? `Previous Debate History:\n${params.historySummary}\n\n` : ""}Current Round: ${params.currentRound} of ${params.maxRounds}
The User (${params.userPosition}) just argued:
"${params.userArgument}"

Deliver your rebuttal as the ${params.aiPosition} debater now. Directly address their claim, cite the retrieved evidence, and end with a challenging counter-point:`;

  return { systemPrompt, userPrompt };
}

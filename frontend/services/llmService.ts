import {
  ArgumentScore,
  DetectedFallacy,
  Difficulty,
  FinalReport,
  Position,
  CrossExaminationQuestion,
  ImprovedArgumentResponse,
  CounterargumentItem,
} from "@/lib/types/debate";
import { detectFallaciesHeuristic } from "./fallacyDetector";
import { calculateArgumentScore } from "./scoringService";
import { retrieveKnowledge } from "./rag/ragService";
import { generateResponse, generateJSON } from "./llm/llmService";
import {
  buildDebatePartnerPrompt,
  buildCrossExaminationPrompt,
  buildArgumentImproverPrompt,
  buildCounterargumentsPrompt,
  buildEvaluationPrompt,
  buildSummaryPrompt,
} from "./prompts";
import { APP_CONFIG } from "@/config/appConfig";

export interface AIAnalysisOutput {
  counterargument: string;
  follow_up_question: string;
  scores: {
    logic: number;
    evidence: number;
    relevance: number;
    clarity: number;
    rebuttal: number;
    overall: number;
  };
  fallacies: DetectedFallacy[];
  strength: string;
  weakness: string;
  coach_feedback: string;
  ragContext?: {
    matchedChunks: Array<{
      chunkId: string;
      docTitle: string;
      category: string;
      content: string;
      citations: string[];
      relevanceScore?: number;
    }>;
    durationMs: number;
  };
}

export interface TurnContext {
  topic: string;
  userPosition: Position;
  aiPosition: Position;
  difficulty: Difficulty;
  roundNumber: number;
  maxRounds: number;
  history: {
    roundNumber: number;
    userArgument: string;
    aiCounterargument: string;
  }[];
  userArgument: string;
}

/**
 * 1. Process Turn with Real RAG + LLM Grounding
 */
export async function processTurnWithAI(context: TurnContext): Promise<AIAnalysisOutput> {
  const { topic, userPosition, aiPosition, difficulty, roundNumber, maxRounds, history, userArgument } = context;

  // A. Execute Real RAG Retrieval
  const ragResult = retrieveKnowledge(userArgument, {
    topK: 3,
  });

  // B. Fallacy Detection
  const fallacies = detectFallaciesHeuristic(userArgument);

  // C. Calculate Rule-Based Baseline Scores
  const baseScore = calculateArgumentScore({
    userArgument,
    topic,
    fallacies,
    difficulty,
    roundNumber,
    previousAiCounterargument: history[history.length - 1]?.aiCounterargument,
  });

  // D. Build Grounded Prompt with Injected RAG Context
  const historySummary = history
    .map((h) => `Round ${h.roundNumber}: User said "${h.userArgument.slice(0, 100)}..." -> AI replied "${h.aiCounterargument.slice(0, 100)}..."`)
    .join("\n");

  const { systemPrompt, userPrompt } = buildDebatePartnerPrompt({
    topic,
    userPosition,
    aiPosition,
    difficulty,
    currentRound: roundNumber,
    maxRounds,
    userArgument,
    historySummary,
    retrievedContext: ragResult.formattedContext,
  });

  // E. Call LLM Service
  const llmResponse = await generateResponse({
    systemPrompt,
    userPrompt,
    temperature: 0.65,
    maxTokens: 500,
  });

  // F. Generate Follow-up Socratic Question
  let followUpQuestion = "What verifiable evidence supports your central contention against our counter-point?";
  if (difficulty !== "beginner") {
    try {
      const qPrompt = buildCrossExaminationPrompt({
        topic,
        userPosition,
        aiPosition,
        userArgument,
        retrievedContext: ragResult.formattedContext,
      });
      const qRes = await generateJSON<CrossExaminationQuestion[]>(qPrompt, []);
      if (qRes.data && qRes.data[0]?.question) {
        followUpQuestion = qRes.data[0].question;
      }
    } catch {
      // Keep baseline question
    }
  }

  return {
    counterargument: llmResponse.text,
    follow_up_question: followUpQuestion,
    scores: {
      logic: baseScore.logic,
      evidence: baseScore.evidence,
      relevance: baseScore.relevance,
      clarity: baseScore.clarity,
      rebuttal: baseScore.counterargumentHandling,
      overall: baseScore.overall,
    },
    fallacies,
    strength: baseScore.strongestPoint,
    weakness: baseScore.weakestPoint,
    coach_feedback: baseScore.coachFeedback || "Articulate clear empirical citations to elevate your warrant.",
    ragContext: {
      matchedChunks: ragResult.matchedChunks,
      durationMs: ragResult.durationMs,
    },
  };
}

/**
 * 2. Generate Opening Statement with RAG Grounding
 */
export async function generateOpeningStatement(
  topic: string,
  aiPosition: Position,
  difficulty: Difficulty
): Promise<string> {
  const ragResult = retrieveKnowledge(topic, { topK: 2 });
  const diffConfig = APP_CONFIG.difficulties[difficulty] || APP_CONFIG.difficulties.intermediate;

  const systemPrompt = `You are an Oxford-level collegiate debater.
Generate a compelling, high-impact Opening Statement representing the ${aiPosition} stance on the motion: "${topic}".
Style: ${diffConfig.style}.
Length: Strictly 50-80 words. Punchy, clear, and spoken-friendly.
Ground your statement with the retrieved evidence below:

=== RETRIEVED KNOWLEDGE (RAG) ===
${ragResult.formattedContext}
=================================`;

  const userPrompt = `Deliver your opening speech for the ${aiPosition} position now:`;

  const res = await generateResponse({
    systemPrompt,
    userPrompt,
    temperature: 0.7,
    maxTokens: 250,
  });

  return res.text;
}

/**
 * 3. GenAI Feature: Socratic Cross-Examination Generator
 */
export async function generateCrossExaminationQuestions(
  topic: string,
  userPosition: Position,
  aiPosition: Position,
  userArgument: string
): Promise<CrossExaminationQuestion[]> {
  const ragResult = retrieveKnowledge(userArgument, { topK: 2 });
  const { systemPrompt, userPrompt } = buildCrossExaminationPrompt({
    topic,
    userPosition,
    aiPosition,
    userArgument,
    retrievedContext: ragResult.formattedContext,
  });

  const fallback: CrossExaminationQuestion[] = [
    {
      question: "How do you reconcile the administrative costs of this proposal with its economic trade-offs?",
      targetPremise: "Assumption of frictionless implementation.",
      coachingTip: "Acknowledge implementation friction and specify phased rollout metrics.",
    },
    {
      question: "What safeguards exist to prevent unintended secondary consequences on vulnerable stakeholders?",
      targetPremise: "Presumption that policy intent equals actual outcome.",
      coachingTip: "Cite empirical guardrails or independent auditing provisions.",
    },
  ];

  const res = await generateJSON<CrossExaminationQuestion[]>(
    { systemPrompt, userPrompt, temperature: 0.5 },
    fallback
  );

  return res.data;
}

/**
 * 4. GenAI Feature: Argument Improver & Rewriter
 */
export async function generateArgumentImprovement(
  topic: string,
  userPosition: Position,
  userArgument: string
): Promise<ImprovedArgumentResponse> {
  const ragResult = retrieveKnowledge(userArgument, { topK: 2 });
  const { systemPrompt, userPrompt } = buildArgumentImproverPrompt({
    topic,
    userPosition,
    userArgument,
    retrievedContext: ragResult.formattedContext,
  });

  const fallback: ImprovedArgumentResponse = {
    improvedArgument: `While the proposition accurately highlights core societal stakes, framing it with empirical rigor elevates its persuasive impact. Integrating verifiable benchmarks and structured warrants ensures the claim stands up to collegiate scrutiny.`,
    keyChanges: [
      "Eliminated emotional assertions in favor of structured causality.",
      "Introduced an explicit Toulmin warrant connecting data to claim.",
    ],
    toulminBreakdown: {
      claim: "Strategic policy guardrails are essential.",
      warrant: "Without verifiable benchmarks, systemic externalities remain unmitigated.",
      impact: "Maximizes public benefit while minimizing market disruption.",
    },
  };

  const res = await generateJSON<ImprovedArgumentResponse>(
    { systemPrompt, userPrompt, temperature: 0.4 },
    fallback
  );

  return res.data;
}

/**
 * 5. GenAI Feature: Counterargument Generator
 */
export async function generateCounterarguments(
  topic: string,
  opponentPosition: Position,
  userArgument: string
): Promise<CounterargumentItem[]> {
  const ragResult = retrieveKnowledge(userArgument, { topK: 2 });
  const { systemPrompt, userPrompt } = buildCounterargumentsPrompt({
    topic,
    opponentPosition,
    userArgument,
    retrievedContext: ragResult.formattedContext,
  });

  const fallback: CounterargumentItem[] = [
    {
      angle: "Economic Feasibility",
      argument: "The capital outlay and administrative overhead required outweigh the marginal public benefit.",
      evidenceCited: "Economic benchmark studies on cost-benefit ratios.",
    },
    {
      angle: "Unintended Consequences",
      argument: "Imposing heavy restrictions inadvertently drives activity into unregulated black-market alternatives.",
      evidenceCited: "Historical regulatory displacement patterns.",
    },
    {
      angle: "Innovation Chilling Effect",
      argument: "Preemptive statutory limits stifle emerging technological breakthroughs before maturity.",
      evidenceCited: "National innovation and patent spillover indices.",
    },
  ];

  const res = await generateJSON<CounterargumentItem[]>(
    { systemPrompt, userPrompt, temperature: 0.5 },
    fallback
  );

  return res.data;
}

/**
 * 6. Judicial Evaluation & Final Report
 */
export async function generateFinalReport(
  topic: string,
  userPosition: Position,
  difficulty: Difficulty,
  rounds: {
    roundNumber: number;
    userArgument: string;
    aiCounterargument: string;
    score: ArgumentScore;
    fallacies: DetectedFallacy[];
  }[]
): Promise<FinalReport> {
  if (rounds.length === 0) {
    return {
      overallScore: 50,
      logicScore: 50,
      evidenceScore: 50,
      relevanceScore: 50,
      clarityScore: 50,
      rebuttalScore: 50,
      totalFallacies: 0,
      fallacyBreakdown: {},
      detectedFallacyList: [],
      strongestArgument: "Debate was concluded before formal rounds.",
      weakestArgument: "No arguments logged.",
      coachAdvice: ["Complete at least 1 full debate round to receive comprehensive scoring."],
      verdictTitle: "Inconclusive Match",
      verdictSummary: "Debate was concluded prematurely.",
      ruling: "Draw / Tie",
    };
  }

  // Calculate average scores across rounds
  const avgLogic = Math.round(rounds.reduce((acc, r) => acc + r.score.logic, 0) / rounds.length);
  const avgEvidence = Math.round(rounds.reduce((acc, r) => acc + r.score.evidence, 0) / rounds.length);
  const avgRelevance = Math.round(rounds.reduce((acc, r) => acc + r.score.relevance, 0) / rounds.length);
  const avgClarity = Math.round(rounds.reduce((acc, r) => acc + r.score.clarity, 0) / rounds.length);
  const avgRebuttal = Math.round(rounds.reduce((acc, r) => acc + r.score.counterargumentHandling, 0) / rounds.length);

  const weightedOverall = Math.round(
    avgLogic * 0.25 + avgEvidence * 0.2 + avgRelevance * 0.2 + avgClarity * 0.15 + avgRebuttal * 0.2
  );

  // Collate all fallacies
  const allFallacies = rounds.flatMap((r) => r.fallacies);
  const fallacyBreakdown: { [key: string]: number } = {};
  for (const f of allFallacies) {
    fallacyBreakdown[f.name] = (fallacyBreakdown[f.name] || 0) + 1;
  }

  // Determine ruling
  let ruling: "User Won" | "AI Opponent Won" | "Draw / Tie" = "Draw / Tie";
  let verdictTitle = "Deadlock / Contested Decision";
  let verdictSummary = "Both debaters demonstrated compelling rhetoric with balanced impact clashes.";

  if (weightedOverall >= 75) {
    ruling = "User Won";
    verdictTitle = "Decisive User Victory";
    verdictSummary = "The user demonstrated superior empirical grounding and logically sound rebuttals that dismantled the opponent's case.";
  } else if (weightedOverall < 65) {
    ruling = "AI Opponent Won";
    verdictTitle = "AI Opponent Victory";
    verdictSummary = "The AI opponent successfully exposed vulnerabilities in the user's warrants and held the stronger empirical ground.";
  }

  // Generate executive summary via LLM if available
  let coachAdvice = [
    "Ground every central premise with verifiable empirical statistics.",
    "Address the opponent's counter-claims directly before introducing new arguments.",
    "Structure arguments using Toulmin warrants (Claim -> Grounds -> Warrant -> Impact).",
  ];

  try {
    const summaryPrompt = buildSummaryPrompt({
      topic,
      userPosition,
      aiPosition: userPosition === "FOR" ? "AGAINST" : "FOR",
      rounds: rounds.map((r) => ({
        round: r.roundNumber,
        userArgument: r.userArgument,
        aiRebuttal: r.aiCounterargument,
      })),
      overallScore: weightedOverall,
    });

    const summaryRes = await generateJSON<{
      executiveSummary: string;
      decisiveMoment: string;
      topRecommendations: string[];
    }>(summaryPrompt, {
      executiveSummary: verdictSummary,
      decisiveMoment: "The key turning point occurred when contrasting empirical evidence was introduced.",
      topRecommendations: coachAdvice,
    });

    if (summaryRes.data.executiveSummary) {
      verdictSummary = summaryRes.data.executiveSummary;
    }
    if (summaryRes.data.topRecommendations?.length > 0) {
      coachAdvice = summaryRes.data.topRecommendations;
    }
  } catch {
    // Keep baseline advice
  }

  const strongestArgument = rounds.reduce((best, cur) => (cur.score.overall > best.score.overall ? cur : best)).userArgument;
  const weakestArgument = rounds.reduce((worst, cur) => (cur.score.overall < worst.score.overall ? cur : worst)).userArgument;

  return {
    overallScore: weightedOverall,
    logicScore: avgLogic,
    evidenceScore: avgEvidence,
    relevanceScore: avgRelevance,
    clarityScore: avgClarity,
    rebuttalScore: avgRebuttal,
    totalFallacies: allFallacies.length,
    fallacyBreakdown: fallacyBreakdown as any,
    detectedFallacyList: allFallacies,
    strongestArgument,
    weakestArgument,
    coachAdvice,
    verdictTitle,
    verdictSummary,
    ruling,
  };
}

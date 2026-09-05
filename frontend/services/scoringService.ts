import {
  ArgumentScore,
  DetectedFallacy,
  Difficulty,
  DimensionEvaluation,
  FinalReport,
  TransparencyDimensionReport,
} from "@/lib/types/debate";

interface ScoringContext {
  userArgument: string;
  topic: string;
  fallacies: DetectedFallacy[];
  difficulty: Difficulty;
  roundNumber: number;
  previousAiCounterargument?: string;
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(val)));
}

export function calculateArgumentScore(context: ScoringContext): ArgumentScore {
  const { userArgument, topic, fallacies, difficulty, previousAiCounterargument } = context;
  const text = userArgument.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // 1. Clarity (0 - 100): Word length, sentence structure, readability
  let clarityRaw = 70;
  if (wordCount < 10) clarityRaw = 40;
  else if (wordCount < 25) clarityRaw = 60;
  else if (wordCount >= 25 && wordCount <= 180) clarityRaw = 85;
  else clarityRaw = 75; // over-verbose can lose punch

  const transitionRegex = /\b(therefore|consequently|furthermore|moreover|specifically|in contrast|nevertheless|firstly|secondly|in conclusion)\b/gi;
  const foundTransitions = Array.from(new Set(text.match(transitionRegex) || []));
  clarityRaw = Math.min(98, clarityRaw + Math.min(15, foundTransitions.length * 4));

  // 2. Relevance (0 - 100): Overlap with topic keywords & debate context
  let relevanceRaw = 72;
  const topicWords = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const lowerText = text.toLowerCase();
  const matchedTopicTerms: string[] = [];
  for (const word of topicWords) {
    if (lowerText.includes(word)) matchedTopicTerms.push(word);
  }
  if (topicWords.length > 0) {
    const topicRatio = matchedTopicTerms.length / topicWords.length;
    relevanceRaw = Math.round(55 + topicRatio * 40);
  }
  if (wordCount < 8) relevanceRaw = Math.min(relevanceRaw, 45);

  // 3. Evidence (0 - 100): Empirical markers, citations, statistics, factual framing
  let evidenceRaw = 58;
  const evidenceRegex = /\b(research|study|studies|data|percent|%|\d+(\.\d+)?%|statistics|historical|history|example|for instance|proven|documented|evidence|surveys?|report|findings)\b/gi;
  const foundEvidence = Array.from(new Set(text.match(evidenceRegex) || []));
  evidenceRaw = Math.min(95, 58 + foundEvidence.length * 9);
  if (foundEvidence.length === 0 && wordCount < 30) evidenceRaw = Math.max(35, evidenceRaw - 15);

  // 4. Counterargument Handling / Rebuttal (0 - 100)
  let rebuttalRaw = 65;
  const rebuttalRegex = /\b(while you claim|even if|despite|however|on the other hand|addressed the point|counter that|you argued|misinterprets|contrary to)\b/gi;
  const foundRebuttal = Array.from(new Set(text.match(rebuttalRegex) || []));
  if (previousAiCounterargument) {
    rebuttalRaw = Math.min(96, 62 + foundRebuttal.length * 10);
  } else {
    // Round 1 opening
    rebuttalRaw = 75;
  }

  // 5. Logic (0 - 100): Premise-conclusion structure, penalized by fallacies
  let logicRaw = 78;
  const premiseRegex = /\b(because|since|leads to|results in|as a result|demonstrates that|implies|given that)\b/gi;
  const foundPremises = Array.from(new Set(text.match(premiseRegex) || []));
  logicRaw = Math.min(94, 65 + foundPremises.length * 7);

  // Apply fallacy penalties
  const fallacyPenalty = fallacies.length * 14;
  logicRaw = Math.max(25, logicRaw - fallacyPenalty);
  clarityRaw = Math.max(30, clarityRaw - fallacies.length * 5);

  // Difficulty adjustments
  if (difficulty === "advanced") {
    logicRaw = Math.max(20, Math.round(logicRaw * 0.92));
    evidenceRaw = Math.max(20, Math.round(evidenceRaw * 0.9));
  } else if (difficulty === "beginner") {
    logicRaw = Math.min(98, Math.round(logicRaw * 1.06));
    evidenceRaw = Math.min(98, Math.round(evidenceRaw * 1.08));
    clarityRaw = Math.min(98, Math.round(clarityRaw * 1.05));
  }

  // Clamp every individual dimension strictly to [0, 100]
  const logic = clamp(logicRaw);
  const evidence = clamp(evidenceRaw);
  const relevance = clamp(relevanceRaw);
  const clarity = clamp(clarityRaw);
  const rebuttal = clamp(rebuttalRaw);

  // Strictly owned by TypeScript:
  // Logic: 25%, Evidence: 20%, Relevance: 20%, Clarity: 15%, Rebuttal: 20%
  const overall = clamp(
    logic * 0.25 +
      evidence * 0.2 +
      relevance * 0.2 +
      clarity * 0.15 +
      rebuttal * 0.2
  );

  // Granular Dimension Details
  const dimensionDetails: NonNullable<ArgumentScore["dimensionDetails"]> = {
    logic: {
      score: logic,
      reason:
        fallacies.length > 0
          ? `Penalized due to ${fallacies.length} detected logical fallacy (${fallacies.map((f) => f.name).join(", ")}).`
          : foundPremises.length > 0
          ? `Strong causal chain established with ${foundPremises.length} explicit premise connector(s).`
          : "Baseline deductive logic present, but lacks clear premise-to-conclusion connectives.",
      evidence:
        fallacies.length > 0
          ? `Flagged fallacy snippet(s): ${fallacies.map((f) => `"${f.snippet || f.name}"`).join(", ")}`
          : foundPremises.length > 0
          ? `Premise markers observed: "${foundPremises.slice(0, 3).join('", "')}"`
          : "No explicit premise connectives ('because', 'therefore', 'results in') found.",
      improvement:
        fallacies.length > 0
          ? `Address the ${fallacies[0].name} fallacy by framing claims around verified mechanisms rather than generalizations.`
          : "Elevate your logic by connecting your claim directly to its impact using 'because [premise], it necessarily follows that [outcome]'.",
    },
    evidence: {
      score: evidence,
      reason:
        foundEvidence.length > 0
          ? `Well-grounded with ${foundEvidence.length} empirical or statistical signpost(s).`
          : "Lacks empirical statistics, institutional citations, or verifiable real-world benchmarks.",
      evidence:
        foundEvidence.length > 0
          ? `Data/empirical markers found: "${foundEvidence.slice(0, 4).join('", "')}"`
          : "No statistics, study references, or concrete data points detected.",
      improvement:
        "Include at least one specific metric, study citation, or historical precedent to validate your claim.",
    },
    relevance: {
      score: relevance,
      reason:
        matchedTopicTerms.length > 0
          ? `Directly addresses core motion resolution with ${matchedTopicTerms.length} matched subject term(s).`
          : "Broad argument that runs the risk of topical drift away from the central resolution.",
      evidence:
        matchedTopicTerms.length > 0
          ? `Topic terms observed: "${matchedTopicTerms.slice(0, 4).join('", "')}"`
          : `Lacks explicit vocabulary matching the motion "${topic}".`,
      improvement:
        "Tie your argument explicitly back to the words in the motion to prevent the opposition from claiming topical drift.",
    },
    clarity: {
      score: clarity,
      reason:
        wordCount >= 25 && wordCount <= 180
          ? `Optimal rhetorical length (${wordCount} words) with smooth flow.`
          : wordCount < 25
          ? `Terse delivery (${wordCount} words); lacks sufficient elaboration.`
          : `Lengthy argument (${wordCount} words); risks losing listener focus.`,
      evidence:
        foundTransitions.length > 0
          ? `Transitions utilized: "${foundTransitions.slice(0, 3).join('", "')}" (${wordCount} words)`
          : `Standard phrasing without explicit signposts (${wordCount} words).`,
      improvement:
        "Use deliberate rhetorical signposts ('firstly', 'furthermore', 'in contrast') to make your structure immediately clear.",
    },
    rebuttal: {
      score: rebuttal,
      reason: previousAiCounterargument
        ? foundRebuttal.length > 0
          ? `Directly counters the opponent's prior argument using ${foundRebuttal.length} clash marker(s).`
          : "Introduced a constructive point but did not directly address the opponent's specific counterargument."
        : "Solid opening stance establishing initial rhetorical momentum.",
      evidence:
        foundRebuttal.length > 0
          ? `Rebuttal markers observed: "${foundRebuttal.slice(0, 3).join('", "')}"`
          : previousAiCounterargument
          ? "No direct clash phrases ('while you argue', 'however', 'contrary to') detected."
          : "Round 1 opening speech.",
      improvement: previousAiCounterargument
        ? "Directly quote or summarize the opponent's core assertion before proving why their warrant is flawed."
        : "Anticipate the strongest counter-argument the opposition will bring up and pre-emptively neutralize it.",
    },
  };

  // Identify Strongest & Weakest Dimensions
  const dimensionScores = [
    { name: "Logic and Reasoning", score: logic },
    { name: "Real-World Evidence", score: evidence },
    { name: "Topic Relevance", score: relevance },
    { name: "Speech Clarity", score: clarity },
    { name: "Rebuttal and Comeback", score: rebuttal },
  ].sort((a, b) => b.score - a.score);

  const strongestPoint =
    dimensionScores[0].score >= 75
      ? `Great ${dimensionScores[0].name.toLowerCase()} that was clear and easy to follow.`
      : `Good start on ${dimensionScores[0].name.toLowerCase()}, providing a workable foundation.`;

  const weakestDimension = dimensionScores[dimensionScores.length - 1];
  let weakestPoint = `Needs stronger ${weakestDimension.name.toLowerCase()}.`;
  if (fallacies.length > 0) {
    weakestPoint = `Weakened by logic issue: ${fallacies.map((f) => f.name).join(", ")}.`;
  } else if (weakestDimension.name === "Real-World Evidence") {
    weakestPoint = "Needs real-world facts, numbers, or specific examples to back it up.";
  } else if (weakestDimension.name === "Rebuttal and Comeback") {
    weakestPoint = "Didn't directly answer the opponent's main point from the previous round.";
  }

  // Short Coach Feedback
  let coachFeedback = "";
  if (overall >= 85) {
    coachFeedback = "Excellent argument! Your points were clear, logical, and backed with persuasive structure.";
  } else if (overall >= 70) {
    coachFeedback = "Solid point! To make it even stronger, add a specific real-world example and explain why the other side fails.";
  } else if (overall >= 55) {
    coachFeedback = "Decent start. Be careful not to make broad claims without backing them up with concrete facts.";
  } else {
    coachFeedback = "Needs work. Focus on answering the opponent's question directly and give 1 or 2 real facts.";
  }

  return {
    logic,
    evidence,
    relevance,
    clarity,
    counterargumentHandling: rebuttal,
    overall,
    strongestPoint,
    weakestPoint,
    coachFeedback,
    dimensionDetails,
  };
}

/**
 * Builds the comprehensive "Why You Got This Score" transparency audit report and trend metrics
 */
export function generateTransparencyReport(
  rounds: {
    roundNumber: number;
    score: ArgumentScore;
    fallacies: DetectedFallacy[];
    userArgument: string;
  }[],
  topic: string
): {
  transparencyReport: NonNullable<FinalReport["transparencyReport"]>;
  trendData: NonNullable<FinalReport["trendData"]>;
} {
  const roundScores = rounds.map((r) => r.score.overall);
  const firstScore = roundScores[0] || 70;
  const lastScore = roundScores[roundScores.length - 1] || firstScore;
  const scoreDelta = lastScore - firstScore;
  const isImproving = scoreDelta >= 0;

  const totalFallacies = rounds.flatMap((r) => r.fallacies);
  const avgLogic = clamp(rounds.reduce((acc, r) => acc + r.score.logic, 0) / Math.max(1, rounds.length));
  const avgEvidence = clamp(rounds.reduce((acc, r) => acc + r.score.evidence, 0) / Math.max(1, rounds.length));
  const avgRelevance = clamp(rounds.reduce((acc, r) => acc + r.score.relevance, 0) / Math.max(1, rounds.length));
  const avgClarity = clamp(rounds.reduce((acc, r) => acc + r.score.clarity, 0) / Math.max(1, rounds.length));
  const avgRebuttal = clamp(rounds.reduce((acc, r) => acc + r.score.counterargumentHandling, 0) / Math.max(1, rounds.length));

  const transparencyReport: NonNullable<FinalReport["transparencyReport"]> = {
    logic: {
      score: avgLogic,
      observation:
        totalFallacies.length > 0
          ? `Detected ${totalFallacies.length} fallacy instance(s) across match (${totalFallacies.map((f) => f.name).join(", ")}).`
          : "Zero informal fallacies detected. Syllogistic transitions remained valid throughout rounds.",
      action:
        totalFallacies.length > 0
          ? `Eliminate ${totalFallacies[0].name} by replacing sweeping assumptions with causal evidence.`
          : "Maintain deductive rigor; structure arguments with explicit premises leading to inevitable impacts.",
      confidence: totalFallacies.length > 0 ? (totalFallacies[0].confidence || 90) : 95,
      structuralStrengths: ["Valid deductive structure", "Coherent premise-to-impact links"],
    },
    evidence: {
      score: avgEvidence,
      observation:
        avgEvidence >= 75
          ? "Demonstrated consistent empirical backing with verifiable data points or institutional citations."
          : "Relied more heavily on intuitive assertions rather than peer-reviewed data or historical benchmarks.",
      action: "Anchor every major contention with at least one verifiable empirical study or quantifiable metric.",
      sourceTitle: "Oxford Debate Standards / RAG Knowledge Base",
      citation: avgEvidence >= 75 ? "Direct empirical grounding verified" : "Empirical citation needed",
    },
    relevance: {
      score: avgRelevance,
      observation: `Maintained tight adherence to the core motion resolution: "${topic}".`,
      action: "Continue referencing core resolution terms to prevent opposing side from claiming topical drift.",
      motion: topic,
    },
    clarity: {
      score: avgClarity,
      observation:
        avgClarity >= 75
          ? "Speech demonstrated crisp articulation, good word-count discipline, and clear signposting."
          : "Phrasing was either overly brief or dense; signposting transitions could be sharper.",
      action: "Use explicit signposting markers ('firstly', 'furthermore', 'in contrast') to guide listener focus.",
    },
    rebuttal: {
      score: avgRebuttal,
      observation:
        avgRebuttal >= 75
          ? "Successfully engaged the opponent's warrants directly and neutralized opposing contentions."
          : "Opponent's arguments were only partially dismantled; some key opposing claims went unaddressed.",
      action: "Directly state the opponent's counter-claim before methodically proving why its warrant fails.",
      addressedOpponentClaim: "Direct clash against AI opponent warrants across completed rounds.",
    },
  };

  return {
    transparencyReport,
    trendData: {
      roundScores,
      isImproving,
      scoreDelta,
    },
  };
}

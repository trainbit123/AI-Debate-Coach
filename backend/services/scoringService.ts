import { ArgumentScore, DetectedFallacy, Difficulty } from "@/lib/types/debate";

interface ScoringContext {
  userArgument: string;
  topic: string;
  fallacies: DetectedFallacy[];
  difficulty: Difficulty;
  roundNumber: number;
  previousAiCounterargument?: string;
}

export function calculateArgumentScore(context: ScoringContext): ArgumentScore {
  const { userArgument, topic, fallacies, difficulty, previousAiCounterargument } = context;
  const text = userArgument.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // 1. Clarity (0 - 100): Word length, sentence structure, readability
  let clarity = 70;
  if (wordCount < 10) clarity = 40;
  else if (wordCount < 25) clarity = 60;
  else if (wordCount >= 25 && wordCount <= 180) clarity = 85;
  else clarity = 75; // over-verbose can lose punch

  const transitions = /\b(therefore|consequently|furthermore|moreover|specifically|in contrast|nevertheless|firstly|secondly|in conclusion)\b/gi;
  const transitionMatches = (text.match(transitions) || []).length;
  clarity = Math.min(98, clarity + Math.min(15, transitionMatches * 4));

  // 2. Relevance (0 - 100): Overlap with topic keywords & debate context
  let relevance = 72;
  const topicWords = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const lowerText = text.toLowerCase();
  let matchedTopicTerms = 0;
  for (const word of topicWords) {
    if (lowerText.includes(word)) matchedTopicTerms++;
  }
  if (topicWords.length > 0) {
    const topicRatio = matchedTopicTerms / topicWords.length;
    relevance = Math.round(55 + topicRatio * 40);
  }
  if (wordCount < 8) relevance = Math.min(relevance, 45);

  // 3. Evidence (0 - 100): Empirical markers, citations, statistics, factual framing
  let evidence = 58;
  const evidenceMarkers = /\b(research|study|studies|data|percent|%|statistics|historical|history|example|for instance|proven|documented|evidence|surveys?|report|findings)\b/gi;
  const evidenceMatches = (text.match(evidenceMarkers) || []).length;
  evidence = Math.min(95, 58 + evidenceMatches * 9);
  if (evidenceMatches === 0 && wordCount < 30) evidence = Math.max(35, evidence - 15);

  // 4. Counterargument Handling / Rebuttal (0 - 100)
  let rebuttal = 65;
  if (previousAiCounterargument) {
    const rebuttalMarkers = /\b(while you claim|even if|despite|however|on the other hand|addressed the point|counter that|you argued|misinterprets)\b/gi;
    const rebuttalMatches = (text.match(rebuttalMarkers) || []).length;
    rebuttal = Math.min(96, 62 + rebuttalMatches * 10);
  } else {
    // Round 1 opening
    rebuttal = 75;
  }

  // 5. Logic (0 - 100): Premise-conclusion structure, penalized by fallacies
  let logic = 78;
  const premiseMarkers = /\b(because|since|leads to|results in|as a result|demonstrates that|implies|given that)\b/gi;
  const premiseMatches = (text.match(premiseMarkers) || []).length;
  logic = Math.min(94, 65 + premiseMatches * 7);

  // Apply fallacy penalties
  const fallacyPenalty = fallacies.length * 14;
  logic = Math.max(25, logic - fallacyPenalty);
  clarity = Math.max(30, clarity - fallacies.length * 5);

  // Difficulty adjustment:
  // Advanced expects sharper precision and penalizes lack of depth
  if (difficulty === "advanced") {
    logic = Math.max(20, Math.round(logic * 0.92));
    evidence = Math.max(20, Math.round(evidence * 0.9));
  } else if (difficulty === "beginner") {
    logic = Math.min(98, Math.round(logic * 1.06));
    evidence = Math.min(98, Math.round(evidence * 1.08));
    clarity = Math.min(98, Math.round(clarity * 1.05));
  }

  // Calculate Weighted Overall Score
  // Logic: 25%, Evidence: 20%, Relevance: 20%, Clarity: 15%, Rebuttal: 20%
  const overall = Math.round(
    logic * 0.25 +
      evidence * 0.2 +
      relevance * 0.2 +
      clarity * 0.15 +
      rebuttal * 0.2
  );

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
    coachFeedback = "Excellent argument! Your points were clear, logical, and very easy to follow.";
  } else if (overall >= 70) {
    coachFeedback = "Solid point! To make it even stronger, add a specific real-world example and explain why the other side fails.";
  } else if (overall >= 55) {
    coachFeedback = "Decent start. Be careful not to make broad claims without backing them up with facts.";
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
  };
}

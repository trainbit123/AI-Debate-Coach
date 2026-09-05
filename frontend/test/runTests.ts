/**
 * DebateAI Automated Deterministic Test Suite
 * Tests scoring math, RAG retrieval diversity, fallacy detection certainty, and transparency report generation.
 */

import { calculateArgumentScore, generateTransparencyReport } from "../services/scoringService";
import { detectFallaciesHeuristic } from "../services/fallacyDetector";
import { retrieveKnowledge } from "../services/rag/ragService";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

console.log("\n========================================================");
console.log("   DEBATEAI DETERMINISTIC TEST SUITE");
console.log("========================================================\n");

// 1. TEST SCORING FORMULA & MATHEMATICAL OWNERSHIP
console.log("--- 1. Testing Scoring Service & Mathematical Ownership ---");
{
  const mockContext = {
    userArgument: "Because decentralized solar networks reduce transmission line loss by 14%, therefore public investment in microgrids directly lowers household utility burdens as demonstrated in historical municipal studies.",
    topic: "Renewable energy subsidies are essential for economic growth",
    fallacies: [],
    difficulty: "intermediate" as const,
    roundNumber: 2,
    previousAiCounterargument: "While solar infrastructure sounds promising, the capital outlay creates fiscal strain.",
  };

  const score = calculateArgumentScore(mockContext);

  // Check clamping [0, 100]
  assert(score.logic >= 0 && score.logic <= 100, "Logic score within [0, 100]", `Logic: ${score.logic}`);
  assert(score.evidence >= 0 && score.evidence <= 100, "Evidence score within [0, 100]", `Evidence: ${score.evidence}`);
  assert(score.relevance >= 0 && score.relevance <= 100, "Relevance score within [0, 100]", `Relevance: ${score.relevance}`);
  assert(score.clarity >= 0 && score.clarity <= 100, "Clarity score within [0, 100]", `Clarity: ${score.clarity}`);
  assert(score.counterargumentHandling >= 0 && score.counterargumentHandling <= 100, "Rebuttal score within [0, 100]", `Rebuttal: ${score.counterargumentHandling}`);
  assert(score.overall >= 0 && score.overall <= 100, "Overall score within [0, 100]", `Overall: ${score.overall}`);

  // Check exact TypeScript mathematical calculation:
  // Math.round(logic * 0.25 + evidence * 0.20 + relevance * 0.20 + clarity * 0.15 + rebuttal * 0.20)
  const expectedOverall = Math.round(
    score.logic * 0.25 +
    score.evidence * 0.20 +
    score.relevance * 0.20 +
    score.clarity * 0.15 +
    score.counterargumentHandling * 0.20
  );
  assert(score.overall === expectedOverall, "Overall score mathematically matches weighted 5-dimension formula", `Expected ${expectedOverall}, got ${score.overall}`);

  // Check dimensionDetails presence & fields
  assert(!!score.dimensionDetails, "Dimension details populated");
  if (score.dimensionDetails) {
    assert(typeof score.dimensionDetails.logic.score === "number", "Logic dimension evaluation has numeric score");
    assert(score.dimensionDetails.logic.reason.length > 0, "Logic dimension has reason");
    assert(score.dimensionDetails.logic.evidence.length > 0, "Logic dimension has observable evidence");
    assert(score.dimensionDetails.logic.improvement.length > 0, "Logic dimension has actionable improvement directive");
  }

  // Test empty input handling in calculateArgumentScore
  const emptyScore = calculateArgumentScore({
    userArgument: "",
    topic: "Renewable energy subsidies are essential for economic growth",
    fallacies: [],
    difficulty: "intermediate",
    roundNumber: 1,
  });
  assert(
    emptyScore.overall >= 0 && emptyScore.overall <= 100 && !isNaN(emptyScore.overall),
    "Empty argument input safely produces bounded overall score without NaN",
    `Empty overall: ${emptyScore.overall}`
  );
  assert(
    emptyScore.logic >= 0 && emptyScore.evidence >= 0 && emptyScore.clarity >= 0,
    "Empty argument yields non-negative dimension scores"
  );
}

// 2. TEST FALLACY DETECTION WITH CERTAINTY & WHY-IT-QUALIFIES
console.log("\n--- 2. Testing Fallacy Detector (Certainty & Justification) ---");
{
  // Test empty and whitespace input handling
  const emptyFallacies = detectFallaciesHeuristic("");
  assert(emptyFallacies.length === 0, "Empty input to fallacy detector safely yields zero fallacies");

  const whitespaceFallacies = detectFallaciesHeuristic("    \n\t   ");
  assert(whitespaceFallacies.length === 0, "Whitespace-only input to fallacy detector safely yields zero fallacies");

  const adHominemText = "My opponent is an idiot and corrupt shill who has no brain.";
  const adHominemFallacies = detectFallaciesHeuristic(adHominemText);
  assert(adHominemFallacies.length > 0, "Ad Hominem detected");
  const ah = adHominemFallacies.find((f) => f.name === "Ad Hominem");
  assert(!!ah, "Ad Hominem rule matched");
  if (ah) {
    assert((ah.confidence || 0) >= 80, "Ad Hominem confidence >= 80%", `Confidence: ${ah.confidence}`);
    assert(ah.isCertain === true, "Ad Hominem marked as isCertain = true");
    assert(!!ah.whyItQualifies && ah.whyItQualifies.length > 0, "Ad Hominem includes whyItQualifies explanation");
    assert(!!ah.snippet, "Ad Hominem includes flagged snippet");
  }

  const slipperySlopeText = "If we allow this regulation, it will inevitably lead to total collapse of society and the death of civilization.";
  const slopeFallacies = detectFallaciesHeuristic(slipperySlopeText);
  const ss = slopeFallacies.find((f) => f.name === "Slippery Slope");
  assert(!!ss, "Slippery Slope detected");
  if (ss) {
    assert(ss.isCertain === true, "Slippery Slope isCertain = true");
    assert(!!ss.whyItQualifies, "Slippery Slope whyItQualifies present");
  }

  // Clean argument tests (expect zero fallacies)
  const cleanText = "According to peer-reviewed studies by the International Energy Agency, distributed solar reduces peak grid demand by 18 percent.";
  const cleanFallacies = detectFallaciesHeuristic(cleanText);
  assert(cleanFallacies.length === 0, "Clean academic text triggers zero fallacies");

  const cleanPhilText = "Universal healthcare ensures foundational human rights and improves labor productivity across low-income demographics.";
  const cleanPhilFallacies = detectFallaciesHeuristic(cleanPhilText);
  assert(cleanPhilFallacies.length === 0, "Clean philosophical argument triggers zero fallacies");
}

// 3. TEST ADVANCED RAG RETRIEVAL (DIVERSITY & NORMALIZATION)
console.log("\n--- 3. Testing RAG Engine (Diversity, Deduplication & Normalization) ---");
{
  const ragResult = retrieveKnowledge("artificial intelligence governance frontier models autonomous systems", {
    topK: 3,
  });

  assert(ragResult.matchedChunks.length > 0, "RAG retrieved matching knowledge chunks");
  assert(ragResult.matchedChunks.length <= 3, "RAG respected topK constraint");

  // Check document diversity: Titles should be distinct where possible
  const docTitles = ragResult.matchedChunks.map((c) => c.docTitle);
  const uniqueTitles = new Set(docTitles);
  assert(uniqueTitles.size === docTitles.length, "RAG document diversity penalty prevented duplicate chunk titles");

  // Check relevance score normalization [0, 100]
  for (const chunk of ragResult.matchedChunks) {
    const score = chunk.relevanceScore ?? 0;
    assert(score >= 0 && score <= 100, `Chunk "${chunk.docTitle}" score normalized to 0-100`, `Score: ${score}`);
    assert(!!chunk.reasonForRetrieval && chunk.reasonForRetrieval.length > 0, `Chunk "${chunk.docTitle}" has reasonForRetrieval`);
  }

  // Test RAG retrieval when knowledge base has no matching documents
  const zeroMatchRag = retrieveKnowledge("zyxwvutsrqponmlkjihgfedcba nonexistingconcept987654321");
  assert(
    zeroMatchRag.matchedChunks.length === 0,
    "Zero-match RAG query gracefully returns empty array without throwing"
  );
  assert(
    zeroMatchRag.formattedContext === "No direct empirical evidence found in knowledge base.",
    "Zero-match RAG query returns clean empirical fallback message"
  );
  assert(
    typeof zeroMatchRag.durationMs === "number" && zeroMatchRag.durationMs >= 0,
    "Zero-match RAG query records valid duration in ms"
  );
}

// 4. TEST TRANSPARENCY REPORT & TREND DATA GENERATION
console.log("\n--- 4. Testing Transparency Report & Trend Metrics ---");
{
  const mockRounds = [
    {
      roundNumber: 1,
      userArgument: "Renewable energy is critical because historical grid data proves emissions drop.",
      fallacies: [],
      score: calculateArgumentScore({
        userArgument: "Renewable energy is critical because historical grid data proves emissions drop.",
        topic: "Renewable Energy Subsidies",
        fallacies: [],
        difficulty: "intermediate",
        roundNumber: 1,
      }),
    },
    {
      roundNumber: 2,
      userArgument: "While you claim subsidies are expensive, economic studies show tax revenue rises by 22% over 5 years.",
      fallacies: [],
      score: calculateArgumentScore({
        userArgument: "While you claim subsidies are expensive, economic studies show tax revenue rises by 22% over 5 years.",
        topic: "Renewable Energy Subsidies",
        fallacies: [],
        difficulty: "intermediate",
        roundNumber: 2,
        previousAiCounterargument: "Subsidies distort market incentives.",
      }),
    },
  ];

  const { transparencyReport, trendData } = generateTransparencyReport(
    mockRounds,
    "Renewable Energy Subsidies"
  );

  assert(!!transparencyReport.logic, "Transparency report has Logic dimension");
  assert(!!transparencyReport.evidence, "Transparency report has Evidence dimension");
  assert(!!transparencyReport.relevance, "Transparency report has Relevance dimension");
  assert(!!transparencyReport.clarity, "Transparency report has Clarity dimension");
  assert(!!transparencyReport.rebuttal, "Transparency report has Rebuttal dimension");

  assert(trendData.roundScores.length === 2, "Trend data tracks all round scores");
  assert(typeof trendData.scoreDelta === "number", "Trend data calculates scoreDelta");
  assert(typeof trendData.isImproving === "boolean", "Trend data flags isImproving");
}

console.log("\n========================================================");
console.log(`TEST SUMMARY: ${passedTests} passed, ${failedTests} failed out of ${totalTests} total tests`);
console.log("========================================================\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

import {
  ArgumentScore,
  DetectedFallacy,
  Difficulty,
  FinalReport,
  Position,
} from "@/lib/types/debate";
import { detectFallaciesHeuristic } from "./fallacyDetector";
import { calculateArgumentScore } from "./scoringService";

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
 * Validates and sanitizes structured AI response
 */
function validateAndNormalizeResponse(
  raw: any,
  fallbackHeuristic: AIAnalysisOutput
): AIAnalysisOutput {
  if (!raw || typeof raw !== "object") {
    return fallbackHeuristic;
  }

  const scores = {
    logic: Math.min(100, Math.max(0, Number(raw.scores?.logic ?? fallbackHeuristic.scores.logic))),
    evidence: Math.min(100, Math.max(0, Number(raw.scores?.evidence ?? fallbackHeuristic.scores.evidence))),
    relevance: Math.min(100, Math.max(0, Number(raw.scores?.relevance ?? fallbackHeuristic.scores.relevance))),
    clarity: Math.min(100, Math.max(0, Number(raw.scores?.clarity ?? fallbackHeuristic.scores.clarity))),
    rebuttal: Math.min(100, Math.max(0, Number(raw.scores?.rebuttal ?? raw.scores?.counterargumentHandling ?? fallbackHeuristic.scores.rebuttal))),
    overall: 0,
  };

  scores.overall = Math.round(
    scores.logic * 0.25 +
      scores.evidence * 0.2 +
      scores.relevance * 0.2 +
      scores.clarity * 0.15 +
      scores.rebuttal * 0.2
  );

  const counterargument =
    typeof raw.counterargument === "string" && raw.counterargument.trim().length > 20
      ? raw.counterargument.trim()
      : fallbackHeuristic.counterargument;

  const follow_up_question =
    typeof raw.follow_up_question === "string" && raw.follow_up_question.trim().length > 5
      ? raw.follow_up_question.trim()
      : fallbackHeuristic.follow_up_question;

  const fallacies: DetectedFallacy[] = Array.isArray(raw.fallacies)
    ? raw.fallacies.map((f: any) => ({
        name: f.name || "Hasty Generalization",
        description: f.description || "Unsubstantiated logical jump.",
        snippet: f.snippet || "",
        howToImprove: f.howToImprove || "Support claim with empirical evidence.",
      }))
    : fallbackHeuristic.fallacies;

  return {
    counterargument,
    follow_up_question,
    scores,
    fallacies,
    strength: raw.strength || fallbackHeuristic.strength,
    weakness: raw.weakness || fallbackHeuristic.weakness,
    coach_feedback: raw.coach_feedback || fallbackHeuristic.coach_feedback,
  };
}

/**
 * Collegiate Heuristic AI Debater (zero-API key fallback)
 */
export function generateHeuristicTurnResponse(ctx: TurnContext): AIAnalysisOutput {
  const detectedFallacies = detectFallaciesHeuristic(ctx.userArgument);
  const calculatedScore = calculateArgumentScore({
    userArgument: ctx.userArgument,
    topic: ctx.topic,
    fallacies: detectedFallacies,
    difficulty: ctx.difficulty,
    roundNumber: ctx.roundNumber,
    previousAiCounterargument:
      ctx.history.length > 0
        ? ctx.history[ctx.history.length - 1].aiCounterargument
        : undefined,
  });

  const aiStanceLabel = ctx.aiPosition === "FOR" ? "in favor of" : "firmly opposed to";
  const userStanceLabel = ctx.userPosition === "FOR" ? "affirmative" : "negative";

  // Synthesize intelligent counterarguments based on position, topic, and difficulty
  let counterargument = "";
  let followUpQuestion = "";

  const difficultyTones = {
    beginner: {
      intro: `I understand what you're saying about ${ctx.topic}, but let's look at why being ${aiStanceLabel} this topic makes more sense. `,
      substance: `You raised a fair point, but your argument misses the practical problems in real life. When you put this idea into practice, the costs and unexpected headaches often turn out much bigger than the benefits. `,
      conclusion: `That is why taking the opposite side is safer and better for everyday people.`,
      question: `How would you handle the high costs and unexpected problems if your idea was put into practice right now?`,
    },
    intermediate: {
      intro: `You made an interesting point, but your stance on "${ctx.topic}" runs into a few major real-world obstacles. `,
      substance: `First, your point assumes that everything will go smoothly, but it overlooks practical limits like money, rules, and human behavior. Second, past examples show that rushed solutions like this usually create new problems rather than fixing the original issue. `,
      conclusion: `Standing against this proposal remains the safer, more realistic choice.`,
      question: `What real-world facts or examples can you give to prove that your idea will actually help more than it hurts?`,
    },
    advanced: {
      intro: `That is a bold argument, but your stance on "${ctx.topic}" overlooks the biggest practical drawback. `,
      substance: `Your claim sounds good in theory, but in real life, strict rules are hard to enforce, budgets get blown, and everyday people end up bearing the cost. You haven't explained how you would stop those predictable issues from happening. `,
      conclusion: `Until you address those real-world risks, the opposing position remains much stronger.`,
      question: `If real-world evidence shows this plan creates more problems than it solves, what changes would you make?`,
    },
  };

  const tone = difficultyTones[ctx.difficulty] || difficultyTones.intermediate;

  // If user committed fallacies, directly challenge them in the rebuttal
  if (detectedFallacies.length > 0) {
    const primaryFallacy = detectedFallacies[0];
    counterargument = `${tone.intro}Also, you fell into a ${primaryFallacy.name}: ${primaryFallacy.description.toLowerCase()} ${tone.substance}${tone.conclusion}`;
    followUpQuestion = `Can you support your point with real facts instead of ${primaryFallacy.name}?`;
  } else {
    counterargument = `${tone.intro}${tone.substance}${tone.conclusion}`;
    followUpQuestion = tone.question;
  }

  return {
    counterargument,
    follow_up_question: followUpQuestion,
    scores: {
      logic: calculatedScore.logic,
      evidence: calculatedScore.evidence,
      relevance: calculatedScore.relevance,
      clarity: calculatedScore.clarity,
      rebuttal: calculatedScore.counterargumentHandling,
      overall: calculatedScore.overall,
    },
    fallacies: detectedFallacies,
    strength: calculatedScore.strongestPoint,
    weakness: calculatedScore.weakestPoint,
    coach_feedback: calculatedScore.coachFeedback || "Engage deeper with counter-evidence.",
  };
}

/**
 * Generate AI Opening Statement for Round 1
 */
export async function generateOpeningStatement(
  topic: string,
  aiPosition: Position,
  difficulty: Difficulty
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const stanceText = aiPosition === "FOR" ? "IN FAVOR OF" : "FIRMLY AGAINST";

  const promptText = `You are a friendly, persuasive debater speaking to judges and audience at a hackathon.
Topic: "${topic}".
Your Position: You are arguing ${stanceText} this topic.
Difficulty level: ${difficulty}.

CRITICAL RULES FOR SIMPLE ENGLISH:
- USE SIMPLE, CLEAR, EVERYDAY ENGLISH: Speak in natural, everyday words that everyone can understand immediately over audio.
- STRICTLY NO ACADEMIC JARGON: Do not use words like 'epistemological', 'externalities', 'untenable', 'axiomatic', 'conflate', 'proposition', or complex philosophical terms.
- Keep sentences short and punchy (total 65-85 words).
- Speak directly to your opponent with warmth, energy, and clear logic.
Do not use bullet points or markdown formatting. Output plain text speech only.`;

  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 30) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn("Gemini opening statement error, falling back to heuristic:", err);
    }
  }

  // Groq fallback (Free high-speed inference)
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a debate sparring partner in a hackathon. Use simple, clear, everyday English with zero academic jargon.",
            },
            { role: "user", content: promptText },
          ],
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 30) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn("Groq opening statement error:", err);
    }
  }

  // OpenAI fallback
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a debate sparring partner in a hackathon. Use simple, clear, everyday English with zero academic jargon.",
            },
            { role: "user", content: promptText },
          ],
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 30) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn("OpenAI opening statement error:", err);
    }
  }

  // Built-in Simple English Opening Statement (Zero-key fallback)
  if (aiPosition === "FOR") {
    return `Hello and welcome to this debate! I am arguing in favor of our topic: "${topic}". Supporting this idea is the right move because it solves real problems, opens up new opportunities, and directly helps everyday people. While the other side will argue that this is risky or too expensive, the practical benefits clearly outweigh the downsides. I'm excited to hear your points, so let's get started!`;
  } else {
    return `Hello and welcome to this debate! I am firmly arguing against our topic: "${topic}". While this idea might sound good on paper, in the real world it creates serious problems and huge hidden costs. We cannot ignore these practical risks just for a quick fix. I'm ready to hear your best arguments, and I look forward to a great debate. Let's begin!`;
  }
}

/**
 * Main turn processor coordinating LLM APIs with robust Heuristic debater fallback
 */
export async function processTurnWithAI(ctx: TurnContext): Promise<AIAnalysisOutput> {
  const fallback = generateHeuristicTurnResponse(ctx);

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const systemPrompt = `You are DebateAI, a smart, friendly, and persuasive AI debate coach and sparring partner in a live hackathon competition.
DEBATE CONTEXT:
- Topic: "${ctx.topic}"
- User Position: ${ctx.userPosition}
- YOUR MANDATORY OPPOSING POSITION: ${ctx.aiPosition} (You must NEVER agree with or switch to the user's position! You must defend ${ctx.aiPosition} clearly, logically, and persuasively).
- Difficulty: ${ctx.difficulty}
- Current Round: ${ctx.roundNumber} of ${ctx.maxRounds}

CRITICAL RULES FOR LANGUAGE AND TONE:
1. USE SIMPLE, CLEAR, EVERYDAY ENGLISH: Speak in natural, everyday words that hackathon judges and listeners can understand immediately over audio. Keep sentences short and direct (10-18 words).
2. STRICTLY NO ACADEMIC JARGON: NEVER use words like "epistemological", "category error", "conflate", "externalities", "preclude", "axiomatic", "untenable", "dichotomy", "antithetical", etc.
3. SPOKEN REBUTTAL ("counterargument"): 60-90 words. Start with conversational phrasing ("I see your point, but...", "That sounds good on paper, but in real life...", "The big issue here is..."). Point out 1 or 2 practical real-world problems and defend your position with common-sense reasoning.
4. TARGETED FOLLOW-UP QUESTION ("follow_up_question"): One clear, simple question challenging their logic or evidence.
5. SIMPLE COACH FEEDBACK: 1-2 friendly, encouraging sentences in plain English advising them on how to improve.

OUTPUT FORMAT: Return valid JSON ONLY matching this exact structure:
{
  "counterargument": "...",
  "follow_up_question": "...",
  "scores": {
    "logic": 84,
    "evidence": 65,
    "relevance": 91,
    "clarity": 87,
    "rebuttal": 79,
    "overall": 81
  },
  "fallacies": [],
  "strength": "...",
  "weakness": "...",
  "coach_feedback": "..."
}`;

  // Try Gemini
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nUSER'S ARGUMENT IN ROUND ${ctx.roundNumber}:\n"${ctx.userArgument}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.6,
            },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return validateAndNormalizeResponse(parsed, fallback);
        }
      }
    } catch (err) {
      console.warn("Gemini API turn error, falling back:", err);
    }
  }

  // Try Groq (Free high-speed inference)
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `User argument in Round ${ctx.roundNumber}: "${ctx.userArgument}"`,
            },
          ],
          temperature: 0.6,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.choices?.[0]?.message?.content;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return validateAndNormalizeResponse(parsed, fallback);
        }
      }
    } catch (err) {
      console.warn("Groq API turn error, falling back:", err);
    }
  }

  // Try OpenAI
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `User argument in Round ${ctx.roundNumber}: "${ctx.userArgument}"`,
            },
          ],
          temperature: 0.6,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.choices?.[0]?.message?.content;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return validateAndNormalizeResponse(parsed, fallback);
        }
      }
    } catch (err) {
      console.warn("OpenAI API turn error, falling back:", err);
    }
  }

  // Return simple English heuristic debater output
  return fallback;
}

/**
 * Synthesizes comprehensive final report across all rounds
 */
export function generateFinalReport(
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
): FinalReport {
  if (rounds.length === 0) {
    return {
      overallScore: 0,
      logicScore: 0,
      evidenceScore: 0,
      relevanceScore: 0,
      clarityScore: 0,
      rebuttalScore: 0,
      totalFallacies: 0,
      fallacyBreakdown: {},
      detectedFallacyList: [],
      strongestArgument: "None recorded",
      weakestArgument: "None recorded",
      coachAdvice: ["Engage in complete rounds to receive comprehensive feedback."],
      verdictTitle: "Incomplete Debate",
      verdictSummary: "Debate was concluded prematurely.",
      ruling: "Draw / Tie",
    };
  }

  // Calculate averages
  const logicScore = Math.round(
    rounds.reduce((acc, r) => acc + r.score.logic, 0) / rounds.length
  );
  const evidenceScore = Math.round(
    rounds.reduce((acc, r) => acc + r.score.evidence, 0) / rounds.length
  );
  const relevanceScore = Math.round(
    rounds.reduce((acc, r) => acc + r.score.relevance, 0) / rounds.length
  );
  const clarityScore = Math.round(
    rounds.reduce((acc, r) => acc + r.score.clarity, 0) / rounds.length
  );
  const rebuttalScore = Math.round(
    rounds.reduce((acc, r) => acc + r.score.counterargumentHandling, 0) / rounds.length
  );
  const overallScore = Math.round(
    rounds.reduce((acc, r) => acc + r.score.overall, 0) / rounds.length
  );

  // Fallacies collection
  const allFallacies: DetectedFallacy[] = [];
  const fallacyBreakdown: Record<string, number> = {};
  for (const r of rounds) {
    for (const f of r.fallacies) {
      allFallacies.push(f);
      fallacyBreakdown[f.name] = (fallacyBreakdown[f.name] || 0) + 1;
    }
  }

  // Best & worst round
  const sortedRounds = [...rounds].sort((a, b) => b.score.overall - a.score.overall);
  const bestRound = sortedRounds[0];
  const worstRound = sortedRounds[sortedRounds.length - 1];

  // Determine ruling
  // Benchmark threshold based on difficulty:
  // Beginner: >= 65 is win
  // Intermediate: >= 75 is win
  // Advanced: >= 82 is win
  let winThreshold = 75;
  if (difficulty === "beginner") winThreshold = 65;
  if (difficulty === "advanced") winThreshold = 82;

  let ruling: "User Won" | "AI Opponent Won" | "Draw / Tie" = "Draw / Tie";
  let verdictTitle = "";
  let verdictSummary = "";

  if (overallScore >= winThreshold && allFallacies.length <= 1) {
    ruling = "User Won";
    verdictTitle = "Victory! You Won the Debate!";
    verdictSummary = `Great job! You delivered clear arguments, responded directly to counterarguments, and supported your points with solid reasoning across ${rounds.length} round(s). Your score was ${overallScore}/100!`;
  } else if (overallScore < winThreshold - 6 || allFallacies.length >= 3) {
    ruling = "AI Opponent Won";
    verdictTitle = "AI Opponent Won This Debate";
    verdictSummary = `You made some good points, but your argument left open key weaknesses that the AI challenged. Try using more concrete facts and addressing the opposing points directly next time.`;
  } else {
    ruling = "Draw / Tie";
    verdictTitle = "It's a Tie / Draw!";
    verdictSummary = `Both sides delivered strong, convincing points with good reasoning. Neither side gained a decisive edge over ${rounds.length} round(s).`;
  }

  const coachAdvice: string[] = [];
  if (evidenceScore < 70) {
    coachAdvice.push(
      "Add more real-world facts: use specific numbers, real-life examples, or true stories rather than broad statements."
    );
  }
  if (allFallacies.length > 0) {
    coachAdvice.push(
      `Watch out for logic traps: you hit ${allFallacies.length} fallacy warning(s) (${Object.keys(
        fallacyBreakdown
      ).join(", ")}). Stick to direct facts and stay focused on the topic.`
    );
  }
  if (rebuttalScore < 72) {
    coachAdvice.push(
      "Respond directly to the other side: clearly explain why their specific point doesn't work before moving on to your next point."
    );
  }
  if (coachAdvice.length === 0) {
    coachAdvice.push(
      "Great performance! Keep practicing to make your points even sharper, faster, and more persuasive."
    );
  }

  return {
    overallScore,
    logicScore,
    evidenceScore,
    relevanceScore,
    clarityScore,
    rebuttalScore,
    totalFallacies: allFallacies.length,
    fallacyBreakdown: fallacyBreakdown as any,
    detectedFallacyList: allFallacies,
    strongestArgument: bestRound
      ? `Round ${bestRound.roundNumber}: "${bestRound.userArgument.slice(0, 120)}..." (Score: ${bestRound.score.overall}/100)`
      : "N/A",
    weakestArgument: worstRound
      ? `Round ${worstRound.roundNumber}: "${worstRound.userArgument.slice(0, 120)}..." (Score: ${worstRound.score.overall}/100)`
      : "N/A",
    coachAdvice,
    verdictTitle,
    verdictSummary,
    ruling,
  };
}

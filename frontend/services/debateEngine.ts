import {
  DebateSession,
  Difficulty,
  FinalReport,
  Position,
  ProcessTurnResponse,
  RoundData,
} from "@/lib/types/debate";
import {
  generateFinalReport,
  generateOpeningStatement,
  processTurnWithAI,
} from "./llmService";

/**
 * Creates a new debate session with strict opposite AI position
 */
export async function createDebateSession(params: {
  topic: string;
  userPosition: Position;
  difficulty: Difficulty;
  maxRounds: number;
  isEndless?: boolean;
}): Promise<DebateSession> {
  const { topic, userPosition, difficulty, maxRounds, isEndless } = params;

  // Strict rule: AI ALWAYS takes the opposite position
  const aiPosition: Position = userPosition === "FOR" ? "AGAINST" : "FOR";

  const id = `deb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  // Generate AI opening statement for context setting (RAG-grounded)
  const aiOpeningStatement = await generateOpeningStatement(
    topic,
    aiPosition,
    difficulty
  );

  const endlessMode = !!isEndless || maxRounds === 0 || maxRounds >= 999;
  const effectiveMaxRounds = endlessMode ? 999 : Math.max(1, maxRounds);

  const session: DebateSession = {
    id,
    topic: topic.trim(),
    userPosition,
    aiPosition,
    difficulty,
    maxRounds: effectiveMaxRounds,
    currentRound: 1,
    isEndless: endlessMode,
    rounds: [],
    aiOpeningStatement,
    isComplete: false,
    createdAt: now,
    updatedAt: now,
  };

  return session;
}

/**
 * Processes a round turn from user argument with RAG context
 */
export async function executeRoundTurn(
  session: DebateSession,
  userArgument: string
): Promise<{ session: DebateSession; turnResult: ProcessTurnResponse }> {
  const cleanArg = userArgument.trim();
  const roundNumber = session.currentRound;

  // Verify anti-switch: AI position must remain strictly opposite to user position
  const expectedAiPosition: Position =
    session.userPosition === "FOR" ? "AGAINST" : "FOR";
  const aiPosition = expectedAiPosition;

  // Call RAG-grounded AI analysis
  const aiResult = await processTurnWithAI({
    topic: session.topic,
    userPosition: session.userPosition,
    aiPosition,
    difficulty: session.difficulty,
    roundNumber,
    maxRounds: session.maxRounds,
    history: session.rounds.map((r) => ({
      roundNumber: r.roundNumber,
      userArgument: r.userArgument,
      aiCounterargument: r.aiCounterargument,
    })),
    userArgument: cleanArg,
  });

  const roundData: RoundData = {
    roundNumber,
    userArgument: cleanArg,
    aiCounterargument: aiResult.counterargument,
    aiFollowUpQuestion: aiResult.follow_up_question,
    score: {
      logic: aiResult.scores.logic,
      evidence: aiResult.scores.evidence,
      relevance: aiResult.scores.relevance,
      clarity: aiResult.scores.clarity,
      counterargumentHandling: aiResult.scores.rebuttal,
      overall: aiResult.scores.overall,
      strongestPoint: aiResult.strength,
      weakestPoint: aiResult.weakness,
      coachFeedback: aiResult.coach_feedback,
    },
    fallacies: aiResult.fallacies,
    ragContext: aiResult.ragContext,
    timestamp: new Date().toISOString(),
  };

  const updatedRounds = [...session.rounds, roundData];
  const isEndless = session.isEndless || session.maxRounds === 0 || session.maxRounds >= 999;
  const isComplete = !isEndless && roundNumber >= session.maxRounds;

  let finalVerdict: FinalReport | undefined = undefined;
  if (isComplete) {
    finalVerdict = await generateFinalReport(
      session.topic,
      session.userPosition,
      session.difficulty,
      updatedRounds
    );
  }

  const updatedSession: DebateSession = {
    ...session,
    rounds: updatedRounds,
    currentRound: isComplete ? session.maxRounds : roundNumber + 1,
    isComplete,
    finalVerdict,
    updatedAt: new Date().toISOString(),
  };

  const turnResult: ProcessTurnResponse = {
    score: roundData.score,
    fallacies: roundData.fallacies,
    aiCounterargument: roundData.aiCounterargument,
    aiFollowUpQuestion: roundData.aiFollowUpQuestion,
    ragContext: roundData.ragContext,
    isComplete,
    finalVerdict,
  };

  return { session: updatedSession, turnResult };
}

/**
 * Concludes an ongoing debate session on demand, generating final judicial adjudication
 */
export async function concludeDebateSession(session: DebateSession): Promise<DebateSession> {
  const finalVerdict = await generateFinalReport(
    session.topic,
    session.userPosition,
    session.difficulty,
    session.rounds
  );

  return {
    ...session,
    isComplete: true,
    finalVerdict,
    updatedAt: new Date().toISOString(),
  };
}

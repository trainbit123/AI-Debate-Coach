export type Position = "FOR" | "AGAINST";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type FallacyType =
  | "Ad Hominem"
  | "Strawman"
  | "Hasty Generalization"
  | "Slippery Slope"
  | "Appeal to Authority"
  | "False Dilemma"
  | "Circular Reasoning"
  | "Appeal to Emotion"
  | "False Cause";

export interface DetectedFallacy {
  name: FallacyType;
  description: string;
  snippet?: string;
  howToImprove: string;
}

export interface ArgumentScore {
  logic: number; // 0-100
  evidence: number; // 0-100
  relevance: number; // 0-100
  clarity: number; // 0-100
  counterargumentHandling: number; // 0-100 (Rebuttal)
  overall: number; // 0-100
  strongestPoint: string;
  weakestPoint: string;
  coachFeedback?: string;
}

export interface RoundData {
  roundNumber: number;
  userArgument: string;
  aiCounterargument: string;
  aiFollowUpQuestion?: string;
  score: ArgumentScore;
  fallacies: DetectedFallacy[];
  timestamp: string;
}

export interface FinalReport {
  overallScore: number;
  logicScore: number;
  evidenceScore: number;
  relevanceScore: number;
  clarityScore: number;
  rebuttalScore: number;
  totalFallacies: number;
  fallacyBreakdown: { [key in FallacyType]?: number };
  detectedFallacyList: DetectedFallacy[];
  strongestArgument: string;
  weakestArgument: string;
  coachAdvice: string[];
  verdictTitle: string;
  verdictSummary: string;
  ruling: "User Won" | "AI Opponent Won" | "Draw / Tie";
}

export interface DebateSession {
  id: string;
  topic: string;
  userPosition: Position;
  aiPosition: Position;
  difficulty: Difficulty;
  maxRounds: number;
  currentRound: number;
  isEndless?: boolean;
  rounds: RoundData[];
  aiOpeningStatement?: string;
  isComplete: boolean;
  finalVerdict?: FinalReport;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalDebates: number;
  completedDebates: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number; // percentage 0-100
  averageScore: number;
  bestScore: number;
  averageLogic: number;
  averageEvidence: number;
  averageRelevance: number;
  averageClarity: number;
  averageRebuttal: number;
  commonFallacies: { name: FallacyType; count: number }[];
  strongestSkill: string;
  weakestSkill: string;
  recentTrends: { date: string; score: number; topic: string }[];
}

export interface ProcessTurnRequest {
  topic: string;
  userPosition: Position;
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

export interface ProcessTurnResponse {
  score: ArgumentScore;
  fallacies: DetectedFallacy[];
  aiCounterargument: string;
  aiFollowUpQuestion?: string;
  isComplete: boolean;
  finalVerdict?: FinalReport;
}

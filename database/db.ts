import fs from "fs";
import path from "path";
import { DebateSession, FallacyType, UserStats } from "@/lib/types/debate";
import { INITIAL_SEED_DEBATES } from "./seed";

const DB_DIR = path.join(process.cwd(), "database");
const DB_FILE = path.join(DB_DIR, "storage.json");

interface StorageData {
  debates: DebateSession[];
}

function ensureDbFile(): StorageData {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData: StorageData = { debates: INITIAL_SEED_DEBATES };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }

    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data: StorageData = JSON.parse(raw);
    if (!Array.isArray(data.debates)) {
      data.debates = INITIAL_SEED_DEBATES;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    }
    return data;
  } catch (err) {
    console.error("Database initialization error:", err);
    return { debates: INITIAL_SEED_DEBATES };
  }
}

function writeDb(data: StorageData): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("Database write error:", err);
  }
}

export function getAllDebates(filters?: {
  topic?: string;
  position?: string;
  difficulty?: string;
  outcome?: string;
}): DebateSession[] {
  const data = ensureDbFile();
  let debates = [...data.debates];

  if (filters?.topic) {
    const q = filters.topic.toLowerCase();
    debates = debates.filter((d) => d.topic.toLowerCase().includes(q));
  }

  if (filters?.position) {
    debates = debates.filter((d) => d.userPosition === filters.position);
  }

  if (filters?.difficulty) {
    debates = debates.filter((d) => d.difficulty === filters.difficulty);
  }

  if (filters?.outcome && filters.outcome !== "ALL") {
    debates = debates.filter((d) => d.finalVerdict?.ruling === filters.outcome);
  }

  return debates.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getDebateById(id: string): DebateSession | null {
  const data = ensureDbFile();
  return data.debates.find((d) => d.id === id) || null;
}

export function saveDebate(session: DebateSession): DebateSession {
  const data = ensureDbFile();
  const existingIndex = data.debates.findIndex((d) => d.id === session.id);

  session.updatedAt = new Date().toISOString();

  if (existingIndex >= 0) {
    data.debates[existingIndex] = session;
  } else {
    data.debates.unshift(session);
  }

  writeDb(data);
  return session;
}

export function deleteDebate(id: string): boolean {
  const data = ensureDbFile();
  const initialLen = data.debates.length;
  data.debates = data.debates.filter((d) => d.id !== id);
  if (data.debates.length !== initialLen) {
    writeDb(data);
    return true;
  }
  return false;
}

export function getUserStats(): UserStats {
  const data = ensureDbFile();
  const completed = data.debates.filter((d) => d.isComplete && d.finalVerdict);

  const totalDebates = data.debates.length;
  const completedCount = completed.length;

  if (completedCount === 0) {
    return {
      totalDebates,
      completedDebates: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      averageScore: 0,
      bestScore: 0,
      averageLogic: 0,
      averageEvidence: 0,
      averageRelevance: 0,
      averageClarity: 0,
      averageRebuttal: 0,
      commonFallacies: [],
      strongestSkill: "Logical Structure",
      weakestSkill: "Empirical Evidence",
      recentTrends: [],
    };
  }

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalScore = 0;
  let bestScore = 0;
  let totalLogic = 0;
  let totalEvidence = 0;
  let totalRelevance = 0;
  let totalClarity = 0;
  let totalRebuttal = 0;

  const fallacyCounts: Record<string, number> = {};

  for (const d of completed) {
    const v = d.finalVerdict!;
    if (v.ruling === "User Won") wins++;
    else if (v.ruling === "AI Opponent Won") losses++;
    else draws++;

    totalScore += v.overallScore;
    if (v.overallScore > bestScore) bestScore = v.overallScore;

    totalLogic += v.logicScore;
    totalEvidence += v.evidenceScore;
    totalRelevance += v.relevanceScore;
    totalClarity += v.clarityScore;
    totalRebuttal += v.rebuttalScore;

    for (const f of v.detectedFallacyList) {
      fallacyCounts[f.name] = (fallacyCounts[f.name] || 0) + 1;
    }
  }

  const averageScore = Math.round(totalScore / completedCount);
  const averageLogic = Math.round(totalLogic / completedCount);
  const averageEvidence = Math.round(totalEvidence / completedCount);
  const averageRelevance = Math.round(totalRelevance / completedCount);
  const averageClarity = Math.round(totalClarity / completedCount);
  const averageRebuttal = Math.round(totalRebuttal / completedCount);
  const winRate = Math.round((wins / completedCount) * 100);

  const commonFallacies = Object.entries(fallacyCounts)
    .map(([name, count]) => ({ name: name as FallacyType, count }))
    .sort((a, b) => b.count - a.count);

  const skills = [
    { name: "Logical Structure", score: averageLogic },
    { name: "Empirical Evidence", score: averageEvidence },
    { name: "Topical Relevance", score: averageRelevance },
    { name: "Rhetorical Clarity", score: averageClarity },
    { name: "Counterargument Rebuttal", score: averageRebuttal },
  ].sort((a, b) => b.score - a.score);

  const strongestSkill = skills[0]?.name || "Logical Structure";
  const weakestSkill = skills[skills.length - 1]?.name || "Empirical Evidence";

  const recentTrends = completed
    .slice(0, 10)
    .reverse()
    .map((d) => ({
      date: new Date(d.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: d.finalVerdict!.overallScore,
      topic: d.topic.length > 30 ? `${d.topic.slice(0, 30)}...` : d.topic,
    }));

  return {
    totalDebates,
    completedDebates: completedCount,
    wins,
    losses,
    draws,
    winRate,
    averageScore,
    bestScore,
    averageLogic,
    averageEvidence,
    averageRelevance,
    averageClarity,
    averageRebuttal,
    commonFallacies,
    strongestSkill,
    weakestSkill,
    recentTrends,
  };
}

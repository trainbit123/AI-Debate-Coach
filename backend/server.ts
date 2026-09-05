import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createDebateSession, executeRoundTurn, concludeDebateSession } from "./services/debateEngine";
import { getAllDebates, getDebateById, saveDebate, getUserStats } from "./database/db";
import { processVoiceSearch } from "./services/intentService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "DebateAI Express REST API", timestamp: new Date().toISOString() });
});

app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "DebateAI API Server",
    version: "1.0.0",
    docs: "/health",
    routes: [
      "POST /api/debates",
      "GET /api/debates",
      "GET /api/debates/:id",
      "POST /api/debates/:id/turn",
      "POST /api/debates/:id/conclude",
      "GET /api/history",
      "GET /api/progress",
      "POST /api/search/voice"
    ]
  });
});

// Create a new debate
app.post("/api/debates", async (req: Request, res: Response) => {
  try {
    const { topic, userPosition, difficulty, maxRounds, isEndless } = req.body;
    if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
      return res.status(400).json({ error: "Topic must be at least 3 characters long." });
    }
    if (userPosition !== "FOR" && userPosition !== "AGAINST") {
      return res.status(400).json({ error: "Position must be either 'FOR' or 'AGAINST'." });
    }

    const session = await createDebateSession({
      topic: topic.trim(),
      userPosition,
      difficulty: difficulty || "intermediate",
      maxRounds: Number(maxRounds) || 3,
      isEndless: Boolean(isEndless),
    });

    saveDebate(session);
    return res.status(201).json(session);
  } catch (err: any) {
    console.error("Error creating debate:", err);
    return res.status(500).json({ error: err?.message || "Failed to create debate session" });
  }
});

// List debates
app.get("/api/debates", (req: Request, res: Response) => {
  try {
    const topic = typeof req.query.topic === "string" ? req.query.topic : undefined;
    const position = typeof req.query.position === "string" ? req.query.position : undefined;
    const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty : undefined;
    const outcome = typeof req.query.outcome === "string" ? req.query.outcome : undefined;

    const debates = getAllDebates({ topic, position, difficulty, outcome });
    return res.json({ debates });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to list debates" });
  }
});

// Get debate by ID
app.get("/api/debates/:id", (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const session = getDebateById(id);
    if (!session) {
      return res.status(404).json({ error: "Debate session not found" });
    }
    return res.json(session);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to get debate session" });
  }
});

// Execute turn in debate
app.post("/api/debates/:id/turn", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const session = getDebateById(id);
    if (!session) {
      return res.status(404).json({ error: "Debate session not found" });
    }
    if (session.isComplete) {
      return res.status(400).json({ error: "This debate session is already complete." });
    }

    const userArgument = req.body.userArgument;
    if (!userArgument || typeof userArgument !== "string" || userArgument.trim().length < 5) {
      return res.status(400).json({ error: "Please provide a substantive argument of at least 5 characters." });
    }

    const { session: updatedSession, turnResult } = await executeRoundTurn(session, userArgument);
    saveDebate(updatedSession);

    return res.json({ session: updatedSession, turnResult });
  } catch (err: any) {
    console.error("Error processing debate turn:", err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

// Conclude debate
app.post("/api/debates/:id/conclude", (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const session = getDebateById(id);
    if (!session) {
      return res.status(404).json({ error: "Debate session not found" });
    }
    if (session.isComplete) {
      return res.json({ session, finalVerdict: session.finalVerdict });
    }

    const concludedSession = concludeDebateSession(session);
    saveDebate(concludedSession);

    return res.json({ session: concludedSession, finalVerdict: concludedSession.finalVerdict });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

// History endpoint
app.get("/api/history", (_req: Request, res: Response) => {
  try {
    const debates = getAllDebates();
    return res.json({ debates });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to fetch history" });
  }
});

// Progress endpoint
app.get("/api/progress", (_req: Request, res: Response) => {
  try {
    const stats = getUserStats();
    return res.json({ stats });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to fetch progress" });
  }
});

// Voice search endpoint
app.post("/api/search/voice", async (req: Request, res: Response) => {
  try {
    const { query, context } = req.body;
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return res.status(400).json({ error: "Valid search query text is required." });
    }

    const searchResponse = await processVoiceSearch(query.trim(), context);
    return res.json(searchResponse);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Search failed" });
  }
});

app.listen(PORT, () => {
  console.log(`[DebateAI Backend] Express REST server running on http://localhost:${PORT}`);
});

export default app;

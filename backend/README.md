# DebateAI — Backend REST API Service

Dedicated Node.js and Express REST API server providing the scoring rubric, 9-fallacy scanning, stance enforcement, and debate session orchestration.

---

## Features

- **Express Server** (`server.ts`): Fully typed REST API with CORS and JSON parsing.
- **Debate Engine** (`services/debateEngine.ts`): Stance lock, difficulty settings, and round state tracking.
- **Fallacy Scanner** (`services/fallacyDetector.ts`): Detects 9 cognitive fallacies (*Ad Hominem, Strawman, False Dilemma, Slippery Slope, etc.*).
- **Scoring Service** (`services/scoringService.ts`): Computes 5-dimension argument scores (Logic, Evidence, Relevance, Clarity, Rebuttal) and final judicial verdicts.
- **Zero-Key Deterministic Fallback**: Works immediately with zero API keys, with optional Gemini / Groq / OpenAI LLM expansion.
- **Local Persistence** (`database/db.ts`): Portable JSON database storing debate history, win rates, and progress analytics.

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check |
| `GET` | `/` | API route index |
| `POST` | `/api/debates` | Create new debate session |
| `GET` | `/api/debates` | List all historical debates |
| `GET` | `/api/debates/:id` | Retrieve single debate session |
| `POST` | `/api/debates/:id/turn` | Submit speech/typed argument turn & get AI rebuttal |
| `POST` | `/api/debates/:id/conclude` | Conclude debate session & produce verdict |
| `GET` | `/api/history` | List debate transcripts |
| `GET` | `/api/progress` | User win rates, fallacy breakdown, and score stats |
| `POST` | `/api/search/voice` | Voice research assistant and evidence retrieval |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run with live reload
npm run dev

# 3. Or run directly
npm start
```
Server runs on [**http://localhost:5000**](http://localhost:5000).

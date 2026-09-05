# DebateAI — System Architecture

## Overview
**DebateAI** is a full-stack, voice-first AI Debate Coach and competitive sparring platform designed to sharpen user rhetorical reasoning, eliminate logical fallacies, and cultivate collegiate-level persuasion.

---

## High-Level Architecture

```
                                  [ User / Browser ]
                                          |
                +-------------------------+-------------------------+
                |                                                   |
         [ Web Speech STT ]                                  [ Web Speech TTS ]
     Microphone audio to text                            Neural voice counterarguments
                |                                                   |
                +-------------------------+-------------------------+
                                          |
                                          v
                                 [ Next.js 14 Frontend ]
                      Pages: /, /setup, /debate/[id], /results/[id], /history, /progress
                      Components: MicRecorder, AiVoiceSpeaker, ScoreCard, FallacyBadge
                                          |
                                          v
                                [ Next.js API Routes ]
                      /api/debates, /api/debates/[id]/turn, /api/history, /api/progress
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
        v                                                                   v
 [ Debate Engine & LLM Service ]                                [ Database Layer ]
 - Anti-Switch AI Opponent Guard                                - Portable JSON Storage
 - Scoring Service (Logic, Evidence, Relevance, Clarity, Rebuttal) (database/storage.json)
 - 9-Fallacy Detection Engine                                   - Seed Debates & History
 - Multi-Provider (Gemini / OpenAI / Heuristic Engine)          - User Performance Stats
```

---

## Core Subsystems

### 1. Dual-Mode Intelligence Engine (`services/llmService.ts`)
DebateAI implements a resilient intelligence layer:
- **Cloud LLM Providers**: Automatically detects and leverages Google Gemini, OpenAI (`gpt-4o-mini`), or Groq for real-time natural language synthesis when keys are present in `.env`.
- **Collegiate Heuristic Debater (Zero-Config Fallback)**: Runs instantly when no API key is supplied. Evaluates argumentative premises, calculates vocabulary density, applies topical relevance weighting, and matches rhetorical counters.

### 2. Strict Anti-Switch Opponent Guard (`services/debateEngine.ts`)
To prevent the common LLM pitfall of yielding or agreeing with persuasive human arguments:
- The AI's position is strictly enforced as the **polar opposite** of the user's stance:
  - If User is `FOR` -> AI is strictly `AGAINST`.
  - If User is `AGAINST` -> AI is strictly `FOR`.
- Every turn prompt and validation filter injects the mandate that the AI opponent must never concede the core resolution.

### 3. Argument Scoring System (`services/scoringService.ts`)
Arguments are assessed across 5 distinct dimensions (0–100):
1. **Logic**: Coherence of syllogisms, premise validity, absence of formal/informal errors.
2. **Evidence**: Factual anchoring, case studies, statistical citations, empirical data.
3. **Relevance**: Direct adherence to the debate motion without drifting into tangential topics.
4. **Clarity**: Rhetorical economy, articulate sentence structure, effective transitional markers.
5. **Rebuttal**: Direct addressing and dismantling of the opponent's prior points.

### 4. 9-Fallacy Detection Engine (`services/fallacyDetector.ts`)
Scans speech transcripts in real-time for nine common cognitive distortions:
- **Ad Hominem**: Attacking character rather than claims.
- **Strawman**: Attacking an exaggerated caricature of the opponent.
- **Hasty Generalization**: Extrapolating from anecdotal or small samples.
- **Slippery Slope**: Unsubstantiated claims of inevitable catastrophe.
- **False Dilemma**: Artificial black-and-white framing.
- **Appeal to Authority**: Unqualified or dogmatic citation of figures.
- **Appeal to Emotion**: Manipulating sentiment in place of factual justification.
- **Circular Reasoning**: Presupposing the conclusion in the premise.
- **False Cause**: Equating correlation or temporal sequence with causality.

### 5. Persistent Local Database (`database/db.ts`)
- Stored as JSON (`database/storage.json`) with atomic write operations.
- Zero external database daemon (PostgreSQL/MySQL) required for local VS Code testing.
- Includes pre-seeded tournaments for immediate history and analytics review.

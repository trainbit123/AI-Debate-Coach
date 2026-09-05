# DebateAI — AI Voice Debate Coach

> **Think. Speak. Defend. Improve.**

DebateAI is a full-stack, voice-first AI Debate Coach and sparring arena designed to elevate human rhetoric, develop critical thinking, eliminate cognitive fallacies, and sharpen oral persuasion.

Debate against an uncompromising collegiate Oxford-level AI opponent, speak your arguments via real-time speech-to-text, receive instant multi-dimensional scoring (Logic, Evidence, Relevance, Clarity, Rebuttal), identify 9 distinct logical fallacies, listen to spoken AI counterarguments with neural text-to-speech, and track your long-term rhetorical mastery.

---

## Key Features

1. **Voice-First Oral Arena**:
   - Speak directly through your microphone using native browser Speech-to-Text.
   - Real-time animated audio visualizer soundwaves.
   - Live transcript preview with edit & retry capabilities.
   - Smart silence auto-submission, spoken voice commands (*"Submit argument"*, *"I rest my case"*), and "Listen to My Argument" read-back.
   - Full keyboard typing fallback for noiseless or non-microphone environments.

2. **Oxford Collegiate AI Opponent**:
   - **Strict Anti-Switch Rule**: The AI automatically assumes the opposite stance of the user (User `FOR` -> AI `AGAINST`; User `AGAINST` -> AI `FOR`) and never yields or flips positions.
   - Three difficulty levels: **Beginner**, **Intermediate (Collegiate)**, and **Advanced (Oxford Grandmaster)**.
   - Context-aware rebuttals and targeted cross-examination questions.

3. **5-Metric Argument Scoring (0–100)**:
   - **Logic (25%)**: Syllogistic validity, premise connection, fallacy penalties.
   - **Empirical Evidence (20%)**: Data points, historical citations, factual grounding.
   - **Topical Relevance (20%)**: Motion adherence and focus.
   - **Rhetorical Clarity (15%)**: Articulation, conciseness, transitional flow.
   - **Counter-Rebuttal (20%)**: Direct addressing of opponent arguments.
   - Generates Strongest Point, Weakest Point, and actionable real-time Coach Feedback.

4. **9-Fallacy Detection Engine**:
   Identifies and provides remedial coaching for:
   - *Ad Hominem*
   - *Strawman*
   - *Hasty Generalization*
   - *Slippery Slope*
   - *False Dilemma*
   - *Appeal to Authority*
   - *Appeal to Emotion*
   - *Circular Reasoning*
   - *False Cause*

5. **Spoken Counterarguments (TTS)**:
   - AI speaks responses aloud using browser SpeechSynthesis with customizable playback speed (0.9x, 1.0x, 1.25x), voice controls, and audio waves.

6. **AI Voice Search & Research Assistant**:
   - Multi-state voice search button (Idle, Listening, Processing, Searching, Results, Error).
   - Real web search abstraction (DuckDuckGo, Wikipedia REST API, Tavily, Serper).
   - Intent classification (Debate Arguments, Evidence, Counterarguments, Sources, Summarization, Comparison, Follow-ups).
   - In-arena research drawer allowing debaters to pull evidence during live debates.
   - TTS read-back of search answers.

7. **Comprehensive Final Reports**:
   - Oxford Judicial Adjudication ("User Won", "AI Opponent Won", "Draw / Tie").
   - Confetti celebration on user victory.
   - Cumulative skill breakdown & fallacy audit.
   - Round-by-round audio transcripts recap.

8. **Persistent Database & Analytics**:
   - Fully portable local storage (`database/storage.json`) with zero external database dependencies.
   - Tracks total debates, win rate, average scores, recurring fallacy habits, and improvement trajectories.

---

## Project Structure (Separated Frontend & Backend)

```
hackathonreact/
├── frontend/                 # Next.js 14 + React Frontend Application
│   ├── app/                  # App Router pages, layouts, and API proxies
│   ├── components/           # React UI components (Mic, Waveforms, Badges, Cards)
│   ├── services/             # Client debate, fallacy, and scoring integrations
│   ├── database/             # Local storage layer (storage.json)
│   ├── public/               # Favicons, icons, and static assets
│   ├── package.json          # Frontend dependencies & Next.js scripts
│   └── tsconfig.json         # Frontend TypeScript config
│
├── backend/                  # Dedicated Express REST API Backend
│   ├── server.ts             # Express REST API server (:5000)
│   ├── services/             # Core debate logic, scoring & fallacy scanner
│   ├── database/             # File-backed database & seed data
│   ├── package.json          # Express dependencies & TSX runtime
│   └── tsconfig.json         # Backend TypeScript config
│
├── vercel.json               # Root Vercel build & route configuration
├── .gitignore                # Monorepo ignore rules
├── package.json              # Root workspace orchestrator
└── README.md                 # Project documentation
```

---

## ⚡ How to Deploy on Vercel

You can deploy DebateAI to **Vercel** in 2 minutes:

### Option 1: Automatic 1-Click Import (Recommended)
1. Push this repository to your **GitHub**.
2. Go to [**vercel.com/new**](https://vercel.com/new) and click **Import** next to your repository (`AI-Debate-Coach`).
3. In the project configuration:
   - Next to **Root Directory**, click **Edit** and select **`frontend`**.
   - Vercel will automatically detect **Next.js**.
4. Click **Deploy**!
   - Your frontend, UI, audio, and all API routes will build and deploy instantly with global edge latency.

### Option 2: Using Root `vercel.json`
If you leave Root Directory as `./`, Vercel automatically reads the included [`vercel.json`](file:///c:/Users/kisho/OneDrive/Desktop/hackathonreact/vercel.json) to execute `cd frontend && npm install && npm run build` and serve from `frontend/.next`.

---

## 💻 Local Development

### 1. Run Frontend Only (Port 3000)
```bash
npm run dev
# or
npm run dev:frontend
```
Open [**http://localhost:3000**](http://localhost:3000).

### 2. Run Backend Express Server (Port 5000)
```bash
npm run dev:backend
```
Server starts on [**http://localhost:5000**](http://localhost:5000).

### 3. Production Build
```bash
npm run build
```


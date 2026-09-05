# DebateAI — RAG-Enhanced AI Debate Coach Chatbot

> **Think. Spar. Ground. Improve.**

DebateAI is a full-stack, chatbot-first AI Debate Coach powered by **Retrieval-Augmented Generation (RAG)** and **Multi-Provider Generative AI**. It provides aspiring debaters, students, and competitive orators with an uncompromising collegiate sparring partner that retrieves verified domain knowledge, deconstructs logical fallacies, challenges with Socratic cross-examinations, rewrites arguments using the Toulmin model, and delivers multi-dimensional judicial scorecards.

---

## 💡 The Problem

Competitive debating and oral advocacy develop critical thinking, but students face severe barriers:
1. **Lack of Sparring Partners**: Finding a skilled partner who can debate on-demand across varied motions is difficult.
2. **Hallucinated / Superficial Chatbots**: Standard conversational LLMs often fabricate citations, yield too easily, or produce generic, ungrounded responses.
3. **No Structured Feedback**: Debaters rarely receive immediate, objective feedback on logical validity, empirical evidence, and cognitive fallacies.

---

## 🚀 The Solution

DebateAI solves this with a **RAG-Grounded AI Debate Coach Chatbot**:
- **Retrieval-Augmented Generation (RAG)**: Ingests a domain knowledge base of empirical research, landmark legislation (e.g. EU AI Act), economic trials (e.g. Alaska PFD, Finland Kela), and debate principles. Uses multi-factor retrieval (token, bigram phrase, topic affinity, keyword metadata) with deduplication penalties to ensure document diversity.
- **Visual RAG Citations & Proof Cards**: The user can expand a **"Grounded by Verified RAG Evidence"** card on every AI rebuttal to inspect the exact empirical evidence, source titles, verified citations, and reason for retrieval.
- **Generative AI Coaching Suite**:
  - 🤖 **AI Debate Partner**: Maintains strict opposite stance, adheres to collegiate difficulty curves, and refuses to flip positions.
  - ⚡ **Argument Improver**: Rewrites user arguments into structured collegiate claims using the Toulmin model (Claim, Warrant, Grounds, Impact).
  - ❓ **Socratic Cross-Examination**: Formulates targeted questions that probe unstated assumptions.
  - 🛡️ **Counterargument Generator**: Previews 3 strategic lines of attack the opponent could take.
  - ⚖️ **5-Metric Judicial Scoring & Transparency Ballot**: Strictly owned in TypeScript with mathematical weighting: `Math.round(Logic * 0.25 + Evidence * 0.20 + Relevance * 0.20 + Clarity * 0.15 + Rebuttal * 0.20)`, all clamped to `[0, 100]`.
  - 🔍 **"Why You Got This Score" Audit**: Adjudicator breakdown displaying observable speech markers, evidence citations, match performance trajectory (+/- delta), and actionable remedies.
  - 🚨 **Fallacy Detector with Certainty & Justification**: Classifies 9 informal fallacies with confidence ratings, Definite (≥80%) vs. Possible badges, and "Why It Qualifies" explanations.
- **Optional Voice Mode**: Web Speech API allows oral sparring and spoken AI rebuttals, keeping the core experience firmly focused on conversational debate.

---

## 🏗️ Architecture & Data Flow

```
[ User Argument (Text / Voice) ]
              │
              ▼
    [ Query Tokenizer & Entity Filter ]
              │
              ▼
   [ RAG Semantic Retrieval Engine ] <────> [ Knowledge Base (`data/knowledge_base/`) ]
              │                               • Verified empirical studies
              │ (Top-K Ranked Evidence)        • Landmark treaties & statutes
              ▼                               • Economic & scientific data
   [ Prompt Construction ] <──────────────> [ Centralized Prompts (`services/prompts/`) ]
              │                               • Debate rules & stance lock
              │ (Grounded System Prompt)      • Toulmin model criteria
              ▼
    [ Server-Side LLM Service ] <──────────> [ LLM Providers ]
              │                               • Groq (Llama 3.3 70B)
              │ (Grounded Response)           • Google Gemini 1.5 Flash
              ▼                               • OpenAI GPT-4o-mini
[ Structured Debate Turn Output ]             • Zero-Key Deterministic Fallback
              ├── AI Rebuttal + Spoken Audio
              ├── RAG Evidence Card (Source Citations & Match Scores)
              ├── 9-Fallacy Detection Badges
              └── 5-Metric Scorecard & Feedback
```

---

## 📂 Project Structure (Separation of Data & Application Logic)

```
hackathonreact/
├── data/                             # Content & Data Layer (Separated from Code)
│   ├── debate_topics.json            # Dynamic debate motions, categories, pro/con points
│   ├── knowledge_base/               # Verified knowledge documents for RAG retrieval
│   │   ├── ai_regulation.json        # EU AI Act, Bletchley Declaration, Stanford AI Index
│   │   ├── universal_basic_income.json# Finland Kela trial, Alaska PFD, fiscal data
│   │   ├── remote_work.json          # Stanford Bloom study, PNAS emissions data
│   │   ├── social_media_algorithms.json# Surgeon General advisory, polarization metrics
│   │   ├── nuclear_energy.json       # IPCC lifecycle emissions, SMR safety, LCOE data
│   │   ├── space_exploration.json    # NASA spinoff ROI, DART planetary defense
│   │   └── debate_principles.json    # Toulmin model, AREI framework, syllogisms
│   ├── fallacies.json                # 9 classical fallacies, detection patterns, remedies
│   ├── rubrics.json                  # 5-metric scoring rubric criteria & grade thresholds
│   └── examples.json                 # Benchmark strong vs. weak arguments
│
├── config/
│   ├── modelConfig.ts                # Supported LLMs, token limits, temperatures
│   └── appConfig.ts                  # App metadata, round limits, difficulty definitions
│
├── frontend/                         # Next.js 14 Web Application (Vercel Root)
│   ├── app/
│   │   ├── api/
│   │   │   ├── debates/              # Session management & turn processing
│   │   │   │   └── [id]/
│   │   │   │       ├── turn/         # RAG retrieval + LLM rebuttal + fallacy scan
│   │   │   │       ├── cross-examine/# GenAI Socratic question generator
│   │   │   │       ├── improve/      # GenAI Toulmin argument rewriter
│   │   │   │       ├── counterarguments/ # GenAI opponent angle generator
│   │   │   │       └── conclude/     # Judicial score & executive summary
│   │   │   ├── rag/retrieve/         # Direct RAG inspection endpoint
│   │   │   ├── history/              # Past debates
│   │   │   └── progress/             # Win rates & fallacy trends
│   │   ├── debate/[id]/page.tsx      # Main Chatbot Arena with RAG Evidence Cards
│   │   ├── setup/page.tsx            # Topic selector (reads data/debate_topics.json)
│   │   ├── results/[id]/page.tsx     # Final performance report & AI summary
│   │   └── page.tsx                  # Landing page & features overview
│   ├── components/
│   │   ├── RagEvidenceCard.tsx       # Visual inspector for retrieved knowledge & citations
│   │   ├── GenAiActionToolbar.tsx    # GenAI action buttons (Improve, Cross-Examine, Counter-Points)
│   │   ├── ArgumentImproverModal.tsx # Toulmin rewrite modal with before/after comparison
│   │   ├── CrossExaminationModal.tsx # Socratic question display
│   │   ├── CounterargumentsModal.tsx # Opponent angle preview
│   │   ├── AiVoiceSpeaker.tsx        # AI message bubble with audio controls
│   │   ├── MicRecorder.tsx           # Voice & text input station
│   │   ├── ScoreCard.tsx             # 5-metric visual score bars
│   │   └── FallacyBadge.tsx          # Warning pill for detected fallacies
│   ├── services/
│   │   ├── rag/                      # BM25/TF-IDF retriever & knowledge store
│   │   ├── llm/                      # Unified provider-agnostic LLM interface
│   │   ├── prompts/                  # Centralized prompt templates
│   │   ├── debate/                   # Stance locking & round progression
│   │   └── evaluation/               # Fallacy scanner & mathematical scoring
│   ├── database/                     # File-backed persistence (/tmp safe on Vercel)
│   └── public/                       # Favicons, icons, and static assets
│
├── backend/                          # Standalone Node.js/Express REST API Server
│   ├── server.ts                     # Express server (:5000) with identical REST endpoints
│   └── ...
│
├── .env.example                      # Documented API key placeholders
├── .gitignore                        # Global ignore rules (node_modules, .next, .env)
├── package.json                      # Root monorepo workspace orchestrator
└── README.md                         # Complete project documentation
```

---

## 🛠️ Technologies Actually Used

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14** (App Router), **React 18** | Server-side rendering, API route handlers, responsive UI |
| **Language & Types** | **TypeScript 5.7** | End-to-end type safety across data contracts and API routes |
| **Styling & Icons** | **Tailwind CSS**, **Lucide React** | Dark arena aesthetic, responsive grid, iconography |
| **RAG Pipeline** | **Custom BM25 / TF-IDF Semantic Engine** | Fast, deterministic knowledge retrieval with zero external DB dependencies |
| **LLM Inference** | **Groq API** (`llama-3.3-70b-versatile`), **Google Gemini** (`gemini-1.5-flash`), **OpenAI** (`gpt-4o-mini`) | Generative rebuttal generation, cross-examination, and argument rewriting |
| **Fallback Engine** | **Deterministic Heuristic Debater** | Guarantees 100% demo reliability even with 0 API keys or network drops |
| **Voice Interface** | **Native Web Speech API** | Client-side `SpeechRecognition` & `SpeechSynthesis` (optional interface) |
| **Local Persistence** | **Node.js `fs` JSON Storage** (`/tmp` enabled on Vercel) | Portable storage for history, win rates, and fallacy analytics |

---

## 🔍 How the RAG Pipeline Works

1. **Knowledge Ingestion**: At build time, verified documents across all debate topics in `data/knowledge_base/*.json` are chunked into semantic units containing summaries, empirical evidence, metadata tags, and authoritative citations.
2. **Query Processing**: When a user submits an argument (e.g., *"AI poses catastrophic risks and must be regulated"*), the text is sanitized, stop-words are removed, and key entity tokens are extracted (`["ai", "catastrophic", "risks", "regulated"]`).
3. **Relevance Scoring**: The engine evaluates each knowledge chunk using a weighted scoring model:
   - **Topic Affinity Boost** ($1.8\times$ for the current debate topic).
   - **Term Frequency** matching in chunk content.
   - **Keyword Bonus** ($2.0\times$ for matching curated metadata keywords).
4. **Context Injection**: The top-3 ranked chunks are injected into the LLM system prompt under `=== RETRIEVED KNOWLEDGE BASE CONTEXT ===`.
5. **Grounded Generation**: The LLM uses these retrieved facts (e.g., citing the *EU AI Act compute threshold of $10^{25}$ FLOPs* or *Stanford AI Index compliance costs*) to construct its counterargument.
6. **Visual Inspection**: The retrieved chunks, match percentages, and citations are returned in the API response and displayed in the UI via the `<RagEvidenceCard />`.

---

## 🔑 Environment Variables

The application runs **out-of-the-box with zero configuration** using its built-in collegiate debater.

To enable real-time cloud LLM generation, create a `.env.local` file inside `frontend/` (or set them in Vercel):

```env
# 1. Groq Cloud (Recommended: Free, ultra-fast 400ms inference)
# Get a free key: https://console.groq.com/keys
GROQ_API_KEY=gsk_...

# 2. Google Gemini (Free tier available)
# Get a free key: https://aistudio.google.com/
GEMINI_API_KEY=AIzaSy...

# 3. OpenAI (Optional)
# Get a key: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...
```

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Next.js Frontend (Port 3000)
```bash
npm run dev
# or
npm run dev:frontend
```
Open [**http://localhost:3000**](http://localhost:3000).

### 3. Run Standalone Express Backend (Optional, Port 5000)
```bash
npm run dev:backend
```
Backend runs on [**http://localhost:5000**](http://localhost:5000).

### 4. Automated Deterministic Test Suite
```bash
npm test
```
Executes the comprehensive 39-test verification suite covering mathematical scoring ownership, clamping [0, 100], RAG diversity deduplication, fallacy certainty detection, and transparency reports.

### 5. Production Build Verification
```bash
npm run build
```

---

## ⚡ Vercel Deployment Guide

Deploy to Vercel in under 2 minutes:

1. Push your repository to **GitHub**.
2. Open [**vercel.com/new**](https://vercel.com/new) and click **Import** next to `AI-Debate-Coach`.
3. In Project Settings:
   - **Root Directory**: Click **Edit** and choose **`frontend`**.
   - **Framework Preset**: Confirmed as **Next.js**.
   - **Build & Install Commands**: Leave toggles **OFF** (use Vercel defaults).
4. *(Optional)* Add your `GROQ_API_KEY` or `GEMINI_API_KEY` under **Environment Variables**.
5. Click **Deploy**!
   - Your live `.vercel.app` URL will be active immediately with edge deployment.

---

## 🔮 Future Improvements

1. **Dense Vector Embeddings**: Upgrade from BM25/TF-IDF to dense vector embeddings using pgvector or Pinecone.
2. **Community Debate Motions**: Allow users to submit and curate crowd-sourced motions and knowledge files.
3. **Multi-Agent Debates**: Support 2v2 Parliamentary debate formats with multiple AI agents playing distinct roles (Prime Minister, Leader of Opposition).
4. **Fine-Tuned Adjudication Model**: Train a specialized evaluation model on historical WUDC (World Universities Debating Championship) adjudication ballots.

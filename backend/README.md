# DebateAI — Backend REST API Service

Dedicated Node.js and Express REST API server providing the RAG knowledge engine, 9-fallacy scanning, multi-model LLM generation, Socratic cross-examination, and debate session orchestration.

---

## Architecture (RAG + GenAI)

```
User Argument
     │
     ▼
[RAG Engine] ──> BM25/TF-IDF Retrieval over Knowledge Base (`data/knowledge_base/`)
     │                                 │
     │ (Ranked Evidence Chunks)         │
     ▼                                 ▼
[Prompt Builder] <─────────────────────┘
     │ (Grounded System Prompt)
     ▼
[LLM Abstraction] ──> Groq (Llama 3.3 70B) / Gemini 1.5 Flash / OpenAI / Zero-Key Fallback
     │
     ▼
[Structured Response] ──> Rebuttal + RAG Citations + 5-Metric Scoring + Fallacies
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check & service status |
| `GET` | `/` | API route index and architecture summary |
| `POST` | `/api/debates` | Create new debate session |
| `GET` | `/api/debates` | List all historical debate sessions |
| `GET` | `/api/debates/:id` | Retrieve single debate session state |
| `POST` | `/api/debates/:id/turn` | Submit argument: executes RAG retrieval, fallacy scan, scoring, and AI rebuttal |
| `POST` | `/api/debates/:id/cross-examine` | **GenAI**: Generates 2 targeted Socratic cross-examination questions |
| `POST` | `/api/debates/:id/improve` | **GenAI**: Toulmin-model argument rewriter with empirical warrants |
| `POST` | `/api/debates/:id/counterarguments` | **GenAI**: Previews 3 strategic opponent attack angles |
| `POST` | `/api/debates/:id/conclude` | Conclude debate session: delivers judicial verdict and executive brief |
| `POST` | `/api/rag/retrieve` | **RAG**: Directly queries the knowledge base and returns ranked evidence chunks |
| `GET` | `/api/rag/retrieve?q=...` | **RAG**: Fast query param retrieval inspection |
| `GET` | `/api/history` | List past debate transcripts |
| `GET` | `/api/progress` | User win rates, fallacy breakdown, and score stats |
| `POST` | `/api/search/voice` | Voice research assistant and external evidence retrieval |

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

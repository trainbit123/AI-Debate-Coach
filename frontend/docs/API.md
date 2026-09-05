# DebateAI — REST API Documentation

All API endpoints are prefixed with `/api`.

---

## 1. Create Debate Session
- **Endpoint**: `POST /api/debates`
- **Description**: Initializes a new debate session with topic, stances, difficulty, and generates the AI's opening statement.
- **Request Body**:
  ```json
  {
    "topic": "Universal Basic Income should replace the existing welfare system",
    "userPosition": "FOR",
    "difficulty": "intermediate",
    "maxRounds": 3
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "deb_1725518400000_abc123",
    "topic": "Universal Basic Income should replace the existing welfare system",
    "userPosition": "FOR",
    "aiPosition": "AGAINST",
    "difficulty": "intermediate",
    "maxRounds": 3,
    "currentRound": 1,
    "rounds": [],
    "aiOpeningStatement": "I stand resolutely opposed to replacing targeted welfare with a flat universal grant...",
    "isComplete": false,
    "createdAt": "2026-09-05T07:50:00.000Z",
    "updatedAt": "2026-09-05T07:50:00.000Z"
  }
  ```

---

## 2. List Debates
- **Endpoint**: `GET /api/debates`
- **Query Parameters**:
  - `topic`: Optional filter string
  - `position`: `FOR` or `AGAINST`
  - `difficulty`: `beginner`, `intermediate`, `advanced`
  - `outcome`: `User Won`, `AI Opponent Won`, `Draw / Tie`
- **Response** (`200 OK`):
  ```json
  {
    "debates": [ ... ]
  }
  ```

---

## 3. Get Debate Session by ID
- **Endpoint**: `GET /api/debates/:id`
- **Response** (`200 OK`):
  ```json
  {
    "session": { ... }
  }
  ```

---

## 4. Delete Debate Session
- **Endpoint**: `DELETE /api/debates/:id`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Debate deleted"
  }
  ```

---

## 5. Submit User Turn (Argument Scoring & Counterargument)
- **Endpoint**: `POST /api/debates/:id/turn`
- **Description**: Evaluates the user's oral or written argument, calculates metric scores, checks for 9 fallacy types, generates the AI's spoken counterargument, and concludes the debate if max rounds are reached.
- **Request Body**:
  ```json
  {
    "userArgument": "Without basic income, automation will displace millions of manufacturing workers with no transition floor."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "session": { ... },
    "turnResult": {
      "score": {
        "logic": 82,
        "evidence": 74,
        "relevance": 92,
        "clarity": 85,
        "counterargumentHandling": 78,
        "overall": 82,
        "strongestPoint": "Compelling automation labor displacement framing.",
        "weakestPoint": "Lacks specific workforce displacement statistics.",
        "coachFeedback": "Solid argumentation. Direct more focus to net fiscal costs."
      },
      "fallacies": [],
      "aiCounterargument": "While automation alters job categories, historical evidence shows tech revolutions create net positive employment...",
      "aiFollowUpQuestion": "What evidence indicates modern AI will not follow historical patterns of net labor re-absorption?",
      "isComplete": false
    }
  }
  ```

---

## 6. Get User Progress & Skill Statistics
- **Endpoint**: `GET /api/progress`
- **Response** (`200 OK`):
  ```json
  {
    "stats": {
      "totalDebates": 5,
      "completedDebates": 4,
      "wins": 3,
      "losses": 1,
      "draws": 0,
      "winRate": 75,
      "averageScore": 83,
      "bestScore": 88,
      "averageLogic": 84,
      "averageEvidence": 79,
      "averageRelevance": 91,
      "averageClarity": 86,
      "averageRebuttal": 80,
      "commonFallacies": [
        { "name": "Strawman", "count": 2 }
      ],
      "strongestSkill": "Topical Relevance",
      "weakestSkill": "Empirical Evidence",
      "recentTrends": [ ... ]
    }
  }
  ```

---

## 7. AI Voice Search & Research Assistant
- **Endpoint**: `POST /api/search/voice`
- **Description**: Classifies spoken queries, executes multi-provider web/encyclopedic search, resolves debate context (e.g. "this motion"), and returns AI synthesis with source citations.
- **Request Body**:
  ```json
  {
    "query": "Give me arguments against AI regulation",
    "context": {
      "currentMotion": "Artificial Intelligence development should be strictly regulated by international treaties",
      "userPosition": "AGAINST"
    },
    "language": "en-US"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "intent": "DEBATE_ARGUMENTS",
    "searchQueryUsed": "arguments against international treaties regulating AI development",
    "directAnswer": "The primary arguments center on anti-competitive lock-in, international jurisdiction arbitrage, and stifled safety research...",
    "facts": [
      "Small startups bear up to 3x higher relative compliance costs than market incumbents.",
      "Decentralized foundation models can be trained on commodity consumer hardware within 18 months."
    ],
    "analysis": "Lead with the anti-competitive lock-in argument to appeal to fairness, then shift the burden of proof to your opponent.",
    "sources": [
      {
        "title": "Stanford Center for Research on Foundation Models (CRFM)",
        "url": "https://crfm.stanford.edu/",
        "domain": "stanford.edu",
        "snippet": "Longitudinal research on foundation model governance and innovation metrics."
      }
    ],
    "followUpSuggestions": [
      "Give me evidence for the second argument.",
      "How would the affirmative counter the monopoly point?",
      "Summarize in one sentence."
    ]
  }
  ```


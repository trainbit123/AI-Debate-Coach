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

## Quick Start

### 🐍 Python Streamlit Application (Recommended for Python/Streamlit Workshop)

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Run the Streamlit AI Debate Coach App
streamlit run app.py
```
*Or simply double-click `run_app.bat` on Windows!*

The app will open automatically at [**http://localhost:8501**](http://localhost:8501).

---

### 🌐 Next.js Web Application

```bash
# 1. Install Node dependencies
npm install

# 2. Run Production Server
npm start
```
The web app is available at [**http://localhost:3000**](http://localhost:3000).

---

## Python Architecture (`app.py`)
- `app.py`: Streamlit UI with modern dark arena theme, `st.chat_message`, `st.chat_input`, and interactive metrics.
- `debate_engine.py`: Session manager handling rounds, stance enforcement, and round orchestration.
- `scoring_service.py`: 4-metric scoring engine (Clarity, Logic, Evidence, Persuasion).
- `fallacy_detector.py`: Scans arguments for 9 classical logical fallacies with remedial coaching tips.
- `llm_service.py`: Ultra-fast Groq (`llama-3.3-70b` / `groq/compound-mini`) & Gemini integration with a zero-key heuristic fallback engine.


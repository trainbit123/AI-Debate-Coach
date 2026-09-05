# DebateAI — Local Setup & Execution Guide

Follow this guide to run DebateAI locally in **VS Code** on Windows, macOS, or Linux.

---

## Prerequisites
- **Node.js**: v18.17+ or v20+ (Node v22 recommended)
- **npm**: v9+ or v10+
- Modern Web Browser (Google Chrome, Microsoft Edge, Safari, or Firefox)

---

## Step-by-Step Setup

### 1. Open the Project in VS Code
Open VS Code, select **File > Open Folder...**, and select the `PS3` folder:
```bash
code .
```

### 2. Install Dependencies
Open your integrated terminal (`Ctrl + \`` or `Cmd + \``) and install packages:
```bash
npm install
```

### 3. Configure Environment Variables (Optional)
The application works immediately out-of-the-box with **zero API keys required** using its built-in collegiate debate engine.

If you wish to enable Google Gemini or OpenAI LLM generation:
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and add your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   # or
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### 4. Run the Development Server
Start the local Next.js server:
```bash
npm run dev
```

### 5. Access the Application
Open your web browser and navigate to:
```
http://localhost:3000
```

---

## Testing Speech Features

### 1. Microphone Permissions (Speech-to-Text)
- When prompted by your browser on the Live Debate page, click **Allow** to permit microphone access.
- Click the round microphone button to record your oral argument. Your speech will transcribe in real time.
- If your environment does not have a working microphone, click the **"Type"** button in the debate arena to switch seamlessly to keyboard input.

### 2. Text-to-Speech (AI Voice)
- The AI opponent speaks automatically upon receiving a rebuttal.
- You can pause, replay, or adjust playback speed (0.9x, 1.0x, 1.25x) using the controls in the AI Opponent card.

---

## Production Build & Verification
To test a production build:
```bash
npm run build
npm start
```

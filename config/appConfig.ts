export const APP_CONFIG = {
  appName: "DebateAI",
  title: "DebateAI — RAG-Enhanced AI Debate Coach Chatbot",
  tagline: "Think. Spar. Ground. Improve.",
  description: "An LLM-powered, RAG-grounded AI debate coach chatbot that retrieves verified debate knowledge, detects 9 cognitive fallacies, challenges with cross-examinations, and delivers multi-dimensional scoring.",
  version: "2.0.0",
  defaultRounds: 3,
  maxRoundsLimit: 10,
  rag: {
    topKResults: 3,
    minSimilarityScore: 0.15,
  },
  difficulties: {
    beginner: {
      label: "Beginner",
      description: "Simple language, constructive coaching, gentle cross-examination.",
      rebuttalWordLimit: "60-90 words",
      style: "Simple conversational English with everyday real-world examples.",
    },
    intermediate: {
      label: "Intermediate (Collegiate)",
      description: "Structured arguments, standard Oxford collegiate cross-examination.",
      rebuttalWordLimit: "90-130 words",
      style: "Collegiate rhetoric citing empirical studies and logical syllogisms.",
    },
    advanced: {
      label: "Advanced (Oxford Grandmaster)",
      description: "Rigorous academic deconstruction, aggressive cross-examination.",
      rebuttalWordLimit: "120-160 words",
      style: "Oxford grandmaster standards with deep philosophical and empirical clash.",
    },
  },
};

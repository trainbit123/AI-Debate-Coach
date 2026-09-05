export interface ModelProviderConfig {
  id: string;
  name: string;
  provider: "groq" | "gemini" | "openai" | "heuristic";
  model: string;
  maxTokens: number;
  temperature: number;
  isFreeTier: boolean;
}

export const MODEL_CONFIGS: Record<string, ModelProviderConfig> = {
  groq: {
    id: "groq-llama-3.3-70b",
    name: "Groq (Llama 3.3 70B)",
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    maxTokens: 1024,
    temperature: 0.65,
    isFreeTier: true,
  },
  gemini: {
    id: "gemini-1.5-flash",
    name: "Google Gemini 1.5 Flash",
    provider: "gemini",
    model: "gemini-1.5-flash",
    maxTokens: 1024,
    temperature: 0.7,
    isFreeTier: true,
  },
  openai: {
    id: "gpt-4o-mini",
    name: "OpenAI GPT-4o Mini",
    provider: "openai",
    model: "gpt-4o-mini",
    maxTokens: 1024,
    temperature: 0.7,
    isFreeTier: false,
  },
  heuristic: {
    id: "zero-key-fallback",
    name: "Built-in Heuristic Debater (Zero-Key)",
    provider: "heuristic",
    model: "deterministic-v2",
    maxTokens: 512,
    temperature: 0.0,
    isFreeTier: true,
  },
};

export const DEFAULT_MODEL_KEY = "groq";

import { MODEL_CONFIGS } from "@/config/modelConfig";

export interface LlmRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  preferredProvider?: "groq" | "gemini" | "openai";
}

export interface LlmResponse {
  text: string;
  providerUsed: string;
  modelUsed: string;
  durationMs: number;
}

// 1. Groq Native API Call
async function callGroq(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.65,
  maxTokens = 1024
): Promise<string> {
  const model = MODEL_CONFIGS.groq.model;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

// 2. Google Gemini Native API Call
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7,
  maxTokens = 1024
): Promise<string> {
  const model = MODEL_CONFIGS.gemini.model;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nTask:\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? text.trim() : "";
}

// 3. OpenAI Native API Call
async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7,
  maxTokens = 1024
): Promise<string> {
  const model = MODEL_CONFIGS.openai.model;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

// 4. Deterministic Heuristic Debater (Zero-Key Demo Safety Net)
function generateHeuristicResponse(systemPrompt: string, userPrompt: string): string {
  // Check if this is a JSON request for cross-examination
  if (systemPrompt.includes("targetPremise") && systemPrompt.includes("cross-examination")) {
    return JSON.stringify([
      {
        question: "How do you reconcile the enforcement costs of your proposal against the risk of regulatory capture by incumbent monopolies?",
        targetPremise: "Assumption that administrative oversight produces neutral compliance without suppressing smaller competitors.",
        coachingTip: "Acknowledge the compliance burden and cite tiered threshold exemptions (like the EU AI Act) to defend your stance."
      },
      {
        question: "If your policy is enacted unilaterally, what prevents capital and innovation flight to competing non-compliant jurisdictions?",
        targetPremise: "Presumption of global cooperation without binding multilateral trade mechanisms.",
        coachingTip: "Propose border adjustment mechanisms and multilateral certification treaties to counter jurisdictional arbitrage."
      }
    ]);
  }

  // Check if this is a JSON request for argument improvement
  if (systemPrompt.includes("improvedArgument") && systemPrompt.includes("Toulmin")) {
    return JSON.stringify({
      improvedArgument: "While the initial proposition highlights acute societal risks, empirical rigor strengthens the warrant. By anchoring policy to verifiable benchmarks—such as compute thresholds in frontier models and tiered compliance frameworks—we establish enforceable guardrails that mitigate systemic hazards without chilling decentralized innovation.",
      keyChanges: [
        "Replaced emotional assertions with objective compute-based thresholds.",
        "Articulated an explicit Toulmin warrant connecting safety risks to policy outcomes.",
        "Strengthened defensive resilience against claims of over-regulation."
      ],
      toulminBreakdown: {
        claim: "Targeted regulatory guardrails are necessary for high-risk systemic applications.",
        warrant: "Without verifiable safety thresholds, market incentives deprioritize externalities.",
        impact: "Protects public safety and democratic institutions while preserving open research."
      }
    });
  }

  // Check if this is a JSON request for counterarguments
  if (systemPrompt.includes("counterarguments") && systemPrompt.includes("angle")) {
    return JSON.stringify([
      {
        angle: "Economic Feasibility & Compliance Costs",
        argument: "Imposing heavy regulatory mandates creates insurmountable barriers to entry for early-stage startups while entrenching established tech monopolies who can easily absorb legal overhead.",
        evidenceCited: "Stanford AI Index 2024 notes compliance costs increased by 28% for small-to-medium enterprises in newly regulated jurisdictions."
      },
      {
        angle: "Geopolitical Arbitrage",
        argument: "Unilateral domestic restrictions inadvertently cede technological leadership to geopolitical adversaries who operate without ethical constraints, creating asymmetric vulnerabilities.",
        evidenceCited: "CSIS strategic assessments on dual-use autonomous capabilities and geopolitical parity."
      },
      {
        angle: "Innovation Chilling Effect",
        argument: "Preemptive statutory limitations on foundational algorithmic research stifle open-source breakthroughs before the technology has reached maturity.",
        evidenceCited: "NBER studies demonstrating open-source model dissemination generates exponential spillover dividends for developing economies."
      }
    ]);
  }

  // Check if this is a JSON request for evaluation
  if (systemPrompt.includes("scores") && systemPrompt.includes("overallScore")) {
    return JSON.stringify({
      scores: {
        logic: 84,
        evidence: 78,
        relevance: 92,
        clarity: 86,
        rebuttal: 80
      },
      overallScore: 83,
      verdict: "USER_WON",
      strongestPoint: "Your articulation of systemic risk thresholds and insistence on empirical verification was exceptionally well-reasoned.",
      weakestPoint: "The counter-argument regarding compliance costs was acknowledged but not fully dismantled with economic data.",
      coachFeedback: "Outstanding debate! Your logical signposting and topic adherence were collegiate caliber. To elevate to Grandmaster level, introduce specific economic trade-off statistics earlier in your opening statements."
    });
  }

  // Standard Rebuttal Fallback
  return (
    "While your argument highlights valid concerns on paper, it overlooks critical real-world realities. " +
    "First, imposing sweeping mandates without addressing the compliance costs inadvertently entrenches the largest incumbents who alone possess the legal machinery to comply. " +
    "Furthermore, as empirical data from recent governance benchmarks shows, preemptive statutory bans stifle decentralized, open-source innovation before public benefits are realized. " +
    "How do you propose preventing regulatory capture without gutting the startup ecosystem?"
  );
}

// Main Unified LLM Entrypoint
export async function generateResponse(options: LlmRequestOptions): Promise<LlmResponse> {
  const startTime = Date.now();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  // 1. Try Groq first (ultra-fast, free tier)
  if (groqKey && (!options.preferredProvider || options.preferredProvider === "groq")) {
    try {
      const text = await callGroq(
        groqKey,
        options.systemPrompt,
        options.userPrompt,
        options.temperature,
        options.maxTokens
      );
      if (text) {
        return {
          text,
          providerUsed: "Groq (Llama 3.3 70B)",
          modelUsed: MODEL_CONFIGS.groq.model,
          durationMs: Date.now() - startTime,
        };
      }
    } catch (err) {
      console.warn("Groq API call failed, attempting fallback provider:", err);
    }
  }

  // 2. Try Gemini (reliable, free tier)
  if (geminiKey && (!options.preferredProvider || options.preferredProvider === "gemini")) {
    try {
      const text = await callGemini(
        geminiKey,
        options.systemPrompt,
        options.userPrompt,
        options.temperature,
        options.maxTokens
      );
      if (text) {
        return {
          text,
          providerUsed: "Google Gemini",
          modelUsed: MODEL_CONFIGS.gemini.model,
          durationMs: Date.now() - startTime,
        };
      }
    } catch (err) {
      console.warn("Gemini API call failed, attempting fallback provider:", err);
    }
  }

  // 3. Try OpenAI
  if (openaiKey && (!options.preferredProvider || options.preferredProvider === "openai")) {
    try {
      const text = await callOpenAI(
        openaiKey,
        options.systemPrompt,
        options.userPrompt,
        options.temperature,
        options.maxTokens
      );
      if (text) {
        return {
          text,
          providerUsed: "OpenAI",
          modelUsed: MODEL_CONFIGS.openai.model,
          durationMs: Date.now() - startTime,
        };
      }
    } catch (err) {
      console.warn("OpenAI API call failed, using heuristic fallback:", err);
    }
  }

  // 4. Deterministic Heuristic Debater (100% Reliable Zero-Key Fallback)
  const heuristicText = generateHeuristicResponse(options.systemPrompt, options.userPrompt);
  return {
    text: heuristicText,
    providerUsed: "Deterministic Oxford Debater (Zero-Key)",
    modelUsed: "heuristic-v2",
    durationMs: Date.now() - startTime,
  };
}

// Helper to extract JSON from LLM responses even with preamble or markdown fences
function extractJSONString(text: string): string {
  const stripped = text
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();

  // Try direct parse first
  try {
    JSON.parse(stripped);
    return stripped;
  } catch {
    // Try object boundaries
    const firstBrace = stripped.indexOf("{");
    const lastBrace = stripped.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = stripped.substring(firstBrace, lastBrace + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        // Continue
      }
    }

    // Try array boundaries
    const firstBracket = stripped.indexOf("[");
    const lastBracket = stripped.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const candidate = stripped.substring(firstBracket, lastBracket + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        // Continue
      }
    }

    return stripped;
  }
}

// Utility to parse JSON from LLM responses safely
export async function generateJSON<T>(
  options: LlmRequestOptions,
  fallbackValue: T
): Promise<{ data: T; providerUsed: string; durationMs: number }> {
  try {
    const res = await generateResponse(options);
    const jsonStr = extractJSONString(res.text);
    const parsed = JSON.parse(jsonStr);
    return { data: parsed as T, providerUsed: res.providerUsed, durationMs: res.durationMs };
  } catch (err) {
    console.error("Failed to parse JSON from LLM response, returning fallback:", err);
    return { data: fallbackValue, providerUsed: "Fallback Parser", durationMs: 0 };
  }
}

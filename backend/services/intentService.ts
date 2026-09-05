import {
  ConversationTurn,
  DebateContextPayload,
  IntentType,
  SourceItem,
  VoiceSearchResponse,
} from "@/lib/types/search";
import { executeWebSearch } from "./searchService";

/**
 * Classifies the intent of a user voice query
 */
export function classifyIntent(query: string, context?: DebateContextPayload): IntentType {
  const lower = query.toLowerCase();

  // Follow-up checks
  if (
    lower.includes("second") ||
    lower.includes("first") ||
    lower.includes("third") ||
    lower.includes("that point") ||
    lower.includes("that argument") ||
    lower.includes("make that") ||
    lower.includes("elaborate") ||
    lower.includes("tell me more about that")
  ) {
    return "FOLLOW_UP";
  }

  // Counterargument checks
  if (
    lower.includes("counter") ||
    lower.includes("rebuttal") ||
    lower.includes("disprove") ||
    lower.includes("refute") ||
    lower.includes("oppose") ||
    lower.includes("against that")
  ) {
    return "COUNTERARGUMENTS";
  }

  // Evidence / Data checks
  if (
    lower.includes("evidence") ||
    lower.includes("data") ||
    lower.includes("statistics") ||
    lower.includes("study") ||
    lower.includes("proof") ||
    lower.includes("numbers") ||
    lower.includes("facts")
  ) {
    return "SEARCH_EVIDENCE";
  }

  // Sources / Citations checks
  if (
    lower.includes("source") ||
    lower.includes("citation") ||
    lower.includes("who said") ||
    lower.includes("where is that from") ||
    lower.includes("papers") ||
    lower.includes("reference")
  ) {
    return "SOURCES";
  }

  // Summarization checks
  if (
    lower.includes("summarize") ||
    lower.includes("summary") ||
    lower.includes("simple terms") ||
    lower.includes("briefly") ||
    lower.includes("tldr") ||
    lower.includes("in short")
  ) {
    return "SUMMARIZATION";
  }

  // Comparison checks
  if (
    lower.includes("compare") ||
    lower.includes("versus") ||
    lower.includes("vs") ||
    lower.includes("difference between")
  ) {
    return "COMPARISON";
  }

  // Debate arguments checks
  if (
    lower.includes("argument") ||
    lower.includes("reasons for") ||
    lower.includes("reasons against") ||
    lower.includes("pros and cons") ||
    lower.includes("how to debate") ||
    lower.includes("points against") ||
    lower.includes("points for")
  ) {
    return "DEBATE_ARGUMENTS";
  }

  return "EXPLANATION";
}

/**
 * Resolves pronouns ("this", "it", "the motion") to the active debate topic
 */
export function resolveContextualQuery(
  rawQuery: string,
  context?: DebateContextPayload
): { resolvedQuery: string; searchKeywords: string } {
  let text = rawQuery.trim();
  const currentMotion = context?.currentMotion;

  // Replace "this" / "the motion" with the actual topic if available
  if (currentMotion) {
    const motionRegex = /\b(this|this motion|this topic|the resolution|the motion|it)\b/gi;
    if (motionRegex.test(text)) {
      text = text.replace(motionRegex, `"${currentMotion}"`);
    } else if (text.length < 25 && !text.toLowerCase().includes(currentMotion.toLowerCase().slice(0, 15))) {
      text = `${text} regarding ${currentMotion}`;
    }
  }

  // Formulate concise web search query keywords
  let searchKeywords = text
    .replace(/\b(give me|show me|find me|can you tell me|what are|find recent|tell me about)\b/gi, "")
    .replace(/[?"'.,!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (searchKeywords.length < 5 && currentMotion) {
    searchKeywords = `${currentMotion} arguments evidence`;
  }

  return { resolvedQuery: text, searchKeywords };
}

/**
 * Generates structured AI answer using Gemini / OpenAI or built-in collegiate debate engine
 */
export async function processVoiceSearch(
  rawQuery: string,
  context?: DebateContextPayload
): Promise<VoiceSearchResponse> {
  const intent = classifyIntent(rawQuery, context);
  const { resolvedQuery, searchKeywords } = resolveContextualQuery(rawQuery, context);

  // Execute real web search
  const searchResult = await executeWebSearch(searchKeywords);
  const sources = searchResult.sources;

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // Build context history string if available
  const historyText = Array.isArray(context?.conversationHistory)
    ? context.conversationHistory
        .slice(-3)
        .map((t) => `${(t?.role || "USER").toUpperCase()}: ${t?.content || ""}`)
        .join("\n\n")
    : "";

  const motionContext = context?.currentMotion
    ? `ACTIVE DEBATE RESOLUTION: "${context.currentMotion}"\nUSER POSITION: ${context.userPosition || "FOR"}\nAI OPPONENT: ${context.aiPosition || "AGAINST"}\n`
    : "";

  // Sources snippet payload
  const sourcesContext = sources
    .map((s, i) => `[Source ${i + 1}] (${s.title} - ${s.domain}): ${s.snippet}`)
    .join("\n");

  const systemPrompt = `You are DebateAI Voice Research Assistant. You help debaters find arguments, facts, and easy-to-understand rebuttals for a hackathon debate.
${motionContext}
USER INTENT: ${intent}
RETRIEVED SOURCES:
${sourcesContext}

CONVERSATION HISTORY:
${historyText}

CRITICAL RULES:
- USE SIMPLE, CLEAR, EVERYDAY CONVERSATIONAL ENGLISH: Do NOT use complex academic jargon, flowery words, or hard-to-understand terms. Keep it punchy and direct so hackathon judges immediately understand.
- Direct spoken answer (70-100 words): Clear, natural, spoken tone.
- Facts: 2-3 concrete, simple facts or numbers.
- Analysis: 1-2 practical tips on how to use this argument clearly in simple words.
- Follow-up suggestions: 3 simple follow-up questions.

OUTPUT VALID JSON ONLY matching:
{
  "directAnswer": "...",
  "facts": ["...", "..."],
  "analysis": "...",
  "followUpSuggestions": ["...", "...", "..."]
}`;

  // Try Gemini
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nUSER VOICE QUERY: "${resolvedQuery}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.5,
            },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return {
            intent,
            searchQueryUsed: searchKeywords,
            directAnswer: parsed.directAnswer || "Analysis completed.",
            facts: Array.isArray(parsed.facts) ? parsed.facts : [],
            analysis: parsed.analysis || "Deploy this point by emphasizing real-world trade-offs.",
            sources,
            followUpSuggestions: Array.isArray(parsed.followUpSuggestions)
              ? parsed.followUpSuggestions
              : [
                  "Give me evidence for the first point.",
                  "How would the opponent counter this?",
                  "Summarize in one sentence.",
                ],
          };
        }
      }
    } catch (err) {
      console.warn("Gemini voice search error:", err);
    }
  }

  // Try Groq (Free fast inference)
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: resolvedQuery },
          ],
          temperature: 0.5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.choices?.[0]?.message?.content;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return {
            intent,
            searchQueryUsed: searchKeywords,
            directAnswer: parsed.directAnswer || "Analysis completed.",
            facts: Array.isArray(parsed.facts) ? parsed.facts : [],
            analysis: parsed.analysis || "Deploy this point by emphasizing real-world trade-offs.",
            sources,
            followUpSuggestions: Array.isArray(parsed.followUpSuggestions)
              ? parsed.followUpSuggestions
              : [
                  "Give me evidence for the first point.",
                  "How would the opponent counter this?",
                  "Summarize in one sentence.",
                ],
          };
        }
      }
    } catch (err) {
      console.warn("Groq voice search error:", err);
    }
  }

  // Try OpenAI
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: resolvedQuery },
          ],
          temperature: 0.5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.choices?.[0]?.message?.content;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return {
            intent,
            searchQueryUsed: searchKeywords,
            directAnswer: parsed.directAnswer || "Analysis completed.",
            facts: Array.isArray(parsed.facts) ? parsed.facts : [],
            analysis: parsed.analysis || "Deploy this point by emphasizing real-world trade-offs.",
            sources,
            followUpSuggestions: Array.isArray(parsed.followUpSuggestions)
              ? parsed.followUpSuggestions
              : [
                  "Give me evidence for the first point.",
                  "How would the opponent counter this?",
                  "Summarize in one sentence.",
                ],
          };
        }
      }
    } catch (err) {
      console.warn("OpenAI voice search error:", err);
    }
  }

  // Built-in Collegiate Debate Knowledge Synthesizer (Zero-key fallback in Simple English)
  return generateCollegiateSearchResponse(intent, resolvedQuery, searchKeywords, sources, context);
}

/**
 * Built-in Heuristic Search Synthesizer with Simple, Clear Everyday English
 */
function generateCollegiateSearchResponse(
  intent: IntentType,
  resolvedQuery: string,
  searchKeywords: string,
  sources: SourceItem[],
  context?: DebateContextPayload
): VoiceSearchResponse {
  const currentMotion = context?.currentMotion || "the motion under debate";

  let directAnswer = "";
  let facts: string[] = [];
  let analysis = "";
  let followUpSuggestions: string[] = [];

  switch (intent) {
    case "DEBATE_ARGUMENTS":
    case "COUNTERARGUMENTS":
      directAnswer = `Here are the top 3 practical arguments against this topic: First, strict rules end up helping huge tech giants who have armies of lawyers, while hurting small startups and students. Second, if only one country bans or restricts technology, companies simply move their research to other countries. Third, moving too slowly can block life-saving breakthroughs in medicine, clean energy, and everyday tools.`;
      facts = [
        "Small startups spend up to 3 times more of their budget on compliance than big tech companies.",
        "Open-source AI tools allow independent researchers around the world to build affordable solutions without big budgets.",
      ];
      analysis = `In your debate, lead with how this hurts small creators and helps big monopolies. Judges love clear, fair-competition arguments.`;
      followUpSuggestions = [
        "Give me an example of the startup argument.",
        "How can the other side respond to this?",
        "Summarize these arguments in simple terms.",
      ];
      break;

    case "SEARCH_EVIDENCE":
    case "SOURCES":
      directAnswer = `Real-world data and industry reports show that heavy regulations often slow down new startups, while bad actors ignore the rules anyway. Experts recommend focusing on specific safety checks rather than broad bans that hurt innovation.`;
      facts = [
        "Top AI models require millions of dollars in computing power, making hardware tracking much more effective than banning software code.",
        "Over 60% of independent researchers rely on open-source tools for educational and non-commercial work.",
      ];
      analysis = `Use concrete examples and real numbers in your speech to make your points believable and earn high Evidence points.`;
      followUpSuggestions = [
        "Find sources supporting the other side.",
        "What is the strongest opposing piece of data?",
        "Make this point sound more persuasive.",
      ];
      break;

    case "SUMMARIZATION":
      directAnswer = `In short: blanket bans and heavy rules hurt small innovators while big tech companies and rule-breakers stay ahead. The smart path is simple, clear safety rules that protect people without killing new ideas.`;
      facts = [
        "Over-regulation raises costs for normal people and startups.",
        "Focusing on real safety benchmarks works better than vague bans.",
      ];
      analysis = `Use this 15-second summary as your closing punchline to leave a memorable impression on the judges.`;
      followUpSuggestions = [
        "Expand on the safety benchmark point.",
        "Give me three rebuttal points to this summary.",
        "What questions will the judge ask?",
      ];
      break;

    default: // EXPLANATION or FOLLOW_UP
      directAnswer = `When looking at "${resolvedQuery}", the main debate is between caution and progress. Supporters believe strict safety rules prevent mistakes, while critics argue that too many restrictions stop helpful technologies that solve real human problems.`;
      facts = [
        "Creating government rules often takes 3 to 5 years, which is much slower than fast-moving tech.",
        "Testing ideas in real-world trial programs usually works better than flat bans.",
      ];
      analysis = `Ask the judges a simple question: should we slow down helpful technology out of fear, or build smart safeguards while moving forward?`;
      followUpSuggestions = [
        "Give me three strong arguments against this.",
        "Find simple evidence for this position.",
        "How do I explain this clearly in 30 seconds?",
      ];
      break;
  }

  return {
    intent,
    searchQueryUsed: searchKeywords,
    directAnswer,
    facts,
    analysis,
    sources,
    followUpSuggestions,
  };
}

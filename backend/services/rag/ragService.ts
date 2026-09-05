import { getKnowledgeChunks } from "./knowledgeStore";
import { RagChunk, RagQueryResult } from "@/lib/types/rag";
import { APP_CONFIG } from "@/config/appConfig";

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
  "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
  "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
  "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function retrieveKnowledge(
  query: string,
  options?: {
    topicId?: string;
    topK?: number;
    preferredStance?: string;
  }
): RagQueryResult {
  const startTime = Date.now();
  const chunks = getKnowledgeChunks();
  const topK = options?.topK || APP_CONFIG.rag.topKResults;
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return {
      query,
      topicId: options?.topicId,
      matchedChunks: [],
      formattedContext: "No specific knowledge base context retrieved.",
      durationMs: Date.now() - startTime,
    };
  }

  // Scored list
  const scoredChunks: Array<{ chunk: RagChunk; score: number }> = [];

  for (const chunk of chunks) {
    // 1. Topic Affinity Boost (filter or boost if matches debate topic or global principles)
    let topicMultiplier = 1.0;
    if (options?.topicId) {
      if (chunk.topicId === options.topicId) {
        topicMultiplier = 1.8;
      } else if (chunk.topicId === "global-debate-principles") {
        topicMultiplier = 1.1;
      } else {
        topicMultiplier = 0.4; // Deprioritize unrelated topics
      }
    }

    // 2. Keyword & Content Term Matching (TF-IDF approximation)
    const contentLower = chunk.content.toLowerCase();
    let termMatches = 0;
    let keywordBonus = 0;

    for (const token of queryTokens) {
      // Direct word match
      if (contentLower.includes(token)) {
        termMatches += 1;
      }
      // Metadata keyword match (higher weight)
      if (chunk.keywords.some((kw) => kw.toLowerCase().includes(token))) {
        keywordBonus += 2.0;
      }
      // Title match
      if (chunk.docTitle.toLowerCase().includes(token)) {
        keywordBonus += 1.5;
      }
    }

    // Normalized Term Frequency
    const termFrequency = termMatches / Math.max(queryTokens.length, 1);
    const rawScore = (termFrequency * 3.0 + keywordBonus) * topicMultiplier;

    if (rawScore > 0.1) {
      scoredChunks.push({
        chunk: {
          ...chunk,
          relevanceScore: Math.min(1.0, Number((rawScore / 5.0).toFixed(3))),
        },
        score: rawScore,
      });
    }
  }

  // Sort descending by score
  scoredChunks.sort((a, b) => b.score - a.score);
  const matchedChunks = scoredChunks.slice(0, topK).map((item) => item.chunk);

  // If no specific matches, return top chunk from current topic as baseline
  if (matchedChunks.length === 0 && options?.topicId) {
    const topicFallback = chunks.find((c) => c.topicId === options.topicId);
    if (topicFallback) {
      matchedChunks.push({
        ...topicFallback,
        relevanceScore: 0.5,
      });
    }
  }

  // Format into prompt-ready context
  const formattedContext = matchedChunks.length > 0
    ? matchedChunks
        .map(
          (c, idx) =>
            `[Evidence #${idx + 1}] Source: ${c.docTitle} (${c.category})\n` +
            `Content: ${c.content}\n` +
            `Citations: ${c.citations.join("; ") || "General Knowledge"}`
        )
        .join("\n\n")
    : "No direct empirical evidence found in knowledge base.";

  return {
    query,
    topicId: options?.topicId,
    matchedChunks,
    formattedContext,
    durationMs: Date.now() - startTime,
  };
}

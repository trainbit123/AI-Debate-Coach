import { RagChunk, TopicKnowledgeFile } from "@/lib/types/rag";

import aiReg from "@/data/knowledge_base/ai_regulation.json";
import ubi from "@/data/knowledge_base/universal_basic_income.json";
import remoteWork from "@/data/knowledge_base/remote_work.json";
import socialMedia from "@/data/knowledge_base/social_media_algorithms.json";
import nuclearEnergy from "@/data/knowledge_base/nuclear_energy.json";
import spaceExploration from "@/data/knowledge_base/space_exploration.json";
import debatePrinciples from "@/data/knowledge_base/debate_principles.json";

const STATIC_KNOWLEDGE_FILES: TopicKnowledgeFile[] = [
  aiReg as TopicKnowledgeFile,
  ubi as TopicKnowledgeFile,
  remoteWork as TopicKnowledgeFile,
  socialMedia as TopicKnowledgeFile,
  nuclearEnergy as TopicKnowledgeFile,
  spaceExploration as TopicKnowledgeFile,
  debatePrinciples as TopicKnowledgeFile,
];

let cachedChunks: RagChunk[] | null = null;

export function getKnowledgeChunks(): RagChunk[] {
  if (cachedChunks) return cachedChunks;

  const chunks: RagChunk[] = [];

  for (const topicFile of STATIC_KNOWLEDGE_FILES) {
    if (!topicFile || !Array.isArray(topicFile.documents)) continue;

    for (const doc of topicFile.documents) {
      // Chunk 1: Executive Summary & Framework
      chunks.push({
        chunkId: `${doc.id}-summary`,
        topicId: topicFile.topicId,
        docTitle: doc.title,
        category: doc.category,
        stanceAlignment: doc.stanceAlignment,
        content: `${doc.title} (${doc.category}): ${doc.summary}`,
        citations: doc.citations || [],
        keywords: doc.keywords || [],
      });

      // Chunk 2: Hard Evidence & Empirical Facts
      chunks.push({
        chunkId: `${doc.id}-evidence`,
        topicId: topicFile.topicId,
        docTitle: doc.title,
        category: doc.category,
        stanceAlignment: doc.stanceAlignment,
        content: `Empirical Evidence & Impact: ${doc.evidence} [Citations: ${doc.citations.join(", ")}]`,
        citations: doc.citations || [],
        keywords: doc.keywords || [],
      });
    }
  }

  cachedChunks = chunks;
  return chunks;
}

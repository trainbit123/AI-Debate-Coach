export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  stanceAlignment: "PRO" | "AGAINST" | "BALANCED" | "METHODOLOGY" | string;
  summary: string;
  evidence: string;
  citations: string[];
  keywords: string[];
}

export interface TopicKnowledgeFile {
  topicId: string;
  topicTitle: string;
  documents: KnowledgeDocument[];
}

export interface RagChunk {
  chunkId: string;
  topicId: string;
  docTitle: string;
  category: string;
  stanceAlignment: string;
  content: string;
  citations: string[];
  keywords: string[];
  relevanceScore?: number;
}

export interface RagQueryResult {
  query: string;
  topicId?: string;
  matchedChunks: RagChunk[];
  formattedContext: string;
  durationMs: number;
}

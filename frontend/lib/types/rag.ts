export type SourceType = "study" | "report" | "law" | "dataset" | "principle";

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  stanceAlignment: "PRO" | "AGAINST" | "BALANCED" | "METHODOLOGY" | string;
  sourceType?: SourceType;
  claim?: string;
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
  sourceType?: SourceType;
  claim?: string;
  content: string;
  citations: string[];
  keywords: string[];
  relevanceScore?: number; // Normalized 0-100 score
  reasonForRetrieval?: string; // Transparent retrieval justification
}

export interface RagQueryResult {
  query: string;
  topicId?: string;
  matchedChunks: RagChunk[];
  formattedContext: string;
  durationMs: number;
}

export type IntentType =
  | "DEBATE_ARGUMENTS"
  | "SEARCH_EVIDENCE"
  | "COUNTERARGUMENTS"
  | "SOURCES"
  | "EXPLANATION"
  | "SUMMARIZATION"
  | "COMPARISON"
  | "FOLLOW_UP";

export interface SourceItem {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
  sources?: SourceItem[];
}

export interface DebateContextPayload {
  currentMotion?: string;
  userPosition?: "FOR" | "AGAINST";
  aiPosition?: "FOR" | "AGAINST";
  conversationHistory?: ConversationTurn[];
}

export interface VoiceSearchRequest {
  query: string;
  context?: DebateContextPayload;
  language?: string;
}

export interface VoiceSearchResponse {
  intent: IntentType;
  searchQueryUsed: string;
  directAnswer: string;
  facts: string[];
  analysis: string;
  sources: SourceItem[];
  followUpSuggestions: string[];
}

export type VoiceSearchState =
  | "idle"
  | "listening"
  | "processing"
  | "searching"
  | "results"
  | "error";

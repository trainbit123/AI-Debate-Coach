"use client";

import React, { useState } from "react";
import { Database, ChevronDown, ChevronUp, BookOpen, CheckCircle, ExternalLink } from "lucide-react";

interface RagEvidenceChunk {
  chunkId: string;
  docTitle: string;
  category: string;
  content: string;
  citations: string[];
  relevanceScore?: number;
  sourceType?: string;
  claim?: string;
  reasonForRetrieval?: string;
}

interface RagEvidenceCardProps {
  matchedChunks: RagEvidenceChunk[];
  durationMs?: number;
}

export default function RagEvidenceCard({ matchedChunks, durationMs }: RagEvidenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!matchedChunks || matchedChunks.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-indigo-500/25 bg-indigo-950/25 p-2.5 text-xs transition-all duration-200 shadow-sm shadow-indigo-950/20">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left font-medium text-indigo-300 hover:text-indigo-200"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold text-indigo-200">Grounded by Verified RAG Evidence</span>
          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300 font-mono">
            {matchedChunks.length} {matchedChunks.length === 1 ? "source" : "sources"}
          </span>
          {durationMs !== undefined && (
            <span className="text-[10px] text-zinc-500 font-mono">({durationMs}ms)</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
          <span>{isExpanded ? "Collapse Evidence" : "Inspect Sources & Proof"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-2.5 space-y-2.5 pt-2.5 border-t border-indigo-500/20 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 p-2 text-[11px] text-indigo-200">
            <CheckCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>
              <strong>Empirical Grounding:</strong> The citations below represent verified data retrieved from the knowledge base, keeping the AI rebuttal grounded in facts rather than hallucinated claims.
            </span>
          </div>

          {matchedChunks.map((chunk, idx) => (
            <div
              key={chunk.chunkId || idx}
              className="rounded-lg bg-zinc-900/80 p-3 border border-zinc-800 space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{chunk.docTitle}</span>
                  {chunk.sourceType && (
                    <span className="rounded bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.2 text-[9px] text-indigo-300 font-medium uppercase tracking-wider">
                      {chunk.sourceType}
                    </span>
                  )}
                </div>
                {chunk.relevanceScore !== undefined && (
                  <span className="rounded bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400">
                    {Math.round(chunk.relevanceScore > 1 ? chunk.relevanceScore : chunk.relevanceScore * 100)}% match
                  </span>
                )}
              </div>

              {chunk.reasonForRetrieval && (
                <p className="text-[10px] text-indigo-300/80 font-mono bg-indigo-950/30 rounded px-2 py-0.5 border border-indigo-500/10">
                  Why retrieved: {chunk.reasonForRetrieval}
                </p>
              )}

              <p className="text-[11px] text-zinc-300 leading-relaxed">{chunk.content}</p>

              {chunk.citations && chunk.citations.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-zinc-500 font-medium">Verified Citations:</span>
                  {chunk.citations.map((cite, cIdx) => (
                    <span
                      key={cIdx}
                      className="rounded bg-zinc-800 px-1.5 py-0.5 italic text-zinc-300 font-serif border border-zinc-700/50"
                    >
                      &ldquo;{cite}&rdquo;
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

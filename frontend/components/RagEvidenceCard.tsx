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
}

interface RagEvidenceCardProps {
  matchedChunks: RagEvidenceChunk[];
  durationMs?: number;
}

export default function RagEvidenceCard({ matchedChunks, durationMs }: RagEvidenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!matchedChunks || matchedChunks.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-2.5 text-xs transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left font-medium text-indigo-300 hover:text-indigo-200"
      >
        <div className="flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold text-indigo-200">Grounded by RAG Knowledge</span>
          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300">
            {matchedChunks.length} {matchedChunks.length === 1 ? "source" : "sources"}
          </span>
          {durationMs !== undefined && (
            <span className="text-[10px] text-zinc-500">({durationMs}ms)</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-indigo-400">
          <span>{isExpanded ? "Hide Evidence" : "Inspect Sources"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-2.5 space-y-2 pt-2 border-t border-indigo-500/20">
          <p className="text-[11px] text-zinc-400">
            The AI retrieved these verified empirical records from the knowledge base to ground its rebuttal:
          </p>
          {matchedChunks.map((chunk, idx) => (
            <div
              key={chunk.chunkId || idx}
              className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <BookOpen className="h-3 w-3 text-indigo-400" />
                  <span>{chunk.docTitle}</span>
                </div>
                {chunk.relevanceScore !== undefined && (
                  <span className="rounded bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-mono text-emerald-400">
                    {Math.round(chunk.relevanceScore * 100)}% match
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">{chunk.content}</p>
              {chunk.citations && chunk.citations.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] text-zinc-400">
                  <span className="text-zinc-500">Citations:</span>
                  {chunk.citations.map((cite, cIdx) => (
                    <span key={cIdx} className="italic text-zinc-400">
                      "{cite}"{cIdx < chunk.citations.length - 1 ? "," : ""}
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

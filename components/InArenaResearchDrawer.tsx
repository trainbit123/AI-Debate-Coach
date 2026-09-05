"use client";

import React, { useState } from "react";
import { Sparkles, Bot, Search, ChevronUp, ChevronDown, BookOpen, X } from "lucide-react";
import { DebateContextPayload, VoiceSearchResponse, VoiceSearchState } from "@/lib/types/search";
import VoiceSearchInput from "./VoiceSearchInput";
import SearchResults from "./SearchResults";
import { cn } from "@/lib/utils";

interface InArenaResearchDrawerProps {
  currentMotion: string;
  userPosition: "FOR" | "AGAINST";
  aiPosition: "FOR" | "AGAINST";
}

export default function InArenaResearchDrawer({
  currentMotion,
  userPosition,
  aiPosition,
}: InArenaResearchDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentResult, setCurrentResult] = useState<VoiceSearchResponse | null>(null);
  const [searchState, setSearchState] = useState<VoiceSearchState>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const debateContext: DebateContextPayload = {
    currentMotion,
    userPosition,
    aiPosition,
  };

  const handleSearch = async (queryText: string, language: string = "en-US") => {
    if (!queryText.trim() || isLoading) return;

    setIsLoading(true);
    setSearchState("processing");
    setLastQuery(queryText);

    try {
      setSearchState("searching");

      const res = await fetch("/api/search/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          context: debateContext,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error("Research query failed.");
      }

      const data: VoiceSearchResponse = await res.json();
      setCurrentResult(data);
      setSearchState("results");
    } catch (err) {
      console.error("In-arena voice search error:", err);
      setSearchState("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Toggle Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Live Debate Research Partner</span>
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                Context-Aware
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Search or ask for evidence, statistics, or counter-points regarding this motion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isOpen ? "Collapse" : "Open Research Partner"}</span>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded Content Drawer */}
      {isOpen && (
        <div className="p-5 border-t border-slate-800/80 space-y-5 animate-in fade-in duration-200 bg-slate-950/40">
          <VoiceSearchInput
            onSearch={handleSearch}
            isLoading={isLoading}
            searchState={searchState}
            placeholder='Ask: "Give me 3 strong arguments against this" or "Find recent evidence..."'
          />

          {currentResult ? (
            <SearchResults
              data={currentResult}
              userQuery={lastQuery}
              onSelectFollowUp={(q) => handleSearch(q)}
            />
          ) : (
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-xs text-slate-400 flex items-center justify-between">
              <span>
                Tip: The Research Partner knows you are debating &ldquo;{currentMotion}&rdquo;. Search or speak <strong>&ldquo;against this&rdquo;</strong> or <strong>&ldquo;for my stance&rdquo;</strong> to retrieve targeted evidence!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

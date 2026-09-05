"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Search, Bot, ArrowRight, Swords, History, BookOpen } from "lucide-react";
import { VoiceSearchResponse, VoiceSearchState } from "@/lib/types/search";
import VoiceSearchInput from "@/components/VoiceSearchInput";
import SearchResults from "@/components/SearchResults";

export default function SearchPage() {
  const [currentResult, setCurrentResult] = useState<VoiceSearchResponse | null>(null);
  const [searchState, setSearchState] = useState<VoiceSearchState>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

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
          language,
        }),
      });

      if (!res.ok) {
        throw new Error("Search query failed.");
      }

      const data: VoiceSearchResponse = await res.json();
      setCurrentResult(data);
      setSearchState("results");
    } catch (err) {
      console.error("Voice search error:", err);
      setSearchState("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Voice Search & Research Lab</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Ask by Voice. Retrieve Evidence. Steel-Man Arguments.
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Speak your questions naturally to search real web sources, extract empirical statistics,
          and explore rhetorical debate strategies.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="mx-auto max-w-3xl">
        <VoiceSearchInput
          onSearch={handleSearch}
          isLoading={isLoading}
          searchState={searchState}
          placeholder='Try: "Give me arguments against AI regulation" or "Find recent evidence..."'
        />
      </div>

      {/* Results Display */}
      {currentResult ? (
        <div className="mx-auto max-w-4xl pt-4">
          <SearchResults
            data={currentResult}
            userQuery={lastQuery}
            onSelectFollowUp={(q) => handleSearch(q)}
          />

          {/* Quick Debate Launch from Search */}
          <div className="mt-8 rounded-2xl border border-blue-500/30 bg-blue-950/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Ready to debate this topic?</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Take these arguments into the Live Arena against the AI opponent.
              </p>
            </div>
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all shrink-0"
            >
              <Swords className="h-4 w-4" />
              <span>Launch Arena Match</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Suggested Research Prompts */
        <div className="mx-auto max-w-3xl pt-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
            Suggested Voice Queries:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                query: "What are the strongest arguments against AI regulation?",
                desc: "Analyzes anti-competitive lock-in and global jurisdiction arbitrage.",
              },
              {
                query: "Find recent evidence about whether AI regulation affects innovation.",
                desc: "Retrieves empirical data from policy and economic institutes.",
              },
              {
                query: "Give me counterarguments to universal basic income inflation risks.",
                desc: "Generates fiscal math and progressive tax recycling rebuttals.",
              },
              {
                query: "Find sources on nuclear energy lifecycle carbon emissions.",
                desc: "Cites IAEA and peer-reviewed grid reliability benchmarks.",
              },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearch(item.query)}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left hover:border-blue-500/40 hover:bg-slate-800/60 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 group-hover:text-blue-300">
                  <span>&ldquo;{item.query}&rdquo;</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

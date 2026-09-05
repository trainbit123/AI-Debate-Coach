"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Sparkles,
  Bot,
  Search,
  MessageSquare,
  History,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import {
  ConversationTurn,
  DebateContextPayload,
  VoiceSearchResponse,
  VoiceSearchState,
} from "@/lib/types/search";
import VoiceSearchInput from "./VoiceSearchInput";
import SearchResults from "./SearchResults";
import { cn } from "@/lib/utils";

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  debateContext?: DebateContextPayload;
}

export default function VoiceSearchModal({
  isOpen,
  onClose,
  debateContext,
}: VoiceSearchModalProps) {
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [currentResult, setCurrentResult] = useState<VoiceSearchResponse | null>(null);
  const [searchState, setSearchState] = useState<VoiceSearchState>("idle");
  const [lastQuery, setLastQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExecuteSearch = async (queryText: string, language: string = "en-US") => {
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
          context: {
            ...debateContext,
            conversationHistory: history,
          },
          language,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Search failed.");
      }

      const data: VoiceSearchResponse = await res.json();
      setCurrentResult(data);
      setSearchState("results");

      // Update conversation history
      setHistory((prev) => [
        ...prev,
        { role: "user", content: queryText },
        { role: "assistant", content: data.directAnswer, sources: data.sources },
      ]);
    } catch (err: any) {
      console.error("Voice search execution error:", err);
      setSearchState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConversation = () => {
    setHistory([]);
    setCurrentResult(null);
    setSearchState("idle");
    setLastQuery("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>AI Voice Search & Research Assistant</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Speak questions, retrieve live empirical evidence, and develop counterarguments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleResetConversation}
                title="Reset conversation"
                className="flex items-center gap-1 rounded-lg border border-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Active Debate Context Notice */}
        {debateContext?.currentMotion && (
          <div className="bg-blue-950/30 border-b border-blue-500/20 px-6 py-2 flex items-center justify-between text-xs text-blue-300">
            <span className="truncate">
              Context: <strong>&ldquo;{debateContext.currentMotion}&rdquo;</strong>
            </span>
            <span className="text-[10px] text-blue-400/80 font-semibold uppercase">
              You can say &ldquo;this&rdquo; to refer to this motion
            </span>
          </div>
        )}

        {/* Search Input Bar */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/40">
          <VoiceSearchInput
            onSearch={handleExecuteSearch}
            isLoading={isLoading}
            searchState={searchState}
            placeholder='Try: "Give me arguments against AI regulation" or "Find recent evidence..."'
          />
        </div>

        {/* Scrollable Results / History Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[250px]">
          {currentResult ? (
            <SearchResults
              data={currentResult}
              userQuery={lastQuery}
              onSelectFollowUp={(q) => handleExecuteSearch(q)}
            />
          ) : history.length === 0 ? (
            /* Starter Prompts */
            <div className="py-8 text-center space-y-4">
              <Bot className="mx-auto h-12 w-12 text-slate-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-300">What would you like to research?</h4>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                  Click the microphone icon above and ask any question naturally, or pick a debate research starter below:
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto pt-2">
                {[
                  "What are the strongest arguments against AI regulation?",
                  "Find recent evidence about AI regulation and innovation",
                  "Give me empirical proof on nuclear energy carbon emissions",
                  "Explain the slippery slope fallacy with debate examples",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleExecuteSearch(prompt)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:border-blue-500/40 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

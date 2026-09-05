"use client";

import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Brain,
  Search,
  Volume2,
  VolumeX,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { VoiceSearchResponse } from "@/lib/types/search";
import { SpeechService } from "@/services/speechService";
import SourceCard from "./SourceCard";
import { cn } from "@/lib/utils";

interface SearchResultsProps {
  data: VoiceSearchResponse;
  userQuery?: string;
  onSelectFollowUp?: (query: string) => void;
  className?: string;
}

export default function SearchResults({
  data,
  userQuery,
  onSelectFollowUp,
  className,
}: SearchResultsProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleToggleSpeak = () => {
    if (isPlayingAudio) {
      SpeechService.cancelSpeech();
      setIsPlayingAudio(false);
      return;
    }

    const fullText = `${data.directAnswer}. Key facts: ${data.facts.join(". ")}`;
    setIsPlayingAudio(true);

    SpeechService.speak(fullText, {
      rate: 1.05,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  return (
    <div className={cn("space-y-5 animate-in fade-in duration-300", className)}>
      {/* Search Query Used Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Search className="h-3.5 w-3.5 text-blue-400" />
          <span>Interpreted Search Query:</span>
          <code className="rounded-md bg-slate-950 px-2.5 py-1 font-mono text-[11px] text-blue-300 border border-slate-800">
            &ldquo;{data.searchQueryUsed}&rdquo;
          </code>
        </div>

        {/* Listen to Answer button */}
        <button
          type="button"
          onClick={handleToggleSpeak}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer",
            isPlayingAudio
              ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
              : "bg-slate-900 text-purple-300 border-purple-500/30 hover:bg-slate-800 hover:text-white"
          )}
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="h-3.5 w-3.5" />
              <span>Pause Audio</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5" />
              <span>Listen to Answer</span>
            </>
          )}
        </button>
      </div>

      {/* 1. AI Answer Box */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/20 via-slate-900 to-slate-900 p-5 shadow-xl">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="h-4 w-4" />
          <span>AI Synthesized Answer</span>
        </div>
        <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-normal">
          {data.directAnswer}
        </p>
      </div>

      {/* 2. Key Empirical Facts vs Debate Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Facts */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4" />
            <span>Documented Empirical Facts</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200">
            {data.facts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Debate Rhetorical Analysis */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Brain className="h-4 w-4" />
            <span>Rhetorical Deployment Strategy</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.analysis}
          </p>
        </div>
      </div>

      {/* 3. Verified Sources */}
      {data.sources && data.sources.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span>Verifiable Sources & References ({data.sources.length})</span>
            </div>
            <span className="text-[11px] text-slate-500">Live web citations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {data.sources.map((source, idx) => (
              <SourceCard key={idx} source={source} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* 4. Follow-Up Suggestions */}
      {data.followUpSuggestions && data.followUpSuggestions.length > 0 && (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
            <span>Ask a Follow-Up Question (Click or Speak):</span>
          </span>

          <div className="flex flex-wrap gap-2 pt-1">
            {data.followUpSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectFollowUp?.(suggestion)}
                className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:border-blue-500/40 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <span>&ldquo;{suggestion}&rdquo;</span>
                <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

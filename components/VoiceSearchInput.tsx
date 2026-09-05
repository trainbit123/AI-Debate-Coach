"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, Mic, MicOff, Globe2, Send, X, AlertCircle, ArrowRight } from "lucide-react";
import { VoiceSearchState } from "@/lib/types/search";
import VoiceSearchButton from "./VoiceSearchButton";
import { SpeechService } from "@/services/speechService";
import { cn, playChime } from "@/lib/utils";

interface VoiceSearchInputProps {
  onSearch: (query: string, language: string) => void;
  isLoading?: boolean;
  searchState?: VoiceSearchState;
  placeholder?: string;
  className?: string;
  initialQuery?: string;
}

export default function VoiceSearchInput({
  onSearch,
  isLoading = false,
  searchState = "idle",
  placeholder = "Ask a question, find evidence, or request arguments...",
  className,
  initialQuery = "",
}: VoiceSearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"type" | "voice">("voice");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleStartVoice = async () => {
    if (isListening) {
      handleStopVoice();
      return;
    }

    setErrorMessage(null);
    setQuery("");

    if (!SpeechService.isSTTSupported()) {
      setErrorMessage("Speech recognition is not supported in this browser. Please type your query.");
      setInputMode("type");
      return;
    }

    playChime("start");
    setIsListening(true);

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false; // Voice search queries are single-shot
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setQuery(transcript);

        // If final result, auto-trigger search
        if (event.results[0]?.isFinal && transcript.trim().length >= 3) {
          setIsListening(false);
          playChime("submit");
          onSearch(transcript.trim(), language);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone permission denied. Click the lock icon in your URL bar to allow, or type your search.");
        } else if (event.error === "no-speech") {
          setErrorMessage("No speech detected. Click the mic to try again.");
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      setIsListening(false);
      setErrorMessage(`Microphone access error: ${err?.message || "Could not start recording"}`);
    }
  };

  const handleStopVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    playChime("stop");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    handleStopVoice();
    onSearch(query.trim(), language);
  };

  const activeState: VoiceSearchState = isListening
    ? "listening"
    : isLoading
    ? "searching"
    : errorMessage
    ? "error"
    : searchState;

  return (
    <div className={cn("space-y-3", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center rounded-2xl border border-slate-700/80 bg-slate-950/90 shadow-2xl transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 backdrop-blur-xl">
          {/* Left search icon */}
          <div className="pl-4 text-slate-500">
            <Search className="h-5 w-5" />
          </div>

          {/* Search Input Box */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? "Listening... Speak your question now..." : placeholder}
            className="w-full bg-transparent px-3.5 py-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Language Selector */}
          <div className="hidden sm:flex items-center gap-1 border-l border-slate-800 px-3 text-xs text-slate-400">
            <Globe2 className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="en-US" className="bg-slate-900 text-white">English (US)</option>
              <option value="te-IN" className="bg-slate-900 text-white">Telugu (తెలుగు)</option>
              <option value="hi-IN" className="bg-slate-900 text-white">Hindi (हिन्दी)</option>
            </select>
          </div>

          {/* Right Action Button: Mic or Submit */}
          <div className="pr-2 flex items-center gap-2">
            <VoiceSearchButton
              state={activeState}
              onClick={handleStartVoice}
              disabled={isLoading}
              showLabel={false}
              className="h-10 w-10 p-0 rounded-xl"
            />

            {query.trim() && (
              <button
                type="submit"
                disabled={isLoading}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer disabled:opacity-50"
                title="Submit Search"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Error notification */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3.5 py-2 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

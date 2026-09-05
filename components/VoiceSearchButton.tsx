"use client";

import React from "react";
import { Mic, MicOff, RefreshCw, AlertCircle, CheckCircle2, Search, Loader2 } from "lucide-react";
import { VoiceSearchState } from "@/lib/types/search";
import { cn } from "@/lib/utils";

interface VoiceSearchButtonProps {
  state: VoiceSearchState;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
}

export default function VoiceSearchButton({
  state,
  onClick,
  disabled = false,
  className,
  showLabel = true,
}: VoiceSearchButtonProps) {
  const stateConfigs = {
    idle: {
      icon: Mic,
      label: "Ask by voice",
      bgColor: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25",
      ringColor: "ring-blue-500/20",
    },
    listening: {
      icon: MicOff,
      label: "Listening...",
      bgColor: "bg-rose-600 text-white shadow-rose-600/30",
      ringColor: "ring-rose-500/50 animate-pulse",
    },
    processing: {
      icon: Loader2,
      label: "Understanding your question...",
      bgColor: "bg-purple-600 text-white shadow-purple-600/30",
      ringColor: "ring-purple-500/30",
      spin: true,
    },
    searching: {
      icon: Search,
      label: "Searching...",
      bgColor: "bg-indigo-600 text-white shadow-indigo-600/30",
      ringColor: "ring-indigo-500/30",
      spin: true,
    },
    results: {
      icon: CheckCircle2,
      label: "Results ready",
      bgColor: "bg-emerald-600 text-white shadow-emerald-600/30",
      ringColor: "ring-emerald-500/30",
    },
    error: {
      icon: AlertCircle,
      label: "I couldn't understand that. Please try again.",
      bgColor: "bg-amber-600 text-white shadow-amber-600/30",
      ringColor: "ring-amber-500/30",
    },
  };

  const current = stateConfigs[state] || stateConfigs.idle;
  const Icon = current.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || state === "processing" || state === "searching"}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition-all duration-200 ring-2 cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed",
        current.bgColor,
        current.ringColor,
        className
      )}
      title={current.label}
    >
      {state === "listening" && (
        <span className="absolute -inset-1 rounded-xl bg-rose-500/30 animate-ping pointer-events-none" />
      )}
      <Icon className={cn("h-4 w-4 shrink-0", (current as any).spin && "animate-spin")} />
      {showLabel && <span className="font-semibold">{current.label}</span>}
    </button>
  );
}

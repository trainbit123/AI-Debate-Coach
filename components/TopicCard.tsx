"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicCardProps {
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  isSelected: boolean;
  onSelect: () => void;
}

export default function TopicCard({
  title,
  category,
  difficulty,
  isSelected,
  onSelect,
}: TopicCardProps) {
  const difficultyColors = {
    beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    intermediate: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    advanced: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200",
        isSelected
          ? "border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/40"
          : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/50"
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {category}
        </span>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
            difficultyColors[difficulty]
          )}
        >
          {difficulty}
        </span>
      </div>

      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
        &ldquo;{title}&rdquo;
      </h4>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 group-hover:text-blue-400 transition-colors">
        <span>{isSelected ? "Selected Motion" : "Click to select"}</span>
        <ArrowRight className={cn("h-3.5 w-3.5 transition-transform", isSelected ? "translate-x-1" : "group-hover:translate-x-1")} />
      </div>
    </div>
  );
}

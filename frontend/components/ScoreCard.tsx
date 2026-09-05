"use client";

import React from "react";
import { ArgumentScore } from "@/lib/types/debate";
import { Award, Brain, CheckCircle2, Flame, HelpCircle, Info, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  score: ArgumentScore;
  className?: string;
  showCoachFeedback?: boolean;
}

export default function ScoreCard({
  score,
  className,
  showCoachFeedback = true,
}: ScoreCardProps) {
  const metrics = [
    {
      label: "Logic",
      value: score.logic,
      color: "from-blue-500 to-indigo-500",
      description: "Clear reasoning and strong logic without traps",
    },
    {
      label: "Evidence",
      value: score.evidence,
      color: "from-emerald-500 to-teal-500",
      description: "Real-world facts, numbers, and concrete examples",
    },
    {
      label: "Relevance",
      value: score.relevance,
      color: "from-purple-500 to-pink-500",
      description: "Staying directly focused on the debate topic",
    },
    {
      label: "Clarity",
      value: score.clarity,
      color: "from-amber-500 to-orange-500",
      description: "Clear, punchy, easy-to-understand speech",
    },
    {
      label: "Rebuttal",
      value: score.counterargumentHandling,
      color: "from-cyan-500 to-blue-500",
      description: "Directly answering and disproving the opponent's claims",
    },
  ];

  // Grade determination
  let grade = "C";
  let gradeColor = "text-amber-400 border-amber-400/30 bg-amber-500/10";
  if (score.overall >= 90) {
    grade = "A+ (Outstanding)";
    gradeColor = "text-emerald-400 border-emerald-400/30 bg-emerald-500/10";
  } else if (score.overall >= 80) {
    grade = "A (Great Argument)";
    gradeColor = "text-blue-400 border-blue-400/30 bg-blue-500/10";
  } else if (score.overall >= 70) {
    grade = "B (Solid Points)";
    gradeColor = "text-cyan-400 border-cyan-400/30 bg-cyan-500/10";
  } else if (score.overall >= 60) {
    grade = "C (Fair Effort)";
    gradeColor = "text-amber-400 border-amber-400/30 bg-amber-500/10";
  } else {
    grade = "Needs Practice";
    gradeColor = "text-rose-400 border-rose-400/30 bg-rose-500/10";
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-black/20 backdrop-blur-sm",
        className
      )}
    >
      {/* Header with Overall Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Round Argument Score</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-Time Argument Scorecard</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-bold tracking-wide",
              gradeColor
            )}
          >
            {grade}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight text-white">
              {score.overall}
            </span>
            <span className="text-xs font-semibold text-slate-500">/100</span>
          </div>
        </div>
      </div>

      {/* 5-Metric Breakdown */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="group rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 transition-colors hover:border-slate-700"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">{m.label}</span>
              <span className="font-bold text-white">{m.value}%</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r", m.color)}
                style={{ width: `${Math.min(100, Math.max(5, m.value))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Weaknesses Callouts */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
              Strongest Aspect
            </span>
            <p className="mt-0.5 text-slate-300 leading-relaxed">
              {score.strongestPoint}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-rose-950/15 p-3 flex items-start gap-2.5">
          <Flame className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">
              Vulnerability / Weakest Aspect
            </span>
            <p className="mt-0.5 text-slate-300 leading-relaxed">
              {score.weakestPoint}
            </p>
          </div>
        </div>
      </div>

      {/* Coach Feedback */}
      {showCoachFeedback && score.coachFeedback && (
        <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-950/20 p-3 flex items-start gap-2.5 text-xs">
          <Sparkles className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
          <div>
            <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">
              AI Coach Real-time Guidance
            </span>
            <p className="mt-0.5 text-blue-200/90 leading-relaxed">
              {score.coachFeedback}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

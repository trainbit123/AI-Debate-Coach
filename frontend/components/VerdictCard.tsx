"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Award, CheckCircle, Scale, ShieldAlert, Sparkles, Trophy, XCircle } from "lucide-react";
import { FinalReport } from "@/lib/types/debate";
import { cn } from "@/lib/utils";

interface VerdictCardProps {
  verdict: FinalReport;
  className?: string;
}

export default function VerdictCard({ verdict, className }: VerdictCardProps) {
  useEffect(() => {
    if (verdict.ruling === "User Won") {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"],
        });
      } catch (e) {
        // Fallback if canvas-confetti is not available
      }
    }
  }, [verdict.ruling]);

  const rulingConfig = {
    "User Won": {
      icon: Trophy,
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      gradient: "from-emerald-950/40 via-slate-900 to-slate-900",
      borderColor: "border-emerald-500/30",
      label: "User Victory",
    },
    "AI Opponent Won": {
      icon: ShieldAlert,
      badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      gradient: "from-rose-950/40 via-slate-900 to-slate-900",
      borderColor: "border-rose-500/30",
      label: "AI Opponent Victory",
    },
    "Draw / Tie": {
      icon: Scale,
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      gradient: "from-amber-950/40 via-slate-900 to-slate-900",
      borderColor: "border-amber-500/30",
      label: "Judicial Stalemate / Draw",
    },
  };

  const config = rulingConfig[verdict.ruling] || rulingConfig["Draw / Tie"];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-gradient-to-b p-6 sm:p-8 shadow-2xl backdrop-blur-md",
        config.borderColor,
        config.gradient,
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 shadow-xl ring-2 ring-white/10 shrink-0">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider",
                  config.badgeColor
                )}
              >
                {config.label}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Oxford Debate Adjudication
              </span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
              {verdict.verdictTitle}
            </h2>
          </div>
        </div>

        {/* Big Overall Score Circle */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950/60 p-4 border border-slate-800 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Final Debate Score
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tight text-white">
              {verdict.overallScore}
            </span>
            <span className="text-sm font-bold text-slate-500">/100</span>
          </div>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
          Judicial Synthesis
        </h4>
        <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-slate-300">
          {verdict.verdictSummary}
        </p>
      </div>

      {/* Master Coach Advice Bullet Points */}
      {verdict.coachAdvice && verdict.coachAdvice.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Master Coach Recommendations:</span>
          </h4>
          <ul className="space-y-2">
            {verdict.coachAdvice.map((advice, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                  {idx + 1}
                </div>
                <p className="leading-relaxed">{advice}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { CheckCircle2, Circle, Clock, Infinity as InfinityIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoundTimelineProps {
  currentRound: number;
  maxRounds: number;
  completedRounds: number;
  isComplete: boolean;
  isEndless?: boolean;
  onSelectRound?: (roundNum: number) => void;
  selectedRound?: number;
}

export default function RoundTimeline({
  currentRound,
  maxRounds,
  completedRounds,
  isComplete,
  isEndless = false,
  onSelectRound,
  selectedRound,
}: RoundTimelineProps) {
  const isContinuous = isEndless || maxRounds >= 999 || maxRounds === 0;

  // For continuous endless mode, generate rounds dynamically based on progress
  const totalDisplayRounds = isContinuous
    ? isComplete
      ? completedRounds
      : Math.max(completedRounds + 1, currentRound)
    : Math.max(1, maxRounds);

  const rounds = Array.from({ length: totalDisplayRounds }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 max-w-full scrollbar-thin">
      {rounds.map((roundNum, index) => {
        const isDone = roundNum <= completedRounds;
        const isCurrent = roundNum === currentRound && !isComplete;
        const isSelected = selectedRound === roundNum;

        return (
          <React.Fragment key={roundNum}>
            {/* Round Step Node */}
            <button
              type="button"
              onClick={() => onSelectRound && isDone && onSelectRound(roundNum)}
              disabled={!isDone && !isCurrent}
              className={cn(
                "group relative flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all duration-200 shrink-0",
                isSelected
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400"
                  : isDone
                  ? "bg-slate-800/80 text-emerald-400 hover:bg-slate-800"
                  : isCurrent
                  ? "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/40"
                  : "bg-slate-900 text-slate-600 cursor-not-allowed"
              )}
            >
              {isDone ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              ) : isCurrent ? (
                <Clock className="h-3.5 w-3.5 shrink-0 text-blue-400 animate-pulse" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-slate-600" />
              )}
              <span>R{roundNum}</span>
            </button>

            {/* Connecting Line */}
            {index < rounds.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-4 sm:w-6 rounded-full shrink-0 transition-colors",
                  roundNum < completedRounds
                    ? "bg-emerald-500/60"
                    : roundNum === completedRounds && isComplete
                    ? "bg-emerald-500/60"
                    : "bg-slate-800"
                )}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Endless indicator node if in continuous sparring mode */}
      {isContinuous && !isComplete && (
        <>
          <div className="h-0.5 w-4 sm:w-6 rounded-full shrink-0 bg-slate-800" />
          <div
            className="flex items-center gap-1 rounded-xl bg-indigo-950/40 border border-indigo-800/50 px-2.5 py-1 text-[11px] font-bold text-indigo-300 shrink-0"
            title="Continuous Sparring: Debate for N rounds and conclude anytime"
          >
            <InfinityIcon className="h-3 w-3 text-indigo-400" />
            <span>Endless</span>
          </div>
        </>
      )}
    </div>
  );
}

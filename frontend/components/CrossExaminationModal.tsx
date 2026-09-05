"use client";

import React from "react";
import { HelpCircle, X, Target, Lightbulb } from "lucide-react";
import { CrossExaminationQuestion } from "@/lib/types/debate";

interface CrossExaminationModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: CrossExaminationQuestion[];
  isLoading: boolean;
}

export default function CrossExaminationModal({
  isOpen,
  onClose,
  questions,
  isLoading,
}: CrossExaminationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-amber-500/30 bg-zinc-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Socratic Cross-Examination</h3>
            <p className="text-xs text-zinc-400">
              The AI tests the resilience of your premises before you submit your turn.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mb-3" />
            <p className="text-sm text-zinc-300 font-medium">Formulating Socratic challenges...</p>
          </div>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={idx} className="rounded-xl bg-zinc-900/70 p-4 border border-zinc-800 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-zinc-100">{q.question}</p>
                </div>
                <div className="pl-7 space-y-1 text-xs">
                  <div className="flex items-start gap-1.5 text-zinc-400">
                    <Target className="h-3.5 w-3.5 text-rose-400 mt-0.5 shrink-0" />
                    <span><strong className="text-zinc-300">Target Premise:</strong> {q.targetPremise}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-zinc-400">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong className="text-zinc-300">Defense Coach Tip:</strong> {q.coachingTip}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Got It, Return to Debate
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

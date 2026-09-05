"use client";

import React from "react";
import { Sparkles, X, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { ImprovedArgumentResponse } from "@/lib/types/debate";

interface ArgumentImproverModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalArgument: string;
  improvedData: ImprovedArgumentResponse | null;
  isLoading: boolean;
  onApplyImproved: (text: string) => void;
}

export default function ArgumentImproverModal({
  isOpen,
  onClose,
  originalArgument,
  improvedData,
  isLoading,
  onApplyImproved,
}: ArgumentImproverModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-indigo-500/30 bg-zinc-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Argument Improver (Toulmin Model)</h3>
            <p className="text-xs text-zinc-400">
              Rewrites your claim with formal warrants, empirical grounding, and zero informal fallacies.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-3" />
            <p className="text-sm text-zinc-300 font-medium">Deconstructing argument premises...</p>
            <p className="text-xs text-zinc-500 mt-1">Applying Toulmin framework and retrieving empirical warrants</p>
          </div>
        ) : improvedData ? (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Original vs Improved */}
            <div className="space-y-3">
              <div className="rounded-xl bg-zinc-900/60 p-3 border border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Your Original Draft
                </span>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed italic">
                  "{originalArgument}"
                </p>
              </div>

              <div className="rounded-xl bg-indigo-950/30 p-4 border border-indigo-500/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Collegiate Improved Version
                  </span>
                </div>
                <p className="text-sm text-zinc-100 font-medium leading-relaxed">
                  "{improvedData.improvedArgument}"
                </p>
              </div>
            </div>

            {/* Key Improvements Made */}
            {improvedData.keyChanges && improvedData.keyChanges.length > 0 && (
              <div className="rounded-xl bg-zinc-900/40 p-3.5 border border-zinc-800">
                <h4 className="text-xs font-semibold text-zinc-300 mb-2">Key Enhancements Applied:</h4>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  {improvedData.keyChanges.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Toulmin Breakdown */}
            {improvedData.toulminBreakdown && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-zinc-900 p-2.5 border border-zinc-800">
                  <span className="text-[10px] font-bold text-indigo-400">1. Claim</span>
                  <p className="text-zinc-300 mt-1">{improvedData.toulminBreakdown.claim}</p>
                </div>
                <div className="rounded-lg bg-zinc-900 p-2.5 border border-zinc-800">
                  <span className="text-[10px] font-bold text-emerald-400">2. Warrant</span>
                  <p className="text-zinc-300 mt-1">{improvedData.toulminBreakdown.warrant}</p>
                </div>
                <div className="rounded-lg bg-zinc-900 p-2.5 border border-zinc-800">
                  <span className="text-[10px] font-bold text-amber-400">3. Impact</span>
                  <p className="text-zinc-300 mt-1">{improvedData.toulminBreakdown.impact}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Keep Original
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyImproved(improvedData.improvedArgument);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
              >
                <span>Use Improved Argument</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

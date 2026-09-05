"use client";

import React, { useState } from "react";
import { AlertTriangle, ChevronRight, HelpCircle, Lightbulb, X } from "lucide-react";
import { DetectedFallacy } from "@/lib/types/debate";
import { FALLACY_CATALOG } from "@/services/fallacyDetector";
import { cn } from "@/lib/utils";

interface FallacyBadgeProps {
  fallacy: DetectedFallacy;
  compact?: boolean;
}

export default function FallacyBadge({ fallacy, compact = false }: FallacyBadgeProps) {
  const [showModal, setShowModal] = useState(false);
  const catalogEntry = FALLACY_CATALOG[fallacy.name] || {
    name: fallacy.name,
    summary: fallacy.description,
    example: "Example unavailable",
    remedy: fallacy.howToImprove,
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 text-left",
          compact
            ? "bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/20"
            : "bg-amber-500/15 px-3 py-1.5 text-sm text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-500/25 hover:shadow-lg hover:shadow-amber-500/10"
        )}
      >
        <AlertTriangle className={compact ? "h-3.5 w-3.5 shrink-0 text-amber-400" : "h-4 w-4 shrink-0 text-amber-400"} />
        <span className="font-semibold">{fallacy.name}</span>
        <HelpCircle className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Fallacy Detail Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-amber-500/30 bg-slate-900 p-6 shadow-2xl shadow-amber-500/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Fallacy Detected: <span className="text-amber-400">{fallacy.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400">Logical Integrity Audit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="mt-4 space-y-4 text-sm">
              {/* Snippet */}
              {fallacy.snippet && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Flagged Phrasing:
                  </p>
                  <p className="mt-1 font-serif italic text-amber-200">
                    &ldquo;{fallacy.snippet}&rdquo;
                  </p>
                </div>
              )}

              {/* What It Means */}
              <div>
                <h4 className="font-semibold text-slate-200">What It Means</h4>
                <p className="mt-1 text-slate-400 leading-relaxed">
                  {catalogEntry.summary || fallacy.description}
                </p>
              </div>

              {/* Classic Example */}
              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80">
                <span className="text-xs font-semibold text-slate-400">Classic Example:</span>
                <p className="mt-1 text-xs italic text-slate-300">
                  {catalogEntry.example}
                </p>
              </div>

              {/* How to Improve */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    How To Improve / Counter-Strategy:
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-emerald-200/90 leading-relaxed">
                  {fallacy.howToImprove}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

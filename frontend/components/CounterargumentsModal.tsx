"use client";

import React from "react";
import { ShieldAlert, X, BookOpen, AlertTriangle } from "lucide-react";
import { CounterargumentItem } from "@/lib/types/debate";

interface CounterargumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  counterarguments: CounterargumentItem[];
  isLoading: boolean;
}

export default function CounterargumentsModal({
  isOpen,
  onClose,
  counterarguments,
  isLoading,
}: CounterargumentsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-rose-500/30 bg-zinc-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-rose-500/20 p-2 text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Opponent Counterarguments Preview</h3>
            <p className="text-xs text-zinc-400">
              Anticipate the 3 strongest lines of attack your opponent might use against this argument.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent mb-3" />
            <p className="text-sm text-zinc-300 font-medium">Analyzing opponent attack angles...</p>
          </div>
        ) : counterarguments && counterarguments.length > 0 ? (
          <div className="space-y-3">
            {counterarguments.map((ca, idx) => (
              <div key={idx} className="rounded-xl bg-zinc-900/70 p-3.5 border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300">
                    {ca.angle}
                  </span>
                </div>
                <p className="text-xs text-zinc-200 font-medium leading-relaxed">{ca.argument}</p>
                {ca.evidenceCited && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-1">
                    <BookOpen className="h-3 w-3 text-rose-400 shrink-0" />
                    <span><strong className="text-zinc-300">Evidence:</strong> {ca.evidenceCited}</span>
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

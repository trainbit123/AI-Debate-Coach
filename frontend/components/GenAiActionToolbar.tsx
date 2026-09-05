"use client";

import React, { useState } from "react";
import { Sparkles, HelpCircle, ShieldAlert } from "lucide-react";
import ArgumentImproverModal from "./ArgumentImproverModal";
import CrossExaminationModal from "./CrossExaminationModal";
import CounterargumentsModal from "./CounterargumentsModal";
import {
  ImprovedArgumentResponse,
  CrossExaminationQuestion,
  CounterargumentItem,
} from "@/lib/types/debate";

interface GenAiActionToolbarProps {
  debateId: string;
  currentDraft: string;
  onApplyImprovedArgument: (text: string) => void;
  disabled?: boolean;
}

export default function GenAiActionToolbar({
  debateId,
  currentDraft,
  onApplyImprovedArgument,
  disabled = false,
}: GenAiActionToolbarProps) {
  // Modal states
  const [improverOpen, setImproverOpen] = useState(false);
  const [improverLoading, setImproverLoading] = useState(false);
  const [improvedData, setImprovedData] = useState<ImprovedArgumentResponse | null>(null);

  const [crossExamOpen, setCrossExamOpen] = useState(false);
  const [crossExamLoading, setCrossExamLoading] = useState(false);
  const [crossExamQuestions, setCrossExamQuestions] = useState<CrossExaminationQuestion[]>([]);

  const [counterOpen, setCounterOpen] = useState(false);
  const [counterLoading, setCounterLoading] = useState(false);
  const [counterList, setCounterList] = useState<CounterargumentItem[]>([]);

  // 1. Handle Improve Argument
  const handleImprove = async () => {
    if (!currentDraft.trim() || currentDraft.trim().length < 5) return;
    setImproverOpen(true);
    setImproverLoading(true);
    try {
      const res = await fetch(`/api/debates/${debateId}/improve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userArgument: currentDraft }),
      });
      if (res.ok) {
        const data = await res.json();
        setImprovedData(data);
      }
    } catch (err) {
      console.error("Error calling improve argument:", err);
    } finally {
      setImproverLoading(false);
    }
  };

  // 2. Handle Cross-Examine
  const handleCrossExamine = async () => {
    if (!currentDraft.trim() || currentDraft.trim().length < 5) return;
    setCrossExamOpen(true);
    setCrossExamLoading(true);
    try {
      const res = await fetch(`/api/debates/${debateId}/cross-examine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userArgument: currentDraft }),
      });
      if (res.ok) {
        const data = await res.json();
        setCrossExamQuestions(data.questions || []);
      }
    } catch (err) {
      console.error("Error calling cross-examine:", err);
    } finally {
      setCrossExamLoading(false);
    }
  };

  // 3. Handle Counterarguments Preview
  const handleCounterarguments = async () => {
    if (!currentDraft.trim() || currentDraft.trim().length < 5) return;
    setCounterOpen(true);
    setCounterLoading(true);
    try {
      const res = await fetch(`/api/debates/${debateId}/counterarguments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userArgument: currentDraft }),
      });
      if (res.ok) {
        const data = await res.json();
        setCounterList(data.counterarguments || []);
      }
    } catch (err) {
      console.error("Error calling counterarguments:", err);
    } finally {
      setCounterLoading(false);
    }
  };

  const hasDraft = currentDraft.trim().length >= 5;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 py-2 text-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mr-1">
          GenAI Tools:
        </span>

        <button
          type="button"
          onClick={handleImprove}
          disabled={disabled || !hasDraft}
          className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/20 px-2.5 py-1.5 font-medium text-indigo-300 hover:bg-indigo-900/40 hover:text-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title={hasDraft ? "Rewrites and strengthens your draft argument using the Toulmin model" : "Type at least 5 characters first"}
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Improve Argument</span>
        </button>

        <button
          type="button"
          onClick={handleCrossExamine}
          disabled={disabled || !hasDraft}
          className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/20 px-2.5 py-1.5 font-medium text-amber-300 hover:bg-amber-900/40 hover:text-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title={hasDraft ? "Asks 2 challenging Socratic questions on your draft" : "Type at least 5 characters first"}
        >
          <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
          <span>Cross-Examine Me</span>
        </button>

        <button
          type="button"
          onClick={handleCounterarguments}
          disabled={disabled || !hasDraft}
          className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 px-2.5 py-1.5 font-medium text-rose-300 hover:bg-rose-900/40 hover:text-rose-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title={hasDraft ? "Preview 3 opponent lines of attack against your draft" : "Type at least 5 characters first"}
        >
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          <span>Opponent Counter-Points</span>
        </button>
      </div>

      {/* Modals */}
      <ArgumentImproverModal
        isOpen={improverOpen}
        onClose={() => setImproverOpen(false)}
        originalArgument={currentDraft}
        improvedData={improvedData}
        isLoading={improverLoading}
        onApplyImproved={onApplyImprovedArgument}
      />

      <CrossExaminationModal
        isOpen={crossExamOpen}
        onClose={() => setCrossExamOpen(false)}
        questions={crossExamQuestions}
        isLoading={crossExamLoading}
      />

      <CounterargumentsModal
        isOpen={counterOpen}
        onClose={() => setCounterOpen(false)}
        counterarguments={counterList}
        isLoading={counterLoading}
      />
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Swords,
  History,
  RotateCcw,
  Sparkles,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Award,
  CheckCircle2,
  Flame,
  ArrowRight,
  HelpCircle,
  Brain,
} from "lucide-react";
import { DebateSession, DetectedFallacy, FinalReport } from "@/lib/types/debate";
import VerdictCard from "@/components/VerdictCard";
import FallacyBadge from "@/components/FallacyBadge";
import ScoreTransparencyReport from "@/components/ScoreTransparencyReport";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const debateId = params?.id as string;

  const [session, setSession] = useState<DebateSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debateId) {
      fetch(`/api/debates/${debateId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Debate session could not be found.");
          return res.json();
        })
        .then((data) => {
          setSession(data.session);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch results error:", err);
          setError(err.message || "Failed to load results.");
          setLoading(false);
        });
    }
  }, [debateId]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-28">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <h2 className="mt-4 text-lg font-bold text-white">Calculating Final Scores...</h2>
          <p className="mt-1 text-xs text-slate-400">Preparing your debate report and coaching tips</p>
        </div>
      </div>
    );
  }

  if (error || !session || !session.finalVerdict) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-400" />
          <h2 className="mt-4 text-xl font-bold text-white">Report Incomplete</h2>
          <p className="mt-2 text-sm text-slate-300">
            {error || "This debate has not concluded all rounds yet."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {session ? (
              <Link
                href={`/debate/${session.id}`}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
              >
                Resume Debate
              </Link>
            ) : (
              <Link
                href="/setup"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
              >
                Start New Debate
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const verdict: FinalReport = session.finalVerdict;

  const scoreBars = [
    { label: "Logic & Reasoning", val: verdict.logicScore, color: "from-blue-500 to-indigo-500" },
    { label: "Real-World Evidence", val: verdict.evidenceScore, color: "from-emerald-500 to-teal-500" },
    { label: "Topic Relevance", val: verdict.relevanceScore, color: "from-purple-500 to-pink-500" },
    { label: "Speech Clarity", val: verdict.clarityScore, color: "from-amber-500 to-orange-500" },
    { label: "Rebuttals & Comeback", val: verdict.rebuttalScore, color: "from-cyan-500 to-blue-500" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Action Buttons Top */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <History className="h-4 w-4" />
          <span>All Past Debates</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/progress"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Skill Progress</span>
          </Link>

          <Link
            href="/setup"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Debate Again</span>
          </Link>
        </div>
      </div>

      {/* Main Verdict Card */}
      <VerdictCard verdict={verdict} />

      {/* Motion Context Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>Motion Resolution:</span>
          <span>
            {session.rounds.length} Round(s) Completed &bull; {session.difficulty} difficulty
          </span>
        </div>
        <p className="mt-2 text-base font-bold text-white">&ldquo;{session.topic}&rdquo;</p>
        <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
          <span className="text-emerald-400">Your Stance: {session.userPosition}</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-amber-400">AI Opponent Stance: {session.aiPosition}</span>
        </div>
      </div>

      {/* 5-Dimension Radar/Bar Analysis */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <span>Debate Skill Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Overall scores across all {session.rounds.length} round(s)
            </p>
          </div>
          <span className="text-xl font-black text-white">{verdict.overallScore}%</span>
        </div>

        <div className="mt-6 space-y-4">
          {scoreBars.map((bar) => (
            <div key={bar.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">{bar.label}</span>
                <span className="font-bold text-white">{bar.val}/100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r", bar.color)}
                  style={{ width: `${Math.min(100, Math.max(5, bar.val))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why You Got This Score - Interactive Transparent Audit Ballot */}
      <ScoreTransparencyReport verdict={verdict} roundsCount={session.rounds.length} />

      {/* Strongest vs Weakest Arguments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4" />
            <span>Your Strongest Point</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            {verdict.strongestArgument}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-5">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <Flame className="h-4 w-4" />
            <span>Point Needing More Evidence</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            {verdict.weakestArgument}
          </p>
        </div>
      </div>

      {/* Fallacies Audit */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span>Logic Trap Review</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Logical mistakes detected during the debate
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold border",
              verdict.totalFallacies === 0
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            )}
          >
            {verdict.totalFallacies} Flagged
          </span>
        </div>

        {verdict.detectedFallacyList && verdict.detectedFallacyList.length > 0 ? (
          <div className="mt-6 space-y-3">
            {verdict.detectedFallacyList.map((f: DetectedFallacy, idx: number) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 text-sm">{f.name}</span>
                    {f.snippet && (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 italic">
                        &ldquo;{f.snippet}&rdquo;
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{f.description}</p>
                </div>
                <FallacyBadge fallacy={f} compact={true} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 p-5 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-emerald-400" />
            <h4 className="mt-2 text-sm font-bold text-emerald-300">Clean Argumentation</h4>
            <p className="mt-1 text-xs text-slate-400">
              Zero cognitive fallacies detected. Your claims avoided ad hominem attacks, false dilemmas, and slippery slopes.
            </p>
          </div>
        )}
      </div>

      {/* Round by Round Transcript Review */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
          Round-by-Round Speech Transcript Review
        </h3>

        <div className="mt-6 space-y-6">
          {session.rounds.map((round) => (
            <div key={round.roundNumber} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Round {round.roundNumber} of {session.rounds.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-xs font-bold text-blue-400">
                    Round Score: {round.score.overall}/100
                  </span>
                </div>
              </div>

              {/* Sub-Dimension Score Pills */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-300 font-mono">
                  Logic: <strong className="text-blue-400">{round.score.logic}</strong>
                </span>
                <span className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-300 font-mono">
                  Evidence: <strong className="text-emerald-400">{round.score.evidence}</strong>
                </span>
                <span className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-300 font-mono">
                  Relevance: <strong className="text-purple-400">{round.score.relevance}</strong>
                </span>
                <span className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-300 font-mono">
                  Clarity: <strong className="text-amber-400">{round.score.clarity}</strong>
                </span>
                <span className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-300 font-mono">
                  Rebuttal: <strong className="text-cyan-400">{round.score.counterargumentHandling}</strong>
                </span>
              </div>

              {/* User transcript */}
              <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Your Argument:
                  </span>
                  {round.fallacies && round.fallacies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {round.fallacies.map((f: DetectedFallacy, fIdx: number) => (
                        <FallacyBadge key={fIdx} fallacy={f} compact={true} />
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                  {round.userArgument}
                </p>
              </div>

              {/* AI counterargument */}
              <div className="rounded-xl bg-indigo-950/20 p-3.5 border border-indigo-500/20">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  AI Opponent Counterargument:
                </span>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {round.aiCounterargument}
                </p>
              </div>

              {/* Coach Feedback for Round */}
              {round.score.coachFeedback && (
                <div className="rounded-xl bg-blue-950/20 border border-blue-500/20 p-3 text-[11px] text-blue-200/90 flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-300">Adjudicator Round Note: </span>
                    <span>{round.score.coachFeedback}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

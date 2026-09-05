"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Swords,
  Bot,
  User,
  Brain,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Award,
  AlertTriangle,
  HelpCircle,
  Clock,
  History,
  Cpu,
} from "lucide-react";
import { DebateSession, DetectedFallacy, Position } from "@/lib/types/debate";
import AiVoiceSpeaker from "@/components/AiVoiceSpeaker";
import MicRecorder from "@/components/MicRecorder";
import ScoreCard from "@/components/ScoreCard";
import FallacyBadge from "@/components/FallacyBadge";
import RoundTimeline from "@/components/RoundTimeline";
import InArenaResearchDrawer from "@/components/InArenaResearchDrawer";
import { cn } from "@/lib/utils";

export default function LiveDebatePage() {
  const params = useParams();
  const router = useRouter();
  const debateId = params?.id as string;

  const [session, setSession] = useState<DebateSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [turnError, setTurnError] = useState<{ title: string; message: string } | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [isConcluding, setIsConcluding] = useState(false);
  const [viewingRound, setViewingRound] = useState<number>(1);

  // Conclude debate on demand (especially for endless mode)
  const handleConcludeDebate = async () => {
    if (!session || isConcluding) return;
    if (!confirm("Are you ready to conclude this debate and receive your final Oxford performance report?")) return;

    setIsConcluding(true);
    try {
      const res = await fetch(`/api/debates/${debateId}/conclude`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Could not conclude debate session.");
      const data = await res.json();
      setSession(data.session);
      router.push(`/results/${session.id}`);
    } catch (err: any) {
      console.error("Conclude debate error:", err);
      setError(err.message || "Failed to conclude debate.");
    } finally {
      setIsConcluding(false);
    }
  };

  // Fetch session
  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/debates/${debateId}`);
      if (!res.ok) {
        throw new Error("Debate session could not be found.");
      }
      const data = await res.json();
      setSession(data.session);
      if (typeof data.isOffline === "boolean") {
        setIsOffline(data.isOffline);
      }
      setViewingRound(data.session.currentRound);
    } catch (err: any) {
      console.error("Fetch session error:", err);
      setError(err.message || "Failed to load debate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debateId) {
      fetchSession();
    }
  }, [debateId]);

  // Handle user argument submission
  const handleSubmitArgument = async (argumentText: string) => {
    if (!session || isProcessingTurn) return;

    // Validate empty or invalid argument submission (< 5 characters)
    const trimmed = (argumentText || "").trim();
    if (trimmed.length < 5) {
      setTurnError({
        title: "Substantive Argument Required",
        message: "Your argument is too short or empty. Please formulate a clear point of at least 5 characters to debate effectively.",
      });
      return;
    }

    setIsProcessingTurn(true);
    setTurnError(null);

    // 25-second AbortController timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 25000);

    try {
      const res = await fetch(`/api/debates/${debateId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userArgument: trimmed }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Turn processing failed with status ${res.status}`);
      }

      const data = await res.json();
      setSession(data.session);
      if (typeof data.isOffline === "boolean") {
        setIsOffline(data.isOffline);
      }
      setViewingRound(data.session.currentRound);

      // If finished, redirect to final results
      if (data.session.isComplete) {
        router.push(`/results/${session.id}`);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Turn submission error:", err);
      if (err.name === "AbortError") {
        setTurnError({
          title: "LLM Response Timeout",
          message: "The AI debater took longer than 25 seconds to respond. Your argument was preserved. Please try submitting again or check your network connection.",
        });
      } else {
        setTurnError({
          title: "Argument Processing Error",
          message: err.message || "Failed to process argument. Please try again.",
        });
      }
    } finally {
      setIsProcessingTurn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <h2 className="mt-4 text-lg font-bold text-white">Opening Debate Arena...</h2>
          <p className="mt-1 text-xs text-slate-400">Setting up the topic and preparing your AI opponent</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-8">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-400" />
          <h2 className="mt-4 text-xl font-bold text-white">Debate Session Error</h2>
          <p className="mt-2 text-sm text-slate-300">{error || "Debate session was not found."}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/setup"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
            >
              Start New Debate
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestRound =
    session.rounds.length > 0 ? session.rounds[session.rounds.length - 1] : null;

  // Determine current active counterargument to speak
  // If no rounds yet, AI presents opening statement
  const activeAiSpeech =
    latestRound?.aiCounterargument ||
    session.aiOpeningStatement ||
    `I am prepared to defend the ${session.aiPosition} stance on this motion. The floor is yours for Round 1.`;

  const activeFollowUp = latestRound?.aiFollowUpQuestion;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner: Topic, Positions & Round Step Progress */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-400 ring-1 ring-blue-500/30">
                Live Debate Arena
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400 capitalize">
                {session.difficulty} level
              </span>
              {isOffline && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/30"
                  title="No cloud LLM API key detected. Running with deterministic Oxford heuristic debater."
                >
                  <Cpu className="h-3 w-3 text-amber-400" />
                  <span>Running in offline heuristic mode</span>
                </span>
              )}
              <span className="text-xs text-slate-500">
                Match ID: {session.id.slice(0, 14)}
              </span>
            </div>
            <h1 className="mt-2 text-lg sm:text-2xl font-black text-white leading-snug">
              &ldquo;{session.topic}&rdquo;
            </h1>
          </div>

          {/* Stances comparison */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            {/* User */}
            <div className="flex items-center gap-2 rounded-2xl bg-slate-950/80 px-3.5 py-2 border border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs">
                You
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Your Stance</span>
                <p className="text-xs font-black text-emerald-400">{session.userPosition}</p>
              </div>
            </div>

            <Swords className="h-4 w-4 text-slate-600" />

            {/* AI */}
            <div className="flex items-center gap-2 rounded-2xl bg-slate-950/80 px-3.5 py-2 border border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs">
                AI
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">AI Opponent</span>
                <p className="text-xs font-black text-amber-400">{session.aiPosition}</p>
              </div>
            </div>

            {/* Conclude Debate Button (Instant or Endless Mode) */}
            {!session.isComplete && (
              <button
                type="button"
                onClick={handleConcludeDebate}
                disabled={isConcluding || isProcessingTurn}
                className="ml-2 flex items-center gap-1.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 hover:text-white transition-all shadow-md shadow-emerald-950/30 shrink-0"
                title="Conclude debate now and view your performance report"
              >
                <Award className="h-4 w-4 text-emerald-400" />
                <span className="hidden sm:inline">
                  {isConcluding ? "Finishing..." : "Conclude & View Report"}
                </span>
                <span className="sm:hidden">Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Round Progress Tracker */}
        <div className="mt-4 pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">
              {session.isEndless || session.maxRounds >= 999
                ? `Round ${session.currentRound} \u2022 Continuous Sparring (\u221E)`
                : `Round ${session.currentRound} of ${session.maxRounds}`}
            </span>
            {session.isComplete && (
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Debate Concluded
              </span>
            )}
          </div>

          <RoundTimeline
            currentRound={session.currentRound}
            maxRounds={session.maxRounds}
            completedRounds={session.rounds.length}
            isComplete={session.isComplete}
            isEndless={session.isEndless || session.maxRounds >= 999}
          />
        </div>
      </div>

      {/* Turn Submission & Timeout Error Banner */}
      {turnError && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-200 flex items-start justify-between gap-3 shadow-lg shadow-rose-950/50 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">{turnError.title}</p>
              <p className="mt-1 text-rose-200/90 leading-relaxed">{turnError.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTurnError(null)}
            className="text-rose-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-900 transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss error notification"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Debate Grid: Split Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Opponent Counterargument Card */}
        <div className="lg:col-span-6 space-y-6">
          <AiVoiceSpeaker
            counterargument={activeAiSpeech}
            followUpQuestion={activeFollowUp}
            aiPosition={session.aiPosition}
            roundNumber={session.currentRound}
            ragContext={latestRound?.ragContext}
            autoPlay={true}
          />

          {/* Previous Round User Arguments History if any */}
          {session.rounds.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" />
                <span>Round {session.rounds.length} Exchange Recap</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                  <span className="font-bold text-blue-400">You argued:</span>
                  <p className="mt-1 text-slate-300 italic">
                    &ldquo;{latestRound?.userArgument}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: User Turn Station & Argument Analysis */}
        <div className="lg:col-span-6 space-y-6">
          {!session.isComplete ? (
            <MicRecorder
              onSubmitArgument={handleSubmitArgument}
              isProcessing={isProcessingTurn}
              roundNumber={session.currentRound}
              debateId={session.id}
            />
          ) : (
            /* Completed Banner with Link to Results */
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center space-y-4">
              <Trophy className="mx-auto h-12 w-12 text-emerald-400" />
              <h3 className="text-xl font-black text-white">All Rounds Completed!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                The AI tribunal has reviewed all rhetorical exchanges, cross-examinations, and fallacy flags.
              </p>
              <div>
                <Link
                  href={`/results/${session.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <span>View Final Adjudication & Report</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Live Scoring & Fallacy Display for the latest turn */}
          {latestRound && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Fallacy Warnings if detected */}
              {latestRound.fallacies && latestRound.fallacies.length > 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Fallacies Flagged in Round {latestRound.roundNumber}:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {latestRound.fallacies.map((f: DetectedFallacy, idx: number) => (
                      <FallacyBadge key={idx} fallacy={f} />
                    ))}
                  </div>
                </div>
              )}

              {/* Score breakdown */}
              <ScoreCard score={latestRound.score} />
            </div>
          )}
        </div>
      </div>

      {/* In-Arena Context-Aware Voice Research Assistant Drawer */}
      <InArenaResearchDrawer
        currentMotion={session.topic}
        userPosition={session.userPosition}
        aiPosition={session.aiPosition}
      />
    </div>
  );
}

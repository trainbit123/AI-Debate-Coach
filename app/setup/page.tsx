"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Swords,
  ShieldAlert,
  Bot,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sliders,
  HelpCircle,
} from "lucide-react";
import { Difficulty, Position } from "@/lib/types/debate";
import TopicCard from "@/components/TopicCard";
import { cn } from "@/lib/utils";

const PRESET_TOPICS = [
  {
    title: "Artificial intelligence development should be strictly regulated by governments",
    category: "AI & Tech",
    difficulty: "intermediate" as Difficulty,
  },
  {
    title: "Universal Basic Income should replace existing welfare programs",
    category: "Economics",
    difficulty: "advanced" as Difficulty,
  },
  {
    title: "Remote work is better for employees and companies than working in an office",
    category: "Workplace",
    difficulty: "beginner" as Difficulty,
  },
  {
    title: "Social media algorithms do more harm than good to teenagers",
    category: "Society",
    difficulty: "intermediate" as Difficulty,
  },
  {
    title: "Nuclear energy is necessary to fight climate change",
    category: "Environment",
    difficulty: "intermediate" as Difficulty,
  },
  {
    title: "Spending money on space exploration is worth it despite problems on Earth",
    category: "Science",
    difficulty: "advanced" as Difficulty,
  },
];

export default function SetupPage() {
  const router = useRouter();

  const [topic, setTopic] = useState(PRESET_TOPICS[0].title);
  const [userPosition, setUserPosition] = useState<Position>("FOR");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [maxRounds, setMaxRounds] = useState<number>(3);
  const [isEndless, setIsEndless] = useState<boolean>(false);
  const [customRoundsInput, setCustomRoundsInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derived AI position: Strictly opposite
  const aiPosition: Position = userPosition === "FOR" ? "AGAINST" : "FOR";

  const handleCreateDebate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage("Please select or enter a debate topic.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const roundsToSend = isEndless
      ? 999
      : customRoundsInput.trim()
      ? Math.max(1, parseInt(customRoundsInput) || 3)
      : maxRounds;

    try {
      const res = await fetch("/api/debates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          userPosition,
          difficulty,
          maxRounds: roundsToSend,
          isEndless,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to initialize debate.");
      }

      const session = await res.json();
      router.push(`/debate/${session.id}`);
    } catch (err: any) {
      console.error("Debate creation error:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-400">
          <Bot className="h-3.5 w-3.5" />
          <span>AI Debate Coach &bull; Setup</span>
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Set Up Your Debate Practice
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Choose your debate motion, your position, and difficulty. Your AI debate coach will take the opposing
          side to spar and help you practice.
        </p>
      </div>

      <form onSubmit={handleCreateDebate} className="mt-10 space-y-8">
        {/* Step 1: Topic Selection */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>1. Select or Enter Debate Topic</span>
              </h2>
              <p className="text-xs text-slate-400">
                Pick a resolution from collegiate presets or draft your own custom motion.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Step 1 of 4
            </span>
          </div>

          {/* Custom Topic Input */}
          <div className="mt-6">
            <label htmlFor="custom-topic" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Current Motion:
            </label>
            <textarea
              id="custom-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Space exploration justifies its massive financial cost..."
              rows={2}
              required
              className="w-full rounded-xl bg-slate-950/90 border border-slate-700 p-3.5 text-sm sm:text-base font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Presets Grid */}
          <div className="mt-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Or Choose a Curated Motion:
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRESET_TOPICS.map((preset) => (
                <TopicCard
                  key={preset.title}
                  title={preset.title}
                  category={preset.category}
                  difficulty={preset.difficulty}
                  isSelected={topic === preset.title}
                  onSelect={() => {
                    setTopic(preset.title);
                    setDifficulty(preset.difficulty);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Position Selection */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>2. Choose Your Stance</span>
            </h2>
            <p className="text-xs text-slate-400">
              The AI automatically defends the exact opposite position with zero bias or mid-debate switching.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* FOR */}
            <button
              type="button"
              onClick={() => setUserPosition("FOR")}
              className={cn(
                "relative rounded-2xl border p-5 text-left transition-all duration-200",
                userPosition === "FOR"
                  ? "border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Affirmative Position
                </span>
                {userPosition === "FOR" && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                )}
              </div>
              <div className="mt-2 text-xl font-black text-white">FOR (PRO)</div>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                You argue in favor of the motion. AI will aggressively attack your premises from the AGAINST position.
              </p>
            </button>

            {/* AGAINST */}
            <button
              type="button"
              onClick={() => setUserPosition("AGAINST")}
              className={cn(
                "relative rounded-2xl border p-5 text-left transition-all duration-200",
                userPosition === "AGAINST"
                  ? "border-rose-500 bg-rose-950/20 ring-2 ring-rose-500/40 shadow-lg shadow-rose-500/10"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Negative Position
                </span>
                {userPosition === "AGAINST" && (
                  <CheckCircle2 className="h-5 w-5 text-rose-400" />
                )}
              </div>
              <div className="mt-2 text-xl font-black text-white">AGAINST (CON)</div>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                You oppose the motion. AI will defend the proposition and hold you to rigorous proof requirements.
              </p>
            </button>
          </div>

          {/* AI Stance Indicator */}
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-950/60 p-3 text-xs text-slate-400 border border-slate-800">
            <Bot className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>
              Opponent Guarantee: AI will strictly argue{" "}
              <strong className="text-indigo-300 uppercase">{aiPosition}</strong> this proposition.
            </span>
          </div>
        </div>

        {/* Step 3: Difficulty & Rounds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Difficulty */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-white">3. Difficulty Level</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Calibrates AI counter-attack aggression and score scrutiny.
            </p>

            <div className="mt-4 space-y-2">
              {[
                {
                  id: "beginner" as Difficulty,
                  name: "Beginner",
                  desc: "Friendly sparring, simple explanations, and helpful hints.",
                },
                {
                  id: "intermediate" as Difficulty,
                  name: "Standard",
                  desc: "Balanced debate with practical, real-world counterarguments.",
                },
                {
                  id: "advanced" as Difficulty,
                  name: "Challenger",
                  desc: "Fast, sharp rebuttals that put pressure on your logic and facts.",
                },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDifficulty(lvl.id)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-colors",
                    difficulty === lvl.id
                      ? "border-blue-500 bg-blue-950/30 text-white ring-1 ring-blue-500"
                      : "border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white capitalize">{lvl.name}</span>
                    {difficulty === lvl.id && <span className="h-2 w-2 rounded-full bg-blue-400" />}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Rounds */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">4. Debate Rounds</h2>
              {isEndless && (
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/40">
                  Endless Sparring &bull; Unlimited Rounds
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose tournament rounds or debate continuously for N rounds until you conclude.
            </p>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Endless Option */}
              <button
                type="button"
                onClick={() => {
                  setIsEndless(true);
                  setMaxRounds(999);
                  setCustomRoundsInput("");
                }}
                className={cn(
                  "rounded-xl border p-3 text-center transition-all col-span-2 sm:col-span-4",
                  isEndless
                    ? "border-indigo-500 bg-indigo-950/40 text-white ring-2 ring-indigo-500/50 shadow-md"
                    : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700"
                )}
              >
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-indigo-300">
                  <span className="text-lg">&infin;</span>
                  <span>Endless Mode (Continuous Sparring)</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Debate for unlimited rounds. Conclude and get your report whenever you decide.
                </span>
              </button>

              {/* Fixed Round Presets */}
              {[
                { num: 3, label: "3 Rounds", tag: "Collegiate" },
                { num: 5, label: "5 Rounds", tag: "Tournament" },
                { num: 10, label: "10 Rounds", tag: "Marathon" },
                { num: 15, label: "15 Rounds", tag: "Grandmaster" },
              ].map((r) => (
                <button
                  key={r.num}
                  type="button"
                  onClick={() => {
                    setIsEndless(false);
                    setMaxRounds(r.num);
                    setCustomRoundsInput("");
                  }}
                  className={cn(
                    "rounded-xl border p-2.5 text-center transition-all",
                    !isEndless && maxRounds === r.num && !customRoundsInput
                      ? "border-blue-500 bg-blue-950/40 text-white ring-2 ring-blue-500/40 shadow-md"
                      : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                  )}
                >
                  <div className="text-sm font-bold text-white">{r.label}</div>
                  <span className="text-[10px] text-slate-500">{r.tag}</span>
                </button>
              ))}
            </div>

            {/* Custom Rounds Input */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-400 shrink-0">Or custom rounds:</span>
              <input
                type="number"
                min={1}
                max={100}
                value={customRoundsInput}
                onChange={(e) => {
                  setCustomRoundsInput(e.target.value);
                  setIsEndless(false);
                }}
                placeholder="e.g. 7, 12, 20..."
                className="w-28 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
              {customRoundsInput && (
                <span className="text-[11px] text-blue-400 font-semibold">
                  {customRoundsInput} rounds configured
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Starting Chatbot Debate...</span>
              </>
            ) : (
              <>
                <Bot className="h-5 w-5" />
                <span>Start Debate Practice</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

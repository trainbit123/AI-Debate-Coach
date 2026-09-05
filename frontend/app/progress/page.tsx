"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Trophy,
  TrendingUp,
  Brain,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  Award,
  Zap,
  Target,
  Swords,
  ChevronRight,
} from "lucide-react";
import { UserStats } from "@/lib/types/debate";
import { FALLACY_CATALOG } from "@/services/fallacyDetector";
import { cn } from "@/lib/utils";

export default function ProgressPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Progress fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-28">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <h2 className="mt-4 text-lg font-bold text-white">Aggregating Skill Metrics...</h2>
          <p className="mt-1 text-xs text-slate-400">Analyzing rhetorical progression and fallacy history</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-20 text-center text-slate-400">
        Could not load analytics.
      </div>
    );
  }

  const skillBars = [
    { name: "Logical Structure", score: stats.averageLogic, color: "from-blue-500 to-indigo-500" },
    { name: "Empirical Evidence", score: stats.averageEvidence, color: "from-emerald-500 to-teal-500" },
    { name: "Topical Relevance", score: stats.averageRelevance, color: "from-purple-500 to-pink-500" },
    { name: "Rhetorical Clarity", score: stats.averageClarity, color: "from-amber-500 to-orange-500" },
    { name: "Counter-Rebuttal", score: stats.averageRebuttal, color: "from-cyan-500 to-blue-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-400">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Performance Intelligence</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            Rhetorical Progress & Skill Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Track your win rate, recurring fallacies, and skill mastery across collegiate debates.
          </p>
        </div>

        <Link
          href="/setup"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all self-start sm:self-auto"
        >
          <Swords className="h-4 w-4" />
          <span>Launch Match</span>
        </Link>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Debates */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Debates
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.completedDebates}</span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-bold">{stats.wins} Wins</span> &bull;{" "}
            <span className="text-rose-400 font-bold">{stats.losses} Losses</span> &bull;{" "}
            <span className="text-amber-400 font-bold">{stats.draws} Draws</span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Victories Rate
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{stats.winRate}%</span>
            <Trophy className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${stats.winRate}%` }}
            />
          </div>
        </div>

        {/* Average Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Average Score
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{stats.averageScore}</span>
            <span className="text-xs font-semibold text-slate-500">/100</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Across all rounds & motions
          </p>
        </div>

        {/* Best Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Personal Record
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-blue-400">{stats.bestScore}</span>
            <span className="text-xs font-semibold text-slate-500">/100</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Peak rhetorical adjudication
          </p>
        </div>
      </div>

      {/* Strongest & Weakest Callout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Award className="h-4 w-4" />
            <span>Strongest Rhetorical Pillar</span>
          </div>
          <h3 className="mt-2 text-xl font-bold text-white">{stats.strongestSkill}</h3>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Consistently ranks highest in your debate score breakdown, showing disciplined premise defense.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Target className="h-4 w-4" />
            <span>Priority Improvement Target</span>
          </div>
          <h3 className="mt-2 text-xl font-bold text-white">{stats.weakestSkill}</h3>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Routinely targeted by the AI opponent. Focusing drills on this dimension will produce the biggest win-rate leap.
          </p>
        </div>
      </div>

      {/* 5-Skill Dimensional Averages */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <span>Dimensional Skill Mastery</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical average scores across all verified debates
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {skillBars.map((bar) => (
            <div key={bar.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">{bar.name}</span>
                <span className="font-bold text-white">{bar.score}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r", bar.color)}
                  style={{ width: `${Math.min(100, Math.max(5, bar.score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Frequent Fallacies & Corrective Advice */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span>Recurring Logical Fallacies Analysis</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cognitive shortcuts flagged during cross-examinations, ranked by recurrence
          </p>
        </div>

        {stats.commonFallacies.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.commonFallacies.map((item) => {
              const catalog = FALLACY_CATALOG[item.name];
              return (
                <div
                  key={item.name}
                  className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-400 text-sm">{item.name}</h4>
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                      {item.count} flag{item.count > 1 ? "s" : ""}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {catalog?.summary || "Logical trap weakening argumentative validity."}
                  </p>

                  <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>Master Counter-Drill:</span>
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-200/90 leading-snug">
                      {catalog?.remedy || "Ground assertions in empirical studies and steel-manned premises."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 p-8 text-center">
            <Award className="mx-auto h-10 w-10 text-emerald-400" />
            <h4 className="mt-3 text-base font-bold text-emerald-300">
              Impeccable Rhetorical Track Record
            </h4>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              No recurring cognitive fallacies detected. Continue maintaining rigorous logic in subsequent tournaments.
            </p>
          </div>
        )}
      </div>

      {/* Score Improvement Timeline */}
      {stats.recentTrends.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <span>Score Progression Trajectory</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Performance history over recent debate matches
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.recentTrends.map((trend, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3.5"
              >
                <div>
                  <span className="text-[10px] font-semibold text-slate-500">{trend.date}</span>
                  <p className="text-xs font-semibold text-slate-200 line-clamp-1">{trend.topic}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white">{trend.score}</span>
                  <span className="text-[10px] text-slate-500">/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

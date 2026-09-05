"use client";

import React, { useState } from "react";
import {
  Brain,
  Calculator,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Target,
  Scale,
  Lightbulb,
  Layers,
  Search,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { FinalReport, TransparencyDimensionReport } from "@/lib/types/debate";
import { cn } from "@/lib/utils";

interface ScoreTransparencyReportProps {
  verdict: FinalReport;
  roundsCount: number;
}

type DimensionKey = "logic" | "evidence" | "relevance" | "clarity" | "rebuttal";

interface DimensionConfig {
  key: DimensionKey;
  label: string;
  weight: number;
  weightPct: string;
  score: number;
  icon: React.ElementType;
  gradient: string;
  badgeColor: string;
}

export default function ScoreTransparencyReport({
  verdict,
  roundsCount,
}: ScoreTransparencyReportProps) {
  const [activeTab, setActiveTab] = useState<DimensionKey>("logic");

  const dimensions: DimensionConfig[] = [
    {
      key: "logic",
      label: "Logic & Reasoning",
      weight: 0.25,
      weightPct: "25%",
      score: verdict.logicScore,
      icon: Scale,
      gradient: "from-blue-500 to-indigo-500",
      badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    },
    {
      key: "evidence",
      label: "Real-World Evidence",
      weight: 0.2,
      weightPct: "20%",
      score: verdict.evidenceScore,
      icon: BookOpen,
      gradient: "from-emerald-500 to-teal-500",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    {
      key: "relevance",
      label: "Topic Relevance",
      weight: 0.2,
      weightPct: "20%",
      score: verdict.relevanceScore,
      icon: Target,
      gradient: "from-purple-500 to-pink-500",
      badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    },
    {
      key: "clarity",
      label: "Speech Clarity",
      weight: 0.15,
      weightPct: "15%",
      score: verdict.clarityScore,
      icon: MessageSquare,
      gradient: "from-amber-500 to-orange-500",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    {
      key: "rebuttal",
      label: "Rebuttal & Clash",
      weight: 0.2,
      weightPct: "20%",
      score: verdict.rebuttalScore,
      icon: Layers,
      gradient: "from-cyan-500 to-blue-500",
      badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    },
  ];

  const currentDim = dimensions.find((d) => d.key === activeTab) || dimensions[0];
  const rep = verdict.transparencyReport?.[activeTab];

  const trendData = verdict.trendData;
  const isImproving = trendData?.isImproving ?? true;
  const scoreDelta = trendData?.scoreDelta ?? 0;

  // Exact math calculation breakdown
  const weightedLogic = (verdict.logicScore * 0.25).toFixed(1);
  const weightedEvidence = (verdict.evidenceScore * 0.2).toFixed(1);
  const weightedRelevance = (verdict.relevanceScore * 0.2).toFixed(1);
  const weightedClarity = (verdict.clarityScore * 0.15).toFixed(1);
  const weightedRebuttal = (verdict.rebuttalScore * 0.2).toFixed(1);

  return (
    <div className="rounded-3xl border border-indigo-500/20 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-xl shadow-indigo-950/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Audit Grade Adjudication
            </span>
            <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Zero-Blackbox
            </span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-2.5 mt-2">
            <Brain className="h-6 w-6 text-indigo-400" />
            <span>Why You Got This Score</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Complete adjudicator ballot with transparent weighting, observable speech evidence, and actionable remedies.
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto rounded-2xl bg-slate-950/70 border border-slate-800 p-3 px-4">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Aggregate</div>
            <div className="text-2xl font-black text-white">{verdict.overallScore} / 100</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-600/30">
            {verdict.overallScore}%
          </div>
        </div>
      </div>

      {/* Trajectory / Performance Progression Bar */}
      {trendData && trendData.roundScores && trendData.roundScores.length > 1 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {isImproving ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <TrendingDown className="h-4 w-4" />
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-white">
                Match Performance Trajectory:{" "}
                <span className={isImproving ? "text-emerald-400" : "text-amber-400"}>
                  {isImproving ? `+${scoreDelta} pts Improvement` : `${scoreDelta} pts Variation`}
                </span>
              </span>
              <p className="text-[11px] text-slate-400">
                Progression across {trendData.roundScores.length} rounds of debate clash
              </p>
            </div>
          </div>

          {/* Sparkline / Round Pills */}
          <div className="flex items-center gap-2">
            {trendData.roundScores.map((score, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs"
              >
                <span className="text-[10px] text-slate-500 font-mono">R{idx + 1}:</span>
                <span className="font-bold text-slate-200">{score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dimension Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {dimensions.map((d) => {
          const Icon = d.icon;
          const isSelected = activeTab === d.key;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => setActiveTab(d.key)}
              className={cn(
                "rounded-2xl border p-3 text-left transition-all duration-200 flex flex-col justify-between gap-2",
                isSelected
                  ? "border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40"
                  : "border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 text-slate-400"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={cn("h-4 w-4", isSelected ? "text-blue-400" : "text-slate-500")} />
                <span className="text-[10px] font-mono text-slate-500">{d.weightPct}</span>
              </div>
              <div>
                <div className={cn("text-xs font-bold leading-tight", isSelected ? "text-white" : "text-slate-300")}>
                  {d.label}
                </div>
                <div className="text-sm font-black text-white mt-1">{d.score} / 100</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dimension Detail Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className={cn("rounded-lg border px-2.5 py-1 text-xs font-bold", currentDim.badgeColor)}>
              {currentDim.label}
            </span>
            <span className="text-xs text-slate-400 font-mono">Weight: {currentDim.weightPct} of Match</span>
          </div>
          <div className="text-sm font-bold text-white">
            Score: <span className="text-indigo-400 text-base">{currentDim.score}</span> / 100
          </div>
        </div>

        {/* Observation */}
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-blue-400" />
            <span>Adjudicator Observation:</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {rep?.observation || "Consistent performance observed across rounds."}
          </p>
        </div>

        {/* Observable Evidence In Speech */}
        {(rep?.evidenceUsed || rep?.citation || rep?.motion || rep?.structuralStrengths) && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Observable Speech Markers Identified:</span>
            </div>
            {rep.evidenceUsed && (
              <p className="text-xs text-slate-300 font-mono bg-slate-950/60 rounded p-2 border border-slate-800">
                {rep.evidenceUsed}
              </p>
            )}
            {rep.sourceTitle && (
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <span className="text-slate-500 font-medium">Empirical Grounding Source:</span>
                <span className="text-slate-300 font-semibold">{rep.sourceTitle}</span>
              </div>
            )}
            {rep.structuralStrengths && rep.structuralStrengths.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {rep.structuralStrengths.map((str, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[11px] text-indigo-300"
                  >
                    &bull; {str}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actionable Remedy / How to Elevate */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-emerald-400" />
            <span>Actionable Coaching Directive:</span>
          </div>
          <p className="text-xs text-emerald-200/90 leading-relaxed">
            {rep?.action || "Continue maintaining structured warrants and direct counter-points."}
          </p>
        </div>
      </div>

      {/* Transparent Math Formula Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <Calculator className="h-4 w-4 text-blue-400" />
          <span>Transparent Scoring Formula Breakdown (TypeScript Owned)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
          Final Score = Math.round(Logic &times; 0.25 + Evidence &times; 0.20 + Relevance &times; 0.20 + Clarity &times; 0.15 + Rebuttal &times; 0.20)
        </p>
        <div className="rounded-xl bg-slate-900 p-2.5 font-mono text-[11px] text-slate-300 border border-slate-800 flex flex-wrap items-center gap-1.5">
          <span className="text-blue-400">({verdict.logicScore} &times; 0.25 = {weightedLogic})</span>
          <span>+</span>
          <span className="text-emerald-400">({verdict.evidenceScore} &times; 0.20 = {weightedEvidence})</span>
          <span>+</span>
          <span className="text-purple-400">({verdict.relevanceScore} &times; 0.20 = {weightedRelevance})</span>
          <span>+</span>
          <span className="text-amber-400">({verdict.clarityScore} &times; 0.15 = {weightedClarity})</span>
          <span>+</span>
          <span className="text-cyan-400">({verdict.rebuttalScore} &times; 0.20 = {weightedRebuttal})</span>
          <span>=</span>
          <span className="font-bold text-white text-sm underline decoration-blue-500 underline-offset-4">
            {verdict.overallScore} / 100
          </span>
        </div>
      </div>
    </div>
  );
}

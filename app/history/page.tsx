"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Trophy,
  ShieldAlert,
  Scale,
  Swords,
  Calendar,
  Layers,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { DebateSession } from "@/lib/types/debate";
import { formatDate, cn } from "@/lib/utils";

export default function HistoryPage() {
  const [debates, setDebates] = useState<DebateSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPosition, setFilterPosition] = useState("ALL");
  const [filterOutcome, setFilterOutcome] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setDebates(data.debates || []);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this debate record?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/debates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDebates((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter debates
  const filteredDebates = debates.filter((d) => {
    if (searchQuery && !d.topic.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterPosition !== "ALL" && d.userPosition !== filterPosition) {
      return false;
    }
    if (filterOutcome !== "ALL") {
      if (!d.finalVerdict || d.finalVerdict.ruling !== filterOutcome) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-400">
            <History className="h-3.5 w-3.5" />
            <span>Debate Archive</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            Debate History & Transcripts
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Review your past oral arguments, opponent counterarguments, and judicial decisions.
          </p>
        </div>

        <Link
          href="/setup"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all self-start sm:self-auto"
        >
          <Swords className="h-4 w-4" />
          <span>New Debate</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic keywords..."
            className="w-full rounded-xl bg-slate-950/90 border border-slate-800 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Stance Filter */}
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Stances</option>
            <option value="FOR">FOR Stance</option>
            <option value="AGAINST">AGAINST Stance</option>
          </select>

          {/* Outcome Filter */}
          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Outcomes</option>
            <option value="User Won">Victories (User Won)</option>
            <option value="AI Opponent Won">AI Victories</option>
            <option value="Draw / Tie">Draws / Ties</option>
          </select>
        </div>
      </div>

      {/* Debates List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-400">Loading debate records...</p>
        </div>
      ) : filteredDebates.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-base font-bold text-white">No debates found</h3>
          <p className="mt-1 text-xs text-slate-400">
            {searchQuery || filterPosition !== "ALL" || filterOutcome !== "ALL"
              ? "Try adjusting your search query or filters."
              : "You haven't recorded any debates yet."}
          </p>
          <div className="mt-6">
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
            >
              Start First Debate
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDebates.map((d) => {
            const verdict = d.finalVerdict;
            const ruling = verdict?.ruling || "Incomplete";

            const rulingBadges = {
              "User Won": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
              "AI Opponent Won": "bg-rose-500/15 text-rose-400 border-rose-500/30",
              "Draw / Tie": "bg-amber-500/15 text-amber-400 border-amber-500/30",
              Incomplete: "bg-slate-800 text-slate-400 border-slate-700",
            };

            return (
              <div
                key={d.id}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          rulingBadges[ruling as keyof typeof rulingBadges]
                        )}
                      >
                        {ruling}
                      </span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="font-semibold text-slate-400 capitalize">
                        {d.difficulty} difficulty
                      </span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(d.createdAt)}</span>
                      </span>
                    </div>

                    <Link
                      href={d.isComplete ? `/results/${d.id}` : `/debate/${d.id}`}
                      className="block group-hover:text-blue-300 transition-colors"
                    >
                      <h3 className="text-base font-bold text-white line-clamp-2">
                        &ldquo;{d.topic}&rdquo;
                      </h3>
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <div>
                        Your Stance:{" "}
                        <strong className="text-emerald-400">{d.userPosition}</strong>
                      </div>
                      <div>
                        AI Opponent:{" "}
                        <strong className="text-amber-400">{d.aiPosition}</strong>
                      </div>
                      <div>
                        Rounds:{" "}
                        <strong className="text-white">
                          {d.rounds.length}/{d.maxRounds}
                        </strong>
                      </div>
                      {verdict && (
                        <div>
                          Fallacies:{" "}
                          <strong className={verdict.totalFallacies > 0 ? "text-amber-400" : "text-emerald-400"}>
                            {verdict.totalFallacies}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score Gauge & Action Buttons */}
                  <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                    {verdict && (
                      <div className="text-center bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Overall Score
                        </span>
                        <span className="text-2xl font-black text-white">
                          {verdict.overallScore}
                          <span className="text-xs text-slate-500 font-normal">/100</span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        href={d.isComplete ? `/results/${d.id}` : `/debate/${d.id}`}
                        className="rounded-xl bg-blue-600/20 px-3.5 py-2 text-xs font-bold text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                      >
                        {d.isComplete ? "View Report" : "Resume"}
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(d.id, e)}
                        disabled={deletingId === d.id}
                        title="Delete record"
                        className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { ExternalLink, Globe } from "lucide-react";
import { SourceItem } from "@/lib/types/search";

interface SourceCardProps {
  source: SourceItem;
  index: number;
}

export default function SourceCard({ source, index }: SourceCardProps) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 transition-all duration-200 hover:border-blue-500/40 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-blue-500/5"
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[11px]">
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate max-w-[180px]">{source.domain}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500 group-hover:text-blue-400 transition-colors">
          <span>Source #{index + 1}</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>

      <h5 className="mt-1.5 text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
        {source.title}
      </h5>

      {source.snippet && (
        <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {source.snippet}
        </p>
      )}
    </a>
  );
}

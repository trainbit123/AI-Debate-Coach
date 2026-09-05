"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  isActive: boolean;
  color?: "blue" | "emerald" | "rose" | "purple";
  barCount?: number;
  className?: string;
}

export default function AudioVisualizer({
  isActive,
  color = "blue",
  barCount = 12,
  className,
}: AudioVisualizerProps) {
  const colorMap = {
    blue: "bg-blue-500 shadow-blue-500/50",
    emerald: "bg-emerald-500 shadow-emerald-500/50",
    rose: "bg-rose-500 shadow-rose-500/50",
    purple: "bg-purple-500 shadow-purple-500/50",
  };

  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 h-10 px-3 py-1 rounded-xl bg-slate-900/60 border border-slate-800",
        className
      )}
    >
      {bars.map((i) => {
        // Pseudo-random stagger delays
        const delay = (i % 5) * 0.12;
        const duration = 0.8 + (i % 4) * 0.2;

        return (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-all duration-300",
              colorMap[color],
              isActive ? "shadow-sm" : "opacity-30 h-1.5"
            )}
            style={
              isActive
                ? {
                    animation: `waveAnimation ${duration}s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                    minHeight: "4px",
                  }
                : { height: "4px" }
            }
          />
        );
      })}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Mic,
  ShieldCheck,
  History,
  BarChart3,
  Sparkles,
  Swords,
  Search,
} from "lucide-react";
import VoiceSearchModal from "./VoiceSearchModal";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);

  // Global Ctrl + K / Cmd + K shortcut to open Voice Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsVoiceSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { href: "/search", label: "Research", icon: Search },
    { href: "/setup", label: "New Debate", icon: Swords },
    { href: "/history", label: "History", icon: History },
    { href: "/progress", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/40">
                <Bot className="h-5 w-5 text-white" />
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-950"></span>
                </span>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">
                  Debate<span className="text-blue-400">AI</span>
                </span>
                <span className="hidden sm:inline-block ml-2 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 ring-1 ring-blue-500/30">
                  AI Debate Coach
                </span>
              </div>
            </Link>
          </div>

          {/* Center Voice Search Quick Trigger */}
          <button
            type="button"
            onClick={() => setIsVoiceSearchOpen(true)}
            className="hidden md:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors shadow-inner"
            title="Press Ctrl + K to open Voice Search"
          >
            <Mic className="h-3.5 w-3.5 text-blue-400" />
            <span>Voice Search...</span>
            <kbd className="rounded bg-slate-950 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 border border-slate-800">
              Ctrl+K
            </kbd>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/30 shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xs:inline sm:inline">{link.label}</span>
                </Link>
              );
            })}

            {/* Mobile Voice Search Mic Button */}
            <button
              type="button"
              onClick={() => setIsVoiceSearchOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-blue-400 hover:text-white"
              title="Voice Search"
            >
              <Mic className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>

      {/* Global Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
      />
    </>
  );
}

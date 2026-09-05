"use client";

import React from "react";
import Link from "next/link";
import {
  Bot,
  Mic,
  Brain,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Flame,
  Scale,
  Volume2,
  CheckCircle2,
  Award,
  Zap,
} from "lucide-react";
import AudioVisualizer from "@/components/AudioVisualizer";

export default function LandingPage() {
  const features = [
    {
      icon: Bot,
      title: "Interactive Debate Chatbot",
      description:
        "Engage in round-by-round debates against an AI sparring partner. Type or speak your arguments to practice critical thinking anytime.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: Scale,
      title: "Relentless AI Opponent",
      description:
        "The AI automatically takes the opposing side, challenging your points with clear, logical counterarguments.",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: ShieldCheck,
      title: "Real-Time Fallacy Detection",
      description:
        "Flags Ad Hominem, Strawman, Slippery Slope, and other common logical traps with simple tips to fix them.",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: Brain,
      title: "5-Metric Argument Scoring",
      description:
        "Every argument is scored on Logic, Real-World Evidence, Topic Relevance, Speech Clarity, and Rebuttals.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Volume2,
      title: "Optional Voice & Audio Mode",
      description:
        "Practice out loud with real-time speech-to-text and listen to your AI coach deliver spoken counterarguments in natural audio.",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Progress & Skill Tracking",
      description:
        "Track your debate win-rate, common logic mistakes, and speaking improvements over time.",
      color: "from-indigo-500 to-purple-600",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Choose Motion & Stance",
      description: "Pick any topic or type your own. Select FOR or AGAINST, difficulty, and rounds.",
    },
    {
      step: "02",
      title: "Submit Your Argument",
      description: "Type your argument directly into the chatbot or use voice input to speak your case.",
    },
    {
      step: "03",
      title: "AI Analysis & Counterargument",
      description: "Get instant scoring, logic feedback, and receive a sharp counterargument from your AI coach.",
    },
    {
      step: "04",
      title: "Final Verdict & Coaching",
      description: "Conclude your debate to get a clear final verdict, score breakdown, and personalized coach tips.",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] bg-blue-600/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-96 left-1/4 h-[400px] w-[500px] bg-indigo-600/10 blur-[140px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-4 py-1.5 text-xs font-semibold text-blue-300 shadow-inner backdrop-blur-md">
          <Bot className="h-3.5 w-3.5 text-blue-400" />
          <span className="tracking-widest uppercase text-[11px]">
            AI Debate Coach &bull; Study Partner Chatbot
          </span>
        </div>

        {/* Master Heading */}
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Master the Art of Debate with an{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            AI Debate Coach Chatbot
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
          An interactive AI chatbot that acts as your personal debate coach and study partner. Practice debate
          motions, receive instant counterarguments, spot logical fallacies, and sharpen your skills with optional voice mode.
        </p>

        {/* Soundwave Animation Graphic */}
        <div className="mt-8 flex justify-center">
          <AudioVisualizer isActive={true} color="blue" barCount={18} className="h-12 px-6" />
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/setup"
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
          >
            <Bot className="h-5 w-5" />
            <span>Start Practicing with AI</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-4 text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            <span>View Past Debates</span>
          </Link>
        </div>

        {/* Quick Trust Highlights */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Interactive Chatbot & Study Partner</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Voice & Audio Sparring (Optional)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Strict Anti-Switch AI Opponent</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>9 Logical Fallacy Scanners</span>
          </div>
        </div>
      </section>

      {/* Interactive Flow / How It Works */}
      <section className="border-y border-slate-800/80 bg-slate-950/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">
              The Critical Path
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              How a DebateAI Session Works
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 shadow-lg transition-all hover:border-slate-700"
              >
                <span className="text-3xl font-black text-slate-700">{s.step}</span>
                <h3 className="mt-2 text-base font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Complete Rhetorical Toolkit
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Everything You Need to Debate Like a Champion
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-xl"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${f.color} shadow-lg ring-1 ring-white/20`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24 text-center">
        <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/30 to-slate-900 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to practice with your AI Debate Coach?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-slate-400">
            Pick a motion, debate your arguments with your AI coach, and sharpen your critical thinking.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95"
            >
              <Bot className="h-4 w-4" />
              <span>Start Debate Practice</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

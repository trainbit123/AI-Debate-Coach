"use client";

import React, { useEffect, useState } from "react";
import {
  Bot,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  HelpCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Position } from "@/lib/types/debate";
import { SpeechService } from "@/services/speechService";
import AudioVisualizer from "./AudioVisualizer";
import { cn } from "@/lib/utils";

interface AiVoiceSpeakerProps {
  counterargument: string;
  followUpQuestion?: string;
  aiPosition: Position;
  roundNumber: number;
  autoPlay?: boolean;
}

export default function AiVoiceSpeaker({
  counterargument,
  followUpQuestion,
  aiPosition,
  roundNumber,
  autoPlay = false,
}: AiVoiceSpeakerProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [hasPlayed, setHasPlayed] = useState(false);

  // When counterargument changes (new round), reset hasPlayed
  useEffect(() => {
    setHasPlayed(false);
    SpeechService.cancelSpeech();
    setIsSpeaking(false);
  }, [counterargument]);

  useEffect(() => {
    return () => {
      SpeechService.cancelSpeech();
    };
  }, []);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      SpeechService.cancelSpeech();
      setIsSpeaking(false);
      return;
    }

    const fullSpeechText = followUpQuestion
      ? `${counterargument}. Now respond to this: ${followUpQuestion}`
      : counterargument;

    setHasPlayed(true);
    SpeechService.speak(fullSpeechText, {
      rate: speechRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStop = () => {
    SpeechService.cancelSpeech();
    setIsSpeaking(false);
  };

  const cycleSpeed = () => {
    const rates = [1.0, 1.25, 0.9];
    const nextIndex = (rates.indexOf(speechRate) + 1) % rates.length;
    const newRate = rates[nextIndex];
    setSpeechRate(newRate);

    if (isSpeaking) {
      SpeechService.cancelSpeech();
      const fullSpeechText = followUpQuestion
        ? `${counterargument}. Now respond to this: ${followUpQuestion}`
        : counterargument;
      SpeechService.speak(fullSpeechText, {
        rate: newRate,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-slate-900 via-slate-900/90 to-indigo-950/20 p-5 shadow-2xl backdrop-blur-md">
      {/* Ambient glow */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/30 ring-2 transition-all duration-300",
                isSpeaking ? "ring-indigo-400 scale-105" : "ring-white/10"
              )}
            >
              <Bot className="h-6 w-6 text-white" />
            </div>
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-indigo-500 ring-2 ring-slate-950"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">AI Opponent</h3>
              <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 ring-1 ring-indigo-500/30">
                AI Sparring Partner
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Standing strictly{" "}
              <span className="font-bold text-amber-400">{aiPosition}</span> the motion
            </p>
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <AudioVisualizer
            isActive={isSpeaking}
            color="purple"
            barCount={8}
            className="h-9 py-0.5"
          />

          <button
            type="button"
            onClick={handleToggleSpeak}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-all duration-200 cursor-pointer",
              isSpeaking
                ? "bg-amber-600 text-white hover:bg-amber-500 shadow-amber-600/25"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/25"
            )}
          >
            {isSpeaking ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause Voice</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>{hasPlayed ? "Replay Voice" : "Speak Aloud"}</span>
              </>
            )}
          </button>

          {isSpeaking && (
            <button
              type="button"
              onClick={handleStop}
              title="Stop speech"
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <VolumeX className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={cycleSpeed}
            title="Adjust voice speed"
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {speechRate}x
          </button>
        </div>
      </div>

      {/* Counterargument Text */}
      <div className="mt-4">
        <div className="text-sm sm:text-base leading-relaxed text-slate-200 font-normal">
          {counterargument}
        </div>

        {/* Follow-up Question Callout */}
        {followUpQuestion && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 text-amber-400">
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Cross-Examination Challenge:
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-amber-200/95 leading-relaxed">
              &ldquo;{followUpQuestion}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

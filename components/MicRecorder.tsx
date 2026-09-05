"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Edit3,
  Check,
  AlertCircle,
  Volume2,
  VolumeX,
  Keyboard,
  Square,
  Sparkles,
  Zap,
  Play,
  Pause,
  Bot,
  HelpCircle,
} from "lucide-react";
import { SpeechService } from "@/services/speechService";
import AudioVisualizer from "./AudioVisualizer";
import { cn, playChime } from "@/lib/utils";

interface MicRecorderProps {
  onSubmitArgument: (argumentText: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
  roundNumber: number;
}

export default function MicRecorder({
  onSubmitArgument,
  isProcessing,
  disabled = false,
  roundNumber,
}: MicRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [manualText, setManualText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mode, setMode] = useState<"voice" | "keyboard">("voice");

  // Speech & Sparring Feature States
  const [voiceAssistantActive, setVoiceAssistantActive] = useState(true);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);
  const [isReadingBack, setIsReadingBack] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState<string>(
    "AI Debate Coach ready. Type your argument or click the microphone to speak."
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      SpeechService.stopListening();
      SpeechService.cancelSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Voice command detector
  const checkVoiceCommands = (text: string): { isCommand: boolean; cleanText: string; command?: string } => {
    const lower = text.toLowerCase().trim();

    // Reset/Clear command
    if (
      lower.endsWith("clear argument") ||
      lower.endsWith("start over") ||
      lower.endsWith("reset argument")
    ) {
      return { isCommand: true, cleanText: "", command: "clear" };
    }

    // Submit commands
    const submitTriggers = [
      "submit argument",
      "submit my argument",
      "submit this argument",
      "i rest my case",
      "that is my argument",
      "i am done",
      "i'm done",
    ];

    for (const trigger of submitTriggers) {
      if (lower.endsWith(trigger)) {
        const clean = text.slice(0, text.length - trigger.length).trim();
        return { isCommand: true, cleanText: clean, command: "submit" };
      }
    }

    return { isCommand: false, cleanText: text };
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscript("");
    setManualText("");
    setRecordingSeconds(0);
    setIsEditing(false);
    setAutoSubmitCountdown(null);

    // Cancel any ongoing AI speech or read-back
    SpeechService.cancelSpeech();
    setIsReadingBack(false);

    playChime("start");
    setAssistantMessage("Listening to your oral argument... Speak clearly.");

    await SpeechService.startListening({
      onStart: () => {
        setIsRecording(true);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      },
      onResult: (text: string, isFinal: boolean) => {
        // Check for voice commands
        const cmdCheck = checkVoiceCommands(text);

        if (cmdCheck.isCommand && cmdCheck.command === "clear") {
          playChime("cue");
          setTranscript("");
          setManualText("");
          setAssistantMessage("Cleared argument. Ready to record again.");
          return;
        }

        if (cmdCheck.isCommand && cmdCheck.command === "submit") {
          const finalArg = cmdCheck.cleanText || transcript;
          if (finalArg.trim().length >= 5) {
            setTranscript(finalArg);
            setManualText(finalArg);
            stopRecording();
            setAssistantMessage("Voice command recognized: Submitting argument...");
            playChime("submit");
            onSubmitArgument(finalArg);
            return;
          }
        }

        const validText = cmdCheck.cleanText;
        setTranscript(validText);
        setManualText(validText);

        const wordCount = validText.split(/\s+/).filter(Boolean).length;

        // Auto-detect speech pause if Assistant Auto-Flow is active and we have meaningful speech
        if (voiceAssistantActive && wordCount >= 8) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          setAutoSubmitCountdown(null);

          // 2.8s of silence after substantive argument triggers smart auto-submission
          silenceTimerRef.current = setTimeout(() => {
            triggerAutoSubmitCountdown(validText);
          }, 2800);
        }
      },
      onError: (err: string) => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setErrorMessage(err);
        setAssistantMessage("Microphone issue detected. Please check permissions or use Type mode.");
      },
      onEnd: () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      },
    });
  };

  const triggerAutoSubmitCountdown = (textToSubmit: string) => {
    let secondsLeft = 3;
    setAutoSubmitCountdown(secondsLeft);
    setAssistantMessage("Speech concluded. Auto-submitting in 3s (or click Cancel)...");
    playChime("cue");

    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setAutoSubmitCountdown(null);
        stopRecording();
        playChime("submit");
        onSubmitArgument(textToSubmit);
      } else {
        setAutoSubmitCountdown(secondsLeft);
      }
    }, 1000);
  };

  const cancelAutoSubmit = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setAutoSubmitCountdown(null);
    setAssistantMessage("Auto-submit paused. You may continue speaking or edit.");
  };

  const stopRecording = () => {
    SpeechService.stopListening();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setAutoSubmitCountdown(null);
    playChime("stop");
    setAssistantMessage("Speech recorded. You can review, read back, or submit.");
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleReset = () => {
    stopRecording();
    setTranscript("");
    setManualText("");
    setErrorMessage(null);
    setRecordingSeconds(0);
    setIsEditing(false);
    setAutoSubmitCountdown(null);
    setAssistantMessage("AI Debate Coach ready. Type your argument or click the microphone to speak.");
  };

  const handleSubmit = () => {
    const textToSubmit = (isEditing ? manualText : transcript || manualText).trim();
    if (!textToSubmit) return;

    cancelAutoSubmit();
    stopRecording();
    playChime("submit");
    onSubmitArgument(textToSubmit);
    setTranscript("");
    setManualText("");
    setRecordingSeconds(0);
    setIsEditing(false);
  };

  // Read-back audio preview of user's argument
  const handleToggleReadBack = () => {
    if (isReadingBack) {
      SpeechService.cancelSpeech();
      setIsReadingBack(false);
      return;
    }

    const textToRead = (isEditing ? manualText : transcript || manualText).trim();
    if (!textToRead) return;

    setIsReadingBack(true);
    setAssistantMessage("Reading back your argument...");

    SpeechService.speak(textToRead, {
      rate: 1.05,
      onStart: () => setIsReadingBack(true),
      onEnd: () => {
        setIsReadingBack(false);
        setAssistantMessage("Read-back complete. Ready to submit.");
      },
      onError: () => setIsReadingBack(false),
    });
  };

  const currentText = isEditing ? manualText : transcript || manualText;
  const wordCount = currentText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-blue-400" />
              <span>AI Debate Partner & Coach</span>
            </h3>
            <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-400 ring-1 ring-blue-500/30">
              Round {roundNumber}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === "voice"
              ? "Speak your rebuttal with auto-speech detection & voice commands."
              : "Type your argument or rebuttal below (or switch to Voice)."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Hands-Free Auto-Flow Toggle */}
          {mode === "voice" && (
            <button
              type="button"
              onClick={() => setVoiceAssistantActive(!voiceAssistantActive)}
              className={cn(
                "hidden sm:flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all",
                voiceAssistantActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm"
                  : "bg-slate-950 text-slate-500 border-slate-800"
              )}
              title="Smart Auto-Submit detects when you finish speaking and submits automatically"
            >
              <Zap className="h-3 w-3" />
              <span>{voiceAssistantActive ? "Smart Auto-Submit ON" : "Auto-Submit OFF"}</span>
            </button>
          )}

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                stopRecording();
                setMode("voice");
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                mode === "voice"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Voice</span>
            </button>
            <button
              type="button"
              onClick={() => {
                stopRecording();
                setMode("keyboard");
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                mode === "keyboard"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>Type</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Debate Coach Live Guidance Banner */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-blue-950/25 border border-blue-500/20 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2 text-blue-300">
          <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span className="font-medium text-[11px] leading-tight">{assistantMessage}</span>
        </div>
        {mode === "voice" && (
          <span className="hidden md:inline-block text-[10px] text-blue-400/80 font-mono">
            Say &ldquo;Submit&rdquo; or pause to finish
          </span>
        )}
      </div>

      {/* Auto-Submit Countdown Alert */}
      {autoSubmitCountdown !== null && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              AI Debate Coach: Submitting argument in{" "}
              <strong className="font-bold text-white text-sm">{autoSubmitCountdown}s</strong>...
            </span>
          </div>
          <button
            type="button"
            onClick={cancelAutoSubmit}
            className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
          >
            Cancel / Keep Speaking
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-rose-200">{errorMessage}</p>
            <p className="text-slate-400">
              Tip: You can switch to the <strong className="text-blue-300">Type</strong> tab above to type your argument if your microphone is unavailable.
            </p>
          </div>
        </div>
      )}

      {/* Main Interaction Station */}
      <div className="mt-4">
        {mode === "voice" ? (
          <div className="space-y-4">
            {/* Big Mic Button with Pulsing Assistant Orb */}
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <div className="relative">
                {isRecording && (
                  <>
                    <div className="absolute -inset-2 rounded-full bg-rose-500/20 animate-ping" />
                    <div className="absolute -inset-4 rounded-full bg-rose-500/10 animate-pulse" />
                  </>
                )}
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={disabled || isProcessing}
                  className={cn(
                    "relative flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-all duration-300 cursor-pointer",
                    isRecording
                      ? "bg-rose-600 text-white ring-4 ring-rose-500/50 scale-105"
                      : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 ring-4 ring-blue-500/20 hover:scale-105 active:scale-95",
                    (disabled || isProcessing) && "opacity-50 cursor-not-allowed hover:scale-100"
                  )}
                  title={isRecording ? "Click to stop recording" : "Click to speak your argument"}
                >
                  {isRecording ? (
                    <Square className="h-7 w-7 fill-white" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </button>
              </div>

              {/* Status and Timer */}
              <div className="text-center">
                {isRecording ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-bold text-rose-400">
                        Coach Listening ({recordingSeconds}s)...
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Speak your rebuttal now &bull; Say &ldquo;Submit&rdquo; when finished
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-slate-400">
                    {currentText
                      ? "Speech captured! Listen back, edit, or submit below."
                      : "Click microphone to speak (or switch to Type tab)"}
                  </span>
                )}
              </div>

              {/* Real-time wave visualizer */}
              {isRecording && (
                <AudioVisualizer
                  isActive={true}
                  color="rose"
                  barCount={16}
                  className="w-full max-w-sm"
                />
              )}
            </div>

            {/* Live Transcript Preview Box */}
            <div className="relative rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-blue-400 flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Speech-to-Text Live Transcript:</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{wordCount} words</span>
                  {currentText && !isRecording && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>{isEditing ? "Done Editing" : "Edit / Fix Text"}</span>
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Edit or refine your argument text here..."
                  rows={4}
                  className="w-full rounded-lg bg-slate-900 border border-blue-500/40 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="min-h-[72px] text-sm leading-relaxed text-slate-200">
                  {currentText || (
                    <span className="italic text-slate-600">
                      {isRecording
                        ? "Transcribing your spoken argument in real time..."
                        : "Your spoken words will appear here. Activate the microphone and speak your case..."}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Keyboard Input Mode */
          <div className="space-y-3">
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Present your argument, cite your evidence, and counter the opponent's thesis..."
              rows={5}
              disabled={disabled || isProcessing}
              className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
            />
            <div className="flex justify-end text-xs text-slate-500">
              {wordCount} words
            </div>
          </div>
        )}

        {/* Action Controls & Coach Review */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {/* Read Back My Argument Button */}
            {currentText && !isRecording && (
              <button
                type="button"
                onClick={handleToggleReadBack}
                disabled={isProcessing}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all cursor-pointer",
                  isReadingBack
                    ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
                    : "bg-slate-800/80 text-purple-300 border-purple-500/30 hover:bg-slate-800 hover:text-white"
                )}
                title="AI Debate Coach reads back your argument aloud so you can test how it sounds"
              >
                {isReadingBack ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause Review</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-purple-300" />
                    <span>Listen to My Argument</span>
                  </>
                )}
              </button>
            )}

            {currentText && !isRecording && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!currentText || isProcessing || disabled || isRecording}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-200",
              currentText && !isProcessing && !isRecording
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-600/25 hover:shadow-blue-500/40 active:scale-95 cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
            )}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>AI Analyzing Rhetoric...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Round {roundNumber} Argument</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

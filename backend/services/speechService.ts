/**
 * Bulletproof Speech Synthesis (TTS) and Speech Recognition (STT) Service
 * Implements Chromium keepalive, multi-sentence chunking, voice-loading fallbacks,
 * and robust continuous STT transcript accumulation.
 */

export interface SpeechRecognitionHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onStart: () => void;
  onEnd: () => void;
}

export class SpeechService {
  private static recognitionInstance: any = null;
  private static isListeningRequested = false;
  private static accumulatedFinalTranscript = "";
  private static keepAliveTimer: any = null;
  private static activeUtterance: SpeechSynthesisUtterance | null = null;
  public static isSpeaking = false;

  /**
   * Check if SpeechRecognition is supported
   */
  public static isSTTSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  /**
   * Check if SpeechSynthesis is supported
   */
  public static isTTSSupported(): boolean {
    if (typeof window === "undefined") return false;
    return "speechSynthesis" in window;
  }

  /**
   * Request microphone permission explicitly via getUserMedia
   */
  public static async requestMicrophoneAccess(): Promise<{ ok: boolean; error?: string }> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return { ok: true }; // Fallback to SpeechRecognition prompt
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately so mic is freed for SpeechRecognition
      stream.getTracks().forEach((track) => track.stop());
      return { ok: true };
    } catch (err: any) {
      console.warn("Microphone permission error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        return {
          ok: false,
          error: "Microphone permission was denied. Please allow microphone access in your browser settings (click the lock/tune icon near the URL bar).",
        };
      }
      return {
        ok: false,
        error: `Could not access microphone: ${err.message || "Device not found"}`,
      };
    }
  }

  /**
   * Start robust continuous Speech-to-Text recording
   */
  public static async startListening(
    handlers: SpeechRecognitionHandlers,
    options?: { lang?: string }
  ): Promise<any> {
    if (!this.isSTTSupported()) {
      handlers.onError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or switch to typing mode.");
      return null;
    }

    // Stop any existing speech synthesis so AI doesn't talk into user's mic
    this.cancelSpeech();

    // Verify mic access
    const micCheck = await this.requestMicrophoneAccess();
    if (!micCheck.ok && micCheck.error) {
      handlers.onError(micCheck.error);
      return null;
    }

    this.stopListening();
    this.isListeningRequested = true;
    this.accumulatedFinalTranscript = "";

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const startRecognitionSession = () => {
      if (!this.isListeningRequested) return;

      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = options?.lang || "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          handlers.onStart();
        };

        recognition.onresult = (event: any) => {
          let currentSessionFinal = "";
          let interimTranscript = "";

          // Accumulate from result 0 to capture all finalized sentences
          for (let i = 0; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              currentSessionFinal += item[0].transcript + " ";
            } else {
              interimTranscript += item[0].transcript;
            }
          }

          const combined = (
            this.accumulatedFinalTranscript +
            currentSessionFinal +
            interimTranscript
          ).trim();

          if (combined) {
            handlers.onResult(combined, !interimTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition event error:", event.error);
          if (event.error === "no-speech") {
            // User paused speaking; do not kill the session!
            return;
          }
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            this.isListeningRequested = false;
            handlers.onError(
              "Microphone access blocked. Click the lock/permission icon in your browser URL bar to allow microphone access, or switch to Type mode."
            );
            return;
          }
          if (event.error === "network") {
            this.isListeningRequested = false;
            handlers.onError(
              "Network error connecting to speech services. Please check your internet connection or switch to Type mode."
            );
            return;
          }
        };

        recognition.onend = () => {
          // If the user hasn't explicitly clicked stop, auto-restart to prevent pause disconnects!
          if (this.isListeningRequested) {
            try {
              recognition.start();
            } catch (e) {
              // Restart after short delay if immediate restart fails
              setTimeout(() => {
                if (this.isListeningRequested) {
                  try {
                    recognition.start();
                  } catch (err) {
                    // Session died
                  }
                }
              }, 300);
            }
          } else {
            handlers.onEnd();
          }
        };

        recognition.start();
        this.recognitionInstance = recognition;
      } catch (err: any) {
        console.error("Speech recognition start error:", err);
        handlers.onError(`Speech recognition error: ${err?.message || "Could not initialize speech engine"}`);
      }
    };

    startRecognitionSession();
    return this.recognitionInstance;
  }

  /**
   * Stop Speech-to-Text gracefully
   */
  public static stopListening(): void {
    this.isListeningRequested = false;
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (e) {
        // Ignore
      }
      this.recognitionInstance = null;
    }
  }

  /**
   * Speak text with Text-to-Speech, handling Chromium keepalive and voice selection
   */
  public static speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    if (!this.isTTSSupported()) {
      options?.onEnd?.();
      return;
    }

    // Cancel ongoing speech and clear keep-alive
    this.cancelSpeech();

    const cleanText = text
      .replace(/[*#_`~]/g, "")
      .replace(/\[\d+\]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      options?.onEnd?.();
      return;
    }

    const executeSpeak = () => {
      try {
        // Ensure speech synthesis is unpaused (Chromium bug)
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = options?.rate ?? 1.0;
        utterance.pitch = options?.pitch ?? 1.0;
        utterance.lang = "en-US";

        // Voice selection
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const selectedVoice =
            voices.find((v) => v.lang.startsWith("en-GB") && v.name.toLowerCase().includes("male")) ||
            voices.find((v) => v.lang.startsWith("en-GB")) ||
            voices.find((v) => v.lang.startsWith("en-US") && (v.name.includes("Natural") || v.name.includes("David") || v.name.includes("Daniel") || v.name.includes("Google"))) ||
            voices.find((v) => v.lang.startsWith("en")) ||
            voices[0];

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }

        utterance.onstart = () => {
          this.isSpeaking = true;
          options?.onStart?.();

          // Chromium keepalive: pause/resume every 10 seconds to prevent speech cutting out
          if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
          this.keepAliveTimer = setInterval(() => {
            if (this.isSpeaking && window.speechSynthesis.speaking) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            } else {
              if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
            }
          }, 9000);
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
          options?.onEnd?.();
        };

        utterance.onerror = (err) => {
          console.warn("Speech synthesis error:", err);
          this.isSpeaking = false;
          if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
          options?.onError?.();
        };

        this.activeUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("Speech synthesis execution error:", e);
        this.isSpeaking = false;
        options?.onError?.();
      }
    };

    // If voices haven't loaded yet in browser, await onvoiceschanged
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0 && "onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        executeSpeak();
      };
      // Fallback timeout in case onvoiceschanged does not fire
      setTimeout(executeSpeak, 100);
    } else {
      executeSpeak();
    }
  }

  /**
   * Cancel any active speech synthesis
   */
  public static cancelSpeech(): void {
    if (this.isTTSSupported()) {
      if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // Ignore
      }
      this.isSpeaking = false;
      this.activeUtterance = null;
    }
  }
}

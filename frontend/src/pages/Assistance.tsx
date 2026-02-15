import React, { useState, useRef, useEffect, useMemo } from "react";
import { Send, Loader2, AlertCircle, Volume2, Mic, Square } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { assistanceApi, ttsApi, sttApi, type AssistanceContext } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../lib/translations";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Clean text for TTS - remove markdown, links, etc.
 */
function cleanTextForTTS(text: string): string {
  if (!text) return "";
  
  // Remove markdown headings
  let cleaned = text.replace(/^#{1,6}\s+/gm, "");
  
  // Remove markdown bullets and numbered lists
  cleaned = cleaned.replace(/^[*\-+]\s+/gm, "");
  cleaned = cleaned.replace(/^\d+\.\s+/gm, "");
  
  // Remove markdown links [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
  
  // Remove markdown bold/italic
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1");
  cleaned = cleaned.replace(/__([^_]+)__/g, "$1");
  cleaned = cleaned.replace(/_([^_]+)_/g, "$1");
  
  // Remove backticks
  cleaned = cleaned.replace(/`{1,3}/g, "");
  
  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "");
  
  // Collapse multiple spaces/newlines
  cleaned = cleaned.replace(/\s+/g, " ");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  
  return cleaned.trim();
}

// Usage tracking for soft limits
let queryCount = 0;
let lastResetTime = Date.now();
const QUERY_LIMIT = 20;
const RESET_INTERVAL = 60000; // 1 minute

function checkUsageLimit(): string | null {
  const now = Date.now();
  if (now - lastResetTime > RESET_INTERVAL) {
    queryCount = 0;
    lastResetTime = now;
  }
  if (queryCount >= QUERY_LIMIT) {
    return "Please wait a moment before asking more questions. You've reached the rate limit.";
  }
  queryCount++;
  return null;
}

export const Assistance: React.FC = () => {
  const { user } = useAuth();
  const { language, isHindi } = useLanguage();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>(() => {
    const initialMessage: Message = {
      id: "1",
      role: "assistant",
      content: t("assistance.initialMessage"),
      timestamp: new Date(),
    };
    return [initialMessage];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [voicePreference, setVoicePreference] = useState<"male" | "female">(() => {
    const stored = localStorage.getItem("krishibodh-voice-preference");
    return stored === "female" ? "female" : "male";
  });
  const listRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(user?.uid || `session-${Date.now()}`);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Update session ID if user changes
  useEffect(() => {
    if (user?.uid) {
      sessionIdRef.current = user.uid;
    }
  }, [user]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Build context from localStorage or other sources (can be enhanced)
  const buildContext = useMemo((): AssistanceContext => {
    const context: AssistanceContext = {};
    
    // Try to get recent results from localStorage (if stored by other pages)
    try {
      const recentIrrigation = localStorage.getItem("recent-irrigation");
      if (recentIrrigation) {
        const data = JSON.parse(recentIrrigation);
        context.irrigation = {
          dailyWater: data.dailyWater || 0,
          riskLevel: data.riskLevel || "",
          efficiencyScore: data.efficiencyScore || 0,
        };
      }
      
      const recentYield = localStorage.getItem("recent-yield");
      if (recentYield) {
        const data = JSON.parse(recentYield);
        context.yield = {
          predictedYield: data.predictedYield || 0,
          riskLevel: data.riskLevel || "",
        };
      }
      
      const recentCrop = localStorage.getItem("recent-crop");
      if (recentCrop) {
        const data = JSON.parse(recentCrop);
        if (data.selectedCrop) context.crop = data.selectedCrop;
        if (data.location) context.location = data.location;
      }
      
      const recentWeather = localStorage.getItem("recent-weather");
      if (recentWeather) {
        const data = JSON.parse(recentWeather);
        context.weather = {
          temperatureC: data.temperatureC || 0,
          humidity: data.humidity || 0,
          precipitationMm: data.precipitationMm || 0,
        };
      }
    } catch {
      // Ignore parsing errors
    }
    
    return context;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Check usage limit
    const limitError = checkUsageLimit();
    if (limitError) {
      setError(isHindi ? "कृपया कुछ समय प्रतीक्षा करें। आपने दर सीमा तक पहुंच गई है।" : limitError);
      setTimeout(() => setError(null), 5000);
      return;
    }

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const context = buildContext;
      
      // Build history from previous messages (last 10 user-assistant pairs)
      // IMPORTANT: History must start with 'user' and have proper pairs
      const allMessages = messages.filter(msg => 
        msg.role === "user" || msg.role === "assistant"
      );
      
      // Remove the initial assistant greeting if it's the first message
      let historyMessages = allMessages;
      if (historyMessages.length > 0 && historyMessages[0].role === "assistant") {
        historyMessages = historyMessages.slice(1);
      }
      
      // Take last 10 messages (5 pairs) and ensure proper pairing
      const recentMessages = historyMessages.slice(-10);
      
      // If last message is 'assistant', remove it (current question will be the new 'user')
      const lastMessage = recentMessages[recentMessages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        recentMessages.pop();
      }
      
      const history = recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      console.log('[Assistance] Sending request', {
        question: trimmed.substring(0, 50),
        language,
        hasContext: Object.keys(context).length > 0,
        historyLength: history.length,
      });
      
      const res = await assistanceApi.ask({
        question: trimmed,
        context,
        language: language,
        history: history,
      });
      
      if (!res) {
        throw new Error('No response from server');
      }
      
      if (!res.answer || typeof res.answer !== 'string') {
        throw new Error('Invalid response format from server');
      }
      
      console.log('[Assistance] Response received', {
        answerLength: res.answer.length,
      });
      
      const reply: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: res.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error('[Assistance] API error:', err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      
      // Show more specific error messages
      let userFriendlyError = errorMsg;
      if (errorMsg.includes("Gemini API key") || errorMsg.includes("not available")) {
        userFriendlyError = "AI assistant is not configured. Please contact support.";
      } else if (errorMsg.includes("Authentication") || errorMsg.includes("401")) {
        userFriendlyError = "Please log in again to continue.";
      } else if (errorMsg.includes("quota")) {
        userFriendlyError = "API quota exceeded. Please try again later.";
      } else if (errorMsg.includes("Invalid response")) {
        userFriendlyError = "Received invalid response from server. Please try again.";
      }
      
      const reply: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: isHindi
          ? `क्षमा करें, ${userFriendlyError}`
          : `Sorry, ${userFriendlyError}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // TTS: Play audio for assistant response
  const handlePlayAudio = async (messageId: string, text: string) => {
    // Stop any currently playing audio
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch {}
      audioSourceRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    // If clicking the same message, stop playback
    if (playingAudioId === messageId) {
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(messageId);

      // Clean text for TTS
      const cleanedText = cleanTextForTTS(text);
      if (!cleanedText) {
        setPlayingAudioId(null);
        return;
      }

      // Get audio blob from API
      const audioBlob = await ttsApi.synthesize({
        text: cleanedText,
        lang: language,
        voice: voicePreference,
      });

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Decode audio data
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create source and play
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      // Handle playback end
      source.onended = () => {
        setPlayingAudioId(null);
        audioSourceRef.current = null;
        audioContext.close().catch(() => {});
        audioContextRef.current = null;
      };

      audioSourceRef.current = source;
      source.start(0);
    } catch (err) {
      console.error('[TTS] Error playing audio:', err);
      setPlayingAudioId(null);
      // Fail silently - don't block text display
    }
  };

  // STT: Start recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          try {
            const result = await sttApi.transcribe({
              audioBlob,
              language: language,
            });
            
            // Set transcription in input field
            setInput(result.transcription);
          } catch (err) {
            console.error('[STT] Error transcribing:', err);
            const errorMsg = err instanceof Error ? err.message : "Failed to transcribe audio";
            // Show user-friendly error message
            setError(isHindi 
              ? `ऑडियो ट्रांसक्रिप्शन में त्रुटि: ${errorMsg}` 
              : `Audio transcription error: ${errorMsg}`);
            setTimeout(() => setError(null), 5000);
            // User can still type manually
          }
        }
        
        chunksRef.current = [];
        mediaRecorderRef.current = null;
      };

      // Play start beep (optional)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('[STT] Error starting recording:', err);
      setError(isHindi ? "माइक्रोफ़ोन तक पहुंचने में त्रुटि। कृपया अनुमति दें।" : "Microphone access error. Please grant permission.");
      setTimeout(() => setError(null), 5000);
    }
  };

  // STT: Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      // Play stop beep (optional)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 600;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col animate-fade-in">
      <div className="mb-4">
        <p className="text-surface-500 text-base">
          {isHindi
            ? "AI-आधारित स्पष्टीकरण सहायक। यह प्रणाली केवल मौजूदा निर्धारक परिणामों की व्याख्या करता है, निर्णय नहीं लेता।"
            : "AI-based explanation assistant. This system only explains existing deterministic results, it does not make decisions."}
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        <CardHeader
          title={t("assistance.title")}
          subtitle={t("assistance.subtitle")}
          className="border-b border-surface-200 px-6 py-4"
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div
                    className={`rounded-xl px-4 py-3 text-base flex-1 ${
                      msg.role === "user"
                        ? "bg-primary-600 text-white"
                        : "bg-surface-100 text-surface-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handlePlayAudio(msg.id, msg.content)}
                      className={`shrink-0 p-2 rounded-lg transition-colors ${
                        playingAudioId === msg.id
                          ? "bg-primary-100 text-primary-700"
                          : "bg-surface-200 text-surface-600 hover:bg-surface-300"
                      }`}
                      title={isHindi ? "ऑडियो चलाएं" : "Play audio"}
                      aria-label={isHindi ? "ऑडियो चलाएं" : "Play audio"}
                    >
                      {playingAudioId === msg.id ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-200 text-surface-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-surface-100 px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                  <span className="text-sm text-surface-500">
                    {t("assistance.thinking")}
                  </span>
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="border-t border-surface-200 p-4"
          >
            <div className="flex gap-3">
              <button
                type="button"
                onClick={recording ? handleStopRecording : handleStartRecording}
                disabled={loading}
                className={`shrink-0 p-3 rounded-lg transition-colors ${
                  recording
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-surface-200 text-surface-600 hover:bg-surface-300"
                }`}
                title={isHindi ? recording ? "रिकॉर्डिंग रोकें" : "वॉइस रिकॉर्ड करें" : recording ? "Stop recording" : "Record voice"}
                aria-label={isHindi ? recording ? "रिकॉर्डिंग रोकें" : "वॉइस रिकॉर्ड करें" : recording ? "Stop recording" : "Record voice"}
              >
                {recording ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("assistance.placeholder")}
                className="input-field flex-1"
                disabled={loading || recording}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || recording}
                className="btn-primary shrink-0 px-5"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

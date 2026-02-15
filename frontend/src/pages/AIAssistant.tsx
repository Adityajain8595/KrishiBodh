import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { chatApi } from "../lib/api";

type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "I can explain irrigation, crop recommendation, and yield or pest results in plain language. Ask about your current module or how the rules work.",
    timestamp: new Date(),
  },
];

type ChatModule = "AquaFarm" | "AgriSmart" | "CropGuard";

function moduleFromPath(pathname: string): ChatModule {
  if (pathname.includes("water")) return "AquaFarm";
  if (pathname.includes("crop")) return "AgriSmart";
  if (pathname.includes("yield")) return "CropGuard";
  return "AgriSmart";
}

export const AIAssistant: React.FC = () => {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const moduleContext = moduleFromPath(location.pathname);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatApi.ask({ module: moduleContext, question: trimmed });
      const reply: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: res.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      const reply: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: "Sorry, the assistant is unavailable. Please check that the backend is running and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col animate-fade-in">
      <div className="mb-4">
        <p className="text-surface-500 text-base">
          Rule-based advice for irrigation, crop, and yield modules.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        <CardHeader
          title="Assistant"
          subtitle="Rule-based explanations for irrigation, crop, and yield"
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
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-base ${
                    msg.role === "user"
                      ? "bg-primary-600 text-white"
                      : "bg-surface-100 text-surface-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-200 text-surface-600">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-surface-100 px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                  <span className="text-sm text-surface-500">Thinking...</span>
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="border-t border-surface-200 p-4"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about irrigation, crops, yield, or pests..."
                className="input-field flex-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
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

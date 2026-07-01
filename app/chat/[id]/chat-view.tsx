"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function ChatView({
  conversationId,
  characterId,
  characterName,
  initialMessages,
}: {
  conversationId: string;
  characterId: string;
  characterName: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMessage = input.trim();
    setInput("");
    setError("");
    setStreaming(true);

    // Display user message immediately
    const tempUserMsg: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Add placeholder for assistant response
    const tempAssistantId = `temp-assistant-${Date.now()}`;
    const tempAssistantMsg: Message = {
      id: tempAssistantId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempAssistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          characterId,
          message: userMessage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to send message");
        // Remove the empty assistant placeholder
        setMessages((prev) => prev.filter((m) => m.id !== tempAssistantId));
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("No response stream");
        setStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "chunk") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempAssistantId
                    ? { ...m, content: m.content + parsed.content }
                    : m
                )
              );
            } else if (parsed.type === "done") {
              // Stream complete
            } else if (parsed.type === "error") {
              setError(parsed.message || "Stream error");
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }

    setStreaming(false);
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-3 border-b border-white/10">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[#E8E4DF]/60 hover:text-[#E8E4DF] transition-colors mr-2"
        >
          ←
        </button>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#E8E4DF]/40 text-sm">
          {characterName[0]}
        </div>
        <span className="text-[#E8E4DF] text-sm font-medium">
          {characterName}
        </span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                msg.role === "assistant"
                  ? "bg-[#AE0D46]/20 text-[#E8E4DF]"
                  : "bg-white/10 text-[#E8E4DF]"
              }`}
            >
              <p
                className="text-sm whitespace-pre-wrap"
                style={{
                  fontFamily: "var(--font-ia-writer), monospace",
                }}
              >
                {msg.content}
                {streaming && msg.id.startsWith("temp-assistant") && msg.content === "" && (
                  <span className="animate-pulse">...</span>
                )}
              </p>
              <p className="text-[9px] text-[#E8E4DF]/30 mt-1" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                {formatTime(msg.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-2 text-sm text-red-400">{error}</div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="px-6 py-4 border-t border-white/10"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={streaming}
            className="flex-1 rounded-full bg-white/5 px-5 py-3 text-sm text-[#E8E4DF] placeholder:text-[#E8E4DF]/30 outline-none focus:bg-white/10 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="rounded-full bg-[#AE0D46] px-6 py-3 text-sm text-white font-medium hover:bg-[#AE0D46]/80 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

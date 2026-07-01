"use client";

import { useRef, useState, useEffect } from "react";

// From Andrea's A20 wireframe (ember-app/src/routes/+page.svelte lines 1869-1937)
// Her bubbles: bg rgba(40,5,18,0.20), border rgba(174,13,70,0.20), radius 12/12/12/4
// His bubbles: bg rgba(11,13,16,0.30), border rgba(232,228,223,0.15), radius 12/12/4/12
// Text: iA Writer Quattro 13px line-height 1.6 opacity 0.8
// Timestamps: Inter 9px opacity 0.3
// Input: pill radius 24px, send circle 38px #AE0D46

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

    const tempUserMsg: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

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
        body: JSON.stringify({ conversationId, characterId, message: userMessage }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to send message");
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
    <div style={{ flex: 1, display: "flex", flexDirection: "column" as const }}>
      {/* Chat header — line 1872-1881 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: "1px solid rgba(232,228,223,0.08)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(232,228,223,0.08)",
          }} />
          <span style={{ fontSize: "15px", fontWeight: 500 }}>{characterName}</span>
        </div>
        <div style={{ display: "flex", gap: "16px", color: "rgba(232,228,223,0.4)", fontSize: "18px" }}>
          <span style={{ cursor: "pointer" }}>&#9743;</span>
          <span style={{ cursor: "pointer" }}>&#9776;</span>
        </div>
      </div>

      {/* Messages area — line 1884-1920 */}
      <div style={{
        flex: 1,
        padding: "24px 20px",
        overflowY: "auto" as const,
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "flex-end",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: "8px", maxWidth: "360px", width: "100%" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                maxWidth: "85%",
                marginLeft: msg.role === "user" ? "auto" : undefined,
                marginTop: "8px",
                padding: "8px 12px",
                backgroundColor: msg.role === "assistant"
                  ? "rgba(40,5,18,0.20)"
                  : "rgba(11,13,16,0.30)",
                border: msg.role === "assistant"
                  ? "1px solid rgba(174,13,70,0.20)"
                  : "1px solid rgba(232,228,223,0.15)",
                borderRadius: msg.role === "assistant"
                  ? "12px 12px 12px 4px"
                  : "12px 12px 4px 12px",
              }}
            >
              <p style={{
                fontFamily: "'iA Writer Quattro V', 'iA Writer Quattro', monospace",
                fontSize: "13px",
                lineHeight: 1.6,
                color: "#E8E4DF",
                opacity: 0.8,
                margin: 0,
                whiteSpace: "pre-wrap" as const,
              }}>
                {msg.content}
                {streaming && msg.id.startsWith("temp-assistant") && msg.content === "" && "..."}
              </p>
              {msg.content && (
                <p style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "9px",
                  color: "#E8E4DF",
                  opacity: 0.3,
                  marginTop: "4px",
                  textAlign: "right" as const,
                  margin: "4px 0 0 0",
                }}>{formatTime(msg.created_at)}</p>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "0 20px 8px", fontSize: "12px", color: "#ef4444" }}>{error}</div>
      )}

      {/* Input area — line 1923-1930 (without "Show me the scene" per Boss) */}
      <form
        onSubmit={handleSend}
        style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(232,228,223,0.08)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
        }}
      >
        <div style={{ maxWidth: "360px", width: "100%", display: "flex", alignItems: "center", gap: "12px" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message..."
            disabled={streaming}
            style={{
              flex: 1,
              background: "rgba(232,228,223,0.06)",
              borderRadius: "24px",
              padding: "12px 18px",
              fontSize: "13px",
              color: "#E8E4DF",
              border: "none",
              outline: "none",
              opacity: streaming ? 0.5 : 1,
            }}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "#AE0D46",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: streaming || !input.trim() ? "default" : "pointer",
              flexShrink: 0,
              border: "none",
              opacity: streaming || !input.trim() ? 0.5 : 1,
            }}
          >
            <span style={{ color: "#E8E4DF", fontSize: "16px" }}>&#10148;</span>
          </button>
        </div>
      </form>
    </div>
  );
}

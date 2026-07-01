"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Character {
  id: string;
  name: string;
}

interface Conversation {
  id: string;
  character_id: string;
}

// From Andrea's A19 wireframe (ember-app/src/routes/+page.svelte lines 2006-2025)
// Filter pill widths from line 2008
const pillWidths = [48, 72, 80, 64, 76, 68, 84, 72];

export default function CharacterGrid({
  characters,
  conversations,
}: {
  characters: Character[];
  conversations: Conversation[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleCardClick(character: Character) {
    setLoadingId(character.id);

    const existing = conversations.find(
      (c) => c.character_id === character.id
    );

    if (existing) {
      router.push(`/chat/${existing.id}`);
      return;
    }

    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId: character.id }),
    });

    if (!res.ok) {
      setLoadingId(null);
      return;
    }

    const { conversationId } = await res.json();
    router.push(`/chat/${conversationId}`);
  }

  return (
    <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>
      {/* Filter bar — line 2007-2011 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" as const }}>
        {pillWidths.map((w, i) => (
          <div
            key={i}
            style={{
              width: `${w}px`,
              height: "34px",
              border: i === 0 ? "1px solid #AE0D46" : "1px solid rgba(232,228,223,0.15)",
              borderRadius: "20px",
              background: i === 0 ? "rgba(174,13,70,0.15)" : "transparent",
            }}
          />
        ))}
      </div>

      {/* Card grid — line 2014-2024 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
        {characters.map((character) => (
          <div
            key={character.id}
            onClick={() => !loadingId && handleCardClick(character)}
            style={{
              background: "rgba(232,228,223,0.04)",
              borderRadius: "12px",
              overflow: "hidden",
              cursor: loadingId === character.id ? "wait" : "pointer",
              transition: "background 0.2s",
              opacity: loadingId === character.id ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!loadingId) e.currentTarget.style.background = "rgba(232,228,223,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(232,228,223,0.04)"; }}
          >
            <div style={{ aspectRatio: "3/4", background: "rgba(232,228,223,0.03)" }} />
            <div style={{ padding: "12px 14px" }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "16px",
                fontWeight: 500,
                color: "#E8E4DF",
              }}>
                {character.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

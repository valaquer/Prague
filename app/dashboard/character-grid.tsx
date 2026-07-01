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

    // Check for existing conversation with this character
    const existing = conversations.find(
      (c) => c.character_id === character.id
    );

    if (existing) {
      router.push(`/chat/${existing.id}`);
      return;
    }

    // Create new conversation
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

  // Filter pills — empty, varying widths (from Andrea's wireframe)
  const pillWidths = [48, 72, 80, 64, 76, 68, 84, 72];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      {/* Filter pills */}
      <div className="flex gap-2 mb-7 flex-wrap">
        {pillWidths.map((w, i) => (
          <div
            key={i}
            className="h-[34px] rounded-full"
            style={{
              width: `${w}px`,
              border: i === 0
                ? "1px solid #AE0D46"
                : "1px solid rgba(232,228,223,0.15)",
              background: i === 0 ? "rgba(174,13,70,0.15)" : "transparent",
            }}
          />
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-4 gap-5">
        {characters.map((character) => (
          <button
            key={character.id}
            onClick={() => handleCardClick(character)}
            disabled={loadingId === character.id}
            className="text-left rounded-xl overflow-hidden transition-colors disabled:opacity-50"
            style={{ background: "rgba(232,228,223,0.04)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232,228,223,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(232,228,223,0.04)")}
          >
            <div
              className="aspect-[3/4]"
              style={{ background: "rgba(232,228,223,0.03)" }}
            />
            <div className="px-3.5 py-3">
              <span
                className="text-[#E8E4DF] text-base font-medium"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {character.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

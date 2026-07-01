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

  // Filter pills (non-functional)
  const pills = ["All", "Popular", "New", "Romantic", "Fun", "Fantasy", "Caring", "Bold"];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Filter pills */}
      <div className="flex gap-2 mb-6">
        {pills.map((pill, i) => (
          <button
            key={pill}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              i === 0
                ? "bg-[#AE0D46] text-white"
                : "bg-white/5 text-[#E8E4DF]/60 hover:bg-white/10"
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-4 gap-5">
        {characters.map((character) => (
          <button
            key={character.id}
            onClick={() => handleCardClick(character)}
            disabled={loadingId === character.id}
            className="group text-left transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {/* 3:4 placeholder */}
            <div className="aspect-[3/4] rounded-xl bg-white/5 mb-2 overflow-hidden group-hover:bg-white/10 transition-colors flex items-center justify-center">
              {loadingId === character.id ? (
                <span className="text-[#E8E4DF]/40 text-sm">Opening...</span>
              ) : (
                <span className="text-[#E8E4DF]/20 text-4xl">
                  {character.name[0]}
                </span>
              )}
            </div>
            <p
              className="text-[#E8E4DF] text-sm"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {character.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

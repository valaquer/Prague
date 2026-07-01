"use client";

import { useRouter } from "next/navigation";

interface ConversationItem {
  id: string;
  character_id: string;
  updated_at: string;
  characters: { name: string }[] | { name: string } | null;
}

function getCharacterName(conv: ConversationItem): string {
  if (!conv.characters) return "Unknown";
  if (Array.isArray(conv.characters)) return conv.characters[0]?.name || "Unknown";
  return conv.characters.name;
}

export default function ChatList({
  conversations,
  activeConversationId,
}: {
  conversations: ConversationItem[];
  activeConversationId: string;
}) {
  const router = useRouter();

  return (
    <aside className="w-[260px] shrink-0 flex flex-col border-r border-white/10">
      {/* Search bar (non-functional) */}
      <div className="p-3 border-b border-white/10">
        <input
          type="text"
          placeholder="Search..."
          disabled
          className="w-full rounded-full bg-white/5 px-4 py-2 text-sm text-[#E8E4DF]/60 placeholder:text-[#E8E4DF]/30 outline-none"
        />
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => router.push(`/chat/${conv.id}`)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${
              conv.id === activeConversationId ? "bg-white/10" : ""
            }`}
          >
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-[#E8E4DF]/40 text-sm">
              {getCharacterName(conv)?.[0] || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#E8E4DF] truncate">
                {getCharacterName(conv)}
              </p>
              <p className="text-xs text-[#E8E4DF]/40 truncate">
                Tap to continue...
              </p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

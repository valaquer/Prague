"use client";

import { useRouter } from "next/navigation";

// From Andrea's A20 wireframe (ember-app/src/routes/+page.svelte lines 1844-1867)

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
    <div style={{
      width: "260px",
      minWidth: "260px",
      borderRight: "1px solid rgba(232,228,223,0.08)",
      display: "flex",
      flexDirection: "column" as const,
    }}>
      {/* Header + search — line 1846-1849 */}
      <div style={{ padding: "20px 16px 12px" }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "22px",
          fontWeight: 500,
          margin: "0 0 12px",
        }}>Chat</h2>
        <div style={{
          background: "rgba(232,228,223,0.06)",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12px",
          color: "rgba(232,228,223,0.4)",
        }}>Search for a profile...</div>
      </div>

      {/* Conversation list — line 1850-1866 */}
      <div style={{ flex: 1, overflowY: "auto" as const, padding: "0 8px" }}>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => router.push(`/chat/${conv.id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 8px",
              borderRadius: "8px",
              background: conv.id === activeConversationId ? "rgba(232,228,223,0.06)" : "transparent",
              cursor: "pointer",
              marginBottom: "2px",
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(232,228,223,0.08)",
              flexShrink: 0,
            }} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#E8E4DF" }}>
                {getCharacterName(conv)}
              </div>
              <div style={{
                fontSize: "11px",
                color: "rgba(232,228,223,0.4)",
                whiteSpace: "nowrap" as const,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>Tap to continue...</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

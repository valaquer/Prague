import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatView from "./chat-view";
import ChatList from "./chat-list";
import ProfilePanel from "./profile-panel";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, character_id")
    .eq("id", id)
    .single();

  if (!conversation) {
    redirect("/dashboard");
  }

  const [{ data: character }, { data: messages }, { data: allConversations }] =
    await Promise.all([
      supabase
        .from("characters")
        .select("id, name")
        .eq("id", conversation.character_id)
        .single(),
      supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("conversations")
        .select("id, character_id, updated_at, characters(name)")
        .order("updated_at", { ascending: false }),
    ]);

  return (
    <div style={{
      background: "#0B0D10",
      height: "100vh",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#E8E4DF",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Top bar — from A20 line 1833-1839, adapted for authenticated view */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(232,228,223,0.08)",
        flexShrink: 0,
      }}>
        <a href="/dashboard">
          <img src="/provoque-wordmark-000337.svg" alt="provoque.ai" style={{ height: "28px", width: "auto" }} />
        </a>
      </div>

      {/* 3-column layout — from A20 line 1842 */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <ChatList
          conversations={allConversations || []}
          activeConversationId={id}
        />
        <ChatView
          conversationId={id}
          characterId={conversation.character_id}
          characterName={character?.name || "Unknown"}
          initialMessages={messages || []}
        />
        <ProfilePanel characterName={character?.name || "Unknown"} />
      </div>
    </div>
  );
}

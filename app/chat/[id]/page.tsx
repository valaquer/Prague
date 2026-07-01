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

  // Load conversation (RLS ensures ownership)
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, character_id")
    .eq("id", id)
    .single();

  if (!conversation) {
    redirect("/dashboard");
  }

  // Load character, messages, and all user conversations in parallel
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
    <div className="flex h-screen overflow-hidden">
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
  );
}

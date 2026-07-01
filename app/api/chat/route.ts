import { createClient } from "@/lib/supabase/server";
import { streamChatResponse, type ChatMessage } from "@/lib/chat/engine";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { conversationId, characterId, message } = body;

  if (!conversationId || !characterId || !message) {
    return new Response(JSON.stringify({ error: "conversationId, characterId, and message are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify user owns the conversation (RLS filters, empty = no access)
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, character_id")
    .eq("id", conversationId)
    .single();

  if (!conversation) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify characterId matches the conversation's character
  if (conversation.character_id !== characterId) {
    return new Response(JSON.stringify({ error: "characterId mismatch" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Save user message before calling engine
  const { error: insertError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      content: message,
    });

  if (insertError) {
    return new Response(JSON.stringify({ error: "Failed to save message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Load full conversation history (no truncation)
  const { data: messages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const chatMessages: ChatMessage[] = (messages || []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Stream the response
  let assistantContent = "";

  const encoder = new TextEncoder();
  const engineStream = streamChatResponse({ messages: chatMessages, characterId });
  const reader = engineStream.getReader();

  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          assistantContent += value;
          const event = `data: ${JSON.stringify({ type: "chunk", content: value })}\n\n`;
          controller.enqueue(encoder.encode(event));
        }

        // Save assistant message before sending done event
        const { error: saveError } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            content: assistantContent,
          });

        if (saveError) {
          const event = `data: ${JSON.stringify({ type: "error", message: "Failed to save response" })}\n\n`;
          controller.enqueue(encoder.encode(event));
          controller.close();
          return;
        }

        // Update conversation's updated_at
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);

        // Send done event only after successful save
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        const event = `data: ${JSON.stringify({ type: "error", message: errorMessage })}\n\n`;
        controller.enqueue(encoder.encode(event));
        controller.close();
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

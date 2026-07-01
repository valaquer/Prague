import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { characterId } = body;

  if (!characterId) {
    return NextResponse.json({ error: "characterId is required" }, { status: 400 });
  }

  // Verify character exists
  const { data: character } = await supabase
    .from("characters")
    .select("id")
    .eq("id", characterId)
    .single();

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 400 });
  }

  // Create conversation
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      character_id: characterId,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }

  return NextResponse.json({ conversationId: conversation.id });
}

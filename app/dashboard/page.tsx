import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";
import Sidebar from "./sidebar";
import CharacterGrid from "./character-grid";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Load characters and user's existing conversations
  const [{ data: characters }, { data: conversations }] = await Promise.all([
    supabase.from("characters").select("id, name").order("name"),
    supabase
      .from("conversations")
      .select("id, character_id")
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DF]/[0.08]">
          <img src="/provoque-wordmark-000337.svg" alt="provoque.ai" style={{ height: "28px", width: "auto" }} />
          <LogoutButton />
        </header>
        <CharacterGrid
          characters={characters || []}
          conversations={conversations || []}
        />
      </div>
    </div>
  );
}

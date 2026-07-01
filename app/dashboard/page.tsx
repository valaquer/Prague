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
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/10">
          <span
            className="text-lg tracking-wide text-[#E8E4DF]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            provoque.ai
          </span>
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

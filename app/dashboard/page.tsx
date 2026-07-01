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

  const [{ data: characters }, { data: conversations }] = await Promise.all([
    supabase.from("characters").select("id, name").order("name"),
    supabase
      .from("conversations")
      .select("id, character_id")
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <div style={{ background: "#0B0D10", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: "#E8E4DF" }}>
      {/* Top bar — from A19 line 1979-1987, adapted for authenticated view */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(232,228,223,0.08)",
      }}>
        <img src="/provoque-wordmark-000337.svg" alt="provoque.ai" style={{ height: "28px", width: "auto" }} />
        <LogoutButton />
      </div>

      <div style={{ display: "flex" }}>
        <Sidebar />
        <CharacterGrid
          characters={characters || []}
          conversations={conversations || []}
        />
      </div>
    </div>
  );
}

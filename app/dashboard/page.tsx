"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <div className="flex justify-end p-4">
        <button
          onClick={handleLogout}
          className="rounded bg-foreground text-background px-4 py-2 font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

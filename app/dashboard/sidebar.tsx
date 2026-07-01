"use client";

const navItems = [
  { label: "Home", icon: "🏠" },
  { label: "Discover", icon: "🔍" },
  { label: "Chat", icon: "💬" },
  { label: "Collection", icon: "📁" },
  { label: "Create Character", icon: "✨" },
  { label: "My AI", icon: "🤖" },
];

export default function Sidebar() {
  return (
    <aside className="w-[200px] shrink-0 flex flex-col border-r border-white/10 px-3 py-4">
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#E8E4DF]/70 hover:bg-white/5 hover:text-[#E8E4DF] transition-colors text-left"
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#AE0D46] hover:bg-[#AE0D46]/10 transition-colors text-left">
        <span className="text-base">⭐</span>
        Premium
      </button>
    </aside>
  );
}

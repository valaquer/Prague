"use client";

const navItems = ["Home", "Discover", "Chat", "Collection", "Create Character", "My AI"];

export default function Sidebar() {
  return (
    <aside className="w-[200px] min-w-[200px] flex flex-col border-r border-[#E8E4DF]/[0.08] px-4 py-5 gap-1">
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <div
            key={item}
            className="text-[13px] px-3 py-2.5 rounded-lg cursor-pointer"
            style={{
              color: item === "Home" ? "#E8E4DF" : "rgba(232,228,223,0.5)",
              background: item === "Home" ? "rgba(232,228,223,0.06)" : "transparent",
            }}
          >
            {item}
          </div>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-[#E8E4DF]/[0.06]">
        <div className="text-[13px] text-[#AE0D46] px-3 py-2.5 cursor-pointer">
          Premium
        </div>
      </div>
    </aside>
  );
}

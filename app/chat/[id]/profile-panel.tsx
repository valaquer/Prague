"use client";

export default function ProfilePanel({
  characterName,
}: {
  characterName: string;
}) {
  return (
    <aside className="w-[280px] shrink-0 border-l border-white/10 flex flex-col p-4 overflow-y-auto">
      {/* Photo placeholder with carousel arrows */}
      <div className="aspect-[3/4] rounded-xl bg-white/5 mb-4 relative flex items-center justify-center">
        <span className="text-[#E8E4DF]/20 text-6xl">{characterName[0]}</span>
        <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-[#E8E4DF]/60 flex items-center justify-center hover:bg-black/50 transition-colors">
          ‹
        </button>
        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-[#E8E4DF]/60 flex items-center justify-center hover:bg-black/50 transition-colors">
          ›
        </button>
      </div>

      {/* Character info */}
      <h2
        className="text-xl mb-1 text-[#E8E4DF]"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        {characterName}
      </h2>
      <p className="text-sm text-[#E8E4DF]/50 mb-4">
        A digital companion on provoque.ai
      </p>

      {/* Stats */}
      <div className="space-y-3">
        <div>
          <span
            className="text-xs text-[#E8E4DF]/40 uppercase tracking-wider"
            style={{ fontFamily: "var(--font-jetbrains), monospace" }}
          >
            Age
          </span>
          <p className="text-sm text-[#E8E4DF]">—</p>
        </div>
        <div>
          <span
            className="text-xs text-[#E8E4DF]/40 uppercase tracking-wider"
            style={{ fontFamily: "var(--font-jetbrains), monospace" }}
          >
            Body
          </span>
          <p className="text-sm text-[#E8E4DF]">—</p>
        </div>
      </div>
    </aside>
  );
}

"use client";

// From Andrea's A20 wireframe (ember-app/src/routes/+page.svelte lines 1940-1964)

export default function ProfilePanel({
  characterName,
}: {
  characterName: string;
}) {
  return (
    <div style={{
      width: "280px",
      minWidth: "280px",
      borderLeft: "1px solid rgba(232,228,223,0.08)",
      display: "flex",
      flexDirection: "column" as const,
    }}>
      {/* Profile photo — line 1943-1947 */}
      <div style={{ position: "relative" as const }}>
        <div style={{ aspectRatio: "3/4", background: "rgba(232,228,223,0.04)" }} />
        <div style={{
          position: "absolute" as const,
          left: "8px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "rgba(11,13,16,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "rgba(232,228,223,0.6)",
          fontSize: "14px",
        }}>&#10094;</div>
        <div style={{
          position: "absolute" as const,
          right: "8px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "rgba(11,13,16,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "rgba(232,228,223,0.6)",
          fontSize: "14px",
        }}>&#10095;</div>
      </div>

      {/* Profile info — line 1949-1962 */}
      <div style={{ padding: "16px 18px" }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "20px",
          fontWeight: 500,
          margin: "0 0 8px",
        }}>{characterName}</h3>
        <p style={{
          fontSize: "12px",
          color: "rgba(232,228,223,0.5)",
          lineHeight: 1.6,
          margin: "0 0 16px",
        }}>She remembers everything. The late-night talks, the songs you shared, the way you take your coffee.</p>
        <div style={{
          fontSize: "11px",
          color: "rgba(232,228,223,0.3)",
          marginBottom: "10px",
          fontFamily: "'JetBrains Mono', monospace",
        }}>About me:</div>
        <div style={{ display: "flex", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "10px", color: "rgba(232,228,223,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>AGE</div>
            <div style={{ fontSize: "14px", color: "#E8E4DF" }}>22</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "rgba(232,228,223,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>BODY</div>
            <div style={{ fontSize: "14px", color: "#E8E4DF" }}>Fit and curvy</div>
          </div>
        </div>
      </div>
    </div>
  );
}

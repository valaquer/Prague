"use client";

// From Andrea's A19 wireframe (ember-app/src/routes/+page.svelte lines 1992-2000)
const navItems = ["Home", "Discover", "Chat", "Collection", "Create Character", "My AI"];

export default function Sidebar() {
  return (
    <div style={{
      width: "200px",
      minWidth: "200px",
      borderRight: "1px solid rgba(232,228,223,0.08)",
      padding: "20px 16px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "4px",
    }}>
      {navItems.map((item) => (
        <div
          key={item}
          style={{
            fontSize: "13px",
            color: item === "Home" ? "#E8E4DF" : "rgba(232,228,223,0.5)",
            padding: "10px 12px",
            borderRadius: "8px",
            background: item === "Home" ? "rgba(232,228,223,0.06)" : "transparent",
            cursor: "pointer",
          }}
        >
          {item}
        </div>
      ))}
      <div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid rgba(232,228,223,0.06)" }}>
        <div style={{ fontSize: "13px", color: "#AE0D46", padding: "10px 12px", cursor: "pointer" }}>
          Premium
        </div>
      </div>
    </div>
  );
}

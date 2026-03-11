export default function TopBar({ semester }) {
  return (
    <div className="glass-card" style={{
      margin: "16px 16px 0",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
    }}>
      <div>
        <h2 style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "#fff",
          margin: "0 0 4px",
          fontFamily: "'Playfair Display', serif",
        }}>
          My Timetable
        </h2>
        <p style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.4)",
          margin: 0,
        }}>
          {semester.name} • {semester.period}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          background: "rgba(34,197,94,0.15)",
          color: "#22c55e",
          fontSize: "11px",
          fontWeight: "600",
          padding: "6px 12px",
          borderRadius: "20px",
          border: "1px solid rgba(34,197,94,0.2)",
        }}>
          {semester.status.text}
        </div>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.6)",
          cursor: "pointer",
        }}>
          🔍 Search classes, rooms...
        </div>
      </div>
    </div>
  )
}

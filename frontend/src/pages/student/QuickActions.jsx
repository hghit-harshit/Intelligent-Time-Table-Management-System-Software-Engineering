export default function QuickActions({ quickActions, handleQuickAction }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "16px",
    }}>
      <h4 style={{
        fontSize: "13px",
        fontWeight: "700",
        color: "#fff",
        marginBottom: "12px",
        margin: "0 0 12px",
      }}>
        Quick Actions
      </h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {quickActions.map((action, i) => (
          <button key={i} onClick={() => handleQuickAction(action)} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "12px 8px",
            color: "rgba(255,255,255,0.8)",
            fontSize: "11px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.2s ease",
          }} onMouseEnter={(e) => {
            e.target.style.background = "rgba(96,239,255,0.1)";
            e.target.style.borderColor = "rgba(96,239,255,0.2)";
            e.target.style.transform = "translateY(-2px)";
          }} onMouseLeave={(e) => {
            e.target.style.background = "rgba(255,255,255,0.05)";
            e.target.style.borderColor = "rgba(255,255,255,0.1)";
            e.target.style.transform = "translateY(0px)";
          }}>
            <span style={{ fontSize: "16px" }}>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

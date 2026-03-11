export default function StatsCards({ stats }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "14px",
      marginBottom: "20px",
    }}>
      {stats.map((stat, i) => (
        <div key={i} style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "20px",
          textAlign: "center",
          cursor: stat.onClick ? "pointer" : "default",
          transition: "all 0.25s ease",
        }}
        onClick={stat.onClick ? () => window.location.href = stat.onClick : undefined}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)"
          e.target.style.boxShadow = "0 12px 32px rgba(0,0,0,0.4)"
          if (stat.onClick) {
            e.target.style.borderColor = "rgba(96,239,255,0.2)"
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0px)"
          e.target.style.boxShadow = "none"
          e.target.style.borderColor = "rgba(255,255,255,0.08)"
        }}>
          <div style={{
            fontSize: "24px",
            marginBottom: "12px",
            filter: `drop-shadow(0 0 8px ${stat.color}30)`,
          }}>
            {stat.icon}
          </div>
          <div style={{
            fontSize: "28px",
            fontWeight: "700",
            color: stat.color,
            marginBottom: "4px",
            fontFamily: "'Space Mono', monospace",
          }}>
            {stat.num}
          </div>
          <div style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.6)",
            marginBottom: stat.sub ? "4px" : 0,
          }}>
            {stat.label}
          </div>
          {stat.sub && (
            <div style={{
              fontSize: "11px",
              fontWeight: "600",
              color: stat.color,
            }}>
              {stat.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

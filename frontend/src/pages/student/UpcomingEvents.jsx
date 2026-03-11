export default function UpcomingEvents({ upcomingEvents }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "16px",
      flex: 1,
    }}>
      <h4 style={{
        fontSize: "13px",
        fontWeight: "700",
        color: "#fff",
        marginBottom: "12px",
        margin: "0 0 12px",
      }}>
        Upcoming This Week
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {upcomingEvents.map((event, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${event.color}20`,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }} onMouseEnter={(e) => {
            e.target.style.background = `${event.color}10`;
            e.target.style.borderColor = `${event.color}40`;
          }} onMouseLeave={(e) => {
            e.target.style.background = "rgba(255,255,255,0.02)";
            e.target.style.borderColor = `${event.color}20`;
          }}>
            <div style={{
              width: "8px", height: "8px",
              borderRadius: "50%",
              background: event.color,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#fff" }}>
                {event.title}
              </div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                {event.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

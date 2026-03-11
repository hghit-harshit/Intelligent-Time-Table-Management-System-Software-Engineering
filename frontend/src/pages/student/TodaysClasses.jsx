export default function TodaysClasses({ todaysClasses, currentDate, handleTimeSlotClick, setSelectedView }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <h3 style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#fff",
          margin: 0,
        }}>
          Today's Classes — {currentDate.dayName}, Feb {currentDate.day}
        </h3>
        <button
          onClick={() => setSelectedView('day')}
          style={{
            marginLeft: "auto",
            color: "#60efff",
            fontSize: "12px",
            fontWeight: "500",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => e.target.style.color = "#a78bfa"}
          onMouseLeave={(e) => e.target.style.color = "#60efff"}
        >
          View full day →
        </button>
      </div>

      {todaysClasses.map((class_, i) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 20px",
          borderBottom: i < todaysClasses.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
          gap: "16px",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.02)"}
        onMouseLeave={(e) => e.target.style.background = "transparent"}
        onClick={() => handleTimeSlotClick({ name: class_.subject, time: class_.time })}
        >
          <div style={{ width: "70px", textAlign: "left" }}>
            <div style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#fff",
            }}>
              {class_.time}
            </div>
            <div style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.4)",
            }}>
              {class_.duration}
            </div>
          </div>
          <div style={{
            width: "10px", height: "10px",
            borderRadius: "50%",
            background: class_.dotColor,
            flexShrink: 0,
            boxShadow: class_.isLive ? `0 0 0 3px rgba(34,197,94,0.2)` : "none",
          }} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontWeight: "600",
              fontSize: "13px",
              color: "#fff",
              marginBottom: "2px",
            }}>
              {class_.subject}
            </div>
            <div style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.4)",
            }}>
              {class_.location}
            </div>
          </div>
          <div style={{
            padding: "4px 12px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "600",
            background: class_.status === 'Done' ? "rgba(34,197,94,0.15)"
                      : class_.status.includes('Live') ? "rgba(34,197,94,0.15)"
                      : "rgba(239,68,68,0.15)",
            color: class_.statusColor,
            border: `1px solid ${class_.statusColor}30`,
          }}>
            {class_.status}
          </div>
        </div>
      ))}
    </div>
  )
}

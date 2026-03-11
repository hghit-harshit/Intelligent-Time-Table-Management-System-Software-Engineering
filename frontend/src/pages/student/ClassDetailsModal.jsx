export default function ClassDetailsModal({ selectedTimeSlot, onClose }) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "rgba(15,23,42,0.95)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: "24px",
        maxWidth: "400px",
        width: "90%",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", margin: 0 }}>
            Class Details
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: "20px",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
          <p><strong>Class:</strong> {selectedTimeSlot.name}</p>
          <p><strong>Time:</strong> {selectedTimeSlot.time}</p>
          <p><strong>Day:</strong> {selectedTimeSlot.day}</p>
          {selectedTimeSlot.location && <p><strong>Location:</strong> {selectedTimeSlot.location}</p>}
          {selectedTimeSlot.professor && <p><strong>Professor:</strong> {selectedTimeSlot.professor}</p>}
        </div>
        <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
          <button style={{
            background: "#60efff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "#0a0a12",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
          }}>
            Add Note
          </button>
          <button style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "#fff",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
          }}>
            Set Reminder
          </button>
        </div>
      </div>
    </div>
  )
}

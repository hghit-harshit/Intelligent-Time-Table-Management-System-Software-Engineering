import { useState } from "react"
import Layout from "../components/Layout"
import CalendarView from "../components/CalendarView"

export default function FacultyPage() {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [rescheduleForm, setRescheduleForm] = useState({
    currentDay: "",
    currentTime: "",
    requestedDay: "",
    requestedTime: "",
    reason: "",
  })

  // Sample events — light-mode friendly colors
  const calendarEvents = [
    { day: "Monday", time: "9:00 AM", title: "Data Structures", location: "Room 301", color: "rgba(0,106,220,0.08)", textColor: "#006ADC" },
    { day: "Tuesday", time: "10:00 AM", title: "Digital Electronics", location: "Lab 2", color: "rgba(217,119,6,0.10)", textColor: "#D97706" },
    { day: "Wednesday", time: "11:00 AM", title: "Signals & Systems", location: "Room 205", color: "rgba(22,163,74,0.08)", textColor: "#16A34A" },
    { day: "Thursday", time: "2:00 PM", title: "Network Analysis", location: "Room 101", color: "rgba(37,99,235,0.08)", textColor: "#2563EB" },
    { day: "Friday", time: "9:00 AM", title: "Engineering Math", location: "Room 302", color: "rgba(107,114,128,0.08)", textColor: "#6B7280" },
  ]

  const handleSlotClick = (slot) => setSelectedSlot(slot)

  const handleRequestReschedule = () => {
    if (selectedSlot) {
      setRescheduleForm((prev) => ({ ...prev, currentDay: selectedSlot.day, currentTime: selectedSlot.time }))
      setShowRescheduleModal(true)
    } else {
      alert("Please select a time slot from the calendar first")
    }
  }

  const handleRescheduleChange = (e) => {
    const { name, value } = e.target
    setRescheduleForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitReschedule = () => {
    if (!rescheduleForm.requestedDay || !rescheduleForm.requestedTime || !rescheduleForm.reason) {
      alert("Please fill in all fields")
      return
    }
    console.log("Submitting reschedule request:", rescheduleForm)
    alert("Reschedule request submitted successfully! Pending approval.")
    setShowRescheduleModal(false)
    setRescheduleForm({ currentDay: "", currentTime: "", requestedDay: "", requestedTime: "", reason: "" })
  }

  return (
    <Layout>
      <style>{`
        .btn-primary {
          padding: 8px 16px;
          background: #006ADC;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s ease;
        }
        .btn-primary:hover {
          background: #0081F1;
        }
        .btn-secondary {
          padding: 8px 16px;
          background: #F9FAFB;
          color: #111827;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s ease;
        }
        .btn-secondary:hover {
          background: #F3F4F6;
        }
        .input-field {
          width: 100%;
          padding: 8px 12px;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          color: #111827;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.15s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: #006ADC;
        }
        .input-field::placeholder {
          color: #9CA3AF;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
        }
      `}</style>

      {/* Top Bar */}
      <div style={{
        margin: "12px 12px 0",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "8px",
      }}>
        <div>
          <h2 style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#111827",
            margin: "0 0 2px",
            fontFamily: "'Inter', sans-serif",
          }}>
            Faculty Dashboard
          </h2>
          <p style={{
            fontSize: "11px",
            color: "#9CA3AF",
            margin: 0,
          }}>
            View and manage your teaching schedule
          </p>
        </div>
        <button onClick={handleRequestReschedule} className="btn-primary">
          🔄 Request Reschedule
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "10px",
        margin: "12px",
      }}>
        {[
          { icon: "📚", label: "Total Classes", value: "12", color: "#006ADC" },
          { icon: "✅", label: "Completed", value: "8", color: "#16A34A" },
          { icon: "⏰", label: "This Week", value: "5", color: "#6B7280" },
          { icon: "📝", label: "Pending Requests", value: "1", color: "#D97706" },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: "12px",
            textAlign: "center",
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
          }}>
            <div style={{ fontSize: "18px", marginBottom: "6px" }}>{stat.icon}</div>
            <div style={{
              fontSize: "20px",
              fontWeight: "600",
              color: stat.color,
              marginBottom: "4px",
              fontFamily: "'Inter', sans-serif",
              fontVariantNumeric: "tabular-nums",
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Section */}
      <div style={{ margin: "12px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}>
          <h3 style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#111827",
            margin: 0,
            fontFamily: "'Inter', sans-serif",
          }}>
            Weekly Schedule
          </h3>
          <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
            Click on any slot to select it for rescheduling
          </div>
        </div>

        <CalendarView events={calendarEvents} onSlotClick={handleSlotClick} />

        {selectedSlot && (
          <div style={{
            marginTop: "12px",
            padding: "12px 16px",
            background: "rgba(0,106,220,0.06)",
            border: "1px solid rgba(0,106,220,0.20)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#006ADC" }} />
            <div style={{ fontSize: "13px", color: "#006ADC", fontWeight: "500" }}>
              Selected: {selectedSlot.day} at {selectedSlot.time}
            </div>
            <button onClick={handleRequestReschedule} className="btn-primary" style={{ marginLeft: "auto", padding: "6px 12px", fontSize: "12px" }}>
              Reschedule This Slot
            </button>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal-overlay" onClick={() => setShowRescheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "20px",
              fontFamily: "'Inter', sans-serif",
            }}>
              Request Reschedule
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#6B7280", marginBottom: "6px", fontWeight: "500" }}>Current Day</label>
                <input type="text" value={selectedSlot?.day || ""} readOnly className="input-field" style={{ opacity: 0.5, cursor: "not-allowed" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#6B7280", marginBottom: "6px", fontWeight: "500" }}>Current Time</label>
                <input type="text" value={selectedSlot?.time || ""} readOnly className="input-field" style={{ opacity: 0.5, cursor: "not-allowed" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#6B7280", marginBottom: "6px", fontWeight: "500" }}>Requested Day</label>
                <select name="requestedDay" value={rescheduleForm.requestedDay} onChange={handleRescheduleChange} className="input-field" style={{ cursor: "pointer" }}>
                  <option value="">Select Day</option>
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#6B7280", marginBottom: "6px", fontWeight: "500" }}>Requested Time</label>
                <input type="time" name="requestedTime" value={rescheduleForm.requestedTime} onChange={handleRescheduleChange} className="input-field" />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#6B7280", marginBottom: "6px", fontWeight: "500" }}>Reason for Rescheduling</label>
              <textarea name="reason" value={rescheduleForm.reason} onChange={handleRescheduleChange} className="input-field" rows={4} placeholder="Please provide a reason for your reschedule request..." style={{ resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowRescheduleModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSubmitReschedule} className="btn-primary" style={{ flex: 1 }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

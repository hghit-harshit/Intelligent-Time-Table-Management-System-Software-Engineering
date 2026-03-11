import { useState } from "react"
import Layout from "../components/Layout"
import CalendarView from "../components/CalendarView"
import { colors, fonts, radius, shadows } from "../styles/tokens"

export default function FacultyPage() {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [rescheduleForm, setRescheduleForm] = useState({
    currentDay: "", currentTime: "", requestedDay: "", requestedTime: "", reason: "",
  })

  const calendarEvents = [
    { day: "Monday", time: "9:00 AM", title: "Data Structures", location: "Room 301", color: colors.primary.ghost, textColor: colors.primary.main },
    { day: "Tuesday", time: "10:00 AM", title: "Digital Electronics", location: "Lab 2", color: colors.warning.ghost, textColor: colors.warning.main },
    { day: "Wednesday", time: "11:00 AM", title: "Signals & Systems", location: "Room 205", color: colors.success.ghost, textColor: colors.success.main },
    { day: "Thursday", time: "2:00 PM", title: "Network Analysis", location: "Room 101", color: colors.info.ghost, textColor: colors.info.main },
    { day: "Friday", time: "9:00 AM", title: "Engineering Math", location: "Room 302", color: colors.secondary.ghost, textColor: colors.secondary.main },
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
      alert("Please fill in all fields"); return
    }
    alert("Reschedule request submitted successfully! Pending approval.")
    setShowRescheduleModal(false)
    setRescheduleForm({ currentDay: "", currentTime: "", requestedDay: "", requestedTime: "", reason: "" })
  }

  const card = { background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.lg, boxShadow: shadows.sm }
  const cardInner = { background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`, borderRadius: radius.md }
  const heading = { fontFamily: fonts.heading, fontWeight: fonts.weight.semibold, color: colors.text.primary }
  const muted = { fontSize: fonts.size.sm, color: colors.text.secondary }
  const caption = { fontSize: fonts.size.xs, color: colors.text.muted }
  const inputField = { width: "100%", padding: "8px 12px", background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.md, color: colors.text.primary, fontSize: fonts.size.base, fontFamily: fonts.body, outline: "none" }

  return (
    <Layout>
      {/* Top Bar */}
      <div style={{ ...card, margin: "12px 12px 0", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 3, height: 20, borderRadius: "2px", background: "#7C3AED" }} />
            <h2 style={{ ...heading, fontSize: "15px", margin: 0, fontWeight: 700 }}>Faculty Dashboard</h2>
          </div>
          <p style={{ ...caption, margin: "4px 0 0 11px" }}>Teaching schedule & availability</p>
        </div>
        <button onClick={handleRequestReschedule} style={{ padding: "8px 16px", background: colors.primary.main, color: "#fff", border: "none", borderRadius: radius.md, fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body }}>
          Request Reschedule
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", margin: "12px" }}>
        {[
          { label: "Total Classes", value: "12", color: colors.primary.main },
          { label: "Completed", value: "8", color: colors.success.main },
          { label: "This Week", value: "5", color: colors.secondary.main },
          { label: "Pending Requests", value: "1", color: colors.warning.main },
        ].map((stat, i) => (
          <div key={i} style={{ ...card, padding: "14px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, color: stat.color, marginBottom: "4px", fontFamily: fonts.heading, fontVariantNumeric: "tabular-nums" }}>{stat.value}</div>
            <div style={{ ...muted, fontSize: fonts.size.xs }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{ margin: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <h3 style={{ ...heading, fontSize: fonts.size.base, margin: 0 }}>Weekly Schedule</h3>
          <div style={caption}>Click on any slot to select it for rescheduling</div>
        </div>

        <CalendarView events={calendarEvents} onSlotClick={handleSlotClick} />

        {selectedSlot && (
          <div style={{ marginTop: "12px", padding: "12px 16px", background: colors.primary.ghost, border: `1px solid ${colors.primary.border}`, borderRadius: radius.md, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors.primary.main }} />
            <div style={{ fontSize: fonts.size.base, color: colors.primary.main, fontWeight: 500 }}>Selected: {selectedSlot.day} at {selectedSlot.time}</div>
            <button onClick={handleRequestReschedule} style={{ marginLeft: "auto", padding: "6px 12px", fontSize: fonts.size.xs, background: colors.primary.main, color: "#fff", border: "none", borderRadius: radius.sm, cursor: "pointer", fontFamily: fonts.body }}>Reschedule This Slot</button>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowRescheduleModal(false)}>
          <div style={{ background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.xl, padding: "24px", width: "90%", maxWidth: "500px", boxShadow: shadows.xl }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ ...heading, fontSize: fonts.size.lg, marginBottom: "20px" }}>Request Reschedule</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", ...caption, marginBottom: "6px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Current Day</label>
                <input type="text" value={selectedSlot?.day || ""} readOnly style={{ ...inputField, opacity: 0.5, cursor: "not-allowed" }} />
              </div>
              <div>
                <label style={{ display: "block", ...caption, marginBottom: "6px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Current Time</label>
                <input type="text" value={selectedSlot?.time || ""} readOnly style={{ ...inputField, opacity: 0.5, cursor: "not-allowed" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", ...caption, marginBottom: "6px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Requested Day</label>
                <select name="requestedDay" value={rescheduleForm.requestedDay} onChange={handleRescheduleChange} style={{ ...inputField, cursor: "pointer" }}>
                  <option value="">Select Day</option>
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", ...caption, marginBottom: "6px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Requested Time</label>
                <input type="time" name="requestedTime" value={rescheduleForm.requestedTime} onChange={handleRescheduleChange} style={inputField} />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", ...caption, marginBottom: "6px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Reason for Rescheduling</label>
              <textarea name="reason" value={rescheduleForm.reason} onChange={handleRescheduleChange} rows={4} placeholder="Please provide a reason..." style={{ ...inputField, resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowRescheduleModal(false)} style={{ flex: 1, padding: "8px 16px", background: colors.bg.raised, color: colors.text.primary, border: `1px solid ${colors.border.medium}`, borderRadius: radius.md, fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body }}>Cancel</button>
              <button onClick={handleSubmitReschedule} style={{ flex: 1, padding: "8px 16px", background: colors.primary.main, color: "#fff", border: "none", borderRadius: radius.md, fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

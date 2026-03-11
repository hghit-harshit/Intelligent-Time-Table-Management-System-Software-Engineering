import { useState, useEffect } from "react"
import { colors, fonts, radius, shadows } from "../../../styles/tokens"
import { getRequests, addRequest } from "../../../data/rescheduleStore"
import {
  RotateCcw,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  ChevronDown,
} from "lucide-react"

const FACULTY_NAME = "Dr. Rajesh M."

const statusConfig = {
  pending:  { label: "Pending",  color: colors.warning.main, bg: colors.warning.ghost, border: colors.warning.border, icon: Clock },
  approved: { label: "Approved", color: colors.success.main, bg: colors.success.ghost, border: colors.success.border, icon: CheckCircle2 },
  rejected: { label: "Rejected", color: colors.error.main,   bg: colors.error.ghost,   border: colors.error.border,   icon: XCircle },
}

export default function RescheduleRequests() {
  const [requests, setRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ currentDay: "", currentTime: "", requestedDay: "", requestedTime: "", reason: "" })

  const reload = () => {
    const all = getRequests()
    setRequests(all.filter((r) => r.facultyName === FACULTY_NAME))
  }

  useEffect(() => { reload() }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.currentDay || !form.currentTime || !form.requestedDay || !form.requestedTime || !form.reason.trim()) return
    addRequest({
      facultyName: FACULTY_NAME,
      facultyDept: "ECE",
      currentSlot: { day: form.currentDay, time: form.currentTime, room: "—" },
      requestedSlot: { day: form.requestedDay, time: form.requestedTime, room: "—" },
      reason: form.reason.trim(),
    })
    setForm({ currentDay: "", currentTime: "", requestedDay: "", requestedTime: "", reason: "" })
    setShowForm(false)
    reload()
  }

  const card = { background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.lg, boxShadow: shadows.sm }
  const heading = { fontFamily: fonts.heading, fontWeight: fonts.weight.semibold, color: colors.text.primary }
  const label = { display: "block", fontSize: fonts.size.xs, color: colors.text.muted, marginBottom: "6px", fontWeight: fonts.weight.medium, textTransform: "uppercase", letterSpacing: "0.04em" }
  const inputField = { width: "100%", padding: "9px 12px", background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.md, color: colors.text.primary, fontSize: fonts.size.base, fontFamily: fonts.body, outline: "none", boxSizing: "border-box" }
  const btnPrimary = { padding: "9px 20px", background: colors.primary.main, color: "#fff", border: "none", borderRadius: radius.md, fontSize: fonts.size.sm, fontWeight: fonts.weight.medium, cursor: "pointer", fontFamily: fonts.body, display: "inline-flex", alignItems: "center", gap: "6px" }
  const btnSecondary = { padding: "9px 20px", background: colors.bg.raised, color: colors.text.primary, border: `1px solid ${colors.border.medium}`, borderRadius: radius.md, fontSize: fonts.size.sm, fontWeight: fonts.weight.medium, cursor: "pointer", fontFamily: fonts.body }

  return (
    <>
      {/* Header */}
      <div style={{ ...card, marginBottom: "12px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 36, height: 36, borderRadius: radius.md, background: colors.primary.ghost, border: `1px solid ${colors.primary.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RotateCcw size={18} color={colors.primary.main} />
          </div>
          <div>
            <h2 style={{ ...heading, fontSize: "15px", margin: 0, fontWeight: 700 }}>My Reschedule Requests</h2>
            <p style={{ fontSize: fonts.size.xs, color: colors.text.muted, margin: "2px 0 0" }}>Submit and track your class reschedule requests</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>
          {showForm ? <ChevronDown size={14} /> : <Plus size={14} />}
          {showForm ? "Close" : "New Request"}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ ...card, marginBottom: "12px", padding: "20px" }}>
          <h3 style={{ ...heading, fontSize: fonts.size.base, marginBottom: "16px" }}>New Reschedule Request</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={label}>Current Day</label>
              <select name="currentDay" value={form.currentDay} onChange={handleChange} style={{ ...inputField, cursor: "pointer" }}>
                <option value="">Select day</option>
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Current Time</label>
              <input type="time" name="currentTime" value={form.currentTime} onChange={handleChange} style={inputField} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={label}>Requested Day</label>
              <select name="requestedDay" value={form.requestedDay} onChange={handleChange} style={{ ...inputField, cursor: "pointer" }}>
                <option value="">Select day</option>
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Requested Time</label>
              <input type="time" name="requestedTime" value={form.requestedTime} onChange={handleChange} style={inputField} />
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={label}>Reason</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} rows={3} placeholder="Briefly explain why you need to reschedule…" style={{ ...inputField, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
            <button type="submit" style={btnPrimary}><Send size={14} /> Submit Request</button>
          </div>
        </form>
      )}

      {/* Request list */}
      <div style={{ ...card, padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h3 style={{ ...heading, fontSize: fonts.size.base, margin: 0 }}>Request History</h3>
          <span style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{requests.length} total</span>
        </div>

        {requests.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: colors.text.muted }}>
            <RotateCcw size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
            <p style={{ fontSize: fonts.size.sm, margin: 0 }}>No reschedule requests yet</p>
            <p style={{ fontSize: fonts.size.xs, marginTop: 4 }}>Click "New Request" to submit one</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {requests.map((req) => {
              const st = statusConfig[req.status] || statusConfig.pending
              const StatusIcon = st.icon
              return (
                <div key={req.id} style={{ ...card, padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", borderLeft: `3px solid ${st.color}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: radius.md, background: st.bg, border: `1px solid ${st.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <StatusIcon size={16} color={st.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <span style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.semibold, color: colors.text.primary }}>
                        {req.currentSlot?.day} {req.currentSlot?.time}
                      </span>
                      <span style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>→</span>
                      <span style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.semibold, color: colors.primary.main }}>
                        {req.requestedSlot?.day} {req.requestedSlot?.time}
                      </span>
                    </div>
                    <p style={{ fontSize: fonts.size.xs, color: colors.text.secondary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.reason}</p>
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: radius.full, background: st.bg, border: `1px solid ${st.border}`, fontSize: fonts.size.xs, fontWeight: fonts.weight.semibold, color: st.color, flexShrink: 0 }}>
                    {st.label}
                  </div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, flexShrink: 0, textAlign: "right", minWidth: "70px" }}>
                    {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}



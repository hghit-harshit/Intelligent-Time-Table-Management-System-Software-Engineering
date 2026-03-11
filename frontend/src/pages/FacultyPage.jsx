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

  // Sample events for the calendar
  const calendarEvents = [
    {
      day: "Monday",
      time: "9:00 AM",
      title: "Data Structures",
      location: "Room 301",
      color: "rgba(96,239,255,0.2)",
      textColor: "#60efff",
    },
    {
      day: "Tuesday",
      time: "10:00 AM",
      title: "Digital Electronics",
      location: "Lab 2",
      color: "rgba(251,146,60,0.2)",
      textColor: "#fb923c",
    },
    {
      day: "Wednesday",
      time: "11:00 AM",
      title: "Signals & Systems",
      location: "Room 205",
      color: "rgba(34,197,94,0.2)",
      textColor: "#22c55e",
    },
    {
      day: "Thursday",
      time: "2:00 PM",
      title: "Network Analysis",
      location: "Room 101",
      color: "rgba(59,130,246,0.2)",
      textColor: "#3b82f6",
    },
    {
      day: "Friday",
      time: "9:00 AM",
      title: "Engineering Math",
      location: "Room 302",
      color: "rgba(167,139,250,0.2)",
      textColor: "#a78bfa",
    },
  ]

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot)
  }

  const handleRequestReschedule = () => {
    if (selectedSlot) {
      setRescheduleForm((prev) => ({
        ...prev,
        currentDay: slot.day,
        currentTime: slot.time,
      }))
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
    setRescheduleForm({
      currentDay: "",
      currentTime: "",
      requestedDay: "",
      requestedTime: "",
      reason: "",
    })
  }

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .btn-primary {
          padding: 12px 24px;
          background: linear-gradient(135deg, #60efff, #3b82f6);
          color: #0a0a12;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(96,239,255,0.3);
        }
        .btn-secondary {
          padding: 10px 20px;
          background: rgba(255,255,255,0.1);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.15);
        }
        .input-field {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          font-family: 'Space Mono', monospace;
          transition: all 0.2s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: #60efff;
          background: rgba(255,255,255,0.08);
        }
        .input-field::placeholder {
          color: rgba(255,255,255,0.3);
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeUp 0.3s ease;
        }
        .modal-content {
          background: rgba(15,15,25,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          animation: slideIn 0.3s ease;
        }
      `}</style>

      {/* Top Bar */}
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
            Faculty Dashboard
          </h2>
          <p style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
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
        gap: "14px",
        margin: "16px",
        animation: "fadeUp 0.4s ease",
      }}>
        {[
          { icon: "📚", label: "Total Classes", value: "12", color: "#60efff" },
          { icon: "✅", label: "Completed", value: "8", color: "#22c55e" },
          { icon: "⏰", label: "This Week", value: "5", color: "#a78bfa" },
          { icon: "📝", label: "Pending Requests", value: "1", color: "#fb923c" },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card"
            style={{
              padding: "20px",
              textAlign: "center",
              animation: `fadeUp 0.4s ${i * 0.1}s ease both`,
              opacity: 0,
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>{stat.icon}</div>
            <div style={{
              fontSize: "24px",
              fontWeight: "700",
              color: stat.color,
              marginBottom: "4px",
              fontFamily: "'Space Mono', monospace",
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.6)",
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Section */}
      <div style={{
        margin: "16px",
        animation: "fadeUp 0.6s ease",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}>
          <h3 style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#fff",
            margin: 0,
            fontFamily: "'Playfair Display', serif",
          }}>
            Weekly Schedule
          </h3>
          <div style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
          }}>
            Click on any slot to select it for rescheduling
          </div>
        </div>

        <CalendarView events={calendarEvents} onSlotClick={handleSlotClick} />

        {selectedSlot && (
          <div style={{
            marginTop: "16px",
            padding: "16px",
            background: "rgba(96,239,255,0.1)",
            border: "1px solid rgba(96,239,255,0.2)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "fadeUp 0.3s ease",
          }}>
            <div style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#60efff",
            }} />
            <div style={{
              fontSize: "13px",
              color: "#60efff",
              fontWeight: "600",
            }}>
              Selected: {selectedSlot.day} at {selectedSlot.time}
            </div>
            <button
              onClick={handleRequestReschedule}
              className="btn-primary"
              style={{
                marginLeft: "auto",
                padding: "8px 16px",
                fontSize: "12px",
              }}
            >
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
              fontSize: "18px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "20px",
              fontFamily: "'Playfair Display', serif",
            }}>
              Request Reschedule
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                  Current Day
                </label>
                <input
                  type="text"
                  value={selectedSlot?.day || ""}
                  readOnly
                  className="input-field"
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                />
              </div>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                  Current Time
                </label>
                <input
                  type="text"
                  value={selectedSlot?.time || ""}
                  readOnly
                  className="input-field"
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                  Requested Day
                </label>
                <select
                  name="requestedDay"
                  value={rescheduleForm.requestedDay}
                  onChange={handleRescheduleChange}
                  className="input-field"
                  style={{ cursor: "pointer" }}
                >
                  <option value="" style={{ background: "#0a0a12" }}>Select Day</option>
                  <option value="Monday" style={{ background: "#0a0a12" }}>Monday</option>
                  <option value="Tuesday" style={{ background: "#0a0a12" }}>Tuesday</option>
                  <option value="Wednesday" style={{ background: "#0a0a12" }}>Wednesday</option>
                  <option value="Thursday" style={{ background: "#0a0a12" }}>Thursday</option>
                  <option value="Friday" style={{ background: "#0a0a12" }}>Friday</option>
                  <option value="Saturday" style={{ background: "#0a0a12" }}>Saturday</option>
                </select>
              </div>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                  Requested Time
                </label>
                <input
                  type="time"
                  name="requestedTime"
                  value={rescheduleForm.requestedTime}
                  onChange={handleRescheduleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontSize: "11px",
                color: "rgba(255,255,255,0.6)",
                marginBottom: "6px",
                fontWeight: "500",
              }}>
                Reason for Rescheduling
              </label>
              <textarea
                name="reason"
                value={rescheduleForm.reason}
                onChange={handleRescheduleChange}
                className="input-field"
                rows={4}
                placeholder="Please provide a reason for your reschedule request..."
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReschedule}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

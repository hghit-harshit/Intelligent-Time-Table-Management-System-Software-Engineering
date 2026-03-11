import { useState } from "react"
import Layout from "../../components/Layout"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function AdminPage() {
  const [timeSlots, setTimeSlots] = useState([])
  const [semesterDetails, setSemesterDetails] = useState({
    name: "",
    year: "",
    branch: "",
    section: "",
    startDate: "",
    endDate: "",
  })
  const [newSlot, setNewSlot] = useState({
    startTime: "",
    endTime: "",
    day: DAYS[0],
  })
  const [activeTab, setActiveTab] = useState("slots")

  const handleSlotChange = (e) => {
    const { name, value } = e.target
    setNewSlot((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) {
      alert("Please fill in both start and end times")
      return
    }

    setTimeSlots((prev) => [
      ...prev,
      {
        id: Date.now(),
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        day: newSlot.day,
      },
    ])

    setNewSlot({
      startTime: "",
      endTime: "",
      day: DAYS[0],
    })
  }

  const handleRemoveSlot = (id) => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== id))
  }

  const handleSemesterChange = (e) => {
    const { name, value } = e.target
    setSemesterDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveSemester = () => {
    if (!semesterDetails.name || !semesterDetails.year) {
      alert("Please fill in at least semester name and year")
      return
    }
    console.log("Saving semester details:", semesterDetails)
    alert("Semester details saved successfully!")
  }

  const handleSaveSlots = () => {
    console.log("Saving time slots:", timeSlots)
    alert("Time slots saved successfully!")
  }

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
        .btn-primary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #60efff, #3b82f6);
          color: #0a0a12;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(96,239,255,0.3);
        }
        .btn-danger {
          padding: 6px 12px;
          background: rgba(239,68,68,0.2);
          color: #ef4444;
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-danger:hover {
          background: rgba(239,68,68,0.3);
        }
        .tab-btn {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tab-btn.active {
          background: rgba(96,239,255,0.15);
          border-color: rgba(96,239,255,0.3);
          color: #60efff;
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
            Admin Dashboard
          </h2>
          <p style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}>
            Manage Time Slots & Semester Configuration
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{
        margin: "16px",
        display: "flex",
        gap: "16px",
        animation: "fadeUp 0.4s ease",
      }}>
        {/* Time Slots Panel */}
        <div className="glass-card" style={{
          flex: 1,
          padding: "24px",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
        }}>
          <h3 style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "20px",
            fontFamily: "'Playfair Display', serif",
          }}>
            Time Slots Configuration
          </h3>

          {/* Add Slot Form */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "12px",
            marginBottom: "24px",
            alignItems: "end",
          }}>
            <div>
              <label style={{
                display: "block",
                fontSize: "11px",
                color: "rgba(255,255,255,0.6)",
                marginBottom: "6px",
                fontWeight: "500",
              }}>
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={newSlot.startTime}
                onChange={handleSlotChange}
                className="input-field"
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
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={newSlot.endTime}
                onChange={handleSlotChange}
                className="input-field"
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
                Day
              </label>
              <select
                name="day"
                value={newSlot.day}
                onChange={handleSlotChange}
                className="input-field"
                style={{ cursor: "pointer" }}
              >
                {DAYS.map((day) => (
                  <option key={day} value={day} style={{ background: "#0a0a12" }}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleAddSlot} className="btn-primary">
              Add Slot
            </button>
          </div>

          {/* Slots List */}
          <div style={{
            maxHeight: "300px",
            overflowY: "auto",
          }}>
            {timeSlots.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "rgba(255,255,255,0.3)",
              }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🕐</div>
                <div>No time slots added yet</div>
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}>
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="glass-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#60efff",
                      }} />
                      <div>
                        <div style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#fff",
                        }}>
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.4)",
                        }}>
                          {slot.day}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {timeSlots.length > 0 && (
            <button
              onClick={handleSaveSlots}
              className="btn-primary"
              style={{ marginTop: "16px", width: "100%" }}
            >
              Save All Slots
            </button>
          )}
        </div>

        {/* Semester Details Panel */}
        <div className="glass-card" style={{
          flex: 1,
          padding: "24px",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
        }}>
          <h3 style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "20px",
            fontFamily: "'Playfair Display', serif",
          }}>
            Semester Configuration
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{
                display: "block",
                fontSize: "11px",
                color: "rgba(255,255,255,0.6)",
                marginBottom: "6px",
                fontWeight: "500",
              }}>
                Semester Name
              </label>
              <input
                type="text"
                name="name"
                value={semesterDetails.name}
                onChange={handleSemesterChange}
                className="input-field"
                placeholder="e.g., Spring Semester 2025"
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
                Academic Year
              </label>
              <select
                name="year"
                value={semesterDetails.year}
                onChange={handleSemesterChange}
                className="input-field"
                style={{ cursor: "pointer" }}
              >
                <option value="" style={{ background: "#0a0a12" }}>Select Year</option>
                <option value="1" style={{ background: "#0a0a12" }}>Year 1</option>
                <option value="2" style={{ background: "#0a0a12" }}>Year 2</option>
                <option value="3" style={{ background: "#0a0a12" }}>Year 3</option>
                <option value="4" style={{ background: "#0a0a12" }}>Year 4</option>
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
                Branch
              </label>
              <input
                type="text"
                name="branch"
                value={semesterDetails.branch}
                onChange={handleSemesterChange}
                className="input-field"
                placeholder="e.g., ECE, CSE, ME"
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
                Section
              </label>
              <input
                type="text"
                name="section"
                value={semesterDetails.section}
                onChange={handleSemesterChange}
                className="input-field"
                placeholder="e.g., A, B, C"
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
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={semesterDetails.startDate}
                onChange={handleSemesterChange}
                className="input-field"
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{
                display: "block",
                fontSize: "11px",
                color: "rgba(255,255,255,0.6)",
                marginBottom: "6px",
                fontWeight: "500",
              }}>
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={semesterDetails.endDate}
                onChange={handleSemesterChange}
                className="input-field"
              />
            </div>
          </div>

          <button
            onClick={handleSaveSemester}
            className="btn-primary"
            style={{ marginTop: "24px", width: "100%" }}
          >
            Save Semester Details
          </button>
        </div>
      </div>
    </Layout>
  )
}

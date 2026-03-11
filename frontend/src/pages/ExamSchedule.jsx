import { useState } from "react"
import Layout from "../components/Layout"

/* ── LIGHT-MODE STYLE HELPERS ──────────────────────────────── */
const card = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px" }
const cardInner = { background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: "6px" }
const heading = { fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#111827" }
const muted = { fontSize: "12px", color: "#6B7280" }
const caption = { fontSize: "11px", color: "#9CA3AF" }
const btn = { background: "#006ADC", border: "none", borderRadius: "6px", padding: "8px 16px", color: "#fff", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "'Inter', sans-serif" }
const btnGhost = { background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "8px 16px", color: "#111827", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "'Inter', sans-serif" }

export default function ExamSchedule() {
  const [selectedExam, setSelectedExam] = useState(null)
  const [filterSubject, setFilterSubject] = useState("all")

  const exams = [
    { id: 1, subject: "Digital Circuits", date: "Feb 27, 2025", time: "9:00 AM - 12:00 PM", duration: "3 hours", location: "Exam Hall A", room: "Row 4, Seat 12", invigilator: "Dr. Nair", syllabus: ["Boolean Algebra", "Logic Gates", "Sequential Circuits", "Combinational Circuits"], status: "upcoming", daysLeft: 8, color: "#DC2626" },
    { id: 2, subject: "Mathematics III", date: "Mar 4, 2025", time: "2:00 PM - 5:00 PM", duration: "3 hours", location: "LHC-1", room: "Row 2, Seat 8", invigilator: "Dr. Kumar", syllabus: ["Fourier Series", "Laplace Transform", "Partial Differential Equations", "Vector Calculus"], status: "upcoming", daysLeft: 13, color: "#D97706" },
    { id: 3, subject: "Data Structures & Algorithms", date: "Mar 11, 2025", time: "9:00 AM - 12:00 PM", duration: "3 hours", location: "Exam Hall B", room: "Row 6, Seat 15", invigilator: "Dr. Mehta", syllabus: ["Arrays & Linked Lists", "Stacks & Queues", "Trees & Graphs", "Searching & Sorting"], status: "upcoming", daysLeft: 20, color: "#16A34A" },
    { id: 4, subject: "Signals & Systems", date: "Feb 20, 2025", time: "9:00 AM - 12:00 PM", duration: "3 hours", location: "Exam Hall C", room: "Row 1, Seat 5", invigilator: "Dr. Patel", syllabus: ["Signal Analysis", "System Properties", "Fourier Analysis", "Z-Transform"], status: "completed", daysLeft: 0, score: "85/100", grade: "A", color: "#006ADC" }
  ]

  const upcomingExams = exams.filter(e => e.status === "upcoming")
  const completedExams = exams.filter(e => e.status === "completed")

  return (
    <Layout>
      {/* Top Bar */}
      <div style={{ ...card, margin: "12px 12px 0", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ ...heading, fontSize: "15px", margin: "0 0 2px" }}>Exam Schedule</h2>
          <p style={{ ...caption, margin: 0 }}>{upcomingExams.length} upcoming exams · Next in {Math.min(...upcomingExams.map(e => e.daysLeft))} days</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} style={{ ...cardInner, padding: "6px 12px", color: "#111827", fontSize: "12px", cursor: "pointer" }}>
            <option value="all">All Subjects</option>
            <option value="digital">Digital Circuits</option>
            <option value="math">Mathematics</option>
            <option value="data">Data Structures</option>
            <option value="signals">Signals & Systems</option>
          </select>
          <button style={btn}>📥 Download Schedule</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", margin: "12px", gap: "12px", overflow: "hidden" }}>
        {/* Main Panel */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
            {[
              { icon: "📅", num: upcomingExams.length.toString(), label: "Upcoming Exams", color: "#DC2626" },
              { icon: "✅", num: completedExams.length.toString(), label: "Completed", color: "#16A34A" },
              { icon: "⏰", num: `${Math.min(...upcomingExams.map(e => e.daysLeft))} days`, label: "Next Exam", color: "#D97706" },
              { icon: "📊", num: "85%", label: "Average Score", color: "#006ADC" },
            ].map((stat, i) => (
              <div key={i} style={{ ...card, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", marginBottom: "6px" }}>{stat.icon}</div>
                <div style={{ fontSize: "20px", fontWeight: "600", color: stat.color, marginBottom: "2px", fontVariantNumeric: "tabular-nums" }}>{stat.num}</div>
                <div style={muted}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming Exams */}
          <div style={{ ...card, marginBottom: "12px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #E5E7EB" }}>
              <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>Upcoming Exams</h3>
              <span style={{ marginLeft: "auto", background: "rgba(220,38,38,0.08)", color: "#DC2626", fontSize: "11px", fontWeight: "500", padding: "3px 10px", borderRadius: "4px" }}>{upcomingExams.length} pending</span>
            </div>
            {upcomingExams.map((exam, i) => (
              <div key={exam.id} onClick={() => setSelectedExam(exam)} style={{ padding: "10px 16px", borderBottom: i < upcomingExams.length - 1 ? "1px solid #F3F4F6" : "none", cursor: "pointer", transition: "background 0.1s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ textAlign: "center", minWidth: "50px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: exam.color, fontVariantNumeric: "tabular-nums" }}>{exam.date.split(' ')[1].replace(',', '')}</div>
                    <div style={caption}>{exam.date.split(' ')[0]}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>{exam.subject}</div>
                    <div style={{ ...muted, marginBottom: "4px" }}>📍 {exam.location} · {exam.time}</div>
                    <div style={caption}>Duration: {exam.duration} · Seat: {exam.room}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <div style={{ padding: "3px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "500", background: exam.daysLeft <= 10 ? "rgba(220,38,38,0.08)" : "rgba(217,119,6,0.08)", color: exam.daysLeft <= 10 ? "#DC2626" : "#D97706" }}>{exam.daysLeft} days</div>
                    <div style={caption}>Click for details</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Completed Exams */}
          {completedExams.length > 0 && (
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #E5E7EB" }}>
                <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>Completed Exams</h3>
                <span style={{ marginLeft: "auto", background: "rgba(22,163,74,0.08)", color: "#16A34A", fontSize: "11px", fontWeight: "500", padding: "3px 10px", borderRadius: "4px" }}>✓ Completed</span>
              </div>
              {completedExams.map((exam, i) => (
                <div key={exam.id} onClick={() => setSelectedExam(exam)} style={{ padding: "10px 16px", borderBottom: i < completedExams.length - 1 ? "1px solid #F3F4F6" : "none", cursor: "pointer", transition: "background 0.1s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#16A34A" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "2px" }}>{exam.subject}</div>
                      <div style={caption}>{exam.date} · {exam.location}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "#16A34A" }}>{exam.score}</div>
                      <div style={caption}>Grade: {exam.grade}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Study Suggestions */}
          <div style={{ ...card, padding: "12px" }}>
            <h4 style={{ ...heading, fontSize: "12px", margin: "0 0 8px" }}>Study Suggestions</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {upcomingExams.slice(0, 2).map((exam, i) => (
                <div key={i} style={{ ...cardInner, padding: "10px 12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "500", color: exam.color, marginBottom: "4px" }}>{exam.subject}</div>
                  <div style={muted}>Suggested: 2-3 hours daily</div>
                  <div style={caption}>Focus: {exam.syllabus?.[0]}, {exam.syllabus?.[1]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Preparation */}
          <div style={{ ...card, padding: "12px" }}>
            <h4 style={{ ...heading, fontSize: "12px", margin: "0 0 8px" }}>Exam Preparation</h4>
            <div style={{ display: "grid", gap: "8px" }}>
              {[
                { icon: "��", label: "Study Materials", onClick: () => alert('Opening study resources...') },
                { icon: "📝", label: "Practice Tests", onClick: () => alert('Loading practice questions...') },
                { icon: "⏰", label: "Study Timer", onClick: () => alert('Starting study timer...') },
                { icon: "📍", label: "Exam Locations", onClick: () => alert('Showing exam hall locations...') },
              ].map((action, i) => (
                <button key={i} onClick={action.onClick} style={{ ...cardInner, padding: "10px 12px", color: "#6B7280", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", textAlign: "left", transition: "background 0.1s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,106,220,0.06)"; e.currentTarget.style.color = "#006ADC" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.color = "#6B7280" }}>
                  <span style={{ fontSize: "14px" }}>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exam Tips */}
          <div style={{ ...card, padding: "12px", flex: 1 }}>
            <h4 style={{ ...heading, fontSize: "12px", margin: "0 0 8px" }}>Exam Day Tips</h4>
            <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 4px" }}>• Arrive 30 minutes early</p>
              <p style={{ margin: "0 0 4px" }}>• Bring valid ID and hall ticket</p>
              <p style={{ margin: "0 0 4px" }}>• Use only blue/black pen</p>
              <p style={{ margin: "0 0 4px" }}>• Read all questions carefully</p>
              <p style={{ margin: "0 0 4px" }}>• Manage time effectively</p>
              <p style={{ margin: 0 }}>• Stay calm and confident</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Details Modal */}
      {selectedExam && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedExam(null)}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "24px", maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ ...heading, fontSize: "16px", color: selectedExam.color, margin: 0 }}>{selectedExam.subject} Exam</h3>
              <button onClick={() => setSelectedExam(null)} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "20px", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ color: "#6B7280", lineHeight: 1.6, fontSize: "13px" }}>
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ ...heading, fontSize: "14px", marginBottom: "8px" }}>Exam Details</h4>
                <p><strong style={{ color: "#111827" }}>📅 Date:</strong> {selectedExam.date}</p>
                <p><strong style={{ color: "#111827" }}>⏰ Time:</strong> {selectedExam.time}</p>
                <p><strong style={{ color: "#111827" }}>📍 Location:</strong> {selectedExam.location}</p>
                <p><strong style={{ color: "#111827" }}>💺 Seat:</strong> {selectedExam.room}</p>
                <p><strong style={{ color: "#111827" }}>👨‍🏫 Invigilator:</strong> {selectedExam.invigilator}</p>
                <p><strong style={{ color: "#111827" }}>⏱️ Duration:</strong> {selectedExam.duration}</p>
                {selectedExam.score && <p><strong style={{ color: "#111827" }}>📊 Score:</strong> {selectedExam.score} (Grade {selectedExam.grade})</p>}
              </div>
              <div>
                <h4 style={{ ...heading, fontSize: "14px", marginBottom: "8px" }}>Syllabus Coverage</h4>
                <ul style={{ paddingLeft: "16px", margin: 0, color: "#6B7280" }}>
                  {selectedExam.syllabus?.map((topic, i) => <li key={i} style={{ marginBottom: "4px" }}>{topic}</li>)}
                </ul>
              </div>
            </div>
            {selectedExam.status === "upcoming" && (
              <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
                <button style={{ ...btn, background: selectedExam.color }}>📚 Study Plan</button>
                <button style={btnGhost}>🔔 Set Reminder</button>
                <button style={btnGhost}>📍 View Location</button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}

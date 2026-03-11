import { useState } from "react"
import { colors, fonts, radius, shadows } from "../../../styles/tokens"
/* WHY: Import shared components to replace duplicated top-bar and stats grid */
import { SubPageHeader, StatsGrid } from "../../admin/components/ui/index"

export default function ExamSchedule() {
  const [selectedExam, setSelectedExam] = useState(null)
  const [filterSubject, setFilterSubject] = useState("all")

  const card = { background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.lg, boxShadow: shadows.sm }
  const cardInner = { background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`, borderRadius: radius.md }
  const heading = { fontFamily: fonts.heading, fontWeight: fonts.weight.semibold, color: colors.text.primary }
  const muted = { fontSize: fonts.size.sm, color: colors.text.secondary }
  const caption = { fontSize: fonts.size.xs, color: colors.text.muted }
  const btn = { background: colors.primary.main, border: "none", borderRadius: radius.md, padding: "8px 16px", color: "#fff", fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body }
  const btnGhost = { background: colors.bg.raised, border: `1px solid ${colors.border.medium}`, borderRadius: radius.md, padding: "8px 16px", color: colors.text.primary, fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body }

  const exams = [
    { id: 1, subject: "Digital Circuits", date: "Feb 27, 2025", time: "9:00 AM - 12:00 PM", duration: "3 hours", location: "Exam Hall A", room: "Row 4, Seat 12", invigilator: "Dr. Nair", syllabus: ["Boolean Algebra", "Logic Gates", "Sequential Circuits", "Combinational Circuits"], status: "upcoming", daysLeft: 8, color: colors.error.main },
    { id: 2, subject: "Mathematics III", date: "Mar 4, 2025", time: "2:00 PM - 5:00 PM", duration: "3 hours", location: "LHC-1", room: "Row 2, Seat 8", invigilator: "Dr. Kumar", syllabus: ["Fourier Series", "Laplace Transform", "Partial Differential Equations", "Vector Calculus"], status: "upcoming", daysLeft: 13, color: colors.warning.main },
    { id: 3, subject: "Data Structures & Algorithms", date: "Mar 11, 2025", time: "9:00 AM - 12:00 PM", duration: "3 hours", location: "Exam Hall B", room: "Row 6, Seat 15", invigilator: "Dr. Mehta", syllabus: ["Arrays & Linked Lists", "Stacks & Queues", "Trees & Graphs", "Searching & Sorting"], status: "upcoming", daysLeft: 20, color: colors.success.main },
    { id: 4, subject: "Signals & Systems", date: "Feb 20, 2025", time: "9:00 AM - 12:00 PM", duration: "3 hours", location: "Exam Hall C", room: "Row 1, Seat 5", invigilator: "Dr. Patel", syllabus: ["Signal Analysis", "System Properties", "Fourier Analysis", "Z-Transform"], status: "completed", daysLeft: 0, score: "85/100", grade: "A", color: colors.primary.main }
  ]

  const upcomingExams = exams.filter(e => e.status === "upcoming")
  const completedExams = exams.filter(e => e.status === "completed")

  return (
    <>
      {/* WHY: Replaced duplicated accent-bar header with shared SubPageHeader */}
      <SubPageHeader
        title="Exam Schedule"
        subtitle={`${upcomingExams.length} upcoming · Next in ${Math.min(...upcomingExams.map(e => e.daysLeft))} days`}
        accentColor={colors.error.main}
        actions={<>
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} style={{ ...cardInner, padding: "6px 12px", color: colors.text.primary, fontSize: fonts.size.sm, cursor: "pointer", fontFamily: fonts.body }}>
            <option value="all">All Subjects</option>
            <option value="digital">Digital Circuits</option>
            <option value="math">Mathematics</option>
            <option value="data">Data Structures</option>
            <option value="signals">Signals & Systems</option>
          </select>
          <button style={btn}>Download Schedule</button>
        </>}
      />

      {/* Content */}
      <div style={{ flex: 1, display: "flex", margin: "12px", gap: "12px", overflow: "hidden" }}>
        {/* Main Panel */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
          {/* WHY: Replaced inline 4-column stat grid with shared StatsGrid */}
          <StatsGrid stats={[
            { num: upcomingExams.length.toString(), label: "Upcoming Exams", color: colors.error.main },
            { num: completedExams.length.toString(), label: "Completed", color: colors.success.main },
            { num: `${Math.min(...upcomingExams.map(e => e.daysLeft))} days`, label: "Next Exam", color: colors.warning.main },
            { num: "85%", label: "Average Score", color: colors.primary.main },
          ]} />

          {/* Upcoming Exams */}
          <div style={{ ...card, marginBottom: "12px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${colors.border.medium}` }}>
              <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>Upcoming Exams</h3>
              <span style={{ marginLeft: "auto", background: colors.error.ghost, color: colors.error.main, fontSize: fonts.size.xs, fontWeight: 500, padding: "3px 10px", borderRadius: radius.sm }}>{upcomingExams.length} pending</span>
            </div>
            {upcomingExams.map((exam, i) => (
              <div key={exam.id} onClick={() => setSelectedExam(exam)} style={{ padding: "10px 16px", borderBottom: i < upcomingExams.length - 1 ? `1px solid ${colors.border.subtle}` : "none", cursor: "pointer", transition: "background 0.1s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.bg.raised}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ textAlign: "center", minWidth: "50px" }}>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: exam.color, fontVariantNumeric: "tabular-nums", fontFamily: fonts.heading }}>{exam.date.split(' ')[1].replace(',', '')}</div>
                    <div style={caption}>{exam.date.split(' ')[0]}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: fonts.size.base, fontWeight: 500, color: colors.text.primary, marginBottom: "4px" }}>{exam.subject}</div>
                    <div style={{ ...muted, marginBottom: "4px" }}>{exam.location} · {exam.time}</div>
                    <div style={caption}>Duration: {exam.duration} · Seat: {exam.room}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <div style={{ padding: "3px 10px", borderRadius: radius.sm, fontSize: fonts.size.xs, fontWeight: 500, background: exam.daysLeft <= 10 ? colors.error.ghost : colors.warning.ghost, color: exam.daysLeft <= 10 ? colors.error.main : colors.warning.main }}>{exam.daysLeft} days</div>
                    <div style={caption}>Click for details</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Completed Exams */}
          {completedExams.length > 0 && (
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${colors.border.medium}` }}>
                <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>Completed Exams</h3>
                <span style={{ marginLeft: "auto", background: colors.success.ghost, color: colors.success.main, fontSize: fonts.size.xs, fontWeight: 500, padding: "3px 10px", borderRadius: radius.sm }}>Completed</span>
              </div>
              {completedExams.map((exam, i) => (
                <div key={exam.id} onClick={() => setSelectedExam(exam)} style={{ padding: "10px 16px", borderBottom: i < completedExams.length - 1 ? `1px solid ${colors.border.subtle}` : "none", cursor: "pointer", transition: "background 0.1s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.bg.raised}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: colors.success.main }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: fonts.size.base, fontWeight: 500, color: colors.text.primary, marginBottom: "2px" }}>{exam.subject}</div>
                      <div style={caption}>{exam.date} · {exam.location}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: colors.success.main, fontFamily: fonts.heading }}>{exam.score}</div>
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
            <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Study Suggestions</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {upcomingExams.slice(0, 2).map((exam, i) => (
                <div key={i} style={{ ...cardInner, padding: "10px 12px" }}>
                  <div style={{ fontSize: fonts.size.sm, fontWeight: 500, color: exam.color, marginBottom: "4px" }}>{exam.subject}</div>
                  <div style={muted}>Suggested: 2-3 hours daily</div>
                  <div style={caption}>Focus: {exam.syllabus?.[0]}, {exam.syllabus?.[1]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Preparation */}
          <div style={{ ...card, padding: "12px" }}>
            <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Exam Preparation</h4>
            <div style={{ display: "grid", gap: "8px" }}>
              {[
                { label: "Study Materials", onClick: () => alert('Opening study resources...') },
                { label: "Practice Tests", onClick: () => alert('Loading practice questions...') },
                { label: "Study Timer", onClick: () => alert('Starting study timer...') },
                { label: "Exam Locations", onClick: () => alert('Showing exam hall locations...') },
              ].map((action, i) => (
                <button key={i} onClick={action.onClick} style={{ ...cardInner, padding: "10px 12px", color: colors.text.secondary, fontSize: fonts.size.sm, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", textAlign: "left", transition: "background 0.1s ease", fontFamily: fonts.body }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.primary.ghost; e.currentTarget.style.color = colors.primary.main }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = colors.bg.raised; e.currentTarget.style.color = colors.text.secondary }}>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exam Tips */}
          <div style={{ ...card, padding: "12px", flex: 1 }}>
            <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Exam Day Tips</h4>
            <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary, lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 4px" }}>Arrive 30 minutes early</p>
              <p style={{ margin: "0 0 4px" }}>Bring valid ID and hall ticket</p>
              <p style={{ margin: "0 0 4px" }}>Use only blue/black pen</p>
              <p style={{ margin: "0 0 4px" }}>Read all questions carefully</p>
              <p style={{ margin: "0 0 4px" }}>Manage time effectively</p>
              <p style={{ margin: 0 }}>Stay calm and confident</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Details Modal */}
      {selectedExam && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedExam(null)}>
          <div style={{ background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.xl, maxWidth: "460px", width: "90%", maxHeight: "80vh", overflowY: "auto", overflow: "hidden", boxShadow: shadows.xl }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.border.subtle}`, display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 4, height: 32, borderRadius: "2px", background: selectedExam.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ ...heading, fontSize: "15px", margin: 0 }}>{selectedExam.subject}</h3>
                <p style={{ ...caption, margin: "2px 0 0" }}>
                  {selectedExam.status === "completed" ? "Completed" : `${selectedExam.daysLeft} days remaining`}
                </p>
              </div>
              <button onClick={() => setSelectedExam(null)} style={{ background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`, width: "28px", height: "28px", borderRadius: radius.md, color: colors.text.secondary, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.1s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.border.medium}
                onMouseLeave={(e) => e.currentTarget.style.background = colors.bg.raised}>×</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                {[
                  { label: "Date", value: selectedExam.date },
                  { label: "Time", value: selectedExam.time },
                  { label: "Location", value: selectedExam.location },
                  { label: "Seat", value: selectedExam.room },
                  { label: "Invigilator", value: selectedExam.invigilator },
                  { label: "Duration", value: selectedExam.duration },
                ].map((item, i) => (
                  <div key={i} style={{ ...cardInner, padding: "10px 12px" }}>
                    <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>{item.label}</div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: colors.text.primary }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {selectedExam.score && (
                <div style={{ ...cardInner, padding: "10px 12px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>Score</div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: colors.text.primary }}>{selectedExam.score}</div>
                  </div>
                  <div style={{ background: colors.success.ghost, color: colors.success.main, fontSize: fonts.size.sm, fontWeight: 600, padding: "4px 10px", borderRadius: radius.sm }}>Grade {selectedExam.grade}</div>
                </div>
              )}

              {/* Syllabus */}
              <div>
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px", fontWeight: 500 }}>Syllabus Coverage</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedExam.syllabus?.map((topic, i) => (
                    <span key={i} style={{ ...cardInner, padding: "5px 10px", fontSize: fonts.size.sm, color: colors.text.secondary, fontWeight: 400 }}>{topic}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            {selectedExam.status === "upcoming" && (
              <div style={{ padding: "12px 20px", borderTop: `1px solid ${colors.border.subtle}`, display: "flex", gap: "8px" }}>
                <button style={{ ...btn, flex: 1, background: selectedExam.color, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>Study Plan</button>
                <button style={{ ...btnGhost, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>Reminder</button>
                <button style={{ ...btnGhost, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>Location</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

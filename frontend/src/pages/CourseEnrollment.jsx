import { useState } from "react"
import Layout from "../components/Layout"
import { colors, fonts, radius, shadows } from "../styles/tokens"

export default function CourseEnrollment() {
  const [selectedSemester, setSelectedSemester] = useState("current")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDept, setFilterDept] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState(null)

  const card = { background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.lg, boxShadow: shadows.sm }
  const cardInner = { background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`, borderRadius: radius.md }
  const heading = { fontFamily: fonts.heading, fontWeight: fonts.weight.semibold, color: colors.text.primary }
  const muted = { fontSize: fonts.size.sm, color: colors.text.secondary }
  const caption = { fontSize: fonts.size.xs, color: colors.text.muted }
  const inputField = { background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.md, padding: "6px 12px", color: colors.text.primary, fontSize: fonts.size.sm, fontFamily: fonts.body }
  const btn = { background: colors.primary.main, border: "none", borderRadius: radius.md, padding: "6px 14px", color: "#fff", fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body }
  const btnGhost = { background: colors.bg.raised, border: `1px solid ${colors.border.medium}`, borderRadius: radius.md, padding: "8px 16px", color: colors.text.primary, fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body }

  const [enrolledCourses] = useState([
    {
      id: 1, code: "EC301", name: "Digital Signal Processing", credits: 3,
      instructor: "Dr. Sarah Chen", schedule: "Mon/Wed/Fri 10:00-11:00 AM", room: "E-204",
      enrolled: 45, capacity: 50, status: "enrolled", grade: "A", completion: 75,
      department: "ECE", semester: "Spring 2024",
      assignments: [
        { name: "Filter Design", due: "Mar 15", status: "submitted", score: "92/100" },
        { name: "FFT Analysis", due: "Mar 28", status: "pending", score: null },
        { name: "Final Project", due: "Apr 20", status: "not started", score: null },
      ],
      materials: [
        { name: "Course Syllabus", type: "pdf", size: "2.3 MB" },
        { name: "Lecture Notes Ch1-5", type: "pdf", size: "15.7 MB" },
        { name: "Lab Manual", type: "pdf", size: "4.2 MB" },
        { name: "Reference Code", type: "zip", size: "8.1 MB" },
      ]
    },
    {
      id: 2, code: "CS302", name: "Data Structures & Algorithms", credits: 4,
      instructor: "Prof. Michael Wong", schedule: "Tue/Thu 2:00-3:30 PM", room: "CS-101",
      enrolled: 38, capacity: 40, status: "enrolled", grade: "A-", completion: 82,
      department: "CSE", semester: "Spring 2024",
      assignments: [
        { name: "Binary Trees", due: "Mar 12", status: "graded", score: "88/100" },
        { name: "Graph Algorithms", due: "Mar 25", status: "submitted", score: null },
        { name: "Dynamic Programming", due: "Apr 8", status: "not started", score: null },
      ],
      materials: [
        { name: "Algorithm Slides", type: "pdf", size: "22.4 MB" },
        { name: "Practice Problems", type: "pdf", size: "6.8 MB" },
        { name: "Code Templates", type: "zip", size: "3.2 MB" },
      ]
    },
    {
      id: 3, code: "EC305", name: "VLSI Design", credits: 3,
      instructor: "Dr. Rajesh Patel", schedule: "Mon/Wed 2:00-3:00 PM", room: "F-102",
      enrolled: 28, capacity: 30, status: "enrolled", grade: "B+", completion: 68,
      department: "ECE", semester: "Spring 2024",
      assignments: [
        { name: "Circuit Layout", due: "Mar 10", status: "graded", score: "85/100" },
        { name: "Timing Analysis", due: "Mar 24", status: "pending", score: null },
        { name: "Final Chip Design", due: "Apr 15", status: "not started", score: null },
      ],
      materials: [
        { name: "VLSI Fundamentals", type: "pdf", size: "45.2 MB" },
        { name: "CAD Tools Guide", type: "pdf", size: "12.1 MB" },
        { name: "Sample Layouts", type: "zip", size: "28.7 MB" },
      ]
    },
  ])

  const [availableCourses] = useState([
    { id: 101, code: "EC401", name: "Microwave Engineering", credits: 3, instructor: "Dr. Lisa Kumar", schedule: "Tue/Thu 11:00 AM-12:30 PM", room: "E-301", enrolled: 22, capacity: 35, status: "available", prerequisites: ["EC301", "EC204"], department: "ECE", semester: "Spring 2024", description: "Advanced study of microwave circuits, antennas, and propagation." },
    { id: 102, code: "CS401", name: "Machine Learning", credits: 4, instructor: "Prof. David Park", schedule: "Mon/Wed/Fri 1:00-2:00 PM", room: "CS-203", enrolled: 35, capacity: 40, status: "available", prerequisites: ["CS302", "MATH301"], department: "CSE", semester: "Spring 2024", description: "Introduction to machine learning algorithms including supervised and deep learning." },
    { id: 103, code: "EC403", name: "Digital Communications", credits: 3, instructor: "Dr. Anna Rodriguez", schedule: "Tue/Thu 9:00-10:30 AM", room: "E-205", enrolled: 31, capacity: 35, status: "available", prerequisites: ["EC301", "EC250"], department: "ECE", semester: "Spring 2024", description: "Modern digital communication systems including modulation and coding." },
    { id: 104, code: "CS405", name: "Computer Networks", credits: 3, instructor: "Prof. James Wilson", schedule: "Mon/Wed 3:00-4:30 PM", room: "CS-105", enrolled: 28, capacity: 32, status: "available", prerequisites: ["CS302", "CS201"], department: "CSE", semester: "Spring 2024", description: "Network protocols, architectures, security, and performance analysis." },
    { id: 105, code: "MATH402", name: "Advanced Statistics", credits: 3, instructor: "Dr. Emily Chen", schedule: "Tue/Thu 1:00-2:30 PM", room: "M-107", enrolled: 33, capacity: 35, status: "waitlist", prerequisites: ["MATH301", "MATH250"], department: "MATH", semester: "Spring 2024", description: "Statistical inference, hypothesis testing, and computational statistics." },
  ])

  const filteredAvailableCourses = availableCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || course.code.toLowerCase().includes(searchTerm.toLowerCase()) || course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = filterDept === "all" || course.department === filterDept
    return matchesSearch && matchesDept
  })

  const enrollInCourse = (courseId) => alert(`Enrolling in course ${courseId}.`)
  const dropCourse = (courseId) => alert(`Dropping course ${courseId}.`)

  return (
    <Layout>
      {/* Top Bar */}
      <div style={{ ...card, margin: "12px 12px 0", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 3, height: 20, borderRadius: "2px", background: colors.primary.main }} />
            <h2 style={{ ...heading, fontSize: "15px", margin: 0, fontWeight: 700 }}>Course Enrollment</h2>
          </div>
          <p style={{ ...caption, margin: "4px 0 0 11px" }}>{enrolledCourses.length} enrolled · {availableCourses.filter(c => c.status === "available").length} available</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} style={inputField}>
            <option value="current">Spring 2024</option>
            <option value="next">Fall 2024</option>
            <option value="previous">Fall 2023</option>
          </select>
          <button style={btn}>Academic Plan</button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: "flex", margin: "12px", gap: "12px", overflow: "hidden" }}>
        {/* Main Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", paddingRight: "8px" }}>
          {/* Enrollment Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            {[
              { num: enrolledCourses.length.toString(), label: "Enrolled Courses", color: colors.primary.main },
              { num: enrolledCourses.reduce((sum, c) => sum + c.credits, 0).toString(), label: "Total Credits", color: colors.success.main },
              { num: (enrolledCourses.reduce((sum, c) => sum + c.completion, 0) / enrolledCourses.length).toFixed(0) + "%", label: "Avg Progress", color: colors.warning.main },
              { num: "3.7", label: "Current GPA", color: colors.secondary.main },
            ].map((stat, i) => (
              <div key={i} style={{ ...card, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 600, color: stat.color, marginBottom: "2px", fontVariantNumeric: "tabular-nums", fontFamily: fonts.heading }}>{stat.num}</div>
                <div style={muted}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Enrolled Courses */}
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${colors.border.medium}` }}>
              <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>Currently Enrolled</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px", padding: "12px" }}>
              {enrolledCourses.map((course) => (
                <div key={course.id} style={{ ...cardInner, padding: "12px", cursor: "pointer", transition: "background 0.1s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.primary.ghost}
                  onMouseLeave={(e) => e.currentTarget.style.background = colors.bg.raised}
                  onClick={() => setSelectedCourse(course)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: fonts.size.base, fontWeight: 600, color: colors.primary.main, marginBottom: "4px" }}>{course.code}</div>
                      <div style={{ fontSize: fonts.size.sm, fontWeight: 500, color: colors.text.primary, marginBottom: "4px" }}>{course.name}</div>
                      <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{course.instructor} · {course.credits} credits</div>
                    </div>
                    <span style={{
                      background: course.grade === "A" || course.grade === "A-" ? colors.success.ghost : colors.warning.ghost,
                      color: course.grade === "A" || course.grade === "A-" ? colors.success.main : colors.warning.main,
                      fontSize: fonts.size.xs, fontWeight: 600, padding: "3px 8px", borderRadius: radius.sm,
                    }}>{course.grade}</span>
                  </div>

                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginBottom: "8px" }}>{course.schedule} · {course.room}</div>

                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: fonts.size.xs, color: colors.text.secondary }}>Progress</span>
                      <span style={{ fontSize: fonts.size.xs, color: colors.primary.main, fontWeight: 600 }}>{course.completion}%</span>
                    </div>
                    <div style={{ width: "100%", height: "4px", background: colors.border.medium, borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${course.completion}%`, height: "100%", background: colors.primary.main, borderRadius: "2px", transition: "width 0.3s ease" }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{course.enrolled}/{course.capacity} enrolled</span>
                    <button onClick={(e) => { e.stopPropagation(); dropCourse(course.id) }} style={{ background: colors.error.ghost, border: "none", borderRadius: radius.sm, padding: "4px 8px", color: colors.error.main, fontSize: "10px", cursor: "pointer", fontFamily: fonts.body }}>Drop</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Courses */}
          <div style={{ ...card, overflow: "hidden", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${colors.border.medium}` }}>
              <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>Available Courses</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
                <input type="text" placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputField, width: "160px" }} />
                <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={inputField}>
                  <option value="all">All Departments</option>
                  <option value="ECE">ECE</option>
                  <option value="CSE">CSE</option>
                  <option value="MATH">Mathematics</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "12px", padding: "12px", maxHeight: "400px", overflowY: "auto" }}>
              {filteredAvailableCourses.map((course) => (
                <div key={course.id} style={{ ...cardInner, padding: "12px", transition: "background 0.1s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.primary.ghost}
                  onMouseLeave={(e) => e.currentTarget.style.background = colors.bg.raised}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: fonts.size.base, fontWeight: 600, color: colors.primary.main, marginBottom: "4px" }}>{course.code}</div>
                      <div style={{ fontSize: fonts.size.sm, fontWeight: 500, color: colors.text.primary, marginBottom: "4px" }}>{course.name}</div>
                      <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{course.instructor} · {course.credits} credits</div>
                    </div>
                    <span style={{
                      background: course.status === "available" ? colors.success.ghost : colors.warning.ghost,
                      color: course.status === "available" ? colors.success.main : colors.warning.main,
                      fontSize: "9px", fontWeight: 600, padding: "3px 6px", borderRadius: radius.sm, textTransform: "uppercase",
                    }}>{course.status}</span>
                  </div>

                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginBottom: "8px" }}>{course.schedule} · {course.room}</div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.secondary, lineHeight: 1.4, marginBottom: "8px" }}>{course.description}</div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginBottom: "12px" }}>Prerequisites: {course.prerequisites.join(", ")}</div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{course.enrolled}/{course.capacity} enrolled</span>
                    <button onClick={() => enrollInCourse(course.id)} disabled={course.status === "waitlist"} style={{
                      background: course.status === "available" ? colors.primary.main : colors.warning.main,
                      border: "none", borderRadius: radius.md, padding: "6px 12px",
                      color: "#fff", fontSize: "10px", fontWeight: 500, fontFamily: fonts.body,
                      cursor: course.status === "available" ? "pointer" : "not-allowed",
                    }}>{course.status === "available" ? "Enroll" : "Join Waitlist"}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Important Dates */}
          <div style={{ ...card, padding: "12px" }}>
            <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Important Dates</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { date: "Mar 15", event: "Add/Drop Deadline", type: "deadline" },
                { date: "Mar 22", event: "Spring Break", type: "break" },
                { date: "Apr 20", event: "Final Exams Begin", type: "exam" },
                { date: "May 15", event: "Summer Registration Opens", type: "registration" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", ...cardInner }}>
                  <div style={{ fontSize: fonts.size.xs, fontWeight: 600, color: colors.primary.main, fontVariantNumeric: "tabular-nums" }}>{item.date}</div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.secondary, flex: 1 }}>{item.event}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Degree Progress */}
          <div style={{ ...card, padding: "12px" }}>
            <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Degree Progress</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { category: "Core Courses", completed: 24, required: 30, color: colors.primary.main },
                { category: "Electives", completed: 12, required: 18, color: colors.success.main },
                { category: "Labs", completed: 8, required: 10, color: colors.warning.main },
                { category: "Capstone", completed: 0, required: 6, color: colors.error.main },
              ].map((item, i) => (
                <div key={i} style={{ padding: "6px 0", borderBottom: i < 3 ? `1px solid ${colors.border.subtle}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: fonts.size.xs, color: colors.text.secondary }}>{item.category}</span>
                    <span style={{ fontSize: fonts.size.xs, color: item.color, fontWeight: 600 }}>{item.completed}/{item.required}</span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: colors.border.medium, borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${(item.completed / item.required) * 100}%`, height: "100%", background: item.color, borderRadius: "2px", transition: "width 0.3s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ ...card, padding: "12px", flex: 1 }}>
            <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Quick Actions</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "View Transcript" },
                { label: "Academic Calendar" },
                { label: "Tuition & Fees" },
                { label: "Graduation Planner" },
                { label: "Course Catalog" },
              ].map((action, i) => (
                <button key={i} style={{ ...cardInner, padding: "10px 12px", color: colors.text.secondary, fontSize: fonts.size.sm, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", textAlign: "left", transition: "background 0.1s ease", fontFamily: fonts.body }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.primary.ghost; e.currentTarget.style.color = colors.primary.main }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = colors.bg.raised; e.currentTarget.style.color = colors.text.secondary }}
                  onClick={() => alert(`Opening ${action.label}...`)}>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedCourse(null)}>
          <div style={{ background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.xl, padding: "24px", maxWidth: "600px", width: "90%", maxHeight: "80vh", overflowY: "auto", boxShadow: shadows.xl }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ ...heading, fontSize: "16px", color: colors.primary.main, margin: "0 0 4px" }}>{selectedCourse.code} – {selectedCourse.name}</h3>
                <p style={{ ...muted, margin: 0 }}>{selectedCourse.instructor} · {selectedCourse.credits} Credits</p>
              </div>
              <button onClick={() => setSelectedCourse(null)} style={{ background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`, width: "28px", height: "28px", borderRadius: radius.md, color: colors.text.secondary, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            {/* Course Materials */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ ...heading, fontSize: "13px", margin: "0 0 12px" }}>Course Materials</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {selectedCourse.materials?.map((material, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", ...cardInner }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "2px", background: material.type === "pdf" ? colors.error.main : colors.primary.main, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: fonts.size.sm, color: colors.text.primary, fontWeight: 500 }}>{material.name}</div>
                        <div style={caption}>{material.size}</div>
                      </div>
                    </div>
                    <button style={{ background: colors.primary.ghost, border: "none", borderRadius: radius.sm, padding: "4px 8px", color: colors.primary.main, fontSize: "10px", cursor: "pointer", fontFamily: fonts.body }}>Download</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ ...heading, fontSize: "13px", margin: "0 0 12px" }}>Recent Assignments</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {selectedCourse.assignments?.map((assignment, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", ...cardInner }}>
                    <div>
                      <div style={{ fontSize: fonts.size.sm, color: colors.text.primary, fontWeight: 500 }}>{assignment.name}</div>
                      <div style={caption}>Due: {assignment.due}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {assignment.score && <span style={{ fontSize: "10px", color: colors.success.main, fontWeight: 600 }}>{assignment.score}</span>}
                      <span style={{
                        background: assignment.status === "graded" ? colors.success.ghost : assignment.status === "submitted" ? colors.primary.ghost : assignment.status === "pending" ? colors.warning.ghost : colors.error.ghost,
                        color: assignment.status === "graded" ? colors.success.main : assignment.status === "submitted" ? colors.primary.main : assignment.status === "pending" ? colors.warning.main : colors.error.main,
                        fontSize: "9px", fontWeight: 600, padding: "3px 6px", borderRadius: radius.sm, textTransform: "uppercase",
                      }}>{assignment.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button style={btn}>Access Course</button>
              <button onClick={() => dropCourse(selectedCourse.id)} style={btnGhost}>Drop Course</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

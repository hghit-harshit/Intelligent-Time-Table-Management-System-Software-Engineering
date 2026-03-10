import { useState } from "react"
import Layout from "../components/Layout"

export default function CourseEnrollment() {
  const [selectedSemester, setSelectedSemester] = useState("current")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDept, setFilterDept] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState(null)
  
  const [enrolledCourses] = useState([
    {
      id: 1,
      code: "EC301",
      name: "Digital Signal Processing",
      credits: 3,
      instructor: "Dr. Sarah Chen",
      schedule: "Mon/Wed/Fri 10:00-11:00 AM",
      room: "E-204",
      enrolled: 45,
      capacity: 50,
      status: "enrolled",
      grade: "A",
      completion: 75,
      department: "ECE",
      semester: "Spring 2024",
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
      id: 2,
      code: "CS302",
      name: "Data Structures & Algorithms", 
      credits: 4,
      instructor: "Prof. Michael Wong",
      schedule: "Tue/Thu 2:00-3:30 PM",
      room: "CS-101",
      enrolled: 38,
      capacity: 40,
      status: "enrolled",
      grade: "A-",
      completion: 82,
      department: "CSE",
      semester: "Spring 2024",
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
      id: 3,
      code: "EC305",
      name: "VLSI Design",
      credits: 3,
      instructor: "Dr. Rajesh Patel",
      schedule: "Mon/Wed 2:00-3:00 PM",
      room: "F-102",
      enrolled: 28,
      capacity: 30,
      status: "enrolled",
      grade: "B+",
      completion: 68,
      department: "ECE",
      semester: "Spring 2024",
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
    {
      id: 101,
      code: "EC401",
      name: "Microwave Engineering",
      credits: 3,
      instructor: "Dr. Lisa Kumar",
      schedule: "Tue/Thu 11:00 AM-12:30 PM",
      room: "E-301",
      enrolled: 22,
      capacity: 35,
      status: "available",
      prerequisites: ["EC301", "EC204"],
      department: "ECE",
      semester: "Spring 2024",
      description: "Advanced study of microwave circuits, antennas, and propagation. Includes hands-on lab work with vector network analyzers and microwave design software."
    },
    {
      id: 102,
      code: "CS401", 
      name: "Machine Learning",
      credits: 4,
      instructor: "Prof. David Park",
      schedule: "Mon/Wed/Fri 1:00-2:00 PM",
      room: "CS-203",
      enrolled: 35,
      capacity: 40,
      status: "available",
      prerequisites: ["CS302", "MATH301"],
      department: "CSE",
      semester: "Spring 2024",
      description: "Introduction to machine learning algorithms including supervised learning, unsupervised learning, and deep learning. Practical projects using Python and TensorFlow."
    },
    {
      id: 103,
      code: "EC403",
      name: "Digital Communications",
      credits: 3,
      instructor: "Dr. Anna Rodriguez",
      schedule: "Tue/Thu 9:00-10:30 AM",
      room: "E-205",
      enrolled: 31,
      capacity: 35,
      status: "available",
      prerequisites: ["EC301", "EC250"],
      department: "ECE",
      semester: "Spring 2024",
      description: "Modern digital communication systems including modulation techniques, channel coding, and wireless standards. Laboratory work with SDR platforms."
    },
    {
      id: 104,
      code: "CS405",
      name: "Computer Networks",
      credits: 3,
      instructor: "Prof. James Wilson",
      schedule: "Mon/Wed 3:00-4:30 PM",
      room: "CS-105",
      enrolled: 28,
      capacity: 32,
      status: "available",
      prerequisites: ["CS302", "CS201"],
      department: "CSE",
      semester: "Spring 2024",
      description: "Network protocols, architectures, and design. Covers TCP/IP, routing algorithms, network security, and performance analysis."
    },
    {
      id: 105,
      code: "MATH402",
      name: "Advanced Statistics",
      credits: 3,
      instructor: "Dr. Emily Chen",
      schedule: "Tue/Thu 1:00-2:30 PM",
      room: "M-107",
      enrolled: 33,
      capacity: 35,
      status: "waitlist",
      prerequisites: ["MATH301", "MATH250"],
      department: "MATH",
      semester: "Spring 2024",
      description: "Statistical inference, hypothesis testing, regression analysis, and computational statistics using R and Python."
    },
  ])

  const filteredAvailableCourses = availableCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = filterDept === "all" || course.department === filterDept
    return matchesSearch && matchesDept
  })

  const enrollInCourse = (courseId) => {
    alert(`Enrolling in course ${courseId}. This would normally process the enrollment.`)
  }

  const dropCourse = (courseId) => {
    alert(`Dropping course ${courseId}. This would normally process the withdrawal.`)
  }

  return (
    <Layout>
      {/* Top Bar */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        margin: "16px 16px 0",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#fff",
            margin: "0 0 4px",
            fontFamily: "'Playfair Display', serif",
          }}>
            Course Enrollment
          </h2>
          <p style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}>
            {enrolledCourses.length} enrolled • {availableCourses.filter(c => c.status === 'available').length} available courses
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select 
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              padding: "6px 12px",
              color: "#fff",
              fontSize: "12px",
            }}
          >
            <option value="current">Spring 2024</option>
            <option value="next">Fall 2024</option>
            <option value="previous">Fall 2023</option>
          </select>
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
            Academic Plan
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        display: "flex",
        margin: "16px",
        gap: "16px",
        overflow: "hidden",
      }}>
        {/* Main Panel */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          {/* Enrollment Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",  
            gap: "14px",
          }}>
            {[
              { 
                icon: "📚", 
                num: enrolledCourses.length.toString(), 
                label: "Enrolled Courses",
                color: "#60efff" 
              },
              { 
                icon: "📊", 
                num: enrolledCourses.reduce((sum, c) => sum + c.credits, 0).toString(), 
                label: "Total Credits",
                color: "#22c55e" 
              },
              { 
                icon: "🎯", 
                num: (enrolledCourses.reduce((sum, c) => sum + c.completion, 0) / enrolledCourses.length).toFixed(0) + "%", 
                label: "Avg Progress",
                color: "#f59e0b" 
              },
              { 
                icon: "⭐", 
                num: "3.7", 
                label: "Current GPA",
                color: "#a78bfa" 
              },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "center",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)"
                e.target.style.borderColor = "rgba(96,239,255,0.2)"
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0px)"
                e.target.style.borderColor = "rgba(255,255,255,0.08)"
              }}>
                <div style={{
                  fontSize: "24px",
                  marginBottom: "12px",
                  filter: `drop-shadow(0 0 8px ${stat.color}30)`,
                }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: stat.color,
                  marginBottom: "4px",
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {stat.num}
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

          {/* Enrolled Courses */}
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
                fontSize: "16px",
                fontWeight: "700",
                color: "#fff",
                margin: 0,
                fontFamily: "'Playfair Display', serif",
              }}>
                Currently Enrolled
              </h3>
            </div>

            <div style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "16px", 
              padding: "20px",
            }}>
              {enrolledCourses.map((course) => (
                <div key={course.id} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }} 
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "rgba(96,239,255,0.2)"
                  e.target.style.background = "rgba(96,239,255,0.03)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.05)"
                  e.target.style.background = "rgba(255,255,255,0.02)"
                }}
                onClick={() => setSelectedCourse(course)}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}>
                    <div>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#60efff",
                        marginBottom: "4px",
                      }}>
                        {course.code}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#fff",
                        marginBottom: "4px",
                      }}>
                        {course.name}
                      </div>
                      <div style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.6)",
                      }}>
                        {course.instructor} • {course.credits} credits
                      </div>
                    </div>
                    <span style={{
                      background: course.grade === 'A' ? "rgba(34,197,94,0.15)" :
                                  course.grade === 'A-' ? "rgba(34,197,94,0.10)" :
                                  "rgba(245,158,11,0.15)",
                      color: course.grade === 'A' ? "#22c55e" :
                             course.grade === 'A-' ? "#22c55e" :
                             "#f59e0b",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}>
                      {course.grade}
                    </span>
                  </div>

                  <div style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "8px",
                  }}>
                    {course.schedule} • {course.room}
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}>
                      <span style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.6)",
                      }}>
                        Progress
                      </span>
                      <span style={{
                        fontSize: "10px",
                        color: "#60efff",
                        fontWeight: "600",
                      }}>
                        {course.completion}%
                      </span>
                    </div>
                    <div style={{
                      width: "100%",
                      height: "4px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${course.completion}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, #60efff, #9333ea)`,
                        borderRadius: "2px",
                        transition: "width 0.3s ease",
                      }} />
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span style={{
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.4)",
                    }}>
                      {course.enrolled}/{course.capacity} enrolled
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        dropCourse(course.id)
                      }}
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        color: "#ef4444",
                        fontSize: "10px",
                        cursor: "pointer",
                      }}
                    >
                      Drop
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Courses */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden",
            flex: 1,
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <h3 style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#fff",
                margin: 0,
                fontFamily: "'Playfair Display', serif",
              }}>
                Available Courses
              </h3>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginLeft: "auto",
              }}>
                <input 
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    color: "#fff",
                    fontSize: "11px",
                    width: "160px",
                  }}
                />
                <select 
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                >
                  <option value="all">All Departments</option>
                  <option value="ECE">ECE</option>
                  <option value="CSE">CSE</option>
                  <option value="MATH">Mathematics</option>
                </select>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "16px",
              padding: "20px",
              maxHeight: "400px",
              overflowY: "auto",
            }}>
              {filteredAvailableCourses.map((course) => (
                <div key={course.id} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "16px",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "rgba(96,239,255,0.2)"
                  e.target.style.background = "rgba(96,239,255,0.03)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.05)"
                  e.target.style.background = "rgba(255,255,255,0.02)"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}>
                    <div>
                      <div style={{
                        fontSize: "14px", 
                        fontWeight: "700",
                        color: "#60efff",
                        marginBottom: "4px",
                      }}>
                        {course.code}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        fontWeight: "600", 
                        color: "#fff",
                        marginBottom: "4px",
                      }}>
                        {course.name}
                      </div>
                      <div style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.6)",
                      }}>
                        {course.instructor} • {course.credits} credits
                      </div>
                    </div>
                    <span style={{
                      background: course.status === "available" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                      color: course.status === "available" ? "#22c55e" : "#f59e0b",
                      fontSize: "9px",
                      fontWeight: "700",
                      padding: "3px 6px",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                    }}>
                      {course.status}
                    </span>
                  </div>

                  <div style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.5)", 
                    marginBottom: "8px",
                  }}>
                    {course.schedule} • {course.room}
                  </div>

                  <div style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.4,
                    marginBottom: "8px",
                  }}>
                    {course.description}
                  </div>

                  <div style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "12px",
                  }}>
                    Prerequisites: {course.prerequisites.join(", ")}
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span style={{
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.4)",
                    }}>
                      {course.enrolled}/{course.capacity} enrolled
                    </span>
                    <button 
                      onClick={() => enrollInCourse(course.id)}
                      disabled={course.status === "waitlist"}
                      style={{
                        background: course.status === "available" ? "#60efff" : "rgba(245,158,11,0.7)",
                        border: "none",
                        borderRadius: "6px", 
                        padding: "6px 12px",
                        color: course.status === "available" ? "#0a0a12" : "#fff",
                        fontSize: "10px",
                        fontWeight: "600",
                        cursor: course.status === "available" ? "pointer" : "not-allowed",
                      }}
                    >
                      {course.status === "available" ? "Enroll" : "Join Waitlist"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{
          width: "280px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          {/* Academic Calendar */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "16px",
          }}>
            <h4 style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "12px",
              margin: "0 0 12px",
            }}>
              Important Dates
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { date: "Mar 15", event: "Add/Drop Deadline", type: "deadline" },
                { date: "Mar 22", event: "Spring Break", type: "break" },
                { date: "Apr 20", event: "Final Exams Begin", type: "exam" },
                { date: "May 15", event: "Summer Registration Opens", type: "registration" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <div style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#60efff",
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    {item.date}
                  </div>
                  <div style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.8)",
                    flex: 1,
                  }}>
                    {item.event}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Degree Progress */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "16px",
          }}>
            <h4 style={{
              fontSize: "13px",
              fontWeight: "700", 
              color: "#fff",
              marginBottom: "12px",
              margin: "0 0 12px",
            }}>
              Degree Progress
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { category: "Core Courses", completed: 24, required: 30, color: "#60efff" },
                { category: "Electives", completed: 12, required: 18, color: "#22c55e" },
                { category: "Labs", completed: 8, required: 10, color: "#f59e0b" },
                { category: "Capstone", completed: 0, required: 6, color: "#ef4444" },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "8px 0",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}>
                    <span style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.8)",
                    }}>
                      {item.category}
                    </span>
                    <span style={{
                      fontSize: "11px",
                      color: item.color,
                      fontWeight: "600",
                    }}>
                      {item.completed}/{item.required}
                    </span>
                  </div>
                  <div style={{
                    width: "100%",
                    height: "4px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${(item.completed / item.required) * 100}%`,
                      height: "100%",
                      background: item.color,
                      borderRadius: "2px",
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "16px",
            flex: 1,
          }}>
            <h4 style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "12px",
              margin: "0 0 12px",
            }}>
              Quick Actions
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { icon: "📄", label: "View Transcript" },
                { icon: "📅", label: "Academic Calendar" },
                { icon: "💰", label: "Tuition & Fees" },
                { icon: "🎓", label: "Graduation Planner" },
                { icon: "📚", label: "Course Catalog" },
              ].map((action, i) => (
                <button key={i} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(96,239,255,0.1)";
                  e.target.style.borderColor = "rgba(96,239,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.05)";
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                }}
                onClick={() => alert(`Opening ${action.label}...`)}>
                  <span style={{ fontSize: "14px" }}>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }} onClick={() => setSelectedCourse(null)}>
          <div style={{
            background: "rgba(15,23,42,0.95)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ 
                  color: "#60efff", 
                  fontSize: "18px", 
                  fontWeight: "700", 
                  margin: "0 0 4px",
                }}>
                  {selectedCourse.code} - {selectedCourse.name}
                </h3>
                <p style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "12px",
                  margin: 0,
                }}>
                  {selectedCourse.instructor} • {selectedCourse.credits} Credits
                </p>
              </div>
              <button 
                onClick={() => setSelectedCourse(null)}
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

            {/* Course Materials */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                margin: "0 0 12px",
              }}>
                Course Materials
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {selectedCourse.materials?.map((material, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>
                        {material.type === "pdf" ? "📄" : "📁"}
                      </span>
                      <div>
                        <div style={{
                          fontSize: "12px",
                          color: "#fff",
                          fontWeight: "500",
                        }}>
                          {material.name}
                        </div>
                        <div style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.5)",
                        }}>
                          {material.size}
                        </div>
                      </div>
                    </div>
                    <button style={{
                      background: "rgba(96,239,255,0.1)",
                      border: "1px solid rgba(96,239,255,0.3)",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      color: "#60efff",
                      fontSize: "10px",
                      cursor: "pointer",
                    }}>
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                margin: "0 0 12px",
              }}>
                Recent Assignments
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {selectedCourse.assignments?.map((assignment, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                  }}>
                    <div>
                      <div style={{
                        fontSize: "12px",
                        color: "#fff",
                        fontWeight: "500",
                      }}>
                        {assignment.name}
                      </div>
                      <div style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.5)",
                      }}>
                        Due: {assignment.due}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {assignment.score && (
                        <span style={{
                          fontSize: "10px",
                          color: "#22c55e",
                          fontWeight: "600",
                        }}>
                          {assignment.score}
                        </span>
                      )}
                      <span style={{
                        background: assignment.status === "graded" ? "rgba(34,197,94,0.15)" :
                                   assignment.status === "submitted" ? "rgba(59,130,246,0.15)" :
                                   assignment.status === "pending" ? "rgba(245,158,11,0.15)" :
                                   "rgba(239,68,68,0.15)",
                        color: assignment.status === "graded" ? "#22c55e" :
                               assignment.status === "submitted" ? "#3b82f6" :
                               assignment.status === "pending" ? "#f59e0b" :
                               "#ef4444",
                        fontSize: "9px",
                        fontWeight: "700",
                        padding: "3px 6px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                      }}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
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
                Access Course
              </button>
              <button 
                onClick={() => dropCourse(selectedCourse.id)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Drop Course
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
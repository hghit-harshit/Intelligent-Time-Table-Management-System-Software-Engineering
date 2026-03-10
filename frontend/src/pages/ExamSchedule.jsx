import { useState } from "react"
import Layout from "../components/Layout"

export default function ExamSchedule() {
  const [selectedExam, setSelectedExam] = useState(null)
  const [filterSubject, setFilterSubject] = useState("all")

  const exams = [
    {
      id: 1,
      subject: "Digital Circuits",
      date: "Feb 27, 2025",
      time: "9:00 AM - 12:00 PM",
      duration: "3 hours",
      location: "Exam Hall A",
      room: "Row 4, Seat 12",
      invigilator: "Dr. Nair",
      syllabus: ["Boolean Algebra", "Logic Gates", "Sequential Circuits", "Combinational Circuits"],
      status: "upcoming",
      daysLeft: 8,
      color: "#ef4444"
    },
    {
      id: 2,
      subject: "Mathematics III",
      date: "Mar 4, 2025",
      time: "2:00 PM - 5:00 PM", 
      duration: "3 hours",
      location: "LHC-1",
      room: "Row 2, Seat 8",
      invigilator: "Dr. Kumar",
      syllabus: ["Fourier Series", "Laplace Transform", "Partial Differential Equations", "Vector Calculus"],
      status: "upcoming",
      daysLeft: 13,
      color: "#f59e0b"
    },
    {
      id: 3,
      subject: "Data Structures & Algorithms",
      date: "Mar 11, 2025", 
      time: "9:00 AM - 12:00 PM",
      duration: "3 hours",
      location: "Exam Hall B",
      room: "Row 6, Seat 15",
      invigilator: "Dr. Mehta",
      syllabus: ["Arrays & Linked Lists", "Stacks & Queues", "Trees & Graphs", "Searching & Sorting"],
      status: "upcoming",
      daysLeft: 20,
      color: "#22c55e"
    },
    {
      id: 4,
      subject: "Signals & Systems",
      date: "Feb 20, 2025",
      time: "9:00 AM - 12:00 PM",
      duration: "3 hours", 
      location: "Exam Hall C",
      room: "Row 1, Seat 5",
      invigilator: "Dr. Patel",
      syllabus: ["Signal Analysis", "System Properties", "Fourier Analysis", "Z-Transform"],
      status: "completed",
      daysLeft: 0,
      score: "85/100",
      grade: "A",
      color: "#60efff"
    }
  ]

  const upcomingExams = exams.filter(exam => exam.status === "upcoming")
  const completedExams = exams.filter(exam => exam.status === "completed")

  const filteredExams = filterSubject === "all" 
    ? exams 
    : exams.filter(exam => exam.subject.toLowerCase().includes(filterSubject.toLowerCase()))

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
            Exam Schedule
          </h2>
          <p style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}>
            {upcomingExams.length} upcoming exams • Next in {Math.min(...upcomingExams.map(e => e.daysLeft))} days
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select 
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              padding: "6px 12px",
              color: "#fff",
              fontSize: "12px",
            }}
          >
            <option value="all">All Subjects</option>
            <option value="digital">Digital Circuits</option>
            <option value="math">Mathematics</option>
            <option value="data">Data Structures</option>
            <option value="signals">Signals & Systems</option>
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
            📥 Download Schedule
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
          overflowY: "auto",
          paddingRight: "8px",
        }}>
          {/* Stats Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginBottom: "20px",
          }}>
            {[
              { icon: "📅", num: upcomingExams.length.toString(), label: "Upcoming Exams", color: "#ef4444" },
              { icon: "✅", num: completedExams.length.toString(), label: "Completed", color: "#22c55e" },
              { icon: "⏰", num: `${Math.min(...upcomingExams.map(e => e.daysLeft))} days`, label: "Next Exam", color: "#f59e0b" },
              { icon: "📊", num: "85%", label: "Average Score", color: "#60efff" },
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

          {/* Upcoming Exams */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            marginBottom: "20px",
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
                Upcoming Exams
              </h3>
              <span style={{
                marginLeft: "auto",
                background: "rgba(239,68,68,0.15)",
                color: "#ef4444",
                fontSize: "11px",
                fontWeight: "600",
                padding: "4px 12px",
                borderRadius: "20px",
                border: "1px solid rgba(239,68,68,0.2)",
              }}>
                {upcomingExams.length} pending
              </span>
            </div>

            {upcomingExams.map((exam, i) => (
              <div key={exam.id} style={{
                padding: "16px 20px",
                borderBottom: i < upcomingExams.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
              onClick={() => setSelectedExam(exam)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ textAlign: "center", minWidth: "50px" }}>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: exam.color,
                    }}>
                      {exam.date.split(' ')[1].replace(',', '')}
                    </div>
                    <div style={{
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                      {exam.date.split(' ')[0]}
                    </div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#fff",
                      marginBottom: "4px",
                    }}>
                      {exam.subject}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.6)",
                      marginBottom: "4px",
                    }}>
                      📍 {exam.location} • {exam.time}
                    </div>
                    <div style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                    }}>
                      Duration: {exam.duration} • Seat: {exam.room}
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "4px",
                  }}>
                    <div style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: exam.daysLeft <= 10 ? "rgba(239,68,68,0.15)" : "rgba(251,146,60,0.15)",
                      color: exam.daysLeft <= 10 ? "#ef4444" : "#fb923c",
                      border: `1px solid ${exam.daysLeft <= 10 ? "rgba(239,68,68,0.2)" : "rgba(251,146,60,0.2)"}`,
                    }}>
                      {exam.daysLeft} days
                    </div>
                    <div style={{
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.4)",
                    }}>
                      Click for details
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Completed Exams */}
          {completedExams.length > 0 && (
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
                  Completed Exams
                </h3>
                <span style={{
                  marginLeft: "auto",
                  background: "rgba(34,197,94,0.15)",
                  color: "#22c55e",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}>
                  ✓ Completed
                </span>
              </div>

              {completedExams.map((exam, i) => (
                <div key={exam.id} style={{
                  padding: "16px 20px",
                  borderBottom: i < completedExams.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
                onClick={() => setSelectedExam(exam)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#22c55e",
                    }} />
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#fff",
                        marginBottom: "2px",
                      }}>
                        {exam.subject}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.4)",
                      }}>
                        {exam.date} • {exam.location}
                      </div>
                    </div>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}>
                      <div style={{
                        textAlign: "right",
                      }}>
                        <div style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#22c55e",
                        }}>
                          {exam.score}
                        </div>
                        <div style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.4)",
                        }}>
                          Grade: {exam.grade}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Exam Preparation */}
        <div style={{
          width: "300px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          {/* Study Schedule */}
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
              Study Suggestions
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {upcomingExams.slice(0, 2).map((exam, i) => (
                <div key={i} style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${exam.color}20`,
                }}>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: exam.color,
                    marginBottom: "4px",
                  }}>
                    {exam.subject}
                  </div>
                  <div style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: "6px",
                  }}>
                    Suggested: 2-3 hours daily
                  </div>
                  <div style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.4)",
                  }}>
                    Focus: {exam.syllabus?.[0]}, {exam.syllabus?.[1]}
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
          }}>
            <h4 style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "12px",
              margin: "0 0 12px",
            }}>
              Exam Preparation
            </h4>
            <div style={{ display: "grid", gap: "8px" }}>
              {[
                { icon: "📚", label: "Study Materials", onClick: () => alert('Opening study resources...') },
                { icon: "📝", label: "Practice Tests", onClick: () => alert('Loading practice questions...') },
                { icon: "⏰", label: "Study Timer", onClick: () => alert('Starting study timer...') },
                { icon: "📍", label: "Exam Locations", onClick: () => alert('Showing exam hall locations...') },
              ].map((action, i) => (
                <button key={i} onClick={action.onClick} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                }} onMouseEnter={(e) => {
                  e.target.style.background = "rgba(96,239,255,0.1)";
                  e.target.style.borderColor = "rgba(96,239,255,0.2)";
                }} onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.05)";
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                }}>
                  <span style={{ fontSize: "16px" }}>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exam Tips */}
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
              Exam Day Tips
            </h4>
            <div style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.5,
            }}>
              <p>• Arrive 30 minutes early</p>
              <p>• Bring valid ID and hall ticket</p>
              <p>• Use only blue/black pen</p>
              <p>• Read all questions carefully</p>
              <p>• Manage time effectively</p>
              <p>• Stay calm and confident</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Details Modal */}
      {selectedExam && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }} onClick={() => setSelectedExam(null)}>
          <div style={{
            background: "rgba(15,23,42,0.95)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ 
                color: selectedExam.color, 
                fontSize: "18px", 
                fontWeight: "700", 
                margin: 0,
                fontFamily: "'Playfair Display', serif",
              }}>
                {selectedExam.subject} Exam
              </h3>
              <button 
                onClick={() => setSelectedExam(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ color: "#fff", fontSize: "14px", marginBottom: "8px" }}>Exam Details</h4>
                <p><strong>📅 Date:</strong> {selectedExam.date}</p>
                <p><strong>⏰ Time:</strong> {selectedExam.time}</p>
                <p><strong>📍 Location:</strong> {selectedExam.location}</p>
                <p><strong>💺 Seat:</strong> {selectedExam.room}</p>
                <p><strong>👨‍🏫 Invigilator:</strong> {selectedExam.invigilator}</p>
                <p><strong>⏱️ Duration:</strong> {selectedExam.duration}</p>
                {selectedExam.score && <p><strong>📊 Score:</strong> {selectedExam.score} (Grade {selectedExam.grade})</p>}
              </div>

              <div>
                <h4 style={{ color: "#fff", fontSize: "14px", marginBottom: "8px" }}>Syllabus Coverage</h4>
                <ul style={{ paddingLeft: "16px", margin: 0 }}>
                  {selectedExam.syllabus?.map((topic, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>{topic}</li>
                  ))}
                </ul>
              </div>
            </div>

            {selectedExam.status === "upcoming" && (
              <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
                <button style={{
                  background: selectedExam.color,
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}>
                  📚 Study Plan
                </button>
                <button style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}>
                  🔔 Set Reminder
                </button>
                <button style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}>
                  📍 View Location
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
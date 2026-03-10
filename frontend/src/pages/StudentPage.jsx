import { useState } from "react"
import Layout from "../components/Layout"
import timetableData from "../data/timetableData.json"

export default function Dashboard() {
  const [selectedView, setSelectedView] = useState('week')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [showClassDetails, setShowClassDetails] = useState(false)
  const [selectedDate, setSelectedDate] = useState(timetableData.currentDate.day)
  const [selectedMonth, setSelectedMonth] = useState(timetableData.currentDate.month)
  const [selectedYear, setSelectedYear] = useState(timetableData.currentDate.year)

  const handleTimeSlotClick = (timeSlot) => {
    setSelectedTimeSlot(timeSlot)
    setShowClassDetails(true)
  }

  const handleDateClick = (day) => {
    setSelectedDate(day)
    setSelectedView('day') // Switch to day view when a date is clicked
  }

  // Function to get day name from date
  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayDate = new Date(selectedYear, selectedMonth - 1, date)
    return days[dayDate.getDay()]
  }

  // Function to get short day name
  const getShortDayName = (date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const dayDate = new Date(selectedYear, selectedMonth - 1, date)
    return days[dayDate.getDay()]
  }

  // Function to get month name
  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[monthNum - 1]
  }

  // Get schedule data for a specific date from JSON
  const getScheduleForDate = (date) => {
    return timetableData.dailySchedules[date.toString()] || []
  }

  const handleQuickAction = (action) => {
    if (action.onClick.startsWith('/')) {
      window.location.href = action.onClick
    } else if (action.onClick === 'modal:addEvent') {
      alert('Add Event functionality coming soon!')
    } else if (action.onClick === 'modal:stats') {
      alert('Stats: 92% Attendance, 6 Courses, 24 Classes this week')
    }
  }

  return (
    <Layout>
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
            My Timetable
          </h2>
          <p style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}>
            {timetableData.semester.name} • {timetableData.semester.period}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "rgba(34,197,94,0.15)",
            color: "#22c55e",
            fontSize: "11px",
            fontWeight: "600",
            padding: "6px 12px",
            borderRadius: "20px",
            border: "1px solid rgba(34,197,94,0.2)",
          }}>
            {timetableData.semester.status.text}
          </div>
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
          }}>
            🔍 Search classes, rooms...
          </div>
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
            {timetableData.stats.map((stat, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "center",
                cursor: stat.onClick ? "pointer" : "default",
                transition: "all 0.25s ease",
              }} 
              onClick={stat.onClick ? () => window.location.href = stat.onClick : undefined}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)"
                e.target.style.boxShadow = "0 12px 32px rgba(0,0,0,0.4)"
                if (stat.onClick) {
                  e.target.style.borderColor = "rgba(96,239,255,0.2)"
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0px)"
                e.target.style.boxShadow = "none"
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
                  marginBottom: stat.sub ? "4px" : 0,
                }}>
                  {stat.label}
                </div>
                {stat.sub && (
                  <div style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: stat.color,
                  }}>
                    {stat.sub}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Calendar Card */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            marginBottom: "20px",
            overflow: "hidden",
          }}>
            {/* Calendar Header */}
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
                February 2025
              </h3>
              <div style={{
                display: "flex",
                gap: "4px",
                marginLeft: "16px",
              }}>
                <button style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  width: "28px", height: "28px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "12px",
                  transition: "all 0.2s ease",
                }} onMouseEnter={(e) => e.target.style.background = "rgba(96,239,255,0.2)"}
                   onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}>‹</button>
                <button style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  width: "28px", height: "28px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "12px",
                  transition: "all 0.2s ease",
                }} onMouseEnter={(e) => e.target.style.background = "rgba(96,239,255,0.2)"}
                   onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}>›</button>
              </div>
              <div style={{
                marginLeft: "auto",
                display: "flex",
                gap: "4px",
              }}>
                {['Month', 'Week', 'Day'].map((view) => (
                  <button key={view} onClick={() => setSelectedView(view.toLowerCase())} style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: selectedView === view.toLowerCase() ? "#60efff" : "rgba(255,255,255,0.1)",
                    color: selectedView === view.toLowerCase() ? "#0a0a12" : "#fff",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                  }}>
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Calendar Views */}
            {selectedView === 'week' && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "60px repeat(5, 1fr)",
                minHeight: "400px",
              }}>
                {/* Day Headers */}
                <div></div>
                {timetableData.weekDays.map((day, i) => (
                  <div key={day} style={{
                    textAlign: "center",
                    padding: "12px 4px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "11px",
                  }}>
                    <div style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "4px",
                    }}>
                      {day}
                    </div>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: timetableData.weekDates[i] === timetableData.currentDate.day ? "#60efff" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: timetableData.weekDates[i] === timetableData.currentDate.day ? "32px" : "auto",
                      height: timetableData.weekDates[i] === timetableData.currentDate.day ? "32px" : "auto",
                      borderRadius: timetableData.weekDates[i] === timetableData.currentDate.day ? "50%" : "0",
                      background: timetableData.weekDates[i] === timetableData.currentDate.day ? "rgba(96,239,255,0.2)" : "transparent",
                      margin: timetableData.weekDates[i] === timetableData.currentDate.day ? "0 auto" : 0,
                      border: timetableData.weekDates[i] === timetableData.currentDate.day ? "1px solid #60efff" : "none",
                    }}>
                      {timetableData.weekDates[i]}
                    </div>
                  </div>
                ))}

                {/* Interactive Time Slots */}
                {timetableData.weeklySchedule.map((slot, slotIndex) => (
                  <>
                    <div key={`time-${slotIndex}`} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "flex-end",
                      padding: "8px 12px 0 0",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.4)",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      height: "60px",
                    }}>
                      {slot.time}
                    </div>
                    {slot.classes.map((classItem, dayIndex) => (
                      <div key={`class-${slotIndex}-${dayIndex}`} style={{
                        borderLeft: "1px solid rgba(255,255,255,0.05)",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        height: "60px",
                        padding: "4px",
                        position: "relative",
                        cursor: classItem ? "pointer" : "default",
                      }}>
                        {classItem && (
                          <div 
                            onClick={() => handleTimeSlotClick({ ...classItem, time: slot.time, day: timetableData.weekDays[dayIndex] })}
                            style={{
                              borderRadius: "6px",
                              padding: "6px 8px",
                              fontSize: "10px",
                              fontWeight: "600",
                              height: "100%",
                              background: classItem.isRescheduled 
                                ? "rgba(251,146,60,0.2)" 
                                : classItem.name?.includes('Data') 
                                ? "rgba(96,239,255,0.2)" 
                                : classItem.name?.includes('Networks') 
                                ? "rgba(59,130,246,0.2)" 
                                : classItem.name?.includes('Digital') 
                                ? "rgba(251,146,60,0.2)" 
                                : classItem.name?.includes('Signals') 
                                ? "rgba(34,197,94,0.2)" 
                                : classItem.name?.includes('Math') 
                                ? "rgba(167,139,250,0.2)" 
                                : "rgba(236,72,153,0.2)",
                              color: classItem.isRescheduled 
                                ? "#fb923c" 
                                : classItem.name?.includes('Data') 
                                ? "#60efff" 
                                : classItem.name?.includes('Networks') 
                                ? "#3b82f6" 
                                : classItem.name?.includes('Digital') 
                                ? "#fb923c" 
                                : classItem.name?.includes('Signals') 
                                ? "#22c55e" 
                                : classItem.name?.includes('Math') 
                                ? "#a78bfa" 
                                : "#ec4899",
                              border: classItem.isRescheduled ? "1px dashed #fb923c" : "1px solid rgba(255,255,255,0.1)",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "scale(1.02)"
                              e.target.style.filter = "brightness(1.1)"
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)"
                              e.target.style.filter = "brightness(1)"
                            }}
                          >
                            <div style={{ fontWeight: "700", fontSize: "11px" }}>
                              {classItem.name}
                            </div>
                            {!classItem.isRescheduled && (
                              <div style={{
                                fontWeight: "400",
                                marginTop: "2px",
                                opacity: 0.8,
                                fontSize: "9px",
                              }}>
                                {classItem.location} · {classItem.professor}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            )}

            {/* Month View */}
            {selectedView === 'month' && (
              <div style={{ minHeight: "400px", padding: "16px" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "1px",
                  marginBottom: "16px",
                }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{
                      textAlign: "center",
                      padding: "12px 4px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                      {day}
                    </div>
                  ))}
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "1px",
                  background: "rgba(255,255,255,0.05)",
                }}>
                  {Array.from({ length: 42 }, (_, i) => {
                    const dayNum = i - 6; // Adjust for month start
                    const isCurrentMonth = dayNum >= 1 && dayNum <= 31;
                    const isToday = dayNum === timetableData.currentDate.day;
                    const isSelected = dayNum === selectedDate;
                    const hasClass = timetableData.calendar.monthDaysWithClasses.includes(dayNum);
                    
                    return (
                      <div key={i} 
                        onClick={() => isCurrentMonth && handleDateClick(dayNum)}
                        style={{
                          minHeight: "60px",
                          padding: "4px",
                          background: isSelected ? "rgba(96,239,255,0.1)" : "rgba(255,255,255,0.02)",
                          border: isSelected ? "1px solid #60efff" : "1px solid rgba(255,255,255,0.05)",
                          position: "relative",
                          cursor: isCurrentMonth ? "pointer" : "default",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (isCurrentMonth) {
                            e.target.style.background = "rgba(96,239,255,0.05)"
                            e.target.style.borderColor = "rgba(96,239,255,0.3)"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isCurrentMonth) {
                            e.target.style.background = isSelected ? "rgba(96,239,255,0.1)" : "rgba(255,255,255,0.02)"
                            e.target.style.borderColor = isSelected ? "#60efff" : "rgba(255,255,255,0.05)"
                          }
                        }}>
                        {isCurrentMonth && (
                          <>
                            <div style={{
                              fontSize: "12px",
                              fontWeight: (isToday || isSelected) ? "700" : "500",
                              color: (isToday || isSelected) ? "#60efff" : "rgba(255,255,255,0.8)",
                              marginBottom: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: (isToday || isSelected) ? "20px" : "auto",
                              height: (isToday || isSelected) ? "20px" : "auto",
                              borderRadius: (isToday || isSelected) ? "50%" : "0",
                              background: (isToday || isSelected) ? "rgba(96,239,255,0.2)" : "transparent",
                              border: (isToday || isSelected) ? "1px solid #60efff" : "none",
                            }}>
                              {dayNum}
                            </div>
                            {hasClass && (
                              <div style={{
                                position: "absolute",
                                bottom: "4px",
                                left: "4px",
                                right: "4px",
                                height: "3px",
                                background: "linear-gradient(90deg, #60efff, #9333ea)",
                                borderRadius: "2px",
                              }} />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Day View */}
            {selectedView === 'day' && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                minHeight: "400px",
              }}>
                <div style={{
                  borderRight: "1px solid rgba(255,255,255,0.1)",
                  padding: "16px 12px",
                  textAlign: "center",
                }}>
                  <div style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px",
                  }}>
                    {getDayName(selectedDate)}
                  </div>
                  <div style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#60efff",
                    marginBottom: "4px",
                  }}>
                    {selectedDate}
                  </div>
                  <div style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.4)",
                  }}>
                    {getMonthName(selectedMonth)} {selectedYear}
                  </div>
                </div>
                
                <div style={{ position: "relative" }}>
                  {(() => {
                    const selectedDateSchedule = getScheduleForDate(selectedDate)
                    
                    // If no classes for this date, show empty state
                    if (selectedDateSchedule.length === 0) {
                      return (
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: "300px",
                          color: "rgba(255,255,255,0.4)",
                          textAlign: "center",
                        }}>
                          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
                          <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
                            No Classes Scheduled
                          </div>
                          <div style={{ fontSize: "12px" }}>
                            You have no classes on {getDayName(selectedDate)}, {getMonthName(selectedMonth)} {selectedDate}
                          </div>
                        </div>
                      )
                    }
                    
                    return timetableData.calendar.timeSlots.map((time, i) => {
                      const classForTime = selectedDateSchedule.find(item => item.time === time)
                      const slot = { time, class: classForTime?.class || null }
                      return (
                    <div key={i} style={{
                      display: "flex",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      minHeight: "60px",
                    }}>
                      <div style={{
                        width: "80px",
                        padding: "12px 16px",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.4)",
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "flex-start",
                      }}>
                        {slot.time}
                      </div>
                      <div style={{
                        flex: 1,
                        padding: "8px 16px",
                        position: "relative",
                        cursor: slot.class ? "pointer" : "default",
                      }}>
                        {slot.class && (
                          <div 
                            onClick={() => handleTimeSlotClick({ ...slot.class, time: slot.time, day: getShortDayName(selectedDate) })}
                            style={{
                              borderRadius: "8px",
                              padding: "12px 16px",
                              background: slot.class.isRescheduled 
                                ? "rgba(251,146,60,0.15)" 
                                : slot.class.name?.includes('Data') 
                                ? "rgba(96,239,255,0.15)" 
                                : slot.class.name?.includes('Math') 
                                ? "rgba(167,139,250,0.15)" 
                                : "rgba(34,197,94,0.15)",
                              color: slot.class.isRescheduled 
                                ? "#fb923c" 
                                : slot.class.name?.includes('Data') 
                                ? "#60efff" 
                                : slot.class.name?.includes('Math') 
                                ? "#a78bfa" 
                                : "#22c55e",
                              border: slot.class.isRescheduled ? "1px dashed #fb923c" : "1px solid rgba(255,255,255,0.1)",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "scale(1.01)"
                              e.target.style.filter = "brightness(1.1)"
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)"
                              e.target.style.filter = "brightness(1)"
                            }}
                          >
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "4px",
                            }}>
                              <div style={{ fontWeight: "700", fontSize: "14px" }}>
                                {slot.class.name}
                              </div>
                              {!slot.class.isRescheduled && (
                                <div style={{
                                  fontSize: "10px",
                                  opacity: 0.7,
                                }}>
                                  {slot.class.duration}
                                </div>
                              )}
                            </div>
                            {!slot.class.isRescheduled && (
                              <div style={{
                                fontSize: "11px",
                                opacity: 0.8,
                              }}>
                                📍 {slot.class.location} • 👨‍🏫 {slot.class.professor}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    )
                  })
                })()}
                </div>
              </div>
            )}
          </div>

          {/* Today's Classes */}
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
                fontSize: "14px",
                fontWeight: "700",
                color: "#fff",
                margin: 0,
              }}>
                Today's Classes — {timetableData.currentDate.dayName}, Feb {timetableData.currentDate.day}
              </h3>
              <button 
                onClick={() => setSelectedView('day')}
                style={{
                  marginLeft: "auto",
                  color: "#60efff",
                  fontSize: "12px",
                  fontWeight: "500",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => e.target.style.color = "#a78bfa"}
                onMouseLeave={(e) => e.target.style.color = "#60efff"}
              >
                View full day →
              </button>
            </div>

            {timetableData.todaysClasses.map((class_, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: i < timetableData.todaysClasses.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                gap: "16px",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
              onClick={() => handleTimeSlotClick({ name: class_.subject, time: class_.time })}
              >
                <div style={{ width: "70px", textAlign: "left" }}>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#fff",
                  }}>
                    {class_.time}
                  </div>
                  <div style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.4)",
                  }}>
                    {class_.duration}
                  </div>
                </div>
                <div style={{
                  width: "10px", height: "10px",
                  borderRadius: "50%",
                  background: class_.dotColor,
                  flexShrink: 0,
                  boxShadow: class_.isLive ? `0 0 0 3px rgba(34,197,94,0.2)` : "none",
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#fff",
                    marginBottom: "2px",
                  }}>
                    {class_.subject}
                  </div>
                  <div style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.4)",
                  }}>
                    {class_.location}
                  </div>
                </div>
                <div style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  background: class_.status === 'Done' ? "rgba(34,197,94,0.15)" 
                            : class_.status.includes('Live') ? "rgba(34,197,94,0.15)"
                            : "rgba(239,68,68,0.15)",
                  color: class_.statusColor,
                  border: `1px solid ${class_.statusColor}30`,
                }}>
                  {class_.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Quick Actions */}
        <div style={{
          width: "300px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
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
              Quick Actions
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {timetableData.quickActions.map((action, i) => (
                <button key={i} onClick={() => handleQuickAction(action)} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "12px 8px",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s ease",
                }} onMouseEnter={(e) => {
                  e.target.style.background = "rgba(96,239,255,0.1)";
                  e.target.style.borderColor = "rgba(96,239,255,0.2)";
                  e.target.style.transform = "translateY(-2px)";
                }} onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.05)";
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  e.target.style.transform = "translateY(0px)";
                }}>
                  <span style={{ fontSize: "16px" }}>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
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
              Upcoming This Week
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {timetableData.upcomingEvents.map((event, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${event.color}20`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }} onMouseEnter={(e) => {
                  e.target.style.background = `${event.color}10`;
                  e.target.style.borderColor = `${event.color}40`;
                }} onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.02)";
                  e.target.style.borderColor = `${event.color}20`;
                }}>
                  <div style={{
                    width: "8px", height: "8px",
                    borderRadius: "50%",
                    background: event.color,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#fff" }}>                                                                                                                                                           
                      {event.title}
                    </div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                      {event.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Class Details Modal */}
      {showClassDetails && selectedTimeSlot && (
        <div style={{                                                               
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }} onClick={() => setShowClassDetails(false)}>
          <div style={{    
            background: "rgba(15,23,42,0.95)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",                                     
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", margin: 0 }}>
                Class Details
              </h3>
              <button 
                onClick={() => setShowClassDetails(false)}
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
            <div style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
              <p><strong>Class:</strong> {selectedTimeSlot.name}</p>
              <p><strong>Time:</strong> {selectedTimeSlot.time}</p>
              <p><strong>Day:</strong> {selectedTimeSlot.day}</p>
              {selectedTimeSlot.location && <p><strong>Location:</strong> {selectedTimeSlot.location}</p>}
              {selectedTimeSlot.professor && <p><strong>Professor:</strong> {selectedTimeSlot.professor}</p>}
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
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
                Add Note
              </button>
              <button style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}>
                Set Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
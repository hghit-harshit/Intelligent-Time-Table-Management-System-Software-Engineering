import { useState, useEffect } from "react";
import { Card, Badge, Loader } from "../../../../shared";
import { fetchLatestTimetable } from "../../../../features/admin/services";
import { colors, fonts, radius } from "../../../../styles/tokens";
import { Search, X } from "lucide-react";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timeToMinutes = (time = "00:00") => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function TimetablePreview() {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLatestTimetable()
      .then((data) => {
        console.log("Latest timetable data:", data);
        setTimetable(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching timetable:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const openModal = (courses, day, time) => {
    setModalData({ courses, day, time });
    setSearchQuery("");
  };

  const closeModal = () => setModalData(null);

  const filteredCourses = modalData?.courses.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.courseCode?.toLowerCase().includes(query) ||
      c.courseName?.toLowerCase().includes(query) ||
      c.professorName?.toLowerCase().includes(query) ||
      c.batchId?.toLowerCase().includes(query) ||
      c.roomName?.toLowerCase().includes(query)
    );
  }) || [];

  if (loading) return <Card style={{ padding: "40px" }}><Loader /></Card>;

  if (error) {
    return (
      <Card style={{ padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: fonts.size.md, fontFamily: fonts.heading }}>
          Published Timetable
        </h3>
        <div style={{ 
          padding: "40px", 
          textAlign: "center", 
          color: colors.text.muted,
          background: colors.bg.base,
          borderRadius: radius.md 
        }}>
          <p style={{ margin: 0 }}>Error: {error}</p>
        </div>
      </Card>
    );
  }

  if (!timetable || !timetable.assignments || timetable.assignments.length === 0) {
    return (
      <Card style={{ padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: fonts.size.md, fontFamily: fonts.heading }}>
          Published Timetable
        </h3>
        <div style={{ 
          padding: "40px", 
          textAlign: "center", 
          color: colors.text.muted,
          background: colors.bg.base,
          borderRadius: radius.md 
        }}>
          <p style={{ margin: 0 }}>
            No published timetable yet. Go to Timetable Engine to generate and publish.
          </p>
        </div>
      </Card>
    );
  }

  const { assignments, version, publishedAt, status } = timetable;

  const previewDays = WEEK_DAYS.filter((day) => 
    assignments.some((item) => item.day === day)
  );

  // Group multiple courses by day and time slot
  const previewRows = [...new Set(assignments.map((item) => `${item.startTime}|${item.endTime}`))]
    .sort((a, b) => timeToMinutes(a.split("|")[0]) - timeToMinutes(b.split("|")[0]))
    .map((rangeKey) => {
      const [startTime, endTime] = rangeKey.split("|");
      return {
        key: rangeKey,
        timeLabel: `${startTime} - ${endTime}`,
        slotsByDay: Object.fromEntries(
          previewDays.map((day) => [
            day,
            assignments.filter(
              (item) =>
                item.day === day &&
                item.startTime === startTime &&
                item.endTime === endTime
            ), // Returns array of courses for this slot
          ])
        ),
      };
    });

  return (
    <Card style={{ padding: "20px" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "16px" 
      }}>
        <h3 style={{ margin: 0, fontSize: fonts.size.md, fontFamily: fonts.heading }}>
          Published Timetable — {version}
        </h3>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Badge variant="success">{status}</Badge>
          <span style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
            {assignments.length} classes
          </span>
        </div>
      </div>

      <div style={{ 
        fontSize: fonts.size.xs, 
        color: colors.text.muted, 
        marginBottom: "12px" 
      }}>
        {publishedAt ? `Published: ${new Date(publishedAt).toLocaleDateString()}` : ""}
      </div>

      <div style={{ 
        overflowX: "auto", 
        border: `1px solid ${colors.border.subtle}`, 
        borderRadius: radius.lg 
      }}>
        <table style={{ 
          width: "100%", 
          minWidth: "600px", 
          borderCollapse: "collapse", 
          fontSize: fonts.size.xs 
        }}>
          <thead>
            <tr>
              <th style={{ 
                padding: "10px 8px", 
                textAlign: "left", 
                color: colors.text.muted, 
                fontSize: fonts.size.xs,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderBottom: `1px solid ${colors.border.medium}`,
                width: "100px",
              }}>
                Time
              </th>
              {previewDays.map((day) => (
                <th key={day} style={{ 
                  padding: "10px 8px", 
                  textAlign: "center", 
                  color: colors.text.muted, 
                  fontSize: fonts.size.xs,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: `1px solid ${colors.border.medium}`,
                }}>
                  {day.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row) => (
              <tr key={row.key}>
                <td style={{ 
                  padding: "8px", 
                  color: colors.text.secondary, 
                  fontWeight: fonts.weight.semibold,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                }}>
                  {row.timeLabel}
                </td>
                {previewDays.map((day) => {
                  const slot = row.slotsByDay[day];
                  if (!slot) {
                    return (
                      <td key={day} style={{ 
                        padding: "8px", 
                        borderBottom: `1px solid ${colors.border.subtle}`,
                        textAlign: "center",
                        background: colors.bg.base,
                      }}>
                        <span style={{ color: colors.text.disabled }}>—</span>
                      </td>
                    );
                  }
                  // Check if it's an array (multiple courses) or single object
                  const courses = Array.isArray(slot) ? slot : (slot ? [slot] : []);
                  const courseCount = courses.length;
                  const firstCourse = courses[0];

                  if (courseCount === 0) {
                    return (
                      <td key={day} style={{ 
                        padding: "8px", 
                        borderBottom: `1px solid ${colors.border.subtle}`,
                        textAlign: "center",
                        background: colors.bg.base,
                      }}>
                        <span style={{ color: colors.text.disabled }}>—</span>
                      </td>
                    );
                  }

                  return (
                    <td 
                      key={day} 
                      style={{ 
                        padding: "6px", 
                        borderBottom: `1px solid ${colors.border.subtle}`,
                        background: colors.bg.base,
                        cursor: "pointer",
                      }}
                      onClick={() => openModal(courses, day, row.timeLabel)}
                      title={`${courseCount} course(s) - Click to view all`}
                    >
                      <div style={{ 
                        background: colors.bg.raised, 
                        border: `1px solid ${colors.primary.border}`, 
                        borderRadius: radius.sm, 
                        padding: "6px",
                      }}>
                        {courseCount > 1 ? (
                          <>
                            <div style={{ 
                              fontWeight: fonts.weight.semibold, 
                              color: colors.primary.main, 
                              fontSize: fonts.size.xs,
                              lineHeight: 1.2,
                            }}>
                              {firstCourse.courseCode} +{courseCount - 1}
                            </div>
                            <div style={{ 
                              color: colors.text.muted, 
                              fontSize: fonts.size.xs,
                              marginTop: "2px",
                            }}>
                              Multiple
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ 
                              fontWeight: fonts.weight.semibold, 
                              color: colors.primary.main, 
                              fontSize: fonts.size.xs,
                              lineHeight: 1.2,
                            }}>
                              {firstCourse.courseCode}
                            </div>
                            <div style={{ 
                              color: colors.text.muted, 
                              fontSize: fonts.size.xs,
                              marginTop: "2px",
                            }}>
                              {firstCourse.professorName?.split(" ")[0] || ""}
                            </div>
                            {firstCourse.roomName && firstCourse.roomName !== "UNASSIGNED" && (
                              <div style={{ 
                                color: colors.text.muted, 
                                fontSize: fonts.size.xs,
                              }}>
                                {firstCourse.roomName}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing all courses in a timeslot */}
      {modalData && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }} onClick={closeModal}>
          <div style={{
            background: colors.bg.raised,
            borderRadius: radius.lg,
            padding: "24px",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: fonts.size.lg, fontFamily: fonts.heading }}>
                  {modalData.day} - {modalData.time}
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: fonts.size.xs, color: colors.text.muted }}>
                  {modalData.courses.length} course(s)
                </p>
              </div>
              <button 
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                }}
              >
                <X size={20} style={{ color: colors.text.muted }} />
              </button>
            </div>

            {/* Search input */}
            <div style={{ 
              position: "relative", 
              marginBottom: "16px" 
            }}>
              <Search 
                size={16} 
                style={{ 
                  position: "absolute", 
                  left: "12px", 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  color: colors.text.muted,
                }} 
              />
              <input
                type="text"
                placeholder="Search by course code, name, professor, batch, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: radius.md,
                  fontSize: fonts.size.sm,
                  fontFamily: fonts.body,
                  background: colors.bg.base,
                  color: colors.text.primary,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Course list */}
            <div style={{ 
              flex: 1, 
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}>
              {filteredCourses.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "40px",
                  color: colors.text.muted,
                }}>
                  No courses match your search.
                </div>
              ) : (
                filteredCourses.map((course, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: colors.bg.base,
                      border: `1px solid ${colors.border.subtle}`,
                      borderRadius: radius.md,
                      padding: "12px",
                    }}
                  >
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}>
                      <div>
                        <span style={{ 
                          fontWeight: fonts.weight.bold, 
                          color: colors.primary.main,
                          fontSize: fonts.size.sm,
                        }}>
                          {course.courseCode}
                        </span>
                        <span style={{ 
                          marginLeft: "8px",
                          fontSize: fonts.size.xs,
                          color: colors.text.muted,
                        }}>
                          {course.courseName}
                        </span>
                      </div>
                      {course.classroomConstraintViolation && (
                        <Badge variant="danger" style={{ fontSize: fonts.size.xs }}>
                          Violation
                        </Badge>
                      )}
                    </div>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(2, 1fr)", 
                      gap: "8px",
                      fontSize: fonts.size.xs,
                    }}>
                      <div>
                        <span style={{ color: colors.text.muted }}>Professor: </span>
                        <span style={{ color: colors.text.primary }}>{course.professorName}</span>
                      </div>
                      <div>
                        <span style={{ color: colors.text.muted }}>Batch: </span>
                        <span style={{ color: colors.text.primary }}>{course.batchId || "—"}</span>
                      </div>
                      <div>
                        <span style={{ color: colors.text.muted }}>Room: </span>
                        <span style={{ 
                          color: course.roomName === "UNASSIGNED" ? colors.danger.main : colors.text.primary 
                        }}>
                          {course.roomName || "—"}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: colors.text.muted }}>Students: </span>
                        <span style={{ color: colors.text.primary }}>{course.students || "—"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
import { useEffect, useState } from "react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
/* WHY: Import shared components to replace duplicated top-bar and stats grid */
import { SubPageHeader, StatsGrid } from "../../../shared";
import { fetchStudentExams } from "../../../services/studentApi";

export default function ExamSchedule() {
  const [selectedExam, setSelectedExam] = useState(null);
  const [filterSubject, setFilterSubject] = useState("all");
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const card = {
    background: colors.bg.base,
    border: `1px solid ${colors.border.medium}`,
    borderRadius: radius.lg,
    boxShadow: shadows.sm,
  };
  const cardInner = {
    background: colors.bg.raised,
    border: `1px solid ${colors.border.subtle}`,
    borderRadius: radius.md,
  };
  const heading = {
    fontFamily: fonts.heading,
    fontWeight: fonts.weight.semibold,
    color: colors.text.primary,
  };
  const muted = { fontSize: fonts.size.sm, color: colors.text.secondary };
  const caption = { fontSize: fonts.size.xs, color: colors.text.muted };
  const btn = {
    background: colors.primary.main,
    border: "none",
    borderRadius: radius.md,
    padding: "8px 16px",
    color: "#fff",
    fontSize: fonts.size.sm,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: fonts.body,
  };
  const btnGhost = {
    background: colors.bg.raised,
    border: `1px solid ${colors.border.medium}`,
    borderRadius: radius.md,
    padding: "8px 16px",
    color: colors.text.primary,
    fontSize: fonts.size.sm,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: fonts.body,
  };

  const toMinutes = (value) => {
    if (!value) return null;
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const formatTime = (value) => {
    if (!value) return "";
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  const formatDuration = (startTime, endTime) => {
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    if (!start || !end || end <= start) return "";
    const minutes = end - start;
    if (minutes % 60 === 0) {
      const hours = minutes / 60;
      return `${hours} hour${hours === 1 ? "" : "s"}`;
    }
    return `${minutes} min`;
  };

  const normalizeExam = (exam) => {
    const examDate = exam.examDate ? new Date(exam.examDate) : exam.date ? new Date(exam.date) : null;
    const hasDate = examDate && !Number.isNaN(examDate.getTime());
    const daysLeft = hasDate
      ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;
    const status = exam.status === "completed" || (hasDate && examDate < new Date())
      ? "completed"
      : "upcoming";

    const timeRange = exam.time ||
      (exam.startTime && exam.endTime
        ? `${formatTime(exam.startTime)} - ${formatTime(exam.endTime)}`
        : "TBD");

    const durationLabel = exam.duration || formatDuration(exam.startTime, exam.endTime);

    const dateLabel = hasDate
      ? examDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "TBD";
    const dateParts = dateLabel.split(" ");
    const dateMonth = dateParts[0] || "TBD";
    const dateDay = dateParts[1] ? dateParts[1].replace(",", "") : "";

    return {
      id: exam.id || exam._id,
      subject: exam.subject || exam.courseName || exam.courseCode || "Untitled",
      date: dateLabel,
      dateMonth,
      dateDay,
      time: timeRange,
      duration: durationLabel || "",
      location: exam.location || "",
      room: exam.room || "",
      invigilator: exam.invigilator || "",
      syllabus: exam.syllabus || [],
      status,
      daysLeft,
      score: exam.score || "",
      grade: exam.grade || "",
      color: status === "completed"
        ? colors.success.main
        : daysLeft <= 10
          ? colors.error.main
          : colors.warning.main,
    };
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    fetchStudentExams()
      .then((data) => {
        if (!isMounted) return;
        const normalized = (data || []).map((exam) => normalizeExam(exam));
        setExams(normalized);
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error?.message || "Unable to load exam schedule");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const upcomingExams = exams.filter((e) => e.status === "upcoming");
  const completedExams = exams.filter((e) => e.status === "completed");
  const nextExamDays = upcomingExams.length
    ? Math.min(...upcomingExams.map((e) => e.daysLeft))
    : 0;

  return (
    <>
      {/* WHY: Replaced duplicated accent-bar header with shared SubPageHeader */}
      <SubPageHeader
        title="Exam Schedule"
        subtitle={`${upcomingExams.length} upcoming · Next in ${nextExamDays || "N/A"} days`}
        accentColor={colors.error.main}
        actions={
          <>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              style={{
                ...cardInner,
                padding: "6px 12px",
                color: colors.text.primary,
                fontSize: fonts.size.sm,
                cursor: "pointer",
                fontFamily: fonts.body,
              }}
            >
              <option value="all">All Subjects</option>
              <option value="digital">Digital Circuits</option>
              <option value="math">Mathematics</option>
              <option value="data">Data Structures</option>
              <option value="signals">Signals & Systems</option>
            </select>
            <button style={btn}>Download Schedule</button>
          </>
        }
      />

      {loading && (
        <div
          style={{
            margin: "0 12px",
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(59, 130, 246, 0.1)",
            color: "#3b82f6",
            fontSize: "12px",
          }}
        >
          Loading exam schedule...
        </div>
      )}

      {loadError && (
        <div
          style={{
            margin: "0 12px",
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            fontSize: "12px",
          }}
        >
          {loadError}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          margin: "12px",
          gap: "12px",
          overflow: "hidden",
        }}
      >
        {/* Main Panel */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
          {/* WHY: Replaced inline 4-column stat grid with shared StatsGrid */}
          <StatsGrid
            stats={[
              {
                num: upcomingExams.length.toString(),
                label: "Upcoming Exams",
                color: colors.error.main,
              },
              {
                num: completedExams.length.toString(),
                label: "Completed",
                color: colors.success.main,
              },
              {
                num: upcomingExams.length ? `${nextExamDays} days` : "N/A",
                label: "Next Exam",
                color: colors.warning.main,
              },
              {
                num: "85%",
                label: "Average Score",
                color: colors.primary.main,
              },
            ]}
          />

          {/* Upcoming Exams */}
          <div style={{ ...card, marginBottom: "12px", overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 16px",
                borderBottom: `1px solid ${colors.border.medium}`,
              }}
            >
              <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>
                Upcoming Exams
              </h3>
              <span
                style={{
                  marginLeft: "auto",
                  background: colors.error.ghost,
                  color: colors.error.main,
                  fontSize: fonts.size.xs,
                  fontWeight: 500,
                  padding: "3px 10px",
                  borderRadius: radius.sm,
                }}
              >
                {upcomingExams.length} pending
              </span>
            </div>
            {upcomingExams.map((exam, i) => (
              <div
                key={exam.id}
                onClick={() => setSelectedExam(exam)}
                style={{
                  padding: "10px 16px",
                  borderBottom:
                    i < upcomingExams.length - 1
                      ? `1px solid ${colors.border.subtle}`
                      : "none",
                  cursor: "pointer",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = colors.bg.raised)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                  }}
                >
                  <div style={{ textAlign: "center", minWidth: "50px" }}>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: exam.color,
                        fontVariantNumeric: "tabular-nums",
                        fontFamily: fonts.heading,
                      }}
                    >
                      {exam.dateDay || "--"}
                    </div>
                    <div style={caption}>{exam.dateMonth}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: fonts.size.base,
                        fontWeight: 500,
                        color: colors.text.primary,
                        marginBottom: "4px",
                      }}
                    >
                      {exam.subject}
                    </div>
                    <div style={{ ...muted, marginBottom: "4px" }}>
                      {exam.location} · {exam.time}
                    </div>
                    <div style={caption}>
                      Duration: {exam.duration} · Seat: {exam.room}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        padding: "3px 10px",
                        borderRadius: radius.sm,
                        fontSize: fonts.size.xs,
                        fontWeight: 500,
                        background:
                          exam.daysLeft <= 10
                            ? colors.error.ghost
                            : colors.warning.ghost,
                        color:
                          exam.daysLeft <= 10
                            ? colors.error.main
                            : colors.warning.main,
                      }}
                    >
                      {exam.daysLeft} days
                    </div>
                    <div style={caption}>Click for details</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Completed Exams */}
          {completedExams.length > 0 && (
            <div style={{ ...card, overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderBottom: `1px solid ${colors.border.medium}`,
                }}
              >
                <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>
                  Completed Exams
                </h3>
                <span
                  style={{
                    marginLeft: "auto",
                    background: colors.success.ghost,
                    color: colors.success.main,
                    fontSize: fonts.size.xs,
                    fontWeight: 500,
                    padding: "3px 10px",
                    borderRadius: radius.sm,
                  }}
                >
                  Completed
                </span>
              </div>
              {completedExams.map((exam, i) => (
                <div
                  key={exam.id}
                  onClick={() => setSelectedExam(exam)}
                  style={{
                    padding: "10px 16px",
                    borderBottom:
                      i < completedExams.length - 1
                        ? `1px solid ${colors.border.subtle}`
                        : "none",
                    cursor: "pointer",
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = colors.bg.raised)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: colors.success.main,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: fonts.size.base,
                          fontWeight: 500,
                          color: colors.text.primary,
                          marginBottom: "2px",
                        }}
                      >
                        {exam.subject}
                      </div>
                      <div style={caption}>
                        {exam.date} · {exam.location}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: colors.success.main,
                          fontFamily: fonts.heading,
                        }}
                      >
                        {exam.score}
                      </div>
                      <div style={caption}>Grade: {exam.grade}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div
          style={{
            width: "260px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Study Suggestions */}
          <div style={{ ...card, padding: "12px" }}>
            <h4
              style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}
            >
              Study Suggestions
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {upcomingExams.slice(0, 2).map((exam, i) => (
                <div key={i} style={{ ...cardInner, padding: "10px 12px" }}>
                  <div
                    style={{
                      fontSize: fonts.size.sm,
                      fontWeight: 500,
                      color: exam.color,
                      marginBottom: "4px",
                    }}
                  >
                    {exam.subject}
                  </div>
                  <div style={muted}>Suggested: 2-3 hours daily</div>
                  <div style={caption}>
                    Focus: {exam.syllabus?.[0]}, {exam.syllabus?.[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Preparation */}
          <div style={{ ...card, padding: "12px" }}>
            <h4
              style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}
            >
              Exam Preparation
            </h4>
            <div style={{ display: "grid", gap: "8px" }}>
              {[
                {
                  label: "Study Materials",
                  onClick: () => alert("Opening study resources..."),
                },
                {
                  label: "Practice Tests",
                  onClick: () => alert("Loading practice questions..."),
                },
                {
                  label: "Study Timer",
                  onClick: () => alert("Starting study timer..."),
                },
                {
                  label: "Exam Locations",
                  onClick: () => alert("Showing exam hall locations..."),
                },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  style={{
                    ...cardInner,
                    padding: "10px 12px",
                    color: colors.text.secondary,
                    fontSize: fonts.size.sm,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    textAlign: "left",
                    transition: "background 0.1s ease",
                    fontFamily: fonts.body,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.primary.ghost;
                    e.currentTarget.style.color = colors.primary.main;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.bg.raised;
                    e.currentTarget.style.color = colors.text.secondary;
                  }}
                >
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exam Tips */}
          <div style={{ ...card, padding: "12px", flex: 1 }}>
            <h4
              style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}
            >
              Exam Day Tips
            </h4>
            <div
              style={{
                fontSize: fonts.size.sm,
                color: colors.text.secondary,
                lineHeight: 1.6,
              }}
            >
              <p style={{ margin: "0 0 4px" }}>Arrive 30 minutes early</p>
              <p style={{ margin: "0 0 4px" }}>
                Bring valid ID and hall ticket
              </p>
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedExam(null)}
        >
          <div
            style={{
              background: colors.bg.base,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: radius.xl,
              maxWidth: "460px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              overflow: "hidden",
              boxShadow: shadows.xl,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${colors.border.subtle}`,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 32,
                  borderRadius: "2px",
                  background: selectedExam.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ ...heading, fontSize: "15px", margin: 0 }}>
                  {selectedExam.subject}
                </h3>
                <p style={{ ...caption, margin: "2px 0 0" }}>
                  {selectedExam.status === "completed"
                    ? "Completed"
                    : `${selectedExam.daysLeft} days remaining`}
                </p>
              </div>
              <button
                onClick={() => setSelectedExam(null)}
                style={{
                  background: colors.bg.raised,
                  border: `1px solid ${colors.border.subtle}`,
                  width: "28px",
                  height: "28px",
                  borderRadius: radius.md,
                  color: colors.text.secondary,
                  fontSize: "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.1s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = colors.border.medium)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = colors.bg.raised)
                }
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "16px 20px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                {[
                  { label: "Date", value: selectedExam.date },
                  { label: "Time", value: selectedExam.time },
                  { label: "Location", value: selectedExam.location },
                  { label: "Seat", value: selectedExam.room },
                  { label: "Invigilator", value: selectedExam.invigilator },
                  { label: "Duration", value: selectedExam.duration },
                ].map((item, i) => (
                  <div key={i} style={{ ...cardInner, padding: "10px 12px" }}>
                    <div
                      style={{
                        fontSize: fonts.size.xs,
                        color: colors.text.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "4px",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: colors.text.primary,
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {selectedExam.score && (
                <div
                  style={{
                    ...cardInner,
                    padding: "10px 12px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: fonts.size.xs,
                        color: colors.text.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "4px",
                      }}
                    >
                      Score
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: colors.text.primary,
                      }}
                    >
                      {selectedExam.score}
                    </div>
                  </div>
                  <div
                    style={{
                      background: colors.success.ghost,
                      color: colors.success.main,
                      fontSize: fonts.size.sm,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: radius.sm,
                    }}
                  >
                    Grade {selectedExam.grade}
                  </div>
                </div>
              )}

              {/* Syllabus */}
              <div>
                <div
                  style={{
                    fontSize: fonts.size.xs,
                    color: colors.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Syllabus Coverage
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedExam.syllabus?.map((topic, i) => (
                    <span
                      key={i}
                      style={{
                        ...cardInner,
                        padding: "5px 10px",
                        fontSize: fonts.size.sm,
                        color: colors.text.secondary,
                        fontWeight: 400,
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            {selectedExam.status === "upcoming" && (
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: `1px solid ${colors.border.subtle}`,
                  display: "flex",
                  gap: "8px",
                }}
              >
                <button
                  style={{
                    ...btn,
                    flex: 1,
                    background: selectedExam.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  Study Plan
                </button>
                <button
                  style={{
                    ...btnGhost,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  Reminder
                </button>
                <button
                  style={{
                    ...btnGhost,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  Location
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

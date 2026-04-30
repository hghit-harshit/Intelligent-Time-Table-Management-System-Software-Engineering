// @ts-nocheck
/**
 * MyCourses — Faculty page listing all courses taught by the logged-in professor.
 * Each course card is expandable to reveal schedule slots, classroom, and enrolled students.
 * Data comes from the published timetable (same source as the dashboard).
 */
import { useState, useEffect, useMemo } from "react";
import { Card, Badge, Loader, PageHeader } from "../../../shared";
import { useUser } from "../../../contexts/UserContext";
import { fetchTimetableLatest } from "../../../services/facultyApi";
import { httpClient } from "../../../services/httpClient";
import { colors, fonts, radius, shadows, transitions } from "../../../styles/tokens";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Users,
  GraduationCap,
  Calendar,
} from "lucide-react";

/* ── Name normaliser (same as FacultyDashboard) ─────────────── */
const normalizeName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/^dr\.?\s+/, "")
    .trim();

/* ── Day ordering ────────────────────────────────────────────── */
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const sortByDay = (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);

/* ── Course‑colour palette ───────────────────────────────────── */
const COURSE_COLORS = [
  { bg: "rgba(30, 58, 95, 0.07)", border: "rgba(30, 58, 95, 0.25)", text: "#1E3A5F" },
  { bg: "rgba(109, 40, 217, 0.06)", border: "rgba(109, 40, 217, 0.20)", text: "#6D28D9" },
  { bg: "rgba(22, 163, 74, 0.06)", border: "rgba(22, 163, 74, 0.20)", text: "#16A34A" },
  { bg: "rgba(217, 119, 6, 0.06)", border: "rgba(217, 119, 6, 0.20)", text: "#D97706" },
  { bg: "rgba(37, 99, 235, 0.06)", border: "rgba(37, 99, 235, 0.20)", text: "#2563EB" },
  { bg: "rgba(220, 38, 38, 0.06)", border: "rgba(220, 38, 38, 0.15)", text: "#DC2626" },
];

export default function MyCourses() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [enrollments, setEnrollments] = useState({});
  const [loadingEnrollments, setLoadingEnrollments] = useState({});

  /* ── Fetch timetable and extract my courses ──────────────── */
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const timetable = await fetchTimetableLatest();
        const assignments = Array.isArray(timetable?.assignments)
          ? timetable.assignments
          : [];

        const facultyName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        const target = normalizeName(facultyName);

        // Filter assignments belonging to this professor
        const myAssignments = assignments.filter((a) => {
          const name = normalizeName(a.professorName || "");
          return name && (name.includes(target) || target.includes(name));
        });

        // Group by course code
        const courseMap = {};
        for (const a of myAssignments) {
          const key = a.courseCode || a.courseName;
          if (!courseMap[key]) {
            courseMap[key] = {
              id: key,
              code: a.courseCode || "—",
              name: a.courseName || "—",
              department: a.courseDepartment || "—",
              students: a.students || 0,
              batchId: a.batchId || "—",
              slots: [],
            };
          }
          courseMap[key].slots.push({
            day: a.day,
            startTime: a.startTime,
            endTime: a.endTime,
            room: a.roomName || "TBA",
            slotLabel: a.slotLabel || "",
          });
        }

        // Sort slots within each course
        const courseList = Object.values(courseMap).map((c) => ({
          ...c,
          slots: c.slots.sort(sortByDay),
          sessionsPerWeek: c.slots.length,
        }));

        setCourses(courseList);
      } catch (err) {
        console.error("Error loading courses:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  /* ── Lazy‑load enrolled students when a card is expanded ─── */
  const fetchEnrolledStudents = async (courseCode) => {
    if (enrollments[courseCode]) return;
    setLoadingEnrollments((prev) => ({ ...prev, [courseCode]: true }));
    try {
      // Try to fetch enrollments for this course's batch
      const course = courses.find((c) => c.code === courseCode);
      if (course && course.batchId && course.batchId !== "—") {
        const data = await httpClient.get(
          `/student/enrollments?batchId=${encodeURIComponent(course.batchId)}`
        );
        const list = Array.isArray(data) ? data : data?.data || [];
        setEnrollments((prev) => ({ ...prev, [courseCode]: list }));
      } else {
        setEnrollments((prev) => ({ ...prev, [courseCode]: [] }));
      }
    } catch {
      setEnrollments((prev) => ({ ...prev, [courseCode]: [] }));
    } finally {
      setLoadingEnrollments((prev) => ({ ...prev, [courseCode]: false }));
    }
  };

  const handleToggle = (courseId, courseCode) => {
    const isExpanding = expandedId !== courseId;
    setExpandedId(isExpanding ? courseId : null);
    if (isExpanding) fetchEnrolledStudents(courseCode);
  };

  /* ── Stats ─────────────────────────────────────────────────── */
  const totalSessions = useMemo(
    () => courses.reduce((sum, c) => sum + c.sessionsPerWeek, 0),
    [courses]
  );

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader
        title="My Courses"
        subtitle={`${courses.length} courses • ${totalSessions} sessions per week`}
      />

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {[
          {
            icon: <BookOpen size={18} />,
            label: "Courses",
            value: courses.length,
            color: "#1E3A5F",
          },
          {
            icon: <Calendar size={18} />,
            label: "Weekly Sessions",
            value: totalSessions,
            color: "#6D28D9",
          },
          {
            icon: <Users size={18} />,
            label: "Total Students",
            value: courses.reduce((s, c) => s + (c.students || 0), 0),
            color: "#16A34A",
          },
        ].map((stat) => (
          <Card key={stat.label} style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radius.md,
                  background: `${stat.color}0F`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: fonts.size["2xl"],
                    fontWeight: fonts.weight.bold,
                    color: colors.text.primary,
                    fontFamily: fonts.heading,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: fonts.size.xs,
                    color: colors.text.muted,
                    marginTop: 2,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Course list */}
      {courses.length === 0 && (
        <Card style={{ padding: "48px", textAlign: "center" }}>
          <BookOpen size={32} style={{ color: colors.text.disabled, marginBottom: 8 }} />
          <div
            style={{
              color: colors.text.muted,
              fontSize: fonts.size.base,
            }}
          >
            No courses assigned yet. Your courses will appear here once a timetable is published.
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {courses.map((course, idx) => {
          const palette = COURSE_COLORS[idx % COURSE_COLORS.length];
          const isExpanded = expandedId === course.id;

          return (
            <Card
              key={course.id}
              hover={false}
              style={{
                padding: 0,
                overflow: "hidden",
                borderLeft: `3px solid ${palette.border}`,
              }}
            >
              {/* Header — always visible */}
              <div
                style={{
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  cursor: "pointer",
                  transition: transitions.fast,
                  background: isExpanded ? palette.bg : "transparent",
                }}
                onClick={() => handleToggle(course.id, course.code)}
              >
                {/* Course icon */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: radius.lg,
                    background: palette.bg,
                    border: `1px solid ${palette.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: palette.text,
                    fontWeight: fonts.weight.bold,
                    fontSize: fonts.size.md,
                    flexShrink: 0,
                  }}
                >
                  {course.code.replace(/[^A-Z]/g, "").slice(0, 2)}
                </div>

                {/* Course title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: fonts.weight.semibold,
                        color: colors.text.primary,
                        fontSize: fonts.size.base,
                      }}
                    >
                      {course.name}
                    </span>
                    <Badge variant="purple">{course.code}</Badge>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      fontSize: fonts.size.xs,
                      color: colors.text.muted,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Clock size={11} /> {course.sessionsPerWeek} sessions/week
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Users size={11} /> {course.students} students
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <GraduationCap size={11} /> {course.department}
                    </span>
                    {course.batchId !== "—" && (
                      <Badge variant="neutral">{course.batchId}</Badge>
                    )}
                  </div>
                </div>

                {/* Expand toggle */}
                <div
                  style={{
                    color: colors.text.muted,
                    transition: transitions.smooth,
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                  }}
                >
                  <ChevronDown size={18} />
                </div>
              </div>

              {/* Expanded section */}
              {isExpanded && (
                <div
                  style={{
                    padding: "0 18px 18px",
                    borderTop: `1px solid ${colors.border.subtle}`,
                    animation: "fadeIn 0.2s ease both",
                  }}
                >
                  {/* Schedule grid */}
                  <div style={{ marginTop: 14, marginBottom: 16 }}>
                    <h4
                      style={{
                        margin: "0 0 10px",
                        fontSize: fonts.size.sm,
                        fontWeight: fonts.weight.bold,
                        color: colors.text.primary,
                        fontFamily: fonts.heading,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Calendar size={14} /> Weekly Schedule
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: "8px",
                      }}
                    >
                      {course.slots.map((slot, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "10px 12px",
                            borderRadius: radius.md,
                            background: palette.bg,
                            border: `1px solid ${palette.border}`,
                          }}
                        >
                          <div
                            style={{
                              fontWeight: fonts.weight.semibold,
                              fontSize: fonts.size.sm,
                              color: palette.text,
                              marginBottom: 4,
                            }}
                          >
                            {slot.day}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: fonts.size.xs,
                              color: colors.text.secondary,
                            }}
                          >
                            <Clock size={10} />
                            {slot.startTime} – {slot.endTime}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: fonts.size.xs,
                              color: colors.text.muted,
                              marginTop: 2,
                            }}
                          >
                            <MapPin size={10} />
                            {slot.room}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enrolled students */}
                  <div>
                    <h4
                      style={{
                        margin: "0 0 10px",
                        fontSize: fonts.size.sm,
                        fontWeight: fonts.weight.bold,
                        color: colors.text.primary,
                        fontFamily: fonts.heading,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Users size={14} /> Enrolled Students
                      <span
                        style={{
                          fontWeight: fonts.weight.regular,
                          color: colors.text.muted,
                          fontSize: fonts.size.xs,
                        }}
                      >
                        ({course.students} total)
                      </span>
                    </h4>

                    {loadingEnrollments[course.code] ? (
                      <div
                        style={{
                          padding: "16px",
                          textAlign: "center",
                          color: colors.text.muted,
                          fontSize: fonts.size.sm,
                        }}
                      >
                        Loading students...
                      </div>
                    ) : enrollments[course.code]?.length > 0 ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: "6px",
                        }}
                      >
                        {enrollments[course.code].map((student, i) => (
                          <div
                            key={student._id || i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 10px",
                              borderRadius: radius.md,
                              background: colors.bg.raised,
                              fontSize: fonts.size.xs,
                            }}
                          >
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: radius.full,
                                background: `${palette.text}10`,
                                border: `1px solid ${palette.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: palette.text,
                                fontWeight: fonts.weight.bold,
                                fontSize: "10px",
                                flexShrink: 0,
                              }}
                            >
                              {(student.firstName || "S")[0]}
                              {(student.lastName || "")[0]}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: fonts.weight.medium,
                                  color: colors.text.primary,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {student.firstName} {student.lastName}
                              </div>
                              <div
                                style={{
                                  color: colors.text.muted,
                                  fontSize: "10px",
                                }}
                              >
                                {student.email || student.batchId || ""}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "14px",
                          borderRadius: radius.md,
                          background: colors.bg.raised,
                          textAlign: "center",
                          color: colors.text.muted,
                          fontSize: fonts.size.sm,
                        }}
                      >
                        {course.students} students enrolled (student list not yet available for this batch)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// @ts-nocheck
/**
 * MyCourses — Faculty page listing all courses taught by the logged-in professor.
 * Each course card is expandable to reveal schedule slots, classroom, and enrolled students.
 * Data comes from the published timetable (same source as the dashboard).
 */
import { useState, useEffect, useMemo } from "react";
import { Card, Badge, Loader } from "../../../shared";
import { useUser } from "../../../contexts/UserContext";
import { createClassReference, fetchCourseSyllabus, fetchTimetableLatest } from "../../../services/facultyApi";
import { httpClient } from "../../../services/httpClient";
import { colors, fonts, radius, shadows, transitions } from "../../../styles/tokens";
import {
  BookOpen,
  ChevronDown,
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
  const [loadError, setLoadError] = useState("");
  const [courses, setCourses] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [enrollments, setEnrollments] = useState({});
  const [loadingEnrollments, setLoadingEnrollments] = useState({});
  const [syllabusByCourse, setSyllabusByCourse] = useState({});

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
        setLoadError("Unable to load courses right now.");
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
    if (isExpanding) {
      fetchEnrolledStudents(courseCode);
      if (!syllabusByCourse[courseCode]) {
        fetchCourseSyllabus(courseCode)
          .then((data) => {
            const list = Array.isArray(data) ? data : (data?.references || data?.data?.references || []);
            setSyllabusByCourse((prev) => ({ ...prev, [courseCode]: list?.[0] || null }));
          })
          .catch(() => setSyllabusByCourse((prev) => ({ ...prev, [courseCode]: null })));
      }
    }
  };

  /* ── Stats ─────────────────────────────────────────────────── */
  const totalSessions = useMemo(
    () => courses.reduce((sum, c) => sum + c.sessionsPerWeek, 0),
    [courses]
  );
  const totalStudents = useMemo(
    () => courses.reduce((sum, c) => sum + (c.students || 0), 0),
    [courses]
  );

  if (loading) return <Loader />;

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "10px 14px 18px 24px",
        background: `linear-gradient(180deg, ${colors.bg.deep} 0%, #f8fafc 100%)`,
        borderRadius: radius.lg,
      }}
    >
      <div style={{ maxWidth: 1220 }}>
      {loadError && (
        <Card style={{ marginBottom: 14, padding: "12px 14px", borderColor: colors.error.border, background: colors.error.ghost }}>
          <div style={{ color: colors.error.main, fontSize: fonts.size.sm, fontWeight: fonts.weight.medium }}>
            {loadError}
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "12px",
          marginBottom: "14px",
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
            value: totalStudents,
            color: "#16A34A",
          },
        ].map((stat) => (
          <Card key={stat.label} style={{ padding: "14px 16px", borderRadius: radius.lg }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
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
                    fontSize: "2rem",
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

      {courses.length > 0 && (
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary, fontWeight: fonts.weight.medium }}>
            Course Directory
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                transition: transitions.smooth,
                borderRadius: radius.lg,
                boxShadow: isExpanded ? shadows.md : shadows.sm,
              }}
            >
              {/* Header — always visible */}
              <div
                style={{
                  padding: "15px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  transition: transitions.fast,
                  background: isExpanded ? palette.bg : "transparent",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = isExpanded ? palette.bg : colors.bg.raised; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isExpanded ? palette.bg : "transparent"; }}
                onClick={() => handleToggle(course.id, course.code)}
              >
                {/* Course icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
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
                        fontSize: fonts.size.lg,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
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
                      gap: "10px",
                      fontSize: fonts.size.xs,
                      color: colors.text.muted,
                      flexWrap: "wrap",
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
                    marginLeft: 8,
                  }}
                >
                  <ChevronDown size={18} />
                </div>
              </div>

              {/* Expanded section */}
              {isExpanded && (
                <div
                  style={{
                    padding: "0 16px 16px",
                    borderTop: `1px solid ${colors.border.subtle}`,
                    animation: "fadeIn 0.2s ease both",
                    background: "linear-gradient(180deg, rgba(248,250,252,0.68) 0%, rgba(255,255,255,0.92) 100%)",
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
                        gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {course.slots.map((slot, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "11px 12px",
                            borderRadius: radius.md,
                            background: palette.bg,
                            border: `1px solid ${palette.border}`,
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
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
                              whiteSpace: "nowrap",
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
                              whiteSpace: "nowrap",
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
                          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                          gap: "8px",
                        }}
                      >
                        {enrollments[course.code].map((student, i) => (
                          <div
                            key={student._id || i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "9px 10px",
                              borderRadius: radius.md,
                              background: colors.bg.raised,
                              fontSize: fonts.size.xs,
                              border: `1px solid ${colors.border.subtle}`,
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
                          border: `1px dashed ${colors.border.medium}`,
                          textAlign: "center",
                          color: colors.text.muted,
                          fontSize: fonts.size.sm,
                        }}
                      >
                        {course.students} students enrolled (student list not yet available for this batch)
                      </div>
                    )}
                  </div>

                  {/* Course Resources */}
                  <div style={{ marginTop: 14 }}>
                    <h4
                      style={{
                        margin: "0 0 10px",
                        fontSize: fonts.size.sm,
                        fontWeight: fonts.weight.bold,
                        color: colors.text.primary,
                        fontFamily: fonts.heading,
                      }}
                    >
                      Course Resources
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const title = "Course Syllabus";
                          const existing = syllabusByCourse[course.code]?.url || "https://";
                          const url = window.prompt("Enter syllabus link:", existing);
                          if (!url || !url.trim()) return;
                          try {
                            await createClassReference({
                              courseCode: course.code,
                              title,
                              url: url.trim(),
                              kind: "syllabus",
                            });
                            setSyllabusByCourse((prev) => ({
                              ...prev,
                              [course.code]: { title, url: url.trim() },
                            }));
                          } catch (err: any) {
                            alert(err?.message || "Failed to save syllabus");
                          }
                        }}
                        style={{
                          padding: "7px 12px",
                          borderRadius: radius.md,
                          border: `1px solid ${colors.primary.border}`,
                          background: colors.primary.ghost,
                          color: colors.primary.main,
                          fontSize: fonts.size.sm,
                          fontWeight: fonts.weight.medium,
                          cursor: "pointer",
                          fontFamily: fonts.body,
                          transition: transitions.fast,
                        }}
                      >
                        {syllabusByCourse[course.code]?.url ? "Update Syllabus Link" : "Add Syllabus Link"}
                      </button>
                      {syllabusByCourse[course.code]?.url && (
                        <a
                          href={syllabusByCourse[course.code].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: fonts.size.sm,
                            color: colors.info.main || colors.primary.main,
                            textDecoration: "none",
                          }}
                        >
                          Open Course Syllabus
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      </div>
    </div>
  );
}

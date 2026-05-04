/**
 * CourseEnrollment — Courses Page (DISHA Student Portal)
 *
 * Per DISHA UI Guide §5A:
 * - Grid of enrolled course tiles: code+name, dept·semester, attendance ratio, next exam pill, view details
 * - "View Details" opens a modal with schedule, professor contact, and course resources
 * - Attendance ratio computed from course.completion and course.credits
 * - Next exam pulled from /student/exams endpoint
 */

import { useEffect, useState } from "react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { fetchStudentCourses, fetchStudentExams } from "../../../services/studentApi";
import { BookOpen, MapPin, Mail, FileText } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  schedule: string;
  room: string;
  completion: number;
  department: string;
  semester: string;
  description: string;
}

interface CourseWithAttendance extends Course {
  attendanceCompleted: number;
  attendanceTotal: number;
  nextExamLabel: string;
}

// ── Helpers ──────────────────────────────────────────────────────

function buildAttendanceRatio(course: Course): { completed: number; total: number } {
  const total = Math.max(24, course.credits * 12);
  const completed = Math.round((course.completion / 100) * total);
  return { completed, total };
}

function normalizeCourse(course: any): Course {
  return {
    id: course.id || course._id || "",
    code: course.code || "",
    name: course.name || course.title || "Untitled",
    credits: Number(course.credits ?? course.creditHours ?? course.sessionsPerWeek ?? 3),
    instructor: course.instructor || course.faculty || "TBA",
    schedule: course.schedule || "",
    room: course.room || "",
    completion: Number(course.completion ?? 0),
    department: course.department || "GENERAL",
    semester: course.semester || "",
    description: course.description || "",
  };
}

// ── Course Details Modal ─────────────────────────────────────────

function CourseDetailsModal({
  course,
  onClose,
}: {
  course: CourseWithAttendance;
  onClose: () => void;
}) {
  // Derive a reasonable professor email from the name
  const emailFromName = (name: string) => {
    if (!name || name === "TBA") return null;
    return (
      name
        .toLowerCase()
        .replace(/^dr\.\s*/i, "")
        .replace(/^prof\.\s*/i, "")
        .trim()
        .replace(/\s+/g, ".")
        .replace(/[^a-z.]/g, "") + "@disha.edu"
    );
  };
  const profEmail = emailFromName(course.instructor);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.bg.base,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: "16px",
          padding: "24px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: shadows.xl,
          animation: "fadeUp 0.25s cubic-bezier(0.4,0,0.2,1) both",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 4px",
                fontSize: fonts.size.xl,
                fontWeight: fonts.weight.bold,
                color: colors.text.primary,
                fontFamily: fonts.heading,
              }}
            >
              {course.code} {course.name}
            </h2>
            <p style={{ margin: 0, fontSize: fonts.size.sm, color: colors.text.muted }}>
              {course.department} · {course.semester || "Spring 2024"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: colors.text.muted,
              fontSize: fonts.size.sm,
              fontWeight: fonts.weight.medium,
              cursor: "pointer",
              fontFamily: fonts.body,
              padding: "4px 8px",
              flexShrink: 0,
            }}
          >
            Close
          </button>
        </div>

        {/* Section: Schedule */}
        <div
          style={{
            background: colors.bg.raised,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: radius.md,
            padding: "14px 16px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.semibold,
              color: colors.text.muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            Schedule
          </div>
          <div
            style={{
              fontSize: fonts.size.md,
              fontWeight: fonts.weight.medium,
              color: colors.text.primary,
              marginBottom: "6px",
            }}
          >
            {course.schedule || "See department schedule"}
          </div>
          {course.room && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: fonts.size.xs,
                color: colors.text.muted,
              }}
            >
              <MapPin size={12} />
              {course.room}
            </div>
          )}
        </div>

        {/* Section: Professor Contact */}
        <div
          style={{
            background: colors.bg.raised,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: radius.md,
            padding: "14px 16px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.semibold,
              color: colors.text.muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            Professor Contact
          </div>
          <div
            style={{
              fontSize: fonts.size.md,
              fontWeight: fonts.weight.bold,
              color: colors.text.primary,
              marginBottom: "6px",
            }}
          >
            {course.instructor}
          </div>
          {profEmail && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: fonts.size.xs,
                color: colors.text.muted,
              }}
            >
              <Mail size={12} />
              {profEmail}
            </div>
          )}
        </div>

        {/* Section: Course Resources */}
        <div
          style={{
            background: colors.bg.raised,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: radius.md,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.semibold,
              color: colors.text.muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "10px",
            }}
          >
            Course Resources
          </div>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              background: "rgba(37, 99, 235, 0.06)",
              border: "1px solid rgba(37, 99, 235, 0.2)",
              borderRadius: radius.md,
              color: "#2563EB",
              fontSize: fonts.size.sm,
              fontWeight: fonts.weight.medium,
              cursor: "pointer",
              fontFamily: fonts.body,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(37, 99, 235, 0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(37, 99, 235, 0.06)";
            }}
          >
            <FileText size={14} />
            Course Syllabus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────

export default function CourseEnrollment() {
  const [courses, setCourses] = useState<CourseWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithAttendance | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    Promise.all([fetchStudentCourses(), fetchStudentExams()])
      .then(([courseData, examData]) => {
        if (!isMounted) return;

        // Build exam lookup: courseCode → formatted date label
        const examList = Array.isArray(examData)
          ? examData
          : examData?.exams || [];
        const examMap: Record<string, string> = {};
        examList.forEach((exam: any) => {
          if (exam.courseCode && exam.date) {
            examMap[exam.courseCode] = new Date(exam.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }
        });

        const enrolled = (courseData?.enrolled || []).map((raw: any) => {
          const c = normalizeCourse(raw);
          const { completed, total } = buildAttendanceRatio(c);
          return {
            ...c,
            attendanceCompleted: completed,
            attendanceTotal: total,
            nextExamLabel: examMap[c.code] || "TBD",
          } as CourseWithAttendance;
        });

        setCourses(enrolled);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err?.message || "Unable to load courses");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100%",
        background: colors.bg.deep,
        padding: "28px 32px",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            background: colors.bg.raised,
            border: `1px solid ${colors.border.medium}`,
            borderRadius: radius.md,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BookOpen size={18} style={{ color: colors.primary.main }} />
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "1.75rem",
            fontWeight: fonts.weight.bold,
            color: colors.text.primary,
            fontFamily: fonts.heading,
          }}
        >
          Courses
        </h1>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: radius.md,
            background: "rgba(37,99,235,0.06)",
            color: "#2563EB",
            fontSize: fonts.size.sm,
            marginBottom: "16px",
          }}
        >
          Loading courses...
        </div>
      )}
      {loadError && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: radius.md,
            background: "rgba(220,38,38,0.06)",
            color: colors.error.main,
            fontSize: fonts.size.sm,
            marginBottom: "16px",
          }}
        >
          {loadError}
        </div>
      )}

      {/* Course Grid */}
      {!loading && courses.length === 0 && !loadError && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: colors.text.muted,
            fontSize: fonts.size.sm,
          }}
        >
          No enrolled courses found.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onViewDetails={() => setSelectedCourse(course)}
          />
        ))}
      </div>

      {/* Details Modal */}
      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}

// ── Course Card ──────────────────────────────────────────────────

function CourseCard({
  course,
  onViewDetails,
}: {
  course: CourseWithAttendance;
  onViewDetails: () => void;
}) {
  return (
    <div
      style={{
        background: colors.bg.base,
        border: `1px solid ${colors.border.medium}`,
        borderRadius: radius.xl,
        boxShadow: shadows.sm,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = shadows.md;
        (e.currentTarget as HTMLDivElement).style.borderColor = colors.border.strong;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = shadows.sm;
        (e.currentTarget as HTMLDivElement).style.borderColor = colors.border.medium;
      }}
    >
      {/* Top: icon + code + name */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            background: colors.bg.raised,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: radius.sm,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          <BookOpen size={14} style={{ color: colors.primary.main }} />
        </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: fonts.size.md,
                fontWeight: fonts.weight.bold,
                color: colors.text.primary,
              }}
            >
              {course.code}
            </span>
            <span
              style={{
                fontSize: fonts.size.sm,
                fontWeight: fonts.weight.medium,
                color: colors.text.primary,
              }}
            >
              {course.name}
            </span>
          </div>
          <div
            style={{
              fontSize: fonts.size.xs,
              color: colors.text.muted,
              marginTop: "2px",
            }}
          >
            {course.department} · {course.semester || "Spring 2024"}
          </div>
        </div>
      </div>

      {/* Attendance ratio */}
      <div
        style={{
          fontSize: fonts.size.sm,
          color: colors.text.secondary,
          marginBottom: "10px",
        }}
      >
        Attendance:{" "}
        <span style={{ fontWeight: fonts.weight.medium, color: colors.text.primary }}>
          {course.attendanceCompleted} / {course.attendanceTotal}
        </span>
      </div>

      {/* Next Exam pill */}
      <div
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          alignItems: "center",
          padding: "3px 10px",
          borderRadius: radius.full,
          background: "rgba(37, 99, 235, 0.07)",
          border: "1px solid rgba(37, 99, 235, 0.18)",
          color: "#2563EB",
          fontSize: fonts.size.xs,
          fontWeight: fonts.weight.semibold,
          marginBottom: "16px",
        }}
      >
        Next Exam: {course.nextExamLabel}
      </div>

      {/* View Details button */}
      <button
        onClick={onViewDetails}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "7px 14px",
          background: colors.bg.base,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: radius.md,
          color: colors.text.secondary,
          fontSize: fonts.size.sm,
          fontWeight: fonts.weight.medium,
          cursor: "pointer",
          fontFamily: fonts.body,
          transition: "all 0.15s ease",
          alignSelf: "flex-start",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = colors.primary.main;
          (e.currentTarget as HTMLButtonElement).style.color = colors.primary.main;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border.medium;
          (e.currentTarget as HTMLButtonElement).style.color = colors.text.secondary;
        }}
      >
        View Details →
      </button>
    </div>
  );
}

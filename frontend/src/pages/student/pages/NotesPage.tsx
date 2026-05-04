/**
 * NotesPage — My Notes Hub (DISHA Student Portal)
 *
 * Per DISHA UI Guide §5B:
 * - Hub: gallery of course tiles, each with session count and "View Notes →" button
 * - History (drill-down): chronological list of past lecture sessions for a course
 * - Session data sourced from student dashboard timetable (weeklySchedule)
 * - "View Notes" opens Google Doc via webViewLink if available
 * - "Add Notes" triggers the port 4000 microservice flow
 */

import { useEffect, useState } from "react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { fetchStudentDashboard, fetchStudentCourses } from "../../../services/studentApi";
import { Calendar, BookOpen, ArrowLeft } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

interface CourseSession {
  date: Date;
  time: string;
  endTime: string;
  hasNotes: boolean;
  notesUrl?: string;
}

interface CourseNotes {
  code: string;
  name: string;
  sessions: CourseSession[];
}

// ── Helpers ──────────────────────────────────────────────────────

function timeStrToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function parseDurationMins(dur: string): number {
  if (!dur) return 60;
  const hrMatch = dur.match(/(\d+)\s*h/i);
  const minMatch = dur.match(/(\d+)\s*m/i);
  const hrs = hrMatch ? parseInt(hrMatch[1]) : 0;
  const mins = minMatch ? parseInt(minMatch[1]) : 0;
  if (hrs === 0 && mins === 0) return 60;
  return hrs * 60 + mins;
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function buildTimeRange(startStr: string, duration: string): string {
  const startMins = timeStrToMinutes(startStr);
  const durMins = parseDurationMins(duration);
  return `${formatMinutes(startMins)}–${formatMinutes(startMins + durMins)}`;
}

function formatSessionDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Extract code from location string like "CS201 · LHC-2" → "CS201"
function extractCode(location: string): string {
  if (!location) return "";
  return location.split("·")[0].split("·")[0].trim();
}

// Build course sessions from dashboard timetable data
function buildCourseSessionMap(
  dashData: any,
): Record<string, CourseSession[]> {
  const map: Record<string, CourseSession[]> = {};
  const weeklySchedule = dashData?.weeklySchedule || [];
  const weekDates: number[] = dashData?.weekDates || [];
  const currentMonth: number = dashData?.currentDate?.month ?? new Date().getMonth() + 1;
  const currentYear: number = dashData?.currentDate?.year ?? new Date().getFullYear();

  weeklySchedule.forEach((slot: any) => {
    slot.classes?.forEach((classItem: any, dayIdx: number) => {
      if (!classItem) return;
      const code = extractCode(classItem.location || "");
      const name = classItem.name || "";
      const key = code || name;
      if (!key) return;

      const weekDate = weekDates[dayIdx];
      if (!weekDate) return;

      const date = new Date(currentYear, currentMonth - 1, weekDate);
      const timeRange = buildTimeRange(slot.time || "", classItem.duration || "1h");

      if (!map[key]) map[key] = [];
      map[key].push({
        date,
        time: slot.time || "",
        endTime: timeRange,
        hasNotes: false,
        notesUrl: undefined,
      });
    });
  });

  return map;
}

// ── Main Component ───────────────────────────────────────────────

export default function NotesPage() {
  const [courseNotes, setCourseNotes] = useState<CourseNotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseNotes | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    Promise.all([fetchStudentCourses(), fetchStudentDashboard()])
      .then(([courseData, dashData]) => {
        if (!isMounted) return;

        const sessionMap = buildCourseSessionMap(dashData);
        const enrolled: any[] = courseData?.enrolled || [];

        // Build course notes list from enrolled courses + session data
        const notes: CourseNotes[] = enrolled.map((raw: any) => {
          const code = raw.code || "";
          const name = raw.name || raw.title || "";
          const sessions =
            sessionMap[code] ||
            // fallback: match by name substring
            Object.entries(sessionMap).find(
              ([k]) =>
                k.toLowerCase().includes(name.toLowerCase().split(" ")[0]) ||
                name.toLowerCase().includes(k.toLowerCase()),
            )?.[1] ||
            [];

          // Sort sessions by date ascending
          const sorted = [...sessions].sort(
            (a, b) => a.date.getTime() - b.date.getTime(),
          );

          return { code, name, sessions: sorted };
        });

        setCourseNotes(notes);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err?.message || "Unable to load notes");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ── History Drill-Down View ────────────────────────────────────
  if (selectedCourse) {
    return (
      <div
        style={{
          minHeight: "100%",
          background: colors.bg.deep,
          padding: "28px 32px",
        }}
      >
        {/* Back link */}
        <button
          onClick={() => setSelectedCourse(null)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: colors.text.secondary,
            fontSize: fonts.size.sm,
            cursor: "pointer",
            fontFamily: fonts.body,
            padding: 0,
            marginBottom: "20px",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = colors.primary.main)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = colors.text.secondary)
          }
        >
          <ArrowLeft size={15} />
          Back to Courses
        </button>

        {/* Title section */}
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              margin: "0 0 4px",
              fontSize: "1.4rem",
              fontWeight: fonts.weight.bold,
              color: colors.text.primary,
              fontFamily: fonts.heading,
            }}
          >
            {selectedCourse.code} Notes History
          </h2>
          <p style={{ margin: 0, fontSize: fonts.size.sm, color: colors.text.secondary }}>
            {selectedCourse.name}
          </p>
        </div>

        {/* Sessions list */}
        <div
          style={{
            background: colors.bg.base,
            border: `1px solid ${colors.border.medium}`,
            borderRadius: radius.xl,
            boxShadow: shadows.sm,
            overflow: "hidden",
          }}
        >
          {selectedCourse.sessions.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: colors.text.muted,
                fontSize: fonts.size.sm,
              }}
            >
              No sessions found for this course.
            </div>
          ) : (
            selectedCourse.sessions.map((session, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom:
                    i < selectedCourse.sessions.length - 1
                      ? `1px solid ${colors.border.subtle}`
                      : "none",
                }}
              >
                {/* Date + time */}
                <div>
                  <div
                    style={{
                      fontWeight: fonts.weight.semibold,
                      fontSize: fonts.size.sm,
                      color: colors.text.primary,
                      marginBottom: "3px",
                    }}
                  >
                    {formatSessionDate(session.date)}
                  </div>
                  <div
                    style={{
                      fontSize: fonts.size.xs,
                      color: "#2563EB",
                    }}
                  >
                    {session.endTime}
                  </div>
                </div>

                {/* Notes status / action */}
                {session.hasNotes && session.notesUrl ? (
                  <a
                    href={session.notesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "5px 12px",
                      background: colors.primary.ghost,
                      border: `1px solid ${colors.primary.border}`,
                      borderRadius: radius.md,
                      color: colors.primary.main,
                      fontSize: fonts.size.xs,
                      fontWeight: fonts.weight.medium,
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    View Notes
                  </a>
                ) : (
                  <span
                    style={{
                      fontSize: fonts.size.xs,
                      color: colors.text.muted,
                      fontStyle: "italic",
                    }}
                  >
                    No Notes Taken for This Session.
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ── Hub View ───────────────────────────────────────────────────
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
          <Calendar size={18} style={{ color: colors.primary.main }} />
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
          My Notes
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
          Loading notes...
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

      {!loading && courseNotes.length === 0 && !loadError && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: colors.text.muted,
            fontSize: fonts.size.sm,
          }}
        >
          No courses found.
        </div>
      )}

      {/* Course tiles grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {courseNotes.map((cn) => (
          <NotesCourseCard
            key={cn.code}
            courseNotes={cn}
            onView={() => setSelectedCourse(cn)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Notes Course Card ────────────────────────────────────────────

function NotesCourseCard({
  courseNotes,
  onView,
}: {
  courseNotes: CourseNotes;
  onView: () => void;
}) {
  const count = courseNotes.sessions.length;

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
          marginBottom: "8px",
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
              {courseNotes.code}
            </span>
            <span
              style={{
                fontSize: fonts.size.sm,
                fontWeight: fonts.weight.medium,
                color: colors.text.primary,
              }}
            >
              {courseNotes.name}
            </span>
          </div>
          {/* Session count */}
          <div
            style={{
              fontSize: fonts.size.xs,
              color: colors.text.muted,
              marginTop: "3px",
            }}
          >
            {count} {count === 1 ? "Session" : "Sessions"} in History
          </div>
        </div>
      </div>

      {/* View Notes button */}
      <button
        onClick={onView}
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
          marginTop: "12px",
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
        View Notes →
      </button>
    </div>
  );
}

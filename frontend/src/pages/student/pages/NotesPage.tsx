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

import { useEffect, useState, useCallback } from "react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { fetchStudentDashboard, fetchStudentCourses, createStudentNote, fetchNotesByCourse } from "../../../services/studentApi";
import { Calendar, BookOpen, ArrowLeft } from "lucide-react";
import NotesViewerModal from "../components/NotesViewerModal";

// ── Mock fallback data (shown when backend returns empty) ─────────────
const MOCK_COURSES = [
  { code: "CS201", name: "Data Structures & Algorithms" },
  { code: "MA301", name: "Engineering Mathematics III" },
  { code: "EC201", name: "Digital Circuits & Systems" },
  { code: "CS301", name: "Computer Networks" },
];

function buildMockSessions(code: string): CourseSession[] {
  const now = new Date();
  const sessions: CourseSession[] = [];
  // Generate last 6 Mon/Wed/Fri sessions
  let count = 0;
  for (let d = 1; d <= 60 && count < 6; d++) {
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
    const day = dt.getDay();
    if (day === 1 || day === 3 || day === 5) {
      sessions.push({ date: dt, time: "09:00", endTime: "09:00–10:00", hasNotes: false });
      count++;
    }
  }
  return sessions.reverse();
}

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

function formatIsoDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
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
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [addingNote, setAddingNote] = useState<string | null>(null);
  const [notesModal, setNotesModal] = useState<{ webViewLink: string; googleDocId: string; title: string; subtitle?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    Promise.all([fetchStudentCourses(), fetchStudentDashboard()])
      .then(([courseData, dashData]) => {
        if (!isMounted) return;

        const sessionMap = buildCourseSessionMap(dashData);
        let enrolled: any[] = courseData?.enrolled || [];

        // Use mock data when backend returns nothing (dev/demo mode)
        if (enrolled.length === 0) enrolled = MOCK_COURSES;

        const notes: CourseNotes[] = enrolled.map((raw: any) => {
          const code = raw.code || "";
          const name = raw.name || raw.title || "";
          const sessions =
            sessionMap[code] ||
            Object.entries(sessionMap).find(
              ([k]) =>
                k.toLowerCase().includes(name.toLowerCase().split(" ")[0]) ||
                name.toLowerCase().includes(k.toLowerCase()),
            )?.[1] ||
            buildMockSessions(code);

          const sorted = [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime());
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

  // Refetch persisted notes every time a course is opened so calendar-created notes appear
  useEffect(() => {
    if (!selectedCourse) return;
    setNoteMap({});
    fetchNotesByCourse(selectedCourse.code)
      .then((data: any) => {
        const map: Record<string, string> = {};
        (data?.notes || []).forEach((n: any) => {
          if (n.classDate && n.webViewLink) map[n.classDate] = n.webViewLink;
        });
        setNoteMap(map);
      })
      .catch(() => {});
  }, [selectedCourse]);

  const [notesError, setNotesError] = useState<"drive_api_disabled" | "not_connected" | "generic" | null>(null);

  const openNotes = useCallback(async (courseCode: string, classDate: string, courseName = "") => {
    setAddingNote(classDate);
    setNotesError(null);
    try {
      const data: any = await createStudentNote(courseCode, classDate);
      const googleDocId = data?.googleDocId;
      const webViewLink = data?.webViewLink || (googleDocId ? `https://docs.google.com/document/d/${googleDocId}/edit` : null);
      if (webViewLink && googleDocId) {
        setNoteMap((prev) => ({ ...prev, [classDate]: webViewLink }));
        const formattedDate = formatIsoDate(classDate);
        setNotesModal({
          webViewLink,
          googleDocId,
          title: courseName || courseCode,
          subtitle: `${courseCode} · ${formattedDate}`,
        });
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("drive.googleapis") || msg.includes("Drive API") || msg.includes("has not been used") || msg.includes("disabled")) {
        setNotesError("drive_api_disabled");
      } else if (msg.includes("authenticated") || msg.includes("Not authenticated")) {
        setNotesError("not_connected");
      } else {
        setNotesError("generic");
      }
      setTimeout(() => setNotesError(null), 6000);
    } finally {
      setAddingNote(null);
    }
  }, []);

  // ── History Drill-Down View ────────────────────────────────────
  // ── Date helpers for the header ─────────────────────────────────
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  if (selectedCourse) {
    const sessionCount = selectedCourse.sessions.length;
    const earliest = sessionCount > 0 ? formatSessionDate(selectedCourse.sessions[0].date) : "";
    const latest   = sessionCount > 0 ? formatSessionDate(selectedCourse.sessions[sessionCount - 1].date) : "";

    return (
      <div style={{ minHeight: "100%", background: colors.bg.deep, padding: "28px 32px" }}>

        {/* Back link */}
        <button
          onClick={() => setSelectedCourse(null)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
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
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.primary.main; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.text.secondary; }}
        >
          <ArrowLeft size={15} />
          Back to Courses
        </button>

        {/* Page title */}
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
            {selectedCourse.code} — Notes History
          </h2>
          <p style={{ margin: 0, fontSize: fonts.size.sm, color: colors.text.secondary }}>
            {selectedCourse.name}
            {sessionCount > 0 && (
              <span style={{ color: colors.text.muted }}>
                {" "}&middot; {earliest} &mdash; {latest}
              </span>
            )}
          </p>
        </div>


        {/* Error banner */}
        {notesError && (
            <div style={{ marginBottom: "16px", padding: "10px 14px", borderRadius: 8, background: "rgba(245,158,11,0.10)", color: "#D97706", fontSize: fonts.size.sm, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>
                {notesError === "drive_api_disabled"
                  ? "Google Drive API is not enabled for this project."
                  : notesError === "not_connected"
                  ? "Google account not connected. Connect to access notes."
                  : "Could not open notes. Please try again."}
              </span>
              {notesError === "drive_api_disabled" ? (
                <a href="https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=347302664202" target="_blank" rel="noopener noreferrer" style={{ color: "#2563EB", fontWeight: 600, fontSize: fonts.size.xs, marginLeft: "12px", textDecoration: "none", whiteSpace: "nowrap" }}>Enable Drive API →</a>
              ) : notesError === "not_connected" ? (
                <a href="/StudentPage/google-classroom" style={{ color: "#2563EB", fontWeight: 600, fontSize: fonts.size.xs, marginLeft: "12px", textDecoration: "none", whiteSpace: "nowrap" }}>Connect Google →</a>
              ) : null}
            </div>
          )}

          {/* Notes viewer modal */}
          {notesModal && (
            <NotesViewerModal
              webViewLink={notesModal.webViewLink}
              googleDocId={notesModal.googleDocId}
              title={notesModal.title}
              subtitle={notesModal.subtitle}
              onClose={() => setNotesModal(null)}
            />
          )}

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
              <div style={{ padding: "48px", textAlign: "center", color: colors.text.muted, fontSize: fonts.size.sm }}>
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
                    padding: "14px 20px",
                    background: i % 2 === 0 ? colors.bg.base : colors.bg.deep,
                    borderBottom: i < selectedCourse.sessions.length - 1 ? `1px solid ${colors.border.subtle}` : "none",
                    transition: "background 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: 34, height: 34,
                        background: "rgba(37,99,235,0.08)",
                        border: "1px solid rgba(37,99,235,0.15)",
                        borderRadius: radius.md,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "14px",
                      }}
                    >
                      📄
                    </div>
                    <div>
                      <div style={{ fontWeight: fonts.weight.semibold, fontSize: fonts.size.sm, color: colors.text.primary, marginBottom: "2px" }}>
                        {formatSessionDate(session.date)}
                      </div>
                      <div style={{ fontSize: fonts.size.xs, color: "#2563EB" }}>
                        {session.endTime}
                      </div>
                    </div>
                  </div>

                  {/* Notes action */}
                  {(() => {
                    const classDate = session.date.toISOString().split("T")[0];
                    const existingUrl = noteMap[classDate] || (session.hasNotes ? session.notesUrl : null);
                    if (existingUrl) {
                      const docId = existingUrl.match(/\/d\/([^/]+)/)?.[1] || "";
                      return (
                        <button
                          onClick={() => setNotesModal({ webViewLink: existingUrl, googleDocId: docId, title: selectedCourse.name || selectedCourse.code, subtitle: `${selectedCourse.code} · ${formatIsoDate(classDate)}` })}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "6px 14px",
                            background: colors.primary.ghost,
                            border: `1px solid ${colors.primary.border}`,
                            borderRadius: radius.md,
                            color: colors.primary.main,
                            fontSize: fonts.size.xs,
                            fontWeight: fonts.weight.semibold,
                            cursor: "pointer",
                            fontFamily: fonts.body,
                            transition: "all 0.15s ease",
                          }}
                        >
                          📖 Open Notes
                        </button>
                      );
                    }
                    return (
                      <button
                        onClick={() => openNotes(selectedCourse.code, classDate, selectedCourse.name)}
                        disabled={addingNote === classDate}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "6px 14px",
                          background: addingNote === classDate ? colors.bg.raised : "rgba(37,99,235,0.06)",
                          border: "1px solid rgba(37,99,235,0.20)",
                          borderRadius: radius.md,
                          color: "#2563EB",
                          fontSize: fonts.size.xs,
                          fontWeight: fonts.weight.semibold,
                          cursor: addingNote === classDate ? "wait" : "pointer",
                          fontFamily: fonts.body,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {addingNote === classDate ? "⏳ Opening…" : "✏️ Add Notes"}
                      </button>
                    );
                  })()}
                </div>
              ))
            )}
        </div>
      </div>
    );
  }

  // ── Hub View ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100%", background: colors.bg.deep, padding: "28px 32px" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <div
          style={{
            width: 36, height: 36,
            background: colors.bg.raised,
            border: `1px solid ${colors.border.medium}`,
            borderRadius: radius.md,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Calendar size={18} style={{ color: colors.primary.main }} />
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.4rem",
              fontWeight: fonts.weight.bold,
              color: colors.text.primary,
              fontFamily: fonts.heading,
            }}
          >
            My Notes
          </h1>
          <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "2px" }}>
            {todayStr}
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
          <div style={{ padding: "10px 14px", borderRadius: radius.md, background: "rgba(37,99,235,0.06)", color: "#2563EB", fontSize: fonts.size.sm, marginBottom: "16px" }}>
            Loading notes…
          </div>
        )}
        {loadError && (
          <div style={{ padding: "10px 14px", borderRadius: radius.md, background: "rgba(220,38,38,0.06)", color: colors.error.main, fontSize: fonts.size.sm, marginBottom: "16px" }}>
            {loadError}
          </div>
        )}
        {!loading && courseNotes.length === 0 && !loadError && (
          <div style={{ padding: "48px", textAlign: "center", color: colors.text.muted, fontSize: fonts.size.sm }}>
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

      {/* Notes viewer modal (hub view — usually not triggered, but keep for safety) */}
      {notesModal && (
        <NotesViewerModal
          webViewLink={notesModal.webViewLink}
          googleDocId={notesModal.googleDocId}
          title={notesModal.title}
          subtitle={notesModal.subtitle}
          onClose={() => setNotesModal(null)}
        />
      )}
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

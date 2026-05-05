/**
 * ClassDetailsModal — Class Info Modal (triggered by clicking a class tile in the calendar)
 *
 * Per DISHA UI Guide §6:
 * - Shows: class name, time, professor, location, and course syllabus button
 * - Matches the same section layout as the Courses "View Details" modal
 */

import { useState, useEffect } from "react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { MapPin, Mail, FileText, Clock, BookOpen } from "lucide-react";
import { checkStudentNote, fetchCourseSyllabusReference, fetchProfessorClassReferences } from "../../../services/studentApi";

export default function ClassDetailsModal({ selectedTimeSlot, onClose, onNoteClick }) {
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteExists, setNoteExists] = useState<boolean | null>(null);
  const [profRefs, setProfRefs] = useState<any[]>([]);
  const [refsLoading, setRefsLoading] = useState(false);
  const [syllabusUrl, setSyllabusUrl] = useState("");

  const courseCode = selectedTimeSlot?.courseCode ||
    (selectedTimeSlot?.location || "").split("·")[0].trim().split(" ")[0].trim() ||
    (selectedTimeSlot?.name || "").split(" ")[0];
  const classDate = selectedTimeSlot?.classDate || new Date().toISOString().split("T")[0];
  const normalizeDay = (value: string) => {
    const key = String(value || "").trim().toLowerCase();
    const map: Record<string, string> = {
      mon: "Monday", monday: "Monday",
      tue: "Tuesday", tues: "Tuesday", tuesday: "Tuesday",
      wed: "Wednesday", wednesday: "Wednesday",
      thu: "Thursday", thur: "Thursday", thurs: "Thursday", thursday: "Thursday",
      fri: "Friday", friday: "Friday",
      sat: "Saturday", saturday: "Saturday",
      sun: "Sunday", sunday: "Sunday",
    };
    return map[key] || value;
  };
  const parseStartTime24 = (value: string) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const firstPart = raw.split("·")[0].trim();
    const start = firstPart.split("–")[0].split("-")[0].trim();
    const m = start.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!m) return "";
    let hh = Number(m[1]);
    const mm = Number(m[2]);
    const suffix = (m[3] || "").toUpperCase();
    if (suffix === "PM" && hh !== 12) hh += 12;
    if (suffix === "AM" && hh === 12) hh = 0;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!courseCode || !classDate) return;
    checkStudentNote(courseCode, classDate)
      .then((data: any) => setNoteExists(data?.exists === true))
      .catch(() => setNoteExists(false));
  }, [courseCode, classDate]);

  useEffect(() => {
    if (!selectedTimeSlot) return;
    const day = normalizeDay(selectedTimeSlot.day || "");
    const startTime = selectedTimeSlot.startTime || parseStartTime24(selectedTimeSlot.time || "");
    if (!courseCode || !day || !startTime) {
      setProfRefs([]);
      return;
    }
    setRefsLoading(true);
    fetchProfessorClassReferences(courseCode, day, startTime)
      .then((data: any) => {
        const list = Array.isArray(data) ? data : (data?.references || data?.data?.references || []);
        const filtered = (list || []).filter((ref: any) => {
          const t = String(ref?.title || "").toLowerCase();
          const k = String(ref?.kind || "").toLowerCase();
          return k !== "syllabus" && t !== "course syllabus";
        });
        setProfRefs(filtered);
      })
      .catch(() => setProfRefs([]))
      .finally(() => setRefsLoading(false));
  }, [selectedTimeSlot, courseCode]);

  useEffect(() => {
    if (!courseCode) return;
    fetchCourseSyllabusReference(courseCode)
      .then((data: any) => {
        const list = Array.isArray(data) ? data : (data?.references || data?.data?.references || []);
        setSyllabusUrl(list?.[0]?.url || "");
      })
      .catch(() => setSyllabusUrl(""));
  }, [courseCode]);

  if (!selectedTimeSlot) return null;

  const profEmail = selectedTimeSlot.professor
    ? selectedTimeSlot.professor
        .toLowerCase()
        .replace(/^dr\.\s*/i, "")
        .replace(/^prof\.\s*/i, "")
        .trim()
        .replace(/\s+/g, ".")
        .replace(/[^a-z.]/g, "") + "@disha.edu"
    : null;

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
          maxWidth: "460px",
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
              {selectedTimeSlot.name}
            </h2>
            <p style={{ margin: 0, fontSize: fonts.size.sm, color: colors.text.muted }}>
              {selectedTimeSlot.day}
              {selectedTimeSlot.time ? ` · ${selectedTimeSlot.time}` : ""}
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
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: fonts.size.md,
              fontWeight: fonts.weight.medium,
              color: colors.text.primary,
              marginBottom: selectedTimeSlot.location ? "6px" : 0,
            }}
          >
            <Clock size={14} style={{ color: colors.text.muted }} />
            {selectedTimeSlot.time || "See schedule"}
            {selectedTimeSlot.duration ? ` · ${selectedTimeSlot.duration}` : ""}
          </div>
          {selectedTimeSlot.location && (
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
              {selectedTimeSlot.location}
            </div>
          )}
        </div>

        {/* Section: Professor Contact */}
        {selectedTimeSlot.professor && (
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
                marginBottom: profEmail ? "6px" : 0,
              }}
            >
              {selectedTimeSlot.professor}
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
        )}

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
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {onNoteClick && (
              <button
                disabled={notesLoading || noteExists === null}
                onClick={async () => {
                  setNotesLoading(true);
                  try {
                    await onNoteClick(courseCode, classDate);
                    setNoteExists(true);
                  } finally {
                    setNotesLoading(false);
                  }
                }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px",
                  background: notesLoading ? colors.bg.raised : noteExists ? colors.primary.ghost : "rgba(16,185,129,0.06)",
                  border: `1px solid ${noteExists ? colors.primary.border : "rgba(16,185,129,0.25)"}`,
                  borderRadius: radius.md,
                  color: noteExists ? colors.primary.main : "#059669",
                  fontSize: fonts.size.sm, fontWeight: fonts.weight.medium,
                  cursor: (notesLoading || noteExists === null) ? "wait" : "pointer",
                  fontFamily: fonts.body,
                  opacity: noteExists === null ? 0.6 : 1,
                }}
              >
                <BookOpen size={14} />
                {notesLoading ? "Opening…" : noteExists === null ? "Checking…" : noteExists ? "Open Notes" : "Add Notes"}
              </button>
            )}

            <button
              disabled={!syllabusUrl}
              onClick={() => { if (syllabusUrl) window.open(syllabusUrl, "_blank", "noopener,noreferrer"); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "7px 14px",
                background: syllabusUrl ? "rgba(37, 99, 235, 0.06)" : colors.bg.raised,
                border: `1px solid ${syllabusUrl ? "rgba(37, 99, 235, 0.2)" : colors.border.subtle}`,
                borderRadius: radius.md, color: syllabusUrl ? "#2563EB" : colors.text.muted,
                fontSize: fonts.size.sm, fontWeight: fonts.weight.medium,
                cursor: syllabusUrl ? "pointer" : "not-allowed", fontFamily: fonts.body,
              }}
            >
              <FileText size={14} />
              {syllabusUrl ? "Course Syllabus" : "Syllabus Not Attached"}
            </button>

            <button
              disabled={refsLoading || profRefs.length === 0}
              onClick={() => {
                if (profRefs.length > 0) window.open(profRefs[0].url, "_blank", "noopener,noreferrer");
              }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "7px 14px",
                background: profRefs.length > 0 ? "rgba(245,158,11,0.08)" : colors.bg.raised,
                border: `1px solid ${profRefs.length > 0 ? "rgba(245,158,11,0.28)" : colors.border.subtle}`,
                borderRadius: radius.md,
                color: profRefs.length > 0 ? "#B45309" : colors.text.muted,
                fontSize: fonts.size.sm, fontWeight: fonts.weight.medium,
                cursor: (refsLoading || profRefs.length === 0) ? "not-allowed" : "pointer",
                fontFamily: fonts.body,
              }}
            >
              <FileText size={14} />
              {refsLoading ? "Loading References…" : profRefs.length > 0 ? `View References (${profRefs.length})` : "No References"}
            </button>
          </div>
          {profRefs.length > 0 && (
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {profRefs.map((ref) => (
                <a
                  key={ref._id || ref.id}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: fonts.size.xs, color: colors.primary.main, textDecoration: "none" }}
                >
                  {ref.title}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

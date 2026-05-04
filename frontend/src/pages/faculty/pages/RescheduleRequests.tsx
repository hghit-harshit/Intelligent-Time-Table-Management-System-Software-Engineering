// @ts-nocheck
import { useState, useEffect } from "react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { useUser } from "../../../contexts/UserContext";
import {
  createRescheduleRequest,
  fetchRescheduleRequests,
  fetchProfessorCourses,
  fetchSlotConflicts,
} from "../../../services/facultyApi";
import {
  RotateCcw,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  ChevronLeft,
  BookOpen,
  AlertTriangle,
  Users,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const statusConfig = {
  pending: { label: "Pending", color: colors.warning.main, bg: colors.warning.ghost, border: colors.warning.border, icon: Clock },
  approved: { label: "Approved", color: colors.success.main, bg: colors.success.ghost, border: colors.success.border, icon: CheckCircle2 },
  rejected: { label: "Rejected", color: colors.error.main, bg: colors.error.ghost, border: colors.error.border, icon: XCircle },
};

// ─── Utility ─────────────────────────────────────────────────
const fmt12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const fmtSlot = (day, startTime, endTime) => {
  if (!day) return "—";
  return `${day} · ${fmt12(startTime)}${endTime ? ` – ${fmt12(endTime)}` : ""}`;
};

// ─── Shared styles ───────────────────────────────────────────
const card = {
  background: colors.bg.base,
  border: `1px solid ${colors.border.medium}`,
  borderRadius: radius.lg,
  boxShadow: shadows.sm,
};

const labelStyle = {
  display: "block",
  fontSize: fonts.size.xs,
  color: colors.text.muted,
  marginBottom: "6px",
  fontWeight: fonts.weight.medium,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const btnPrimary = {
  padding: "9px 20px",
  background: colors.primary.main,
  color: "#fff",
  border: "none",
  borderRadius: radius.md,
  fontSize: fonts.size.sm,
  fontWeight: fonts.weight.medium,
  cursor: "pointer",
  fontFamily: fonts.body,
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

const btnSecondary = {
  padding: "9px 20px",
  background: colors.bg.raised,
  color: colors.text.primary,
  border: `1px solid ${colors.border.medium}`,
  borderRadius: radius.md,
  fontSize: fonts.size.sm,
  fontWeight: fonts.weight.medium,
  cursor: "pointer",
  fontFamily: fonts.body,
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

// ─── Weekly Calendar ──────────────────────────────────────────
function WeeklyCalendar({ slots, currentSlot, selectedTarget, onSelect }) {
  if (!slots || slots.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px", color: colors.text.muted, fontSize: fonts.size.sm }}>
        No available time slots found in the current timetable.
      </div>
    );
  }

  const activeDays = DAY_ORDER.filter((d) => slots.some((s) => s.day === d));
  const uniqueTimes = [...new Set(slots.map((s) => s.startTime))].sort();

  const slotLookup = new Map();
  for (const s of slots) {
    slotLookup.set(`${s.day}|${s.startTime}`, s);
  }

  const thStyle = {
    padding: "8px 12px",
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    color: colors.text.muted,
    textAlign: "center",
    borderBottom: `1px solid ${colors.border.subtle}`,
    background: colors.bg.raised,
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ overflowX: "auto" }}>
      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
        {[
          { color: "#f0fdf4", border: "#86efac", label: "Free — no student conflicts" },
          { color: "#f5f5f5", border: "#d4d4d4", label: "Conflicts — students affected" },
          { color: colors.warning.ghost, border: colors.warning.border, label: "Current slot" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color, border: `1px solid ${item.border}`, flexShrink: 0 }} />
            <span style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{item.label}</span>
          </div>
        ))}
      </div>

      <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: "left", width: "100px" }}>Time</th>
            {activeDays.map((d) => (
              <th key={d} style={thStyle}>{d.slice(0, 3)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uniqueTimes.map((time) => {
            const slot0 = slots.find((s) => s.startTime === time);
            const endTime = slot0?.endTime ?? "";
            return (
              <tr key={time}>
                <td style={{
                  padding: "6px 8px",
                  fontSize: fonts.size.xs,
                  color: colors.text.muted,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}>
                  {fmt12(time)}{endTime ? ` – ${fmt12(endTime)}` : ""}
                </td>
                {activeDays.map((day) => {
                  const isCurrent = currentSlot.day === day && currentSlot.startTime === time;
                  const slot = slotLookup.get(`${day}|${time}`);

                  if (isCurrent) {
                    return (
                      <td key={day} style={{ padding: "4px", borderBottom: `1px solid ${colors.border.subtle}` }}>
                        <div style={{
                          padding: "6px 8px",
                          borderRadius: radius.sm,
                          background: colors.warning.ghost,
                          border: `1px solid ${colors.warning.border}`,
                          fontSize: "10px",
                          fontWeight: fonts.weight.semibold,
                          color: colors.warning.main,
                          textAlign: "center",
                        }}>
                          Current
                        </div>
                      </td>
                    );
                  }

                  if (!slot) {
                    return <td key={day} style={{ borderBottom: `1px solid ${colors.border.subtle}` }} />;
                  }

                  const isSelected = selectedTarget?.day === day && selectedTarget?.startTime === time;
                  const hasConflict = slot.conflictCount > 0;

                  const cellBg = isSelected
                    ? colors.primary.ghost
                    : hasConflict
                    ? "#f5f5f5"
                    : "#f0fdf4";
                  const cellBorder = isSelected
                    ? colors.primary.main
                    : hasConflict
                    ? "#d4d4d4"
                    : "#86efac";
                  const cellColor = isSelected
                    ? colors.primary.main
                    : hasConflict
                    ? colors.text.muted
                    : "#15803d";

                  return (
                    <td key={day} style={{ padding: "4px", borderBottom: `1px solid ${colors.border.subtle}` }}>
                      <div
                        onClick={() => onSelect(slot)}
                        title={hasConflict ? `${slot.conflictCount} student(s) have class at this time` : "No conflicts"}
                        style={{
                          padding: "6px 8px",
                          borderRadius: radius.sm,
                          background: cellBg,
                          border: `${isSelected ? "2px" : "1px"} solid ${cellBorder}`,
                          fontSize: "10px",
                          fontWeight: fonts.weight.semibold,
                          color: cellColor,
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          userSelect: "none",
                        }}
                      >
                        {hasConflict ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center" }}>
                            <Users size={10} />
                            <span>{slot.conflictCount} students</span>
                          </div>
                        ) : (
                          "Free"
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Date helpers ─────────────────────────────────────────────
const DAY_JS_INDEX = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

const toLocalISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Returns the next N dates (as "YYYY-MM-DD" in LOCAL time) on which `dayName` falls, starting from today
const upcomingDatesForDay = (dayName, count = 6) => {
  const targetIdx = DAY_JS_INDEX[dayName];
  if (targetIdx == null) return [];
  const results = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; results.length < count; i++) {
    const candidate = new Date(d);
    candidate.setDate(d.getDate() + i);
    if (candidate.getDay() === targetIdx) results.push(toLocalISO(candidate));
  }
  return results;
};

const fmtDateLabel = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

// ─── Request Wizard ───────────────────────────────────────────
function RequestWizard({ user, onClose, onSuccess }) {
  const [step, setStep] = useState("course"); // "course" | "calendar"
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCurrentSlot, setSelectedCurrentSlot] = useState(null);
  const [currentDate, setCurrentDate] = useState(""); // specific date of the session to reschedule

  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [requestedDate, setRequestedDate] = useState(""); // specific target date

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchProfessorCourses()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setCourses(list);
        setCoursesLoading(false);
      })
      .catch((err) => {
        setCoursesError(err?.message || "Could not load your courses");
        setCoursesLoading(false);
      });
  }, []);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    if (course.slots.length === 1) {
      loadCalendar(course, course.slots[0]);
    }
  };

  const handleSlotSelect = (course, slot) => {
    loadCalendar(course, slot);
  };

  const loadCalendar = (course, slot) => {
    setSelectedCurrentSlot(slot);
    setSelectedTarget(null);
    setRequestedDate("");
    // Pre-fill the from-date with the nearest upcoming occurrence of this day
    const upcoming = upcomingDatesForDay(slot.day, 1);
    setCurrentDate(upcoming[0] || "");
    setSlotsLoading(true);
    setStep("calendar");
    fetchSlotConflicts(course.courseId, slot.day, slot.startTime)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setAvailableSlots(list);
        setSlotsLoading(false);
      })
      .catch(() => {
        setAvailableSlots([]);
        setSlotsLoading(false);
      });
  };

  const handleTargetSelect = (slot) => {
    setSelectedTarget(slot);
    // Auto-fill the to-date with the nearest upcoming occurrence of the target day
    const upcoming = upcomingDatesForDay(slot.day, 1);
    setRequestedDate(upcoming[0] || "");
  };

  const handleSubmit = async () => {
    if (!selectedTarget || !reason.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentTime = `${selectedCurrentSlot.startTime}${selectedCurrentSlot.endTime ? `-${selectedCurrentSlot.endTime}` : ""}`;
      const requestedTime = `${selectedTarget.startTime}${selectedTarget.endTime ? `-${selectedTarget.endTime}` : ""}`;
      await createRescheduleRequest({
        professorId: user._id,
        courseId: selectedCourse.courseId,
        currentDate,
        requestedDate,
        currentSlot: {
          day: selectedCurrentSlot.day,
          time: currentTime,
          room: selectedCurrentSlot.room || "—",
        },
        requestedSlot: {
          day: selectedTarget.day,
          time: requestedTime,
          room: "—",
        },
        reason: reason.trim(),
        affectedStudentCount: selectedTarget.conflictCount ?? 0,
      });
      onSuccess();
    } catch (err) {
      setSubmitError(err?.message || "Failed to submit request");
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    background: colors.bg.base,
    border: `1px solid ${colors.border.medium}`,
    borderRadius: radius.md,
    color: colors.text.primary,
    fontSize: fonts.size.base,
    fontFamily: fonts.body,
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
  };

  // ── Step: Course selection ───────────────────────────────────
  if (step === "course") {
    return (
      <div style={{ ...card, marginBottom: "12px" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.border.subtle}`, display: "flex", alignItems: "center", gap: "10px" }}>
          <BookOpen size={16} color={colors.primary.main} />
          <span style={{ fontWeight: fonts.weight.semibold, fontSize: fonts.size.base, color: colors.text.primary }}>
            Select a course to reschedule
          </span>
          <button onClick={onClose} style={{ ...btnSecondary, marginLeft: "auto", padding: "5px 12px" }}>Cancel</button>
        </div>

        <div style={{ padding: "16px 20px" }}>
          {coursesLoading && (
            <div style={{ color: colors.text.muted, fontSize: fonts.size.sm, padding: "16px 0" }}>Loading your courses…</div>
          )}
          {coursesError && (
            <div style={{ color: colors.error.main, fontSize: fonts.size.sm, padding: "16px 0" }}>{coursesError}</div>
          )}
          {!coursesLoading && !coursesError && courses.length === 0 && (
            <div style={{ color: colors.text.muted, fontSize: fonts.size.sm, padding: "16px 0", textAlign: "center" }}>
              No courses found in the current published timetable.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {courses.map((course) => {
              const isExpanded = selectedCourse?.courseId === course.courseId;
              const multiSlot = course.slots.length > 1;
              return (
                <div key={course.courseId}>
                  <div
                    onClick={() => (multiSlot ? handleCourseSelect(course) : handleCourseSelect(course))}
                    style={{
                      padding: "14px 16px",
                      border: `1px solid ${isExpanded ? colors.primary.border : colors.border.medium}`,
                      borderRadius: radius.md,
                      cursor: "pointer",
                      background: isExpanded ? colors.primary.ghost : colors.bg.raised,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: radius.md,
                        background: colors.primary.ghost, border: `1px solid ${colors.primary.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <BookOpen size={16} color={colors.primary.main} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: fonts.weight.semibold, fontSize: fonts.size.sm, color: colors.text.primary }}>
                          {course.courseCode} — {course.courseName}
                        </div>
                        <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "2px" }}>
                          {multiSlot ? `${course.slots.length} sessions per week` : fmtSlot(course.slots[0]?.day, course.slots[0]?.startTime, course.slots[0]?.endTime)}
                          {!multiSlot && course.slots[0]?.room ? ` · ${course.slots[0].room}` : ""}
                        </div>
                      </div>
                      {!multiSlot && (
                        <div style={{
                          fontSize: fonts.size.xs, color: colors.primary.main,
                          fontWeight: fonts.weight.medium, flexShrink: 0,
                        }}>
                          Select →
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi-slot expansion */}
                  {isExpanded && multiSlot && (
                    <div style={{ marginTop: "4px", paddingLeft: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, padding: "4px 0" }}>
                        Choose which session to reschedule:
                      </div>
                      {course.slots.map((slot, i) => (
                        <div
                          key={i}
                          onClick={() => handleSlotSelect(course, slot)}
                          style={{
                            padding: "10px 14px",
                            border: `1px solid ${colors.border.medium}`,
                            borderRadius: radius.md,
                            cursor: "pointer",
                            background: colors.bg.base,
                            fontSize: fonts.size.sm,
                            color: colors.text.secondary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{fmtSlot(slot.day, slot.startTime, slot.endTime)}</span>
                          <span style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{slot.room}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Calendar + Reason ──────────────────────────────────
  if (step === "calendar") {
    const canSubmit = selectedTarget && currentDate && requestedDate && reason.trim().length > 0;
    return (
      <div style={{ ...card, marginBottom: "12px" }}>
        {/* Header */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${colors.border.subtle}`, display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => { setStep("course"); setSelectedCurrentSlot(null); setSelectedTarget(null); }}
            style={{ ...btnSecondary, padding: "5px 10px" }}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: fonts.weight.semibold, fontSize: fonts.size.sm, color: colors.text.primary }}>
              {selectedCourse.courseCode} — {selectedCourse.courseName}
            </span>
            <span style={{ marginLeft: "10px", fontSize: fonts.size.xs, color: colors.text.muted }}>
              Moving from: {fmtSlot(selectedCurrentSlot.day, selectedCurrentSlot.startTime, selectedCurrentSlot.endTime)} · {selectedCurrentSlot.room}
            </span>
          </div>
          <button onClick={onClose} style={{ ...btnSecondary, padding: "5px 12px" }}>Cancel</button>
        </div>

        <div style={{ padding: "20px" }}>
          {/* Date pickers row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            {/* From date */}
            <div>
              <label style={labelStyle}>Rescheduling from (date)</label>
              <select
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: colors.bg.base,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: radius.md,
                  color: currentDate ? colors.text.primary : colors.text.muted,
                  fontSize: fonts.size.sm,
                  fontFamily: fonts.body,
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <option value="">Select date…</option>
                {upcomingDatesForDay(selectedCurrentSlot.day, 8).map((iso) => (
                  <option key={iso} value={iso}>{fmtDateLabel(iso)}</option>
                ))}
              </select>
            </div>

            {/* To date */}
            <div>
              <label style={labelStyle}>Rescheduling to (date)</label>
              <select
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                disabled={!selectedTarget}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: colors.bg.base,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: radius.md,
                  color: requestedDate ? colors.text.primary : colors.text.muted,
                  fontSize: fonts.size.sm,
                  fontFamily: fonts.body,
                  outline: "none",
                  cursor: selectedTarget ? "pointer" : "not-allowed",
                  opacity: selectedTarget ? 1 : 0.5,
                  boxSizing: "border-box",
                }}
              >
                <option value="">
                  {selectedTarget ? "Select date…" : "Pick a target slot first"}
                </option>
                {selectedTarget && upcomingDatesForDay(selectedTarget.day, 8).map((iso) => (
                  <option key={iso} value={iso}>{fmtDateLabel(iso)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.semibold, color: colors.text.primary, marginBottom: "12px" }}>
              Pick a new time slot
            </div>
            {slotsLoading ? (
              <div style={{ color: colors.text.muted, fontSize: fonts.size.sm }}>Checking student schedules…</div>
            ) : (
              <WeeklyCalendar
                slots={availableSlots}
                currentSlot={selectedCurrentSlot}
                selectedTarget={selectedTarget}
                onSelect={handleTargetSelect}
              />
            )}
          </div>

          {/* Selected target summary */}
          {selectedTarget && (
            <div style={{
              padding: "10px 14px",
              borderRadius: radius.md,
              background: selectedTarget.conflictCount > 0 ? colors.warning.ghost : colors.success.ghost,
              border: `1px solid ${selectedTarget.conflictCount > 0 ? colors.warning.border : colors.success.border}`,
              marginBottom: "16px",
              fontSize: fonts.size.sm,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {selectedTarget.conflictCount > 0 ? (
                  <>
                    <AlertTriangle size={14} color={colors.warning.main} />
                    <span style={{ color: colors.warning.main, fontWeight: fonts.weight.medium }}>
                      {selectedTarget.conflictCount} student{selectedTarget.conflictCount > 1 ? "s" : ""} in your course have class at this time
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} color={colors.success.main} />
                    <span style={{ color: colors.success.main, fontWeight: fonts.weight.medium }}>No student conflicts</span>
                  </>
                )}
              </div>
              {(currentDate || requestedDate) && (
                <div style={{ marginTop: "6px", fontSize: fonts.size.xs, color: colors.text.muted }}>
                  {currentDate && <span>From: <strong>{fmtDateLabel(currentDate)}</strong></span>}
                  {currentDate && requestedDate && <span style={{ margin: "0 6px" }}>→</span>}
                  {requestedDate && <span>To: <strong>{fmtDateLabel(requestedDate)}</strong></span>}
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Reason for rescheduling</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Briefly explain why you need to reschedule this class…"
              style={inputStyle}
            />
          </div>

          {submitError && (
            <div style={{ color: colors.error.main, fontSize: fonts.size.sm, marginBottom: "12px" }}>{submitError}</div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              style={{
                ...btnPrimary,
                opacity: canSubmit && !submitting ? 1 : 0.5,
                cursor: canSubmit && !submitting ? "pointer" : "not-allowed",
              }}
            >
              <Send size={14} />
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main Component ───────────────────────────────────────────
export default function RescheduleRequests() {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showWizard, setShowWizard] = useState(false);

  const normalizeRequest = (r) => {
    const cur = r.currentSlot || {};
    const req = r.requestedSlot || {};
    return {
      id: r._id || r.id,
      course: r.course || "—",
      courseCode: r.courseCode || "—",
      currentSlot: { day: cur.day || "—", time: cur.time || "—", room: cur.room || "—" },
      requestedSlot: { day: req.day || "—", time: req.time || "—", room: req.room || "—" },
      currentDate: r.currentDate || "",
      requestedDate: r.requestedDate || "",
      reason: r.reason || "",
      status: r.status || "pending",
      conflictStatus: r.conflictStatus || "No conflicts",
      affectedStudentCount: r.affectedStudentCount ?? 0,
      createdAt: r.createdAt,
    };
  };

  const reload = async () => {
    if (!user?._id) { setLoading(false); return; }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchRescheduleRequests(user._id);
      setRequests(Array.isArray(data) ? data.map(normalizeRequest) : []);
    } catch (err) {
      setLoadError(err?.message || "Unable to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, [user?._id]);

  const handleWizardSuccess = () => {
    setShowWizard(false);
    reload();
  };

  return (
    <>
      {/* Header */}
      <div style={{ ...card, marginBottom: "12px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: radius.md,
            background: colors.primary.ghost, border: `1px solid ${colors.primary.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <RotateCcw size={18} color={colors.primary.main} />
          </div>
          <div>
            <h2 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: "15px", margin: 0, color: colors.text.primary }}>
              My Reschedule Requests
            </h2>
            <p style={{ fontSize: fonts.size.xs, color: colors.text.muted, margin: "2px 0 0" }}>
              Submit and track your class reschedule requests
            </p>
          </div>
        </div>
        {!showWizard && (
          <button onClick={() => setShowWizard(true)} style={btnPrimary}>
            <Plus size={14} /> New Request
          </button>
        )}
      </div>

      {/* Error */}
      {loadError && (
        <div style={{ margin: "0 0 12px", padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px" }}>
          {loadError}
        </div>
      )}

      {/* Wizard */}
      {showWizard && (
        <RequestWizard
          user={user}
          onClose={() => setShowWizard(false)}
          onSuccess={handleWizardSuccess}
        />
      )}

      {/* Request history */}
      <div style={{ ...card, padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h3 style={{ fontFamily: fonts.heading, fontWeight: fonts.weight.semibold, fontSize: fonts.size.base, margin: 0, color: colors.text.primary }}>
            Request History
          </h3>
          <span style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>{requests.length} total</span>
        </div>

        {loading ? (
          <div style={{ padding: "24px", textAlign: "center", color: colors.text.muted, fontSize: fonts.size.sm }}>
            Loading…
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: colors.text.muted }}>
            <RotateCcw size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
            <p style={{ fontSize: fonts.size.sm, margin: 0 }}>No reschedule requests yet</p>
            <p style={{ fontSize: fonts.size.xs, marginTop: 4 }}>Click "New Request" to submit one</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {requests.map((req) => {
              const st = statusConfig[req.status] || statusConfig.pending;
              const StatusIcon = st.icon;
              return (
                <div key={req.id} style={{
                  ...card,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  borderLeft: `3px solid ${st.color}`,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: radius.md,
                    background: st.bg, border: `1px solid ${st.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <StatusIcon size={16} color={st.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Course */}
                    {req.courseCode !== "—" && (
                      <div style={{ fontSize: fonts.size.xs, color: colors.primary.main, fontWeight: fonts.weight.semibold, marginBottom: "2px" }}>
                        {req.courseCode}{req.course !== "—" ? ` — ${req.course}` : ""}
                      </div>
                    )}
                    {/* Slot info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.semibold, color: colors.text.primary }}>
                        {req.currentDate ? fmtDateLabel(req.currentDate) : req.currentSlot?.day} {!req.currentDate ? req.currentSlot?.time : ""}
                      </span>
                      <span style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>→</span>
                      <span style={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.semibold, color: colors.primary.main }}>
                        {req.requestedDate ? fmtDateLabel(req.requestedDate) : req.requestedSlot?.day} {!req.requestedDate ? req.requestedSlot?.time : ""}
                      </span>
                    </div>
                    {/* Reason */}
                    <p style={{ fontSize: fonts.size.xs, color: colors.text.secondary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {req.reason}
                    </p>
                    {/* Affected students */}
                    {req.affectedStudentCount > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                        <AlertTriangle size={11} color={colors.warning.main} />
                        <span style={{ fontSize: "11px", color: colors.warning.main }}>
                          {req.affectedStudentCount} student{req.affectedStudentCount > 1 ? "s" : ""} affected
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                    <div style={{
                      padding: "4px 10px", borderRadius: radius.full,
                      background: st.bg, border: `1px solid ${st.border}`,
                      fontSize: fonts.size.xs, fontWeight: fonts.weight.semibold, color: st.color,
                    }}>
                      {st.label}
                    </div>
                    <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
                      {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

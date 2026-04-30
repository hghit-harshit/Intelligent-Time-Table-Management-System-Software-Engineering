import { useEffect, useState } from "react";
import CalendarView from "../../../components/CalendarView";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { useUser } from "../../../contexts/UserContext";
import {
  createRescheduleRequest,
  fetchCatalogCourses,
  fetchCatalogProfessors,
  fetchRescheduleRequests,
  fetchTimetableLatest,
} from "../../../services/facultyApi";

export default function FacultyDashboard() {
  const { user } = useUser();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: "0",
    completed: "0",
    thisWeek: "0",
    pendingRequests: "0",
  });
  const [resolvedProfessorId, setResolvedProfessorId] = useState(null);
  const [courseByCode, setCourseByCode] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    currentDay: "",
    currentTime: "",
    requestedDay: "",
    requestedTime: "",
    reason: "",
  });

  const normalizeName = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/^dr\.?\s+/, "")
      .trim();

  const formatTime12 = (value) => {
    if (!value) return "";
    if (/am|pm/i.test(value)) return value;
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  const formatTime24 = (value) => {
    if (!value) return "";
    if (!/am|pm/i.test(value)) return value;
    const match = value.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!match) return value;
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3].toLowerCase();
    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const parseTimeMinutes = (value) => {
    if (!value) return null;
    const time24 = formatTime24(value);
    const [hours, minutes] = time24.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const buildCalendarEvents = (assignments) => {
    const palette = [
      { bg: colors.primary.ghost, fg: colors.primary.main },
      { bg: colors.warning.ghost, fg: colors.warning.main },
      { bg: colors.success.ghost, fg: colors.success.main },
      { bg: colors.info.ghost, fg: colors.info.main },
      { bg: colors.secondary.ghost, fg: colors.secondary.main },
    ];

    return assignments.map((assignment, index) => {
      const pick = palette[index % palette.length];
      return {
        day: assignment.day,
        time: formatTime12(assignment.startTime || assignment.time),
        title: assignment.courseName || assignment.courseCode || "Untitled",
        location: assignment.roomName || "TBD",
        color: pick.bg,
        textColor: pick.fg,
        raw: assignment,
      };
    });
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [timetable, requestData] = await Promise.all([
          fetchTimetableLatest(),
          user?._id ? fetchRescheduleRequests(user._id) : Promise.resolve([]),
        ]);

        const assignments = Array.isArray(timetable?.assignments)
          ? timetable.assignments
          : [];
        const facultyName = user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
          : "";
        let filtered = assignments;

        if (facultyName) {
          const target = normalizeName(facultyName);
          const matches = assignments.filter((assignment) => {
            const value = normalizeName(assignment.professorName || "");
            return value && (value.includes(target) || target.includes(value));
          });
          if (matches.length) {
            filtered = matches;
          }
        }

        const events = buildCalendarEvents(filtered);
        const pendingRequests = Array.isArray(requestData)
          ? requestData.filter((req) => req.status === "pending").length
          : 0;

        const today = new Date();
        const dayIndex = {
          Sunday: 0,
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
        };
        const nowDay = today.getDay();
        const nowMinutes = today.getHours() * 60 + today.getMinutes();
        const completed = filtered.filter((assignment) => {
          const day = dayIndex[assignment.day] ?? null;
          if (day === null) return false;
          if (day < nowDay) return true;
          if (day > nowDay) return false;
          const startMinutes = parseTimeMinutes(assignment.startTime);
          return startMinutes !== null && startMinutes < nowMinutes;
        }).length;

        if (!isMounted) return;
        setCalendarEvents(events);
        setStats({
          totalClasses: String(filtered.length),
          completed: String(completed),
          thisWeek: String(filtered.length),
          pendingRequests: String(pendingRequests),
        });
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error?.message || "Unable to load faculty dashboard");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [user?._id, user?.firstName, user?.lastName]);

  const handleSlotClick = (slot) => {
    const match = calendarEvents.find(
      (event) => event.day === slot.day && event.time === slot.time,
    );
    setSelectedSlot(
      match
        ? { ...slot, title: match.title, location: match.location }
        : slot,
    );
  };

  const handleRequestReschedule = () => {
    if (selectedSlot) {
      setRescheduleForm((prev) => ({
        ...prev,
        currentDay: selectedSlot.day,
        currentTime: selectedSlot.time,
      }));
      setShowRescheduleModal(true);
    } else {
      alert("Please select a time slot from the calendar first");
    }
  };

  const handleRescheduleChange = (e) => {
    const { name, value } = e.target;
    setRescheduleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReschedule = async () => {
    if (
      !rescheduleForm.requestedDay ||
      !rescheduleForm.requestedTime ||
      !rescheduleForm.reason
    ) {
      alert("Please fill in all fields");
      return;
    }
    if (!user?._id) {
      alert("Please sign in again to submit a request.");
      return;
    }

    const facultyName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    try {
      await createRescheduleRequest({
        professorId: user._id,
        currentSlot: {
          day: selectedSlot?.day || rescheduleForm.currentDay,
          time: formatTime24(
            selectedSlot?.time || rescheduleForm.currentTime,
          ),
          room: selectedSlot?.location || "—",
        },
        requestedSlot: {
          day: rescheduleForm.requestedDay,
          time: formatTime24(rescheduleForm.requestedTime),
          room: "—",
        },
        reason: rescheduleForm.reason,
        conflictStatus: "",
      });

      alert("Reschedule request submitted successfully! Pending admin approval.");
      setShowRescheduleModal(false);
      setRescheduleForm({
        currentDay: "",
        currentTime: "",
        requestedDay: "",
        requestedTime: "",
        reason: "",
      });
      setSelectedSlot(null);
    } catch (error) {
      alert(error?.message || "Unable to submit reschedule request");
    }
  };

  const card = {
    background: colors.bg.base,
    border: `1px solid ${colors.border.medium}`,
    borderRadius: radius.lg,
    boxShadow: shadows.sm,
  };
  const heading = {
    fontFamily: fonts.heading,
    fontWeight: fonts.weight.semibold,
    color: colors.text.primary,
  };
  const muted = { fontSize: fonts.size.sm, color: colors.text.secondary };
  const caption = { fontSize: fonts.size.xs, color: colors.text.muted };
  const inputField = {
    width: "100%",
    padding: "8px 12px",
    background: colors.bg.base,
    border: `1px solid ${colors.border.medium}`,
    borderRadius: radius.md,
    color: colors.text.primary,
    fontSize: fonts.size.base,
    fontFamily: fonts.body,
    outline: "none",
  };

  return (
    <>
      {/* Top Bar */}
      <div
        style={{
          ...card,
          marginBottom: "12px",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: 3,
                height: 20,
                borderRadius: "2px",
                background: "#7C3AED",
              }}
            />
            <h2
              style={{
                ...heading,
                fontSize: "15px",
                margin: 0,
                fontWeight: 700,
              }}
            >
              Faculty Dashboard
            </h2>
          </div>
          <p style={{ ...caption, margin: "4px 0 0 11px" }}>
            Teaching schedule & availability
          </p>
        </div>
        <button
          onClick={handleRequestReschedule}
          style={{
            padding: "8px 16px",
            background: colors.primary.main,
            color: "#fff",
            border: "none",
            borderRadius: radius.md,
            fontSize: fonts.size.sm,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: fonts.body,
          }}
        >
          Request Reschedule
        </button>
      </div>

      {loading && (
        <div
          style={{
            marginBottom: "12px",
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(59, 130, 246, 0.1)",
            color: "#3b82f6",
            fontSize: "12px",
          }}
        >
          Loading faculty schedule...
        </div>
      )}

      {loadError && (
        <div
          style={{
            marginBottom: "12px",
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

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        {[
          {
            label: "Total Classes",
            value: stats.totalClasses,
            color: colors.primary.main,
          },
          { label: "Completed", value: stats.completed, color: colors.success.main },
          { label: "This Week", value: stats.thisWeek, color: colors.secondary.main },
          {
            label: "Pending Requests",
            value: stats.pendingRequests,
            color: colors.warning.main,
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{ ...card, padding: "14px", textAlign: "center" }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: stat.color,
                marginBottom: "4px",
                fontFamily: fonts.heading,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {stat.value}
            </div>
            <div style={{ ...muted, fontSize: fonts.size.xs }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <h3 style={{ ...heading, fontSize: fonts.size.base, margin: 0 }}>
            Weekly Schedule
          </h3>
          <div style={caption}>
            Click on any slot to select it for rescheduling
          </div>
        </div>

        <CalendarView events={calendarEvents} onSlotClick={handleSlotClick} />

        {selectedSlot && (
          <div
            style={{
              marginTop: "12px",
              padding: "12px 16px",
              background: colors.primary.ghost,
              border: `1px solid ${colors.primary.border}`,
              borderRadius: radius.md,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: colors.primary.main,
              }}
            />
            <div
              style={{
                fontSize: fonts.size.base,
                color: colors.primary.main,
                fontWeight: 500,
              }}
            >
              Selected: {selectedSlot.day} at {selectedSlot.time}
            </div>
            <button
              onClick={handleRequestReschedule}
              style={{
                marginLeft: "auto",
                padding: "6px 12px",
                fontSize: fonts.size.xs,
                background: colors.primary.main,
                color: "#fff",
                border: "none",
                borderRadius: radius.sm,
                cursor: "pointer",
                fontFamily: fonts.body,
              }}
            >
              Reschedule This Slot
            </button>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
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
          onClick={() => setShowRescheduleModal(false)}
        >
          <div
            style={{
              background: colors.bg.base,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: radius.xl,
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: shadows.xl,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                ...heading,
                fontSize: fonts.size.lg,
                marginBottom: "20px",
              }}
            >
              Request Reschedule
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    ...caption,
                    marginBottom: "6px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Current Day
                </label>
                <input
                  type="text"
                  value={selectedSlot?.day || ""}
                  readOnly
                  style={{ ...inputField, opacity: 0.5, cursor: "not-allowed" }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    ...caption,
                    marginBottom: "6px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Current Time
                </label>
                <input
                  type="text"
                  value={selectedSlot?.time || ""}
                  readOnly
                  style={{ ...inputField, opacity: 0.5, cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    ...caption,
                    marginBottom: "6px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Requested Day
                </label>
                <select
                  name="requestedDay"
                  value={rescheduleForm.requestedDay}
                  onChange={handleRescheduleChange}
                  style={{ ...inputField, cursor: "pointer" }}
                >
                  <option value="">Select Day</option>
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    ...caption,
                    marginBottom: "6px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Requested Time
                </label>
                <input
                  type="time"
                  name="requestedTime"
                  value={rescheduleForm.requestedTime}
                  onChange={handleRescheduleChange}
                  style={inputField}
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  ...caption,
                  marginBottom: "6px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Reason for Rescheduling
              </label>
              <textarea
                name="reason"
                value={rescheduleForm.reason}
                onChange={handleRescheduleChange}
                rows={4}
                placeholder="Please provide a reason..."
                style={{ ...inputField, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowRescheduleModal(false)}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  background: colors.bg.raised,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: radius.md,
                  fontSize: fonts.size.sm,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReschedule}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  background: colors.primary.main,
                  color: "#fff",
                  border: "none",
                  borderRadius: radius.md,
                  fontSize: fonts.size.sm,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import CalendarView from "../../../components/CalendarView";
import CalendarCard from "../../student/components/CalendarCard";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { useUser } from "../../../contexts/UserContext";
import {
  createRescheduleRequest,
  fetchCatalogCourses,
  fetchCatalogProfessors,
  fetchRescheduleRequests,
  fetchTimetableLatest,
} from "../../../services/facultyApi";
import { fetchTimetablePublishedAt } from "../../../services/studentApi";

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
  const [stale, setStale] = useState(false);
  const loadedPublishedAt = useRef<string | null>(null);
  const [selectedView, setSelectedView] = useState("week")
  const [viewWeekStart, setViewWeekStart] = useState(() => {
    const d = new Date(); d.setHours(0,0,0,0)
    const day = d.getDay()
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    return d
  })
  const [viewDayDate, setViewDayDate] = useState(() => new Date())
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate())
  const [facultyTimetableData, setFacultyTimetableData] = useState<any>(null)
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

  const WEEK_DAY_NAMES_F = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const WEEK_DAYS_F = ["MON", "TUE", "WED", "THU", "FRI"]

  const fmt12F = (time) => {
    if (!time) return ""
    if (/am|pm/i.test(time)) return time
    const [h, m] = time.split(":").map(Number)
    if (isNaN(h)) return time
    const suffix = h >= 12 ? "PM" : "AM"
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`
  }

  const timeToMinF = (t) => {
    if (!t) return 0
    const [h, m] = String(t).split(":").map(Number)
    return (h || 0) * 60 + (m || 0)
  }

  const normalizeDayF = (val) => {
    const map: Record<string,string> = {
      mon:"Monday", monday:"Monday", tue:"Tuesday", tuesday:"Tuesday",
      wed:"Wednesday", wednesday:"Wednesday", thu:"Thursday", thursday:"Thursday",
      fri:"Friday", friday:"Friday"
    }
    return map[String(val).toLowerCase()] ?? val
  }

  const buildFacultyTimetableData = (assignments: any[], weekStart: Date) => {
    const now = new Date()
    const weekActualDates = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    })
    const weekDates = weekActualDates.map(d => d.getDate())

    const byDay = new Map(WEEK_DAY_NAMES_F.map(d => [d, [] as any[]]))
    for (const a of assignments) {
      const day = normalizeDayF(a.day)
      if (byDay.has(day)) byDay.get(day)!.push(a)
    }

    const timeSlots = [...new Set(assignments.map(a => a.startTime))]
      .filter(Boolean)
      .sort((a: any, b: any) => timeToMinF(a) - timeToMinF(b))

    const weeklySchedule = timeSlots.map((time: any) => ({
      time: fmt12F(time),
      classes: WEEK_DAY_NAMES_F.map(day => {
        const match = byDay.get(day)?.find(a => a.startTime === time)
        return match ? {
          name: match.courseName || match.courseCode || "Untitled",
          location: match.roomName || "TBD",
          professor: match.professorName || "",
          isRescheduled: false,
        } : null
      })
    }))

    const dailySchedules: Record<string, any[]> = {}
    weekActualDates.forEach((date, i) => {
      const dayName = WEEK_DAY_NAMES_F[i]
      const items = [...(byDay.get(dayName) || [])].sort((a, b) => timeToMinF(a.startTime) - timeToMinF(b.startTime))
      dailySchedules[String(date.getDate())] = items.map(a => {
        const dur = timeToMinF(a.endTime) - timeToMinF(a.startTime)
        const duration = dur > 0 ? (dur % 60 === 0 ? `${dur/60} hr` : `${dur} min`) : ""
        return {
          time: fmt12F(a.startTime),
          class: {
            name: a.courseName || a.courseCode || "Untitled",
            location: a.roomName || "TBD",
            professor: a.professorName || "",
            isRescheduled: false,
            duration,
          }
        }
      })
    })

    const DAY_NAMES_F = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    return {
      weekDays: WEEK_DAYS_F,
      weekDates,
      weeklySchedule,
      dailySchedules,
      currentDate: { day: now.getDate(), month: now.getMonth()+1, year: now.getFullYear(), dayName: DAY_NAMES_F[now.getDay()] },
      calendar: { monthDaysWithClasses: [], timeSlots: (timeSlots as string[]).map(fmt12F) }
    }
  }

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
        setStale(false);
        setFacultyTimetableData(buildFacultyTimetableData(filtered, viewWeekStart));
        setStats({
          totalClasses: String(filtered.length),
          completed: String(completed),
          thisWeek: String(filtered.length),
          pendingRequests: String(pendingRequests),
        });
        // Record the timetable version we just loaded
        fetchTimetablePublishedAt().then((v) => {
          if (v?.publishedAt) loadedPublishedAt.current = v.publishedAt;
        }).catch(() => {});
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

  // Poll every 90 seconds for a new timetable publish
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTimetablePublishedAt().then((v) => {
        if (v?.publishedAt && loadedPublishedAt.current && v.publishedAt !== loadedPublishedAt.current) {
          setStale(true);
        }
      }).catch(() => {});
    }, 90_000);
    return () => clearInterval(interval);
  }, []);

  // Rebuild timetable data when week changes (calendarEvents already loaded)
  useEffect(() => {
    if (calendarEvents.length === 0) return
    const rawAssignments = calendarEvents.map(e => e.raw)
    setFacultyTimetableData(buildFacultyTimetableData(rawAssignments, viewWeekStart))
  }, [viewWeekStart])

  const toLocalISOF = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`

  const getMondayOfF = (date: Date) => {
    const d = new Date(date); d.setHours(0,0,0,0)
    const day = d.getDay()
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    return d
  }

  const handlePrevF = () => {
    if (selectedView === "week") {
      const prev = new Date(viewWeekStart); prev.setDate(prev.getDate() - 7); setViewWeekStart(prev)
    } else if (selectedView === "day") {
      const prev = new Date(viewDayDate); prev.setDate(prev.getDate() - 1); setViewDayDate(prev)
      setSelectedDate(prev.getDate()); setSelectedMonth(prev.getMonth()+1); setSelectedYear(prev.getFullYear())
      const pm = getMondayOfF(prev)
      if (pm.getTime() !== viewWeekStart.getTime()) setViewWeekStart(pm)
    } else {
      if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y-1) } else setSelectedMonth(m => m-1)
      setSelectedDate(1)
    }
  }

  const handleNextF = () => {
    if (selectedView === "week") {
      const next = new Date(viewWeekStart); next.setDate(next.getDate() + 7); setViewWeekStart(next)
    } else if (selectedView === "day") {
      const next = new Date(viewDayDate); next.setDate(next.getDate() + 1); setViewDayDate(next)
      setSelectedDate(next.getDate()); setSelectedMonth(next.getMonth()+1); setSelectedYear(next.getFullYear())
      const nm = getMondayOfF(next)
      if (nm.getTime() !== viewWeekStart.getTime()) setViewWeekStart(nm)
    } else {
      if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y+1) } else setSelectedMonth(m => m+1)
      setSelectedDate(1)
    }
  }

  const MONTH_NAMES_F = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const DAY_NAMES_F2 = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

  const getHeaderLabelF = () => {
    if (selectedView === "week") {
      const friday = new Date(viewWeekStart); friday.setDate(friday.getDate() + 4)
      return `${viewWeekStart.toLocaleDateString("en-IN", { month:"short", day:"numeric" })} – ${friday.getDate()}, ${viewWeekStart.getFullYear()}`
    }
    if (selectedView === "day") {
      return viewDayDate.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
    }
    return `${MONTH_NAMES_F[selectedMonth-1]} ${selectedYear}`
  }

  const getScheduleForDateF = (date) => {
    if (!facultyTimetableData) return []
    const fromCache = facultyTimetableData.dailySchedules?.[date.toString()]
    if (fromCache && fromCache.length > 0) return fromCache
    const d = new Date(selectedYear, selectedMonth - 1, date)
    const jsDay = d.getDay()
    if (jsDay === 0 || jsDay === 6) return []
    const idx = jsDay - 1
    const result: any[] = []
    for (const slot of (facultyTimetableData.weeklySchedule || [])) {
      const item = slot.classes?.[idx]
      if (item) result.push({ time: slot.time, class: { ...item, duration: "" } })
    }
    return result
  }

  const getDayNameF = (date) => DAY_NAMES_F2[new Date(selectedYear, selectedMonth-1, date).getDay()]
  const getShortDayNameF = (date) => {
    const s = ["SUN","MON","TUE","WED","THU","FRI","SAT"]
    return s[new Date(selectedYear, selectedMonth-1, date).getDay()]
  }
  const getDaysInMonthF = (month, year) => new Date(year, month, 0).getDate()
  const getFirstDayOfMonthF = (month, year) => new Date(year, month-1, 1).getDay()
  const getMonthNameF = (m) => MONTH_NAMES_F[m-1]

  const handleCalendarTimeSlotClick = (item) => {
    const match = calendarEvents.find(e => e.day === item.day && e.time === item.time)
    setSelectedSlot(match ? { ...item, title: item.name, location: item.location } : { ...item, title: item.name })
  }

  const handleDateClickF = (day) => {
    setSelectedDate(day); setSelectedView("day")
    setViewDayDate(new Date(selectedYear, selectedMonth-1, day))
  }

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
      {stale && (
        <div style={{
          margin: "0 0 12px",
          padding: "10px 16px",
          borderRadius: 8,
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.3)",
          color: "#1d4ed8",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}>
          <span>📅 A new timetable has been published. Your schedule may have changed.</span>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#1d4ed8",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Refresh Now
          </button>
        </div>
      )}

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
      {facultyTimetableData ? (
        <>
          <CalendarCard
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            handlePrev={handlePrevF}
            handleNext={handleNextF}
            handleDateClick={handleDateClickF}
            handleTimeSlotClick={handleCalendarTimeSlotClick}
            headerLabel={getHeaderLabelF()}
            getMonthName={getMonthNameF}
            getDaysInMonth={getDaysInMonthF}
            getFirstDayOfMonth={getFirstDayOfMonthF}
            getDayName={getDayNameF}
            getShortDayName={getShortDayNameF}
            getScheduleForDate={getScheduleForDateF}
            timetableData={facultyTimetableData}
            viewWeekStart={viewWeekStart}
          />
          {selectedSlot && (
            <div style={{ marginBottom: "12px", padding: "12px 16px", background: colors.primary.ghost, border: `1px solid ${colors.primary.border}`, borderRadius: radius.md, display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.primary.main }} />
              <div style={{ fontSize: fonts.size.base, color: colors.primary.main, fontWeight: 500 }}>
                Selected: {selectedSlot.day} at {selectedSlot.time}
              </div>
              <button onClick={handleRequestReschedule} style={{ marginLeft: "auto", padding: "6px 12px", fontSize: fonts.size.xs, background: colors.primary.main, color: "#fff", border: "none", borderRadius: radius.sm, cursor: "pointer", fontFamily: fonts.body }}>
                Reschedule This Slot
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ ...card, padding: "32px", textAlign: "center", color: colors.text.muted, fontSize: fonts.size.sm }}>
          {loading ? "Loading schedule…" : "No timetable published yet."}
        </div>
      )}

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

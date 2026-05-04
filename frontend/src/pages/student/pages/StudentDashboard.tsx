/**
 * StudentDashboard — Main Timetable / Dashboard View
 *
 * Per DISHA UI Guide §3:
 * - Full-height layout: CalendarCard (left/main) + RightPane (contextual column)
 * - Right pane states: "classes" (default) / "notifs" (bell) / "exams" (View Exams)
 * - "View Exams" toggles examMode: exam-only calendar + exams pane simultaneously
 * - "View Full Calendar" reverts to normal mode
 * - "+ Add Task" opens AddTaskModal overlay; tasks shown in calendar + right pane
 * - Month → Day navigation on date click
 * - Red line time indicator built into DayView and WeekView
 */

import { useEffect, useState } from "react";
import { fetchStudentDashboard, fetchNotificationUnreadCount, fetchStudentExams } from "../../../services/studentApi";
import CalendarCard from "../components/CalendarCard";
import RightPane from "../components/RightPane";
import ClassDetailsModal from "../components/ClassDetailsModal";
import AddTaskModal from "../components/AddTaskModal";
import { colors, fonts } from "../../../styles/tokens";

type PaneState = "classes" | "notifs" | "exams";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  reminder: boolean;
  reminderTime: string;
  dueDate: string;
  completed: boolean;
}

const buildEmptyDashboard = () => {
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    semester: { name: "Semester", period: "", status: { text: "Loading", type: "info" } },
    currentDate: {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      dayName: dayNames[now.getDay()],
    },
    stats: [],
    weekDays: [],
    weekDates: [],
    weeklySchedule: [],
    dailySchedules: {},
    todaysClasses: [],
    quickActions: [],
    upcomingEvents: [],
    calendar: { monthDaysWithClasses: [], timeSlots: [] },
  };
};

export default function StudentDashboard() {
  const initialDashboard = buildEmptyDashboard();
  const [dashboardData, setDashboardData] = useState(initialDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedView, setSelectedView] = useState("week");
  const [selectedDate, setSelectedDate] = useState(initialDashboard.currentDate.day);
  const [selectedMonth, setSelectedMonth] = useState(initialDashboard.currentDate.month);
  const [selectedYear, setSelectedYear] = useState(initialDashboard.currentDate.year);

  // Modal / overlay states
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Exam mode toggle
  const [examMode, setExamMode] = useState(false);
  const [examData, setExamData] = useState<any[]>([]);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);

  // Right pane state
  const [paneState, setPaneState] = useState<PaneState>("classes");

  useEffect(() => {
    fetchNotificationUnreadCount()
      .then((data) => setNotificationCount(data?.unread ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStudentExams()
      .then((data) => setExamData(Array.isArray(data) ? data : data?.exams || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    fetchStudentDashboard()
      .then((data) => {
        if (!isMounted) return;
        setDashboardData(data);
        setSelectedDate(data.currentDate.day);
        setSelectedMonth(data.currentDate.month);
        setSelectedYear(data.currentDate.year);
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error?.message || "Unable to load dashboard data");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTimeSlotClick = (timeSlot: any) => {
    setSelectedTimeSlot(timeSlot);
    setShowClassDetails(true);
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(day);
    setSelectedView("day");
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    setSelectedDate(1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    setSelectedDate(1);
  };

  const handleToggleExamMode = () => {
    const next = !examMode;
    setExamMode(next);
    setPaneState(next ? "exams" : "classes");
  };

  const handleBell = () => {
    setPaneState((prev) => (prev === "notifs" ? "classes" : "notifs"));
  };

  const handleAddTask = async (task: {
    title: string;
    description: string;
    category: string;
    reminder: boolean;
    reminderTime: string;
    dueDate: string;
  }) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);

    try {
      await fetch("/api/student/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          category: task.category,
          dueDate: task.dueDate || null,
          reminder: task.reminder,
          reminderMinutes: task.reminder ? parseInt(task.reminderTime) : null,
          status: "pending",
        }),
      });
    } catch {
      // Silently fail — task is shown locally
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month - 1, 1).getDay();

  const getDayName = (date: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date(selectedYear, selectedMonth - 1, date).getDay()];
  };

  const getShortDayName = (date: number) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[new Date(selectedYear, selectedMonth - 1, date).getDay()];
  };

  const getMonthName = (monthNum: number) => {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return months[monthNum - 1];
  };

  const getScheduleForDate = (date: number) =>
    dashboardData.dailySchedules[date.toString()] || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: colors.bg.deep,
      }}
    >
      {/* Loading / Error banners */}
      {isLoading && (
        <div
          style={{
            margin: "8px 16px 0",
            padding: "8px 14px",
            borderRadius: 8,
            background: "rgba(37,99,235,0.08)",
            color: "#2563EB",
            fontSize: fonts.size.sm,
          }}
        >
          Loading dashboard data...
        </div>
      )}
      {loadError && (
        <div
          style={{
            margin: "8px 16px 0",
            padding: "8px 14px",
            borderRadius: 8,
            background: "rgba(220,38,38,0.08)",
            color: colors.error.main,
            fontSize: fonts.size.sm,
          }}
        >
          {loadError}
        </div>
      )}

      {/* Main layout: Calendar + Right Pane */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "14px",
          padding: "14px 16px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Calendar (main area) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <CalendarCard
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            handleDateClick={handleDateClick}
            handleTimeSlotClick={handleTimeSlotClick}
            getMonthName={getMonthName}
            getDaysInMonth={getDaysInMonth}
            getFirstDayOfMonth={getFirstDayOfMonth}
            getDayName={getDayName}
            getShortDayName={getShortDayName}
            getScheduleForDate={getScheduleForDate}
            timetableData={dashboardData}
            examMode={examMode}
            examData={examData}
            tasks={tasks}
            onToggleExamMode={handleToggleExamMode}
            onAddTask={() => setShowAddTask(true)}
            onBell={handleBell}
            notificationCount={notificationCount}
          />
        </div>

        {/* Contextual Right Pane */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <RightPane
            paneState={paneState}
            setPaneState={setPaneState}
            todaysClasses={dashboardData.todaysClasses}
            currentDate={dashboardData.currentDate}
            onViewFullDay={() => setSelectedView("day")}
            onAddNotes={() => {
              window.location.href = "/StudentPage/notes";
            }}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>

      {/* Class Details Modal */}
      {showClassDetails && selectedTimeSlot && (
        <ClassDetailsModal
          selectedTimeSlot={selectedTimeSlot}
          onClose={() => setShowClassDetails(false)}
        />
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          onClose={() => setShowAddTask(false)}
          onSave={handleAddTask}
        />
      )}
    </div>
  );
}

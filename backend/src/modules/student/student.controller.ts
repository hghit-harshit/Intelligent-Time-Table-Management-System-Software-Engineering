import type { Request, Response } from "express";
import { CourseModel } from "../../database/models/courseModel.js";
import { StudentEnrollmentModel } from "../../database/models/studentEnrollmentModel.js";
import { TimetableResultModel } from "../../database/models/timetableResultModel.js";
import { fail, ok } from "../../shared/response.js";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const shortDayNames = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];

const weekDays = ["MON", "TUE", "WED", "THU", "FRI"];
const weekDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const dayAliasMap: Record<string, string> = {
  sun: "Sunday",
  sunday: "Sunday",
  mon: "Monday",
  monday: "Monday",
  tue: "Tuesday",
  tues: "Tuesday",
  tuesday: "Tuesday",
  wed: "Wednesday",
  weds: "Wednesday",
  wednesday: "Wednesday",
  thu: "Thursday",
  thur: "Thursday",
  thurs: "Thursday",
  thursday: "Thursday",
  fri: "Friday",
  friday: "Friday",
  sat: "Saturday",
  saturday: "Saturday",
};

const normalizeDayName = (value: unknown) => {
  if (!value) return "";
  const key = String(value).trim().toLowerCase();
  return dayAliasMap[key] ?? String(value).trim();
};

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }
  return hours * 60 + minutes;
};

const formatTime24 = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }
  return `${hours}:${String(minutes).padStart(2, "0")}`;
};

const formatTime12 = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const formatDuration = (startTime: string, endTime: string) => {
  const durationMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return "";
  }
  if (durationMinutes % 60 === 0) {
    const hours = durationMinutes / 60;
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }
  return `${durationMinutes} min`;
};

const getWeekDates = (today: Date) => {
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
};

const buildClassItem = (assignment: Record<string, any>) => {
  return {
    name: assignment.courseName || assignment.courseCode || "Untitled",
    location: assignment.roomName || "TBD",
    professor: assignment.professorName || "TBA",
    isRescheduled: Boolean(assignment.isRescheduled),
  };
};

const buildDashboardPayload = (
  assignments: Record<string, any>[],
  timetable: Record<string, any> | null,
  now: Date,
) => {
  const weekDates = getWeekDates(now);
  const weekDateMap = new Map(
    weekDayNames.map((name, index) => [name, weekDates[index]]),
  );

  const normalizedAssignments = assignments.map((assignment) => ({
    ...assignment,
    day: normalizeDayName(assignment.day),
  }));

  const assignmentsByDay = new Map<string, Record<string, any>[]>();
  for (const dayName of weekDayNames) {
    assignmentsByDay.set(dayName, []);
  }

  for (const assignment of normalizedAssignments) {
    const dayName = normalizeDayName(assignment.day);
    if (!assignmentsByDay.has(dayName)) {
      assignmentsByDay.set(dayName, []);
    }
    assignmentsByDay.get(dayName)?.push(assignment);
  }

  for (const dayAssignments of assignmentsByDay.values()) {
    dayAssignments.sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );
  }

  const timeSlots = Array.from(
    new Set(
      normalizedAssignments
        .map((assignment) => assignment.startTime)
        .filter(Boolean),
    ),
  ).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  const weeklySchedule = timeSlots.map((time) => ({
    time: formatTime24(time),
    classes: weekDayNames.map((dayName) => {
      const match = assignmentsByDay
        .get(dayName)
        ?.find((assignment) => assignment.startTime === time);
      return match ? buildClassItem(match) : null;
    }),
  }));

  const dailySchedules: Record<string, any[]> = {};
  for (const [index, dayName] of weekDayNames.entries()) {
    const date = weekDates[index];
    const dateKey = String(date.getDate());
    const items = assignmentsByDay.get(dayName) ?? [];

    dailySchedules[dateKey] = items.map((assignment) => ({
      time: formatTime12(assignment.startTime),
      class: {
        ...buildClassItem(assignment),
        duration: formatDuration(assignment.startTime, assignment.endTime),
      },
    }));
  }

  const todayDayName = dayNames[now.getDay()];
  const todayAssignments = assignmentsByDay.get(todayDayName) ?? [];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const todaysClasses = todayAssignments.map((assignment) => {
    const startMinutes = timeToMinutes(assignment.startTime);
    const endMinutes = timeToMinutes(assignment.endTime);
    const isLive = nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    const isDone = nowMinutes > endMinutes;
    const status = isLive ? "● Live Now" : isDone ? "Done" : "Upcoming";
    const statusColor = isLive || isDone ? "#22c55e" : "#3b82f6";

    const students = assignment.students ? ` · ${assignment.students} students` : "";
    const location = `${assignment.roomName || "TBD"} · ${assignment.professorName || "TBA"}${students}`;

    return {
      time: formatTime12(assignment.startTime),
      duration: formatDuration(assignment.startTime, assignment.endTime),
      subject: assignment.courseName || assignment.courseCode || "Untitled",
      location,
      status,
      statusColor,
      dotColor: statusColor,
      isLive,
    };
  });

  const upcomingClasses = [] as { dateTime: Date; assignment: Record<string, any> }[];
  for (const assignment of normalizedAssignments) {
    const dayName = normalizeDayName(assignment.day);
    const date = weekDateMap.get(dayName);
    if (!date) continue;

    const [hours, minutes] = String(assignment.startTime).split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) continue;

    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);

    if (dateTime < now) {
      continue;
    }

    upcomingClasses.push({ dateTime, assignment });
  }

  upcomingClasses.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  const upcomingEvents = upcomingClasses.slice(0, 3).map((item) => {
    const dateLabel = `${shortDayNames[item.dateTime.getDay()]} ${formatTime12(item.assignment.startTime)}`;
    return {
      type: "class",
      title: item.assignment.courseName || item.assignment.courseCode || "Upcoming class",
      date: dateLabel,
      color: "#3b82f6",
    };
  });

  const coursesSet = new Set(
    normalizedAssignments
      .map((assignment) => assignment.courseCode || assignment.courseName)
      .filter(Boolean),
  );

  const classesThisWeek = normalizedAssignments.length;

  const conflictsCount = Array.isArray(timetable?.conflicts)
    ? timetable?.conflicts.length
    : 0;

  const academicYear = timetable?.academicYear ?? "";
  const semesterNumber = timetable?.semester ?? "";

  const assignmentsDays = new Set(
    normalizedAssignments
      .map((assignment) => dayNames.indexOf(normalizeDayName(assignment.day)))
      .filter((index) => index >= 0),
  );

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthDaysWithClasses: number[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    if (assignmentsDays.has(date.getDay())) {
      monthDaysWithClasses.push(day);
    }
  }

  return {
    semester: {
      name: semesterNumber ? `Semester ${semesterNumber}` : "Semester",
      period: academicYear,
      status: {
        text: conflictsCount > 0 ? "Conflicts detected" : "No clashes this week",
        type: conflictsCount > 0 ? "warning" : "success",
      },
    },
    currentDate: {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      dayName: dayNames[now.getDay()],
    },
    stats: [
      {
        num: String(coursesSet.size),
        label: "Courses This Sem",
        onClick: "/courses",
      },
      {
        num: "0",
        label: "Exams Upcoming",
        sub: "No exams scheduled",
        onClick: "/exams",
      },
      {
        num: String(classesThisWeek),
        label: "Classes This Week",
      },
      {
        num: "N/A",
        label: "Attendance",
        sub: "No data yet",
      },
    ],
    weekDays,
    weekDates: weekDates.map((date) => date.getDate()),
    weeklySchedule,
    dailySchedules,
    todaysClasses,
    quickActions: [
      { label: "Take Notes", onClick: "/notes" },
      { label: "Add Event", onClick: "modal:addEvent" },
      { label: "Set Reminder", onClick: "/reminders" },
      { label: "View Stats", onClick: "modal:stats" },
    ],
    upcomingEvents,
    calendar: {
      monthDaysWithClasses,
      timeSlots: timeSlots.map((time) => formatTime12(time)),
    },
  };
};

export const getStudentDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Student authentication required", 401);
    }

    const now = new Date();
    const academicYear = typeof req.query.academicYear === "string" ? req.query.academicYear : undefined;
    const semester = typeof req.query.semester === "string" ? Number(req.query.semester) : undefined;

    const timetable =
      (await TimetableResultModel.findOne({ isLatest: true }).lean()) ||
      (await TimetableResultModel.findOne().sort({ generatedAt: -1 }).lean());

    let enrollmentQuery: Record<string, any> = { studentId: req.user._id };
    if (academicYear) {
      enrollmentQuery = { ...enrollmentQuery, academicYear };
    }
    if (Number.isFinite(semester)) {
      enrollmentQuery = { ...enrollmentQuery, semester };
    }

    const enrollment =
      (await StudentEnrollmentModel.findOne(enrollmentQuery).lean()) ||
      (await StudentEnrollmentModel.findOne({ studentId: req.user._id })
        .sort({ createdAt: -1 })
        .lean());

    const enrolledCourseIds =
      enrollment?.enrolledCourseIds?.map((id: any) => id.toString()) ?? [];
    const enrolledBatch = enrollment?.batchId
      ? String(enrollment.batchId).toUpperCase()
      : "";

    let courseCodes: string[] = [];
    if (enrolledCourseIds.length > 0) {
      const courses = await CourseModel.find({ _id: { $in: enrolledCourseIds } })
        .select("code")
        .lean();
      courseCodes = courses
        .map((course) => String(course.code || ""))
        .filter(Boolean);
    }

    const courseIdSet = new Set(enrolledCourseIds);
    const courseCodeSet = new Set(courseCodes);

    const rawAssignments: Record<string, any>[] = Array.isArray(timetable?.assignments)
      ? timetable?.assignments
      : [];

    const assignments = enrollment
      ? rawAssignments.filter((assignment) => {
          if (enrolledBatch && assignment.batchId) {
            return String(assignment.batchId).toUpperCase() === enrolledBatch;
          }
          if (assignment.courseId && courseIdSet.has(String(assignment.courseId))) {
            return true;
          }
          if (assignment.courseCode && courseCodeSet.has(String(assignment.courseCode))) {
            return true;
          }
          return false;
        })
      : rawAssignments;

    const payload = buildDashboardPayload(assignments, timetable, now);
    return ok(res, payload);
  } catch (error) {
    return fail(
      res,
      "Failed to fetch student dashboard",
      500,
      error instanceof Error ? error.message : error,
    );
  }
};

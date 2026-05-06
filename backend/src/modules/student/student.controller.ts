import mongoose from "mongoose";
import type { Request, Response } from "express";
import { CourseModel } from "../../database/models/courseModel.js";
import { ExamDateWindowModel } from "../../database/models/examDateWindowModel.js";
import { ExamScheduleModel } from "../../database/models/examScheduleModel.js";
import { NotificationModel } from "../../database/models/notificationModel.js";
import { ProfessorModel } from "../../database/models/professorModel.js";
import { RequestModel } from "../../database/models/requestModel.js";
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

const normalizeStartTime = (value: unknown) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const m24 = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m24) {
    return `${String(Number(m24[1])).padStart(2, "0")}:${m24[2]}`;
  }
  const m12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let hh = Number(m12[1]);
    const mm = m12[2];
    const ampm = m12[3].toUpperCase();
    if (ampm === "PM" && hh !== 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }
  return raw;
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

const formatRelativeTime = (value: Date | string | undefined) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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
  const isRescheduleSource = Boolean(assignment.isRescheduleSource);
  return {
    name: assignment.courseName || assignment.courseCode || "Untitled",
    courseCode: assignment.courseCode || "",
    location: isRescheduleSource ? "Course moved from this slot" : (assignment.roomName || "TBD"),
    professor: assignment.professorName || "TBA",
    isRescheduled: Boolean(assignment.isRescheduled),
    isRescheduleSource,
  };
};

type AssignmentRecord = Record<string, any>;

const buildDashboardPayload = (
  assignments: AssignmentRecord[],
  timetable: Record<string, any> | null,
  now: Date,
  baseAssignments?: AssignmentRecord[],
) => {
  const weekDates = getWeekDates(now);
  const weekDateMap = new Map(
    weekDayNames.map((name, index) => [name, weekDates[index]]),
  );

  const normalizedAssignments: AssignmentRecord[] = assignments.map((assignment) => ({
    ...assignment,
    day: normalizeDayName(assignment.day),
  }));

  const assignmentsByDay = new Map<string, AssignmentRecord[]>();
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

  const pickCellAssignment = (dayName: string, time: string) => {
    const matches =
      assignmentsByDay
        .get(dayName)
        ?.filter((assignment) => assignment.startTime === time) ?? [];
    if (matches.length === 0) return null;
    return matches.sort((a, b) => {
      const score = (x: AssignmentRecord) =>
        x.isRescheduled ? 3 : (x.isRescheduleSource ? 1 : 2);
      return score(b) - score(a);
    })[0];
  };

  const weeklySchedule = timeSlots.map((time) => ({
    time: formatTime24(time),
    classes: weekDayNames.map((dayName) => {
      const match = pickCellAssignment(dayName, time);
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
      isRescheduled: Boolean(assignment.isRescheduled),
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
    // Base schedule without date-specific overlays — used as fallback for month/day navigation
    baseWeeklySchedule: (() => {
      const base = (baseAssignments ?? assignments).map((a) => ({
        ...a,
        day: normalizeDayName(a.day),
      }));
      const baseByDay = new Map<string, AssignmentRecord[]>();
      for (const d of weekDayNames) baseByDay.set(d, []);
      for (const a of base) {
        const d = normalizeDayName(a.day);
        if (!baseByDay.has(d)) baseByDay.set(d, []);
        baseByDay.get(d)?.push(a);
      }
      const baseTimeslots = Array.from(new Set(base.map((a) => (a as AssignmentRecord).startTime).filter(Boolean)))
        .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
      return baseTimeslots.map((time) => ({
        time: formatTime24(time),
        classes: weekDayNames.map((dayName) => {
          const match = baseByDay.get(dayName)?.find((a) => a.startTime === time);
          return match ? buildClassItem(match) : null;
        }),
      }));
    })(),
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

    const realNow = new Date();
    const weekDateParam = typeof req.query.weekDate === "string" ? req.query.weekDate : undefined;
    const weekAnchor = weekDateParam ? new Date(weekDateParam) : realNow;
    // Use weekAnchor for week-relative calculations; realNow for live-class detection
    const now = isNaN(weekAnchor.getTime()) ? realNow : weekAnchor;
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

    let assignments: Record<string, any>[] = enrollment
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

    // Snapshot the base (pre-overlay) enrolled assignments so the frontend can derive
    // the repeating weekly pattern for month/day view dates outside the fetched week.
    const baseAssignmentsForFallback = [...assignments];

    // Apply date-specific reschedule overrides for the current week.
    // The base weekly timetable never changes; approved reschedule requests
    // are overlaid here so the student sees the correct schedule.
    if (enrolledCourseIds.length > 0) {
      const weekDatesForOverride = getWeekDates(now);
      const weekStart = new Date(weekDatesForOverride[0]);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekDatesForOverride[weekDatesForOverride.length - 1]);
      weekEnd.setHours(23, 59, 59, 999);

      const approvedReschedules = await RequestModel.find({
        status: "approved",
        courseId: { $in: enrolledCourseIds.map((id) => new mongoose.Types.ObjectId(id)) },
        $or: [
          { currentDate: { $exists: true, $nin: [null, ""] } },
          { requestedDate: { $exists: true, $nin: [null, ""] } },
        ],
      })
        .populate("courseId", "code")
        .lean();

      for (const rescheduled of approvedReschedules) {
        const fromDateStr = (rescheduled as any).currentDate as string | undefined;
        const toDateStr = (rescheduled as any).requestedDate as string | undefined;
        if (!fromDateStr && !toDateStr) continue;

        const fromDate = fromDateStr ? new Date(fromDateStr + "T00:00:00") : null;
        const toDate = toDateStr ? new Date(toDateStr + "T00:00:00") : null;
        const courseRef = (rescheduled as any).courseId;
        const courseIdStr = courseRef && typeof courseRef === "object"
          ? String(courseRef._id)
          : String(courseRef ?? "");
        const courseCode = courseRef && typeof courseRef === "object"
          ? String(courseRef.code || "")
          : String((rescheduled as any).courseCode || "");
        const curSlot = (rescheduled as any).currentSlot;
        const reqSlot = (rescheduled as any).requestedSlot;
        const curStart = normalizeStartTime(curSlot?.time?.split("-")[0]?.trim());
        const reqStart = normalizeStartTime(reqSlot?.time?.split("-")[0]?.trim());
        const reqEnd = reqSlot?.time?.split("-")[1]?.trim();

        const matchesCourse = (a: Record<string, any>) =>
          (courseIdStr && String(a.courseId) === courseIdStr) ||
          (courseCode && String(a.courseCode) === courseCode);

        // Remove the original slot from its day if currentDate is in this week
        if (fromDate && fromDate >= weekStart && fromDate <= weekEnd && curStart && curSlot?.day) {
          assignments = assignments.map((a) => {
            const isOriginalSlot =
              matchesCourse(a) &&
              normalizeStartTime(a.startTime || a.time) === curStart &&
              normalizeDayName(a.day) === normalizeDayName(curSlot.day);
            if (!isOriginalSlot) return a;
            return {
              ...a,
              isRescheduleSource: true,
              isRescheduled: false,
            };
          });
        }

        // Insert the rescheduled slot if requestedDate is in this week
        if (toDate && toDate >= weekStart && toDate <= weekEnd && reqStart && reqSlot?.day) {
          const original =
            assignments.find((a) => matchesCourse(a)) ||
            rawAssignments.find((a) => matchesCourse(a));
          if (original) {
            assignments.push({
              ...original,
              day: normalizeDayName(reqSlot.day),
              startTime: reqStart,
              endTime: reqEnd || original.endTime,
              isRescheduleSource: false,
              isRescheduled: true,
            });
          }
        }
      }
    }

    // Strip classes that fall on admin-selected exam dates.
    const examWindow = await ExamDateWindowModel.findOne({ isActive: true }).lean();
    if (examWindow) {
      const weekDatesForExam = getWeekDates(now);
      const examDayIndices = new Set<number>();
      for (const examDate of (examWindow as any).dates as Date[]) {
        const ed = new Date(examDate);
        ed.setHours(0, 0, 0, 0);
        for (let i = 0; i < weekDatesForExam.length; i++) {
          const wd = new Date(weekDatesForExam[i]);
          wd.setHours(0, 0, 0, 0);
          if (wd.getTime() === ed.getTime()) examDayIndices.add(i);
        }
      }
      if (examDayIndices.size > 0) {
        const blockedDays = new Set(
          Array.from(examDayIndices).map((i) => weekDayNames[i]),
        );
        assignments = assignments.filter(
          (a) => !blockedDays.has(normalizeDayName(a.day)),
        );
      }
    }

    const payload = buildDashboardPayload(assignments, timetable, now, baseAssignmentsForFallback);
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

const buildCourseSummary = (
  course: Record<string, any>,
  professorNames: Map<string, string>,
  statusOverride?: string,
) => {
  const professorIds = Array.isArray(course.professorIds)
    ? course.professorIds
    : [];
  const resolvedProfessors = professorIds
    .map((id: any) => professorNames.get(String(id)))
    .filter(Boolean);

  const instructor =
    course.instructor ||
    course.faculty ||
    (resolvedProfessors.length ? resolvedProfessors.join(", ") : "TBA");

  const capacity =
    course.capacity ??
    course.maxCapacity ??
    course.maxStudents ??
    course.students ??
    0;

  const enrolled = course.enrolled ?? course.students ?? 0;
  const status =
    statusOverride ||
    course.status ||
    (capacity && enrolled >= capacity ? "waitlist" : "available");

  return {
    id: String(course._id ?? course.id ?? ""),
    code: course.code ?? course.id ?? "",
    name: course.name ?? course.title ?? "Untitled",
    credits: Number(course.credits ?? course.creditHours ?? course.sessionsPerWeek ?? 0),
    instructor,
    schedule: course.schedule ?? "Schedule TBD",
    room: course.room ?? "Room TBD",
    enrolled,
    capacity,
    status,
    grade: course.grade ?? "N/A",
    completion: Number(course.completion ?? 0),
    department: course.department ?? "GENERAL",
    semester: course.semester ?? "",
    assignments: Array.isArray(course.assignments) ? course.assignments : [],
    materials: Array.isArray(course.materials) ? course.materials : [],
    description: course.description ?? "",
    prerequisites: Array.isArray(course.prerequisites)
      ? course.prerequisites
      : [],
  };
};

export const getStudentCourses = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Student authentication required", 401);
    }

    const enrollment = await StudentEnrollmentModel.findOne({
      studentId: req.user._id,
    }).lean();

    const enrolledCourseIds = enrollment?.enrolledCourseIds?.map((id: any) => id.toString()) ?? [];

    const [enrolledCourses, availableCourses] = await Promise.all([
      enrolledCourseIds.length > 0
        ? CourseModel.find({ _id: { $in: enrolledCourseIds } }).lean()
        : Promise.resolve([]),
      CourseModel.find(
        enrolledCourseIds.length > 0
          ? { _id: { $nin: enrolledCourseIds } }
          : {},
      ).lean(),
    ]);

    const professorIds = new Set<string>();
    for (const course of [...enrolledCourses, ...availableCourses]) {
      const ids = Array.isArray(course.professorIds)
        ? course.professorIds
        : [];
      ids.forEach((id: any) => professorIds.add(String(id)));
    }

    const professors = professorIds.size
      ? await ProfessorModel.find({ _id: { $in: Array.from(professorIds) } })
          .select("name")
          .lean()
      : [];

    const professorMap = new Map(
      professors.map((professor) => [String(professor._id), professor.name]),
    );

    const enrolled = enrolledCourses.map((course) =>
      buildCourseSummary(course, professorMap, "enrolled"),
    );
    const available = availableCourses.map((course) =>
      buildCourseSummary(course, professorMap),
    );

    return ok(res, { enrolled, available });
  } catch (error) {
    return fail(
      res,
      "Failed to fetch student courses",
      500,
      error instanceof Error ? error.message : error,
    );
  }
};

export const getStudentExams = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Student authentication required", 401);
    }

    const enrollment = await StudentEnrollmentModel.findOne({
      studentId: req.user._id,
    }).lean();

    const enrolledCourseIds = enrollment?.enrolledCourseIds?.map((id: any) => id.toString()) ?? [];
    const enrolledCourses = enrolledCourseIds.length
      ? await CourseModel.find({ _id: { $in: enrolledCourseIds } })
          .select("code")
          .lean()
      : [];

    const enrolledCodes = enrolledCourses
      .map((course) => String(course.code || ""))
      .filter(Boolean);

    const query: Record<string, any> = {};
    if (enrolledCourseIds.length || enrolledCodes.length) {
      query.$or = [
        ...(enrolledCourseIds.length
          ? [{ courseId: { $in: enrolledCourseIds } }]
          : []),
        ...(enrolledCodes.length
          ? [{ courseCode: { $in: enrolledCodes } }]
          : []),
      ];
    }

    const exams = await ExamScheduleModel.find(query)
      .sort({ examDate: 1 })
      .lean();

    return ok(
      res,
      exams.map((exam) => ({
        id: String(exam._id),
        courseCode: exam.courseCode,
        courseName: exam.courseName,
        examName: (exam as any).examName || "End Semester Exam",
        subject: exam.courseName || exam.courseCode || "Untitled",
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        location: exam.location,
        room: exam.room,
        invigilator: exam.invigilator,
        syllabus: Array.isArray(exam.syllabus) ? exam.syllabus : [],
        status: exam.status,
        score: exam.score,
        grade: exam.grade,
      })),
    );
  } catch (error) {
    return fail(
      res,
      "Failed to fetch exam schedule",
      500,
      error instanceof Error ? error.message : error,
    );
  }
};

export const getStudentNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Student authentication required", 401);
    }

    const notifications = await NotificationModel.find({
      $or: [
        { studentId: req.user._id },
        { studentId: null },
        { studentId: { $exists: false } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    return ok(
      res,
      notifications.map((notification) => ({
        id: String(notification._id),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        details: notification.details,
        priority: notification.priority,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        time: formatRelativeTime(notification.createdAt),
      })),
    );
  } catch (error) {
    return fail(
      res,
      "Failed to fetch notifications",
      500,
      error instanceof Error ? error.message : error,
    );
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Student authentication required", 401);
    }

    const notification = await NotificationModel.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { studentId: req.user._id },
          { studentId: null },
          { studentId: { $exists: false } },
        ],
      },
      { $set: { isRead: true } },
      { new: true },
    ).lean();

    if (!notification) {
      return fail(res, "Notification not found", 404);
    }

    return ok(res, { id: String(notification._id), isRead: true });
  } catch (error) {
    return fail(
      res,
      "Failed to update notification",
      500,
      error instanceof Error ? error.message : error,
    );
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Student authentication required", 401);
    }

    const deleted = await NotificationModel.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { studentId: req.user._id },
        { studentId: null },
        { studentId: { $exists: false } },
      ],
    }).lean();

    if (!deleted) {
      return fail(res, "Notification not found", 404);
    }

    return ok(res, { id: String(deleted._id) });
  } catch (error) {
    return fail(
      res,
      "Failed to delete notification",
      500,
      error instanceof Error ? error.message : error,
    );
  }
};

export const getNotificationUnreadCount = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Student authentication required", 401);
    }

    const [unread, total] = await Promise.all([
      NotificationModel.countDocuments({
        $or: [
          { studentId: req.user._id },
          { studentId: null },
          { studentId: { $exists: false } },
        ],
        isRead: false,
      }),
      NotificationModel.countDocuments({
        $or: [
          { studentId: req.user._id },
          { studentId: null },
          { studentId: { $exists: false } },
        ],
      }),
    ]);

    return ok(res, { unread, total });
  } catch (error) {
    return fail(
      res,
      "Failed to fetch notification count",
      500,
      error instanceof Error ? error.message : error,
    );
  }
};

export const getBatchEnrollments = async (req: Request, res: Response) => {
  try {
    const batchId = typeof req.query.batchId === "string" ? req.query.batchId : undefined;
    if (!batchId) {
      return fail(res, "batchId query parameter is required", 400);
    }

    const enrollments = await StudentEnrollmentModel.find({
      batchId: batchId.toUpperCase(),
    })
      .populate("studentId", "firstName lastName email")
      .populate("enrolledCourseIds", "code name")
      .lean();

    const students = enrollments.map((enrollment: any) => ({
      id: String(enrollment._id),
      student: enrollment.studentId
        ? {
            firstName: enrollment.studentId.firstName,
            lastName: enrollment.studentId.lastName,
            email: enrollment.studentId.email,
          }
        : null,
      enrolledCourseIds: (enrollment.enrolledCourseIds || []).map((c: any) => ({
        id: String(c._id),
        code: c.code,
        name: c.name,
      })),
      academicYear: enrollment.academicYear,
      semester: enrollment.semester,
    }));

    return ok(res, students);
  } catch (error) {
    return fail(
      res,
      "Failed to fetch batch enrollments",
      500,
      error instanceof Error ? error.message : error,
    );
  }
};

import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import { createTestUser, createProfessorUser, generateAuthToken } from "./helpers.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { NotificationModel } from "../src/database/models/notificationModel.js";
import { TaskModel } from "../src/database/models/taskModel.js";
import { StudentEnrollmentModel } from "../src/database/models/studentEnrollmentModel.js";
import { TimetableResultModel } from "../src/database/models/timetableResultModel.js";
import { ExamScheduleModel } from "../src/database/models/examScheduleModel.js";

const app = createApp();

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe("GET /api/student/dashboard", () => {
  it("returns student dashboard data", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const course = await CourseModel.create({
      code: "CS101",
      name: "Intro to CS",
      students: 100,
    });

    await StudentEnrollmentModel.create({
      studentId: student._id,
      batchId: "CS24-FY",
      enrolledCourseIds: [course._id],
      academicYear: "2025-2026",
      semester: 2,
    });

    await TimetableResultModel.create({
      version: "v1",
      status: "published",
      isLatest: true,
      assignments: [
        {
          courseCode: "CS101",
          courseName: "Intro to CS",
          courseDepartment: "CSE",
          professorName: "Dr. Smith",
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          roomName: "LH-101",
          roomCapacity: 150,
          students: 100,
          slotLabel: "L1",
        },
      ],
    });

    const res = await request(app)
      .get("/api/student/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("semester");
  });

  it("rejects professor accessing student dashboard", async () => {
    const { user } = await createProfessorUser();
    const token = generateAuthToken(user);

    const res = await request(app)
      .get("/api/student/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe("GET /api/student/courses", () => {
  it("returns enrolled courses for student", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const course = await CourseModel.create({
      code: "CS101",
      name: "Intro to CS",
      department: "CSE",
      students: 100,
    });

    await StudentEnrollmentModel.create({
      studentId: student._id,
      batchId: "CS24-FY",
      enrolledCourseIds: [course._id],
      academicYear: "2025-2026",
      semester: 2,
    });

    const res = await request(app)
      .get("/api/student/courses")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.enrolled).toHaveLength(1);
    expect(res.body.enrolled[0].code).toBe("CS101");
  });
});

describe("GET /api/student/exams", () => {
  it("returns exams for enrolled courses", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const course = await CourseModel.create({
      code: "CS101",
      name: "Intro to CS",
      students: 100,
    });

    await StudentEnrollmentModel.create({
      studentId: student._id,
      batchId: "CS24-FY",
      enrolledCourseIds: [course._id],
      academicYear: "2025-2026",
      semester: 2,
    });

    await ExamScheduleModel.create({
      courseId: course._id,
      courseCode: "CS101",
      courseName: "Intro to CS",
      examDate: new Date("2026-06-01"),
      startTime: "09:00",
      endTime: "12:00",
      room: "LH-101",
      status: "scheduled",
    });

    const res = await request(app)
      .get("/api/student/exams")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("GET /api/student/notifications", () => {
  it("returns notifications for student", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    await NotificationModel.create({
      studentId: student._id,
      type: "info",
      title: "Welcome",
      message: "Welcome to the system",
      details: "Details",
      priority: "low",
      isRead: false,
    });

    const res = await request(app)
      .get("/api/student/notifications")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("PATCH /api/student/notifications/:id/read", () => {
  it("marks notification as read", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const notif = await NotificationModel.create({
      studentId: student._id,
      type: "info",
      title: "Test",
      message: "Test message",
      isRead: false,
    });

    const res = await request(app)
      .patch(`/api/student/notifications/${notif._id}/read`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.isRead).toBe(true);
  });
});

describe("DELETE /api/student/notifications/:id", () => {
  it("deletes a notification", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const notif = await NotificationModel.create({
      studentId: student._id,
      type: "info",
      title: "Delete me",
      message: "To be deleted",
    });

    const res = await request(app)
      .delete(`/api/student/notifications/${notif._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const count = await NotificationModel.countDocuments({ _id: notif._id });
    expect(count).toBe(0);
  });
});

describe("Student tasks", () => {
  it("creates a task", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const res = await request(app)
      .post("/api/student/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Complete assignment", description: "Do the homework", priority: "high" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Complete assignment");
    expect(res.body.status).toBe("todo");
  });

  it("gets all tasks for student", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    await TaskModel.create({ studentId: student._id, title: "Task 1", status: "todo" });
    await TaskModel.create({ studentId: student._id, title: "Task 2", status: "in-progress" });

    const res = await request(app)
      .get("/api/student/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
  });

  it("updates a task status", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const task = await TaskModel.create({ studentId: student._id, title: "Task", status: "todo" });

    const res = await request(app)
      .patch(`/api/student/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "completed" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("completed");
  });

  it("deletes a task", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const task = await TaskModel.create({ studentId: student._id, title: "ToDelete", status: "todo" });

    const res = await request(app)
      .delete(`/api/student/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const count = await TaskModel.countDocuments({ _id: task._id });
    expect(count).toBe(0);
  });
});

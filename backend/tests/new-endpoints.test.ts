import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import { createTestUser, createAdminUser, generateAuthToken } from "./helpers.js";
import { StudentEnrollmentModel } from "../src/database/models/studentEnrollmentModel.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { TimetableResultModel } from "../src/database/models/timetableResultModel.js";
import { UserModel } from "../src/database/models/userModel.js";

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

describe("GET /api/student/enrollments", () => {
  it("returns enrollments for a given batchId", async () => {
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

    const res = await request(app)
      .get("/api/student/enrollments?batchId=CS24-FY")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].student.email).toBe(student.email);
    expect(res.body[0].enrolledCourseIds).toHaveLength(1);
    expect(res.body[0].enrolledCourseIds[0].code).toBe("CS101");
  });

  it("returns empty array when no enrollments match batchId", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const res = await request(app)
      .get("/api/student/enrollments?batchId=NONEXISTENT")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("rejects request without batchId", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const res = await request(app)
      .get("/api/student/enrollments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("rejects non-student accessing enrollments", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const res = await request(app)
      .get("/api/student/enrollments?batchId=CS24-FY")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe("GET /api/timetable/conflicts", () => {
  it("returns conflicts from the latest timetable", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    await TimetableResultModel.create({
      version: "v-conflicts",
      status: "published",
      isLatest: true,
      assignments: [],
      conflicts: [
        {
          type: "room_conflict",
          severity: "error",
          description: "LH-101 is double-booked on Monday 09:00",
          courseCode: "CS101",
          conflictingCourseCodes: ["CS201", "CS301"],
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          affectedRooms: ["LH-101"],
        },
        {
          type: "faculty_conflict",
          severity: "warning",
          description: "Professor has overlapping classes",
          courseCode: "CS101",
          professorName: "Dr. Smith",
          day: "Tuesday",
          startTime: "11:00",
          endTime: "12:00",
        },
      ],
    });

    const res = await request(app)
      .get("/api/timetable/conflicts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].type).toBe("Room Conflict");
    expect(res.body[0].severity).toBe("critical");
    expect(res.body[0].status).toBe("unresolved");
    expect(res.body[1].type).toBe("Faculty Conflict");
    expect(res.body[1].severity).toBe("warning");
  });

  it("returns empty array when no timetable exists", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    const res = await request(app)
      .get("/api/timetable/conflicts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns empty conflicts array when timetable has no conflicts", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    await TimetableResultModel.create({
      version: "v-clean",
      status: "published",
      isLatest: true,
      assignments: [],
      conflicts: [],
    });

    const res = await request(app)
      .get("/api/timetable/conflicts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("PATCH /api/timetable/conflicts/:id/resolve", () => {
  it("resolves a conflict", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    await TimetableResultModel.create({
      version: "v-resolve",
      status: "published",
      isLatest: true,
      assignments: [],
      conflicts: [
        {
          type: "room_conflict",
          severity: "error",
          description: "Room conflict",
          courseCode: "CS101",
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
        },
      ],
    });

    const res = await request(app)
      .patch("/api/timetable/conflicts/conflict-0/resolve")
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "resolve" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("resolved");
  });

  it("overrides a conflict", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    await TimetableResultModel.create({
      version: "v-override",
      status: "published",
      isLatest: true,
      assignments: [],
      conflicts: [
        {
          type: "faculty_conflict",
          severity: "warning",
          description: "Faculty conflict",
          courseCode: "CS101",
          day: "Tuesday",
          startTime: "11:00",
          endTime: "12:00",
        },
      ],
    });

    const res = await request(app)
      .patch("/api/timetable/conflicts/conflict-0/resolve")
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "override" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("overridden");
  });

  it("returns 404 for non-existent conflict id", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    await TimetableResultModel.create({
      version: "v-404",
      status: "published",
      isLatest: true,
      assignments: [],
      conflicts: [],
    });

    const res = await request(app)
      .patch("/api/timetable/conflicts/conflict-99/resolve")
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "resolve" });

    expect(res.status).toBe(404);
  });

  it("returns 404 when no timetable exists", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const res = await request(app)
      .patch("/api/timetable/conflicts/conflict-0/resolve")
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "resolve" });

    expect(res.status).toBe(404);
  });
});

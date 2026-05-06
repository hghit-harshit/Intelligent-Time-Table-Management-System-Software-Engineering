import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import { createAdminUser, createProfessorUser, createTestUser, generateAuthToken } from "./helpers.js";
import { ExamDateWindowModel } from "../src/database/models/examDateWindowModel.js";
import { ExamRequestModel } from "../src/database/models/examRequestModel.js";
import { ExamScheduleModel } from "../src/database/models/examScheduleModel.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { ProfessorModel } from "../src/database/models/professorModel.js";

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

describe("POST /api/exam/date-window", () => {
  it("creates an exam date window as admin", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const res = await request(app)
      .post("/api/exam/date-window")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dates: ["2026-06-01", "2026-06-02", "2026-06-03"],
        startTime: "09:00",
        endTime: "17:00",
        semester: 2,
        academicYear: "2025-2026",
      });

    expect(res.status).toBe(201);
    expect(res.body.dates).toHaveLength(3);
  });

  it("rejects non-admin creating date window", async () => {
    const { user } = await createProfessorUser();
    const token = generateAuthToken(user);

    const res = await request(app)
      .post("/api/exam/date-window")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dates: ["2026-06-01"],
        startTime: "09:00",
        endTime: "17:00",
      });

    expect(res.status).toBe(403);
  });

  it("rejects date window without dates", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const res = await request(app)
      .post("/api/exam/date-window")
      .set("Authorization", `Bearer ${token}`)
      .send({ startTime: "09:00", endTime: "17:00" });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/exam/date-window", () => {
  it("returns active exam date window", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    await ExamDateWindowModel.create({
      dates: [new Date("2026-06-01"), new Date("2026-06-02")],
      startTime: "09:00",
      endTime: "17:00",
      semester: 2,
      academicYear: "2025-2026",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/exam/date-window")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(true);
  });

  it("rejects student accessing date window", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const res = await request(app)
      .get("/api/exam/date-window")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe("POST /api/exam/request", () => {
  it("submits an exam request as professor", async () => {
    const { user, professor } = await createProfessorUser();
    const token = generateAuthToken(user);

    const course = await CourseModel.create({
      code: "CS101",
      name: "Intro to CS",
      professorIds: [professor._id],
      students: 100,
    });

    await ProfessorModel.updateOne(
      { _id: professor._id },
      { $set: { courseMappings: [course._id] } }
    );

    await ExamDateWindowModel.create({
      dates: [new Date("2026-06-01"), new Date("2026-06-02")],
      startTime: "09:00",
      endTime: "17:00",
      semester: 2,
      isActive: true,
    });

    const res = await request(app)
      .post("/api/exam/request")
      .set("Authorization", `Bearer ${token}`)
      .send({
        courseId: course._id.toString(),
        examName: "End Semester",
        examDate: "2026-06-01",
        startTime: "09:00",
        endTime: "12:00",
        venue: "LH-101",
      });

    expect(res.status).toBe(201);
    expect(res.body.request.status).toBe("pending");
  });

  it("rejects student submitting exam request", async () => {
    const student = await createTestUser({ role: "student" });
    const token = generateAuthToken(student);

    const res = await request(app)
      .post("/api/exam/request")
      .set("Authorization", `Bearer ${token}`)
      .send({
        courseId: "000000000000000000000001",
        examName: "End Semester",
        examDate: "2026-06-01",
        startTime: "09:00",
        endTime: "12:00",
        venue: "LH-101",
      });

    expect(res.status).toBe(403);
  });
});

describe("GET /api/exam/requests", () => {
  it("returns all exam requests for admin", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const prof = await ProfessorModel.create({ name: "Dr. Test", email: "test@test.com" });

    await ExamRequestModel.create([
      { courseId: "000000000000000000000001", courseCode: "CS101", courseName: "Intro to CS", professorId: prof._id, professorName: "Dr. Test", examName: "Midterm", examDate: new Date("2026-06-01"), startTime: "09:00", endTime: "11:00", venue: "LH-101", status: "pending" },
      { courseId: "000000000000000000000002", courseCode: "CS201", courseName: "DS", professorId: prof._id, professorName: "Dr. Test", examName: "Final", examDate: new Date("2026-06-02"), startTime: "14:00", endTime: "17:00", venue: "LH-102", status: "approved" },
    ]);

    const res = await request(app)
      .get("/api/exam/requests")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("POST /api/exam/requests/:id/approve", () => {
  it("approves an exam request and creates schedule", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const prof = await ProfessorModel.create({ name: "Dr. Approve", email: "approve@test.com" });

    const examReq = await ExamRequestModel.create({
      courseId: "000000000000000000000001",
      courseCode: "CS101",
      courseName: "Intro to CS",
      professorId: prof._id,
      professorName: "Dr. Approve",
      examName: "End Semester",
      examDate: new Date("2026-06-01"),
      startTime: "09:00",
      endTime: "12:00",
      venue: "LH-101",
      students: 100,
      status: "pending",
    });

    const res = await request(app)
      .post(`/api/exam/requests/${examReq._id}/approve`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const updatedReq = await ExamRequestModel.findById(examReq._id);
    expect(updatedReq?.status).toBe("approved");

    const schedule = await ExamScheduleModel.findOne({ courseCode: "CS101" });
    expect(schedule).toBeTruthy();
  });
});

describe("POST /api/exam/requests/:id/reject", () => {
  it("rejects an exam request", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const prof = await ProfessorModel.create({ name: "Dr. Reject", email: "reject@test.com" });

    const examReq = await ExamRequestModel.create({
      courseId: "000000000000000000000001",
      courseCode: "CS101",
      courseName: "Intro to CS",
      professorId: prof._id,
      professorName: "Dr. Reject",
      examName: "End Semester",
      examDate: new Date("2026-06-01"),
      startTime: "09:00",
      endTime: "12:00",
      venue: "LH-101",
      status: "pending",
    });

    const res = await request(app)
      .post(`/api/exam/requests/${examReq._id}/reject`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rejectionReason: "Date conflict" });

    expect(res.status).toBe(200);

    const updatedReq = await ExamRequestModel.findById(examReq._id);
    expect(updatedReq?.status).toBe("rejected");
  });
});

describe("GET /api/exam/schedule", () => {
  it("returns all exam schedules", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    await ExamScheduleModel.create([
      { courseCode: "CS101", courseName: "Intro to CS", examDate: new Date("2026-06-01"), startTime: "09:00", endTime: "12:00", room: "LH-101" },
      { courseCode: "CS201", courseName: "DS", examDate: new Date("2026-06-02"), startTime: "14:00", endTime: "17:00", room: "LH-102" },
    ]);

    const res = await request(app)
      .get("/api/exam/schedule")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /api/exam/my-requests", () => {
  it("returns professor's exam requests", async () => {
    const { user, professor } = await createProfessorUser();
    const token = generateAuthToken(user);

    await ExamRequestModel.create({
      courseId: "000000000000000000000001",
      courseCode: "CS101",
      courseName: "Intro to CS",
      professorId: professor._id,
      professorName: professor.name,
      examName: "Midterm",
      examDate: new Date("2026-06-01"),
      startTime: "09:00",
      endTime: "11:00",
      venue: "LH-101",
      status: "pending",
    });

    const res = await request(app)
      .get("/api/exam/my-requests")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("GET /api/exam/faculty-courses", () => {
  it("returns courses taught by professor", async () => {
    const { user, professor } = await createProfessorUser();
    const token = generateAuthToken(user);

    const course = await CourseModel.create({
      code: "CS101",
      name: "Intro to CS",
      professorIds: [professor._id],
      students: 100,
    });

    await ProfessorModel.updateOne(
      { _id: professor._id },
      { $set: { courseMappings: [course._id] } }
    );

    const res = await request(app)
      .get("/api/exam/faculty-courses")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].code).toBe("CS101");
  });
});

describe("DELETE /api/exam/schedule/:id", () => {
  it("deletes a scheduled exam as admin", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const exam = await ExamScheduleModel.create({
      courseCode: "CS101",
      courseName: "Intro to CS",
      examDate: new Date("2026-06-01"),
      startTime: "09:00",
      endTime: "12:00",
      room: "LH-101",
    });

    const res = await request(app)
      .delete(`/api/exam/schedule/${exam._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const count = await ExamScheduleModel.countDocuments({ _id: exam._id });
    expect(count).toBe(0);
  });

  it("rejects non-admin deleting exam schedule", async () => {
    const { user } = await createProfessorUser();
    const token = generateAuthToken(user);

    const exam = await ExamScheduleModel.create({
      courseCode: "CS101",
      courseName: "Intro to CS",
      examDate: new Date("2026-06-01"),
      startTime: "09:00",
      endTime: "12:00",
      room: "LH-101",
    });

    const res = await request(app)
      .delete(`/api/exam/schedule/${exam._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

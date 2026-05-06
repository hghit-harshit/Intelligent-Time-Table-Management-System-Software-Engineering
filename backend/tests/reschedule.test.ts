import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import { createProfessorUser, createAdminUser, generateAuthToken } from "./helpers.js";
import { RequestModel } from "../src/database/models/requestModel.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { SlotModel } from "../src/database/models/slotModel.js";

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

describe("POST /api/requests", () => {
  it("creates a reschedule request", async () => {
    const { user, professor } = await createProfessorUser();
    const token = generateAuthToken(user);

    const course = await CourseModel.create({
      code: "CS101",
      name: "Intro to CS",
      professorIds: [professor._id],
      students: 100,
    });

    const slot = await SlotModel.create({
      label: "Slot A",
      occurrences: [{ day: "Monday", startTime: "09:00", endTime: "09:55" }],
    });

    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${token}`)
      .send({
        professorId: professor._id.toString(),
        courseId: course._id.toString(),
        currentSlot: { day: "Monday", time: "09:00" },
        requestedSlot: { day: "Wednesday", time: "10:00", room: "LH-101" },
        reason: "Conference attendance",
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
    expect(res.body.reason).toBe("Conference attendance");
  });

  it("rejects request without reason", async () => {
    const { user, professor } = await createProfessorUser();
    const token = generateAuthToken(user);

    const course = await CourseModel.create({
      code: "CS101",
      name: "Intro to CS",
      professorIds: [professor._id],
      students: 100,
    });

    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseId: course._id.toString() });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/requests", () => {
  it("returns all requests for admin", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    await RequestModel.create([
      { professorId: "000000000000000000000001", courseId: "000000000000000000000002", reason: "Reason 1", status: "pending" },
      { professorId: "000000000000000000000003", courseId: "000000000000000000000004", reason: "Reason 2", status: "approved" },
    ]);

    const res = await request(app)
      .get("/api/requests")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /api/requests/pending-count", () => {
  it("returns the count of pending requests", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    await RequestModel.create([
      { professorId: "000000000000000000000001", courseId: "000000000000000000000002", reason: "R1", status: "pending" },
      { professorId: "000000000000000000000003", courseId: "000000000000000000000004", reason: "R2", status: "pending" },
      { professorId: "000000000000000000000005", courseId: "000000000000000000000006", reason: "R3", status: "approved" },
    ]);

    const res = await request(app)
      .get("/api/requests/pending-count")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.pending).toBe(2);
  });
});

describe("PATCH /api/requests/:id/approve", () => {
  it("approves a pending request", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const req = await RequestModel.create({
      professorId: "000000000000000000000001",
      courseId: "000000000000000000000002",
      reason: "To approve",
      status: "pending",
    });

    const res = await request(app)
      .patch(`/api/requests/${req._id}/approve`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
  });
});

describe("PATCH /api/requests/:id/reject", () => {
  it("rejects a pending request", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const req = await RequestModel.create({
      professorId: "000000000000000000000001",
      courseId: "000000000000000000000002",
      reason: "To reject",
      status: "pending",
    });

    const res = await request(app)
      .patch(`/api/requests/${req._id}/reject`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Not feasible" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("rejected");
  });
});

describe("GET /api/requests/:id", () => {
  it("returns a request by id", async () => {
    const user = await createProfessorUser();
    const token = generateAuthToken(user.user);

    const req = await RequestModel.create({
      professorId: user.professor._id,
      courseId: "000000000000000000000002",
      reason: "Details needed",
      status: "pending",
    });

    const res = await request(app)
      .get(`/api/requests/${req._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.reason).toBe("Details needed");
  });

  it("returns 404 for non-existent request", async () => {
    const user = await createProfessorUser();
    const token = generateAuthToken(user.user);

    const res = await request(app)
      .get("/api/requests/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import { createAdminUser, createTestUser, generateAuthToken } from "./helpers.js";
import { TimetableResultModel } from "../src/database/models/timetableResultModel.js";

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

describe("POST /api/timetable/save-draft", () => {
  it("saves a draft timetable", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const draft = {
      version: "test-v1",
      assignments: [
        {
          courseCode: "CS101",
          courseName: "Intro to CS",
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
    };

    const res = await request(app)
      .post("/api/timetable/save-draft")
      .set("Authorization", `Bearer ${token}`)
      .send(draft);

    expect(res.status).toBe(200);
    expect(res.body.result).toHaveProperty("version");
    expect(res.body.result.status).toBe("draft");
  });

  it("rejects draft without assignments", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const res = await request(app)
      .post("/api/timetable/save-draft")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("POST /api/timetable/publish", () => {
  it("publishes a draft timetable", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    // First save a draft
    await request(app)
      .post("/api/timetable/save-draft")
      .set("Authorization", `Bearer ${token}`)
      .send({
        version: "test-v2",
        assignments: [
          {
            courseCode: "CS101",
            courseName: "Intro to CS",
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
      .post("/api/timetable/publish")
      .set("Authorization", `Bearer ${token}`)
      .send({ version: "test-v2", commitMessage: "Initial publish" });

    expect(res.status).toBe(200);
    expect(res.body.result.status).toBe("published");
  });

  it("rejects publish without any draft", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    const res = await request(app)
      .post("/api/timetable/publish")
      .set("Authorization", `Bearer ${token}`)
      .send({ version: "nonexistent-version" });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/timetable/latest", () => {
  it("returns the latest published timetable", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    await TimetableResultModel.create({
      version: "v1",
      status: "published",
      isLatest: true,
      assignments: [
        {
          courseCode: "CS101",
          courseName: "Intro to CS",
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
      .get("/api/timetable/latest")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.version).toBe("v1");
    expect(res.body.assignments).toHaveLength(1);
  });

  it("returns null when no published timetable exists", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    const res = await request(app)
      .get("/api/timetable/latest")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });
});

describe("GET /api/timetable/versions", () => {
  it("returns all timetable versions", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    await TimetableResultModel.create({ version: "v1", status: "published", isLatest: false, assignments: [] });
    await TimetableResultModel.create({ version: "v2", status: "draft", isLatest: false, assignments: [] });
    await TimetableResultModel.create({ version: "v3", status: "published", isLatest: true, assignments: [] });

    const res = await request(app)
      .get("/api/timetable/versions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });
});

describe("GET /api/timetable/version/:version", () => {
  it("returns a timetable by version", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    await TimetableResultModel.create({
      version: "v-specific",
      status: "published",
      isLatest: false,
      assignments: [{ courseCode: "TEST", courseName: "Test", professorName: "Prof", day: "Monday", startTime: "09:00", endTime: "10:00", roomName: "R1", roomCapacity: 50, students: 30, slotLabel: "L1" }],
    });

    const res = await request(app)
      .get("/api/timetable/version/v-specific")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.version).toBe("v-specific");
  });

  it("returns 404 for non-existent version", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    const res = await request(app)
      .get("/api/timetable/version/nonexistent")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/timetable/version/:version", () => {
  it("deletes a non-latest version", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    await TimetableResultModel.create({ version: "v-old", status: "draft", isLatest: false, assignments: [] });

    const res = await request(app)
      .delete("/api/timetable/version/v-old")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const count = await TimetableResultModel.countDocuments({ version: "v-old" });
    expect(count).toBe(0);
  });

  it("rejects deleting the latest version", async () => {
    const admin = await createAdminUser();
    const token = generateAuthToken(admin);

    await TimetableResultModel.create({ version: "v-current", status: "published", isLatest: true, assignments: [] });

    const res = await request(app)
      .delete("/api/timetable/version/v-current")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

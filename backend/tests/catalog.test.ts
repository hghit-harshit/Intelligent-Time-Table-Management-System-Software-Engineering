import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import { createTestUser, generateAuthToken } from "./helpers.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { ProfessorModel } from "../src/database/models/professorModel.js";
import { RoomModel } from "../src/database/models/roomModel.js";

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

describe("GET /api/catalog/courses", () => {
  it("returns all courses", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    await CourseModel.create({ code: "CS101", name: "Intro to CS", department: "CSE", students: 100 });
    await CourseModel.create({ code: "CS201", name: "Data Structures", department: "CSE", students: 80 });

    const res = await request(app)
      .get("/api/catalog/courses")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it("returns empty array when no courses exist", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    const res = await request(app)
      .get("/api/catalog/courses")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe("GET /api/catalog/professors", () => {
  it("returns all professors", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    await ProfessorModel.create({ name: "Dr. Smith", email: "smith@test.com" });
    await ProfessorModel.create({ name: "Dr. Jones", email: "jones@test.com" });

    const res = await request(app)
      .get("/api/catalog/professors")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});

describe("GET /api/catalog/rooms", () => {
  it("returns all rooms", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    await RoomModel.create({ name: "LH-101", capacity: 150, building: "Block A" });
    await RoomModel.create({ name: "LH-102", capacity: 100, building: "Block B" });

    const res = await request(app)
      .get("/api/catalog/rooms")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it("returns rooms", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    await RoomModel.create({ name: "Small", capacity: 30 });
    await RoomModel.create({ name: "Medium", capacity: 80 });
    await RoomModel.create({ name: "Large", capacity: 200 });

    const res = await request(app)
      .get("/api/catalog/rooms")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });
});

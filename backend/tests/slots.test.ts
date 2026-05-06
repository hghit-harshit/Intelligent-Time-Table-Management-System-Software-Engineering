import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import { createTestUser, generateAuthToken } from "./helpers.js";
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

describe("POST /api/slots", () => {
  it("creates a slot successfully", async () => {
    const user = await createTestUser({ role: "admin" });
    const token = generateAuthToken(user);

    const res = await request(app)
      .post("/api/slots")
      .set("Authorization", `Bearer ${token}`)
      .send({
        label: "Slot A",
        occurrences: [
          { day: "Monday", startTime: "09:00", endTime: "09:55" },
          { day: "Wednesday", startTime: "11:00", endTime: "11:55" },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.label).toBe("Slot A");
    expect(res.body.occurrences).toHaveLength(2);
  });

  it("rejects slot with end time before start time", async () => {
    const user = await createTestUser({ role: "admin" });
    const token = generateAuthToken(user);

    const res = await request(app)
      .post("/api/slots")
      .set("Authorization", `Bearer ${token}`)
      .send({
        label: "Bad Slot",
        occurrences: [
          { day: "Monday", startTime: "10:00", endTime: "09:00" },
        ],
      });

    expect(res.status).toBe(400);
  });

  it("rejects slot with overlapping occurrences", async () => {
    const user = await createTestUser({ role: "admin" });
    const token = generateAuthToken(user);

    const res = await request(app)
      .post("/api/slots")
      .set("Authorization", `Bearer ${token}`)
      .send({
        label: "Overlapping Slot",
        occurrences: [
          { day: "Monday", startTime: "09:00", endTime: "10:00" },
          { day: "Monday", startTime: "09:30", endTime: "10:30" },
        ],
      });

    expect(res.status).toBe(400);
  });

  it("rejects slot with empty occurrences", async () => {
    const user = await createTestUser({ role: "admin" });
    const token = generateAuthToken(user);

    const res = await request(app)
      .post("/api/slots")
      .set("Authorization", `Bearer ${token}`)
      .send({
        label: "Empty Slot",
        occurrences: [],
      });

    expect(res.status).toBe(400);
  });

  it("rejects duplicate slot label", async () => {
    const user = await createTestUser({ role: "admin" });
    const token = generateAuthToken(user);

    await request(app)
      .post("/api/slots")
      .set("Authorization", `Bearer ${token}`)
      .send({
        label: "Unique Slot",
        occurrences: [{ day: "Monday", startTime: "09:00", endTime: "09:55" }],
      });

    const res = await request(app)
      .post("/api/slots")
      .set("Authorization", `Bearer ${token}`)
      .send({
        label: "Unique Slot",
        occurrences: [{ day: "Tuesday", startTime: "09:00", endTime: "09:55" }],
      });

    expect(res.status).toBe(409);
  });
});

describe("GET /api/slots", () => {
  it("returns all slots", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    await SlotModel.create({
      label: "Slot X",
      occurrences: [{ day: "Monday", startTime: "09:00", endTime: "09:55" }],
    });

    await SlotModel.create({
      label: "Slot Y",
      occurrences: [{ day: "Tuesday", startTime: "10:00", endTime: "10:55" }],
    });

    const res = await request(app)
      .get("/api/slots")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("returns empty array when no slots exist", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    const res = await request(app)
      .get("/api/slots")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("GET /api/slots/:id", () => {
  it("returns a slot by id", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    const slot = await SlotModel.create({
      label: "Slot Z",
      occurrences: [{ day: "Friday", startTime: "14:00", endTime: "15:00" }],
    });

    const res = await request(app)
      .get(`/api/slots/${slot._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.label).toBe("Slot Z");
  });

  it("returns 404 for non-existent slot", async () => {
    const user = await createTestUser();
    const token = generateAuthToken(user);

    const res = await request(app)
      .get("/api/slots/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/slots/:id", () => {
  it("updates a slot successfully", async () => {
    const user = await createTestUser({ role: "admin" });
    const token = generateAuthToken(user);

    const slot = await SlotModel.create({
      label: "Old Label",
      occurrences: [{ day: "Monday", startTime: "09:00", endTime: "09:55" }],
    });

    const res = await request(app)
      .put(`/api/slots/${slot._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        label: "New Label",
        occurrences: [{ day: "Tuesday", startTime: "10:00", endTime: "10:55" }],
      });

    expect(res.status).toBe(200);
    expect(res.body.label).toBe("New Label");
  });
});

describe("DELETE /api/slots/:id", () => {
  it("deletes a slot successfully", async () => {
    const user = await createTestUser({ role: "admin" });
    const token = generateAuthToken(user);

    const slot = await SlotModel.create({
      label: "ToDelete",
      occurrences: [{ day: "Monday", startTime: "09:00", endTime: "09:55" }],
    });

    const res = await request(app)
      .delete(`/api/slots/${slot._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const count = await SlotModel.countDocuments({ _id: slot._id });
    expect(count).toBe(0);
  });
});

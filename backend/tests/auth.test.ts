import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import { createTestUser, createAdminUser, createProfessorUser, generateAuthToken } from "./helpers.js";
import { UserModel } from "../src/database/models/userModel.js";
import bcrypt from "bcryptjs";

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

describe("GET /ping", () => {
  it("returns pong", async () => {
    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "pong" });
  });
});

describe("POST /api/auth/register", () => {
  it("registers a new student successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "New",
        lastName: "Student",
        email: "newstudent@test.com",
        password: "SecurePass123!",
        role: "student",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(true);
    expect(res.body).not.toHaveProperty("password");
  });

  it("registers a new professor successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "New",
        lastName: "Professor",
        email: "newprof@test.com",
        password: "SecurePass123!",
        role: "professor",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("rejects registration with weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Weak",
        lastName: "Pass",
        email: "weak@test.com",
        password: "123",
        role: "student",
      });

    expect(res.status).toBe(400);
  });

  it("rejects registration with invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Bad",
        lastName: "Email",
        email: "not-an-email",
        password: "SecurePass123!",
        role: "student",
      });

    expect(res.status).toBe(400);
  });

  it("rejects duplicate email registration", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "First",
        lastName: "User",
        email: "duplicate@test.com",
        password: "SecurePass123!",
        role: "student",
      });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Second",
        lastName: "User",
        email: "duplicate@test.com",
        password: "SecurePass123!",
        role: "student",
      });

    expect(res.status).toBe(409);
  });

  it("rejects invalid role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Bad",
        lastName: "Role",
        email: "badrole@test.com",
        password: "SecurePass123!",
        role: "superadmin",
      });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await UserModel.create({
      firstName: "Login",
      lastName: "Test",
      email: "login@test.com",
      password: await bcrypt.hash("correctpassword", 12),
      role: "student",
      isActive: true,
    });
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@test.com", password: "correctpassword" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.success).toBe(true);
  });

  it("rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@test.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("rejects non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "correctpassword" });

    expect(res.status).toBe(401);
  });

  it("rejects inactive user", async () => {
    await UserModel.create({
      firstName: "Inactive",
      lastName: "User",
      email: "inactive@test.com",
      password: await bcrypt.hash("password123", 12),
      role: "student",
      isActive: false,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "inactive@test.com", password: "password123" });

    expect(res.status).toBe(403);
  });

  it("rejects missing email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "correctpassword" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/refresh", () => {
  it("refreshes access token with valid refresh token", async () => {
    const loginRes = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Refresh",
        lastName: "Test",
        email: "refresh@test.com",
        password: "SecurePass123!",
        role: "student",
      });

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: loginRes.body.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("rejects invalid refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "invalid.token.here" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/profile", () => {
  it("returns profile for authenticated user", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Profile",
        lastName: "Test",
        email: "profile@test.com",
        password: "SecurePass123!",
        role: "student",
      });

    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${registerRes.body.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("profile@test.com");
  });

  it("rejects unauthenticated request", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.status).toBe(401);
  });

  it("rejects invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.status).toBe(401);
  });
});

describe("PUT /api/auth/profile", () => {
  it("updates profile successfully", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Update",
        lastName: "Me",
        email: "update@test.com",
        password: "SecurePass123!",
        role: "student",
      });

    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${registerRes.body.accessToken}`)
      .send({ firstName: "Updated", lastName: "Name" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.firstName).toBe("Updated");
    expect(res.body.data.lastName).toBe("Name");
  });
});

describe("PUT /api/auth/change-password", () => {
  it("changes password successfully", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Change",
        lastName: "Pass",
        email: "changepass@test.com",
        password: "OldPassword123!",
        role: "student",
      });

    const res = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${registerRes.body.accessToken}`)
      .send({ currentPassword: "OldPassword123!", newPassword: "NewPassword456!" });

    expect(res.status).toBe(200);

    // Verify login with new password works
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "changepass@test.com", password: "NewPassword456!" });

    expect(loginRes.status).toBe(200);
  });

  it("rejects wrong old password", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Wrong",
        lastName: "Old",
        email: "wrongold@test.com",
        password: "CorrectOld123!",
        role: "student",
      });

    const res = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${registerRes.body.accessToken}`)
      .send({ currentPassword: "WrongOld123!", newPassword: "NewPassword456!" });

    expect(res.status).toBe(401);
  });
});

describe("Auth middleware on protected routes", () => {
  it("blocks unauthenticated access to /api/slots", async () => {
    const res = await request(app).get("/api/slots");
    expect(res.status).toBe(401);
  });

  it("blocks unauthenticated access to /api/catalog/courses", async () => {
    const res = await request(app).get("/api/catalog/courses");
    expect(res.status).toBe(401);
  });

  it("blocks unauthenticated access to /api/student/dashboard", async () => {
    const res = await request(app).get("/api/student/dashboard");
    expect(res.status).toBe(401);
  });
});

import bcrypt from "bcryptjs";
import { UserModel } from "../src/database/models/userModel.js";
import { ProfessorModel } from "../src/database/models/professorModel.js";
import { generateTokens } from "../src/utils/token.js";

export const createTestUser = async (overrides: Record<string, unknown> = {}) => {
  const user = await UserModel.create({
    firstName: "Test",
    lastName: "User",
    email: `test.${Date.now()}@test.com`,
    password: await bcrypt.hash("password123", 12),
    role: "student",
    isActive: true,
    ...overrides,
  });
  return user;
};

export const createAdminUser = async () => {
  return createTestUser({
    firstName: "Admin",
    lastName: "Test",
    email: `admin.${Date.now()}@test.com`,
    role: "admin",
  });
};

export const createProfessorUser = async (overrides: Record<string, unknown> = {}) => {
  const user = await createTestUser({
    firstName: "Professor",
    lastName: "Test",
    email: `prof.${Date.now()}@test.com`,
    role: "professor",
    ...overrides,
  });

  const professor = await ProfessorModel.create({
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    userId: user._id,
    courseMappings: [],
    preferredDaysOff: [],
    availability: { unavailableSlotIds: [] },
  });

  user.profileId = professor._id;
  await user.save();

  return { user, professor };
};

export const generateAuthToken = (user: any) => {
  return generateTokens({
    sub: user._id.toString(),
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  }).accessToken;
};

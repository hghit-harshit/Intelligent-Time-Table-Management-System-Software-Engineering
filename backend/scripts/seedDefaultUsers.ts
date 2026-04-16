import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { UserModel } from "../src/database/models/userModel.js";
import bcrypt from "bcryptjs";

const defaultUsers = [
  {
    firstName: "Student",
    lastName: "Work",
    email: "student@gmail.com",
    password: "password123",
    role: "student",
  },
  {
    firstName: "Prof",
    lastName: "Work",
    email: "prof@gmail.com",
    password: "password123",
    role: "professor",
  },
  {
    firstName: "Admin",
    lastName: "Work",
    email: "admin@gmail.com",
    password: "password123",
    role: "admin",
  },
];

async function seedDefaultUsers() {
  try {
    await connectDatabase();
    console.log("Connected to database");

    for (const user of defaultUsers) {
      const existing = await UserModel.findOne({ email: user.email });
      if (existing) {
        console.log(`User ${user.email} already exists, skipping`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 12);
      await UserModel.create({
        ...user,
        password: hashedPassword,
        isActive: true,
      });
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    console.log("Default users seeded successfully");
  } catch (error) {
    console.error("Error seeding default users:", error);
  } finally {
    await disconnectDatabase();
  }
}

seedDefaultUsers();
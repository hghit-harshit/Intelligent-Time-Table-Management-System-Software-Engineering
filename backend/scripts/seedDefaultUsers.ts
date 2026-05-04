import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../src/database/index.js";
import { UserModel } from "../src/database/models/userModel.js";

const defaultUsers = [
  {
    firstName: "Student",
    lastName: "Work",
    email: "student@gmail.com",
    password: "password",
    role: "student",
  },
  {
    firstName: "Atharva",
    lastName: "Lohare",
    email: "es23btech11010@iith.ac.in",
    password: "Atharva@1234",
    role: "student",
  },
  {
    firstName: "Dr. Arun",
    lastName: "Kumar",
    email: "prof@gmail.com",
    password: "password",
    role: "professor",
  },
  {
    firstName: "Admin",
    lastName: "Work",
    email: "admin@gmail.com",
    password: "password",
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
        // Update name in case it changed
        existing.firstName = user.firstName;
        existing.lastName = user.lastName;
        await existing.save();
        console.log(`User ${user.email} already exists, updated name`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 12);
      await UserModel.create({
        ...user,
        password: hashedPassword,
        isActive: true,
      });
      console.log(`Created user: ${user.email} (${user.role}) — password: "${user.password}"`);
    }

    console.log("Default users seeded successfully");
  } catch (error) {
    console.error("Error seeding default users:", error);
  } finally {
    await disconnectDatabase();
  }
}

seedDefaultUsers();

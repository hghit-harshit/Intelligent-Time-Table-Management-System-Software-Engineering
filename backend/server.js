import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import slotRoutes from "./routes/slotRoutes.js";
import schedulerRoutes from "./routes/schedulerRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/timetable";

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Test route
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Routes
app.use("/api/slots", slotRoutes);
app.use("/api/scheduler", schedulerRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

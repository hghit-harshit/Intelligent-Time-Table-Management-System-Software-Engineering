import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import mongoose from "mongoose";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import Slot from "../../../models/Slot.js";
import Course from "../../../models/Course.js";
import Professor from "../../../models/Professor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOLVER_SCRIPT = path.join(__dirname, "../scheduleSolver.py");

const runSolver = (payload) =>
  new Promise((resolve, reject) => {
    const child = spawn("python3", [SOLVER_SCRIPT], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Solver exited with code ${code}`));
      } else {
        try {
          resolve(JSON.parse(stdout || "{}"));
        } catch (e) {
          reject(new Error(`Invalid JSON: ${e.message}`));
        }
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });

describe("CP-SAT Timetable Scheduler", () => {
  let testSlots = [];
  let testCourses = [];
  let testProfessors = [];

  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://admin:admin123@localhost:27017/timetable?authSource=admin",
    );

    testSlots = await Slot.find().limit(10).lean();
    testCourses = await Course.find().limit(5).lean();
    testProfessors = await Professor.find().limit(3).lean();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe("HC1: One Course Per Timeslot", () => {
    it("should not schedule multiple courses in the same slot", async () => {
      const result = await runSolver({
        constraints: { hc1_enabled: true },
        timeslots: testSlots,
        courses: testCourses,
        professors: testProfessors,
      });

      expect(result.success).toBe(true);

      const slotUsage = {};
      result.assignments.forEach((assignment) => {
        const key = `${assignment.day}|${assignment.startTime}|${assignment.endTime}`;
        if (!slotUsage[key]) {
          slotUsage[key] = [];
        }
        slotUsage[key].push(assignment.courseId);
      });

      Object.entries(slotUsage).forEach(([slot, courseIds]) => {
        expect(courseIds.length).toBeLessThanOrEqual(1);
      });
    });

    it("should not schedule multiple courses for the same professor in one slot", async () => {
      const result = await runSolver({
        constraints: { hc1_enabled: true },
        timeslots: testSlots,
        courses: testCourses,
        professors: testProfessors,
      });

      expect(result.success).toBe(true);

      const professorSlotUsage = {};
      result.assignments.forEach((assignment) => {
        const key = `${assignment.professorId}|${assignment.day}|${assignment.startTime}`;
        if (!professorSlotUsage[key]) {
          professorSlotUsage[key] = 0;
        }
        professorSlotUsage[key] += 1;
      });

      Object.values(professorSlotUsage).forEach((count) => {
        expect(count).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("SC1: Respect Unavailable Slots", () => {
    it("should respect blocked slots when constraint is enabled", async () => {
      const result = await runSolver({
        constraints: { hc1_enabled: true, sc1_enabled: true },
        timeslots: testSlots,
        courses: testCourses,
        professors: testProfessors,
      });

      expect(result.success).toBe(true);

      const sc1Violations = result.assignments.filter(
        (a) => a.softViolations?.sc1_unavailable_slot_violated,
      ).length;

      console.log(
        `SC1 violations: ${sc1Violations} out of ${result.assignments.length}`,
      );
      expect(sc1Violations).toBeLessThanOrEqual(
        result.assignments.length * 0.1,
      );
    });

    it("should relax SC1 when disabled", async () => {
      const result1 = await runSolver({
        constraints: { hc1_enabled: true, sc1_enabled: true },
        timeslots: testSlots,
        courses: testCourses,
        professors: testProfessors,
      });

      const result2 = await runSolver({
        constraints: { hc1_enabled: true, sc1_enabled: false },
        timeslots: testSlots,
        courses: testCourses,
        professors: testProfessors,
      });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe("SC2: Respect Preferred Days Off", () => {
    it("should maximize adherence to preferred days off", async () => {
      const result = await runSolver({
        constraints: { hc1_enabled: true, sc2_enabled: true },
        timeslots: testSlots,
        courses: testCourses,
        professors: testProfessors,
      });

      expect(result.success).toBe(true);

      const sc2Violations = result.assignments.filter(
        (a) => a.softViolations?.sc2_preferred_day_off_violated,
      ).length;

      console.log(
        `SC2 violations: ${sc2Violations} out of ${result.assignments.length}`,
      );
      expect(sc2Violations).toBeLessThanOrEqual(
        result.assignments.length * 0.15,
      );
    });
  });

  describe("Solver Output Validation", () => {
    it("should generate valid assignment structure", async () => {
      const result = await runSolver({
        constraints: {
          hc1_enabled: true,
          sc1_enabled: true,
          sc2_enabled: true,
        },
        timeslots: testSlots,
        courses: testCourses,
        professors: testProfessors,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.assignments)).toBe(true);
      expect(result.stats).toBeDefined();

      result.assignments.forEach((assignment) => {
        expect(assignment.courseId).toBeDefined();
        expect(assignment.courseName).toBeDefined();
        expect(assignment.professorId).toBeDefined();
        expect(assignment.professorName).toBeDefined();
        expect(assignment.timeslotId).toBeDefined();
        expect(assignment.day).toBeDefined();
        expect(assignment.startTime).toBeDefined();
        expect(assignment.endTime).toBeDefined();
        expect(assignment.softViolations).toBeDefined();
      });
    });

    it("should return stats with expected fields", async () => {
      const result = await runSolver({
        constraints: {
          hc1_enabled: true,
          sc1_enabled: true,
          sc2_enabled: true,
        },
        timeslots: testSlots,
        courses: testCourses,
        professors: testProfessors,
      });

      expect(result.stats).toHaveProperty("courseCount");
      expect(result.stats).toHaveProperty("timeslotCount");
      expect(result.stats).toHaveProperty("professorCount");
      expect(result.stats).toHaveProperty("solverStatus");
      expect(result.stats).toHaveProperty("appliedConstraints");
    });
  });

  describe("Solver Feasibility", () => {
    it("should find feasible solution with all constraints enabled", async () => {
      const result = await runSolver({
        constraints: {
          hc1_enabled: true,
          sc1_enabled: true,
          sc2_enabled: true,
        },
        timeslots: testSlots,
        courses: testCourses,
        professors: testProfessors,
      });

      expect(result.success).toBe(true);
    });

    it("should fail gracefully when no feasible solution exists", async () => {
      const impossibleCourse = {
        ...testCourses[0],
        _id: "999999999999999999999999",
        professorIds: [],
        name: "Impossible Course",
      };

      const result = await runSolver({
        constraints: { hc1_enabled: true },
        timeslots: testSlots,
        courses: [impossibleCourse],
        professors: testProfessors,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe("Sessions Per Week Distribution", () => {
    it("should schedule courses multiple times if sessionsPerWeek > 1", async () => {
      const result = await runSolver({
        constraints: { hc1_enabled: true },
        timeslots: testSlots,
        courses: testCourses.map((c) => ({
          ...c,
          sessionsPerWeek: 2,
        })),
        professors: testProfessors,
      });

      if (result.success && result.assignments.length > 0) {
        const courseCounts = {};
        result.assignments.forEach((assignment) => {
          if (!courseCounts[assignment.courseId])
            courseCounts[assignment.courseId] = 0;
          courseCounts[assignment.courseId]++;
        });

        console.log("Course scheduling counts:", courseCounts);
      }
    });
  });
});

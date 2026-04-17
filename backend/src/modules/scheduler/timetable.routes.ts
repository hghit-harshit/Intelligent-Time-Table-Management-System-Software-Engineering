import { Router } from "express";
import { z } from "zod";
import { TimetableResultModel } from "../../database/models/timetableResultModel.js";
import { ok, fail } from "../../shared/response.js";

const router = Router();

const saveDraftSchema = z.object({
  version: z.string(),
  assignments: z.array(z.object({
    courseId: z.string().optional(),
    courseCode: z.string(),
    courseName: z.string(),
    courseDepartment: z.string().optional(),
    professorId: z.string().optional(),
    professorName: z.string(),
    batchId: z.string().optional(),
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    slotLabel: z.string().optional(),
    roomName: z.string().optional(),
    roomCapacity: z.number().optional(),
    roomDepartment: z.string().optional(),
    students: z.number().optional(),
    interdisciplinary: z.boolean().optional(),
    classroomConstraintViolation: z.boolean().optional(),
  })),
  stats: z.object({
    totalAssignments: z.number().optional(),
    timeslotCount: z.number().optional(),
    solverDuration: z.number().optional(),
    solverStatus: z.string().optional(),
  }).optional(),
  constraints: z.object({
    hc1_enabled: z.boolean().optional(),
    hc2_enabled: z.boolean().optional(),
    hc3_enabled: z.boolean().optional(),
    sc1_enabled: z.boolean().optional(),
    sc2_enabled: z.boolean().optional(),
  }).optional(),
});

const publishSchema = z.object({
  version: z.string(),
});

// Save draft timetable
router.post("/save-draft", async (req, res) => {
  try {
    const payload = saveDraftSchema.parse(req.body);
    
    const result = await TimetableResultModel.findOneAndUpdate(
      { version: payload.version },
      {
        $set: {
          assignments: payload.assignments,
          stats: payload.stats,
          constraints: payload.constraints,
          status: "draft",
          generatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return ok(res, { success: true, result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(res, "Validation failed", 400, error.flatten());
    }
    return fail(res, "Failed to save draft", 500, error instanceof Error ? error.message : error);
  }
});

// Publish timetable (marks as latest)
router.post("/publish", async (req, res) => {
  try {
    const payload = publishSchema.parse(req.body);

    // First, unset isLatest from all other versions
    await TimetableResultModel.updateMany(
      { isLatest: true },
      { $set: { isLatest: false } }
    );

    // Then publish the requested version and mark as latest
    const result = await TimetableResultModel.findOneAndUpdate(
      { version: payload.version },
      {
        $set: {
          status: "published",
          isLatest: true,
          publishedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!result) {
      return fail(res, "Timetable version not found", 404);
    }

    return ok(res, { success: true, result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(res, "Validation failed", 400, error.flatten());
    }
    return fail(res, "Failed to publish timetable", 500, error instanceof Error ? error.message : error);
  }
});

// Get latest published timetable
router.get("/latest", async (req, res) => {
  try {
    const result = await TimetableResultModel.findOne({ isLatest: true });

    if (!result) {
      return ok(res, null);
    }

    return ok(res, result);
  } catch (error) {
    return fail(res, "Failed to get latest timetable", 500, error instanceof Error ? error.message : error);
  }
});

// Get timetable by version
router.get("/version/:version", async (req, res) => {
  try {
    const result = await TimetableResultModel.findOne({ version: req.params.version });

    if (!result) {
      return fail(res, "Timetable version not found", 404);
    }

    return ok(res, result);
  } catch (error) {
    return fail(res, "Failed to get timetable", 500, error instanceof Error ? error.message : error);
  }
});

// Get all versions
router.get("/versions", async (req, res) => {
  try {
    const results = await TimetableResultModel.find()
      .sort({ generatedAt: -1 })
      .select("version status isLatest generatedAt publishedAt stats");

    return ok(res, results);
  } catch (error) {
    return fail(res, "Failed to get versions", 500, error instanceof Error ? error.message : error);
  }
});

export default router;
import { Router } from "express";
import { z } from "zod";
import { TimetableResultModel } from "../../database/models/timetableResultModel.js";
import { ok, fail } from "../../shared/response.js";

const router = Router();

const saveDraftSchema = z.object({
  version: z.string(),
  commitMessage: z.string().optional(),
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
  commitMessage: z.string().optional(),
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
          commitMessage: payload.commitMessage || "",
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
    const updateData: Record<string, unknown> = {
      status: "published",
      isLatest: true,
      publishedAt: new Date(),
    };
    if (payload.commitMessage) {
      updateData.commitMessage = payload.commitMessage;
    }

    const result = await TimetableResultModel.findOneAndUpdate(
      { version: payload.version },
      { $set: updateData },
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

// Get most recently saved timetable (draft or published) — restores state on page refresh
router.get("/latest-draft", async (req, res) => {
  try {
    const result = await TimetableResultModel.findOne().sort({ generatedAt: -1 });
    return ok(res, result);
  } catch (error) {
    return fail(res, "Failed to get latest draft", 500, error instanceof Error ? error.message : error);
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
      .select("version status isLatest generatedAt publishedAt stats commitMessage");

    return ok(res, results);
  } catch (error) {
    return fail(res, "Failed to get versions", 500, error instanceof Error ? error.message : error);
  }
});

// Delete a version (cannot delete the currently published/latest)
router.delete("/version/:version", async (req, res) => {
  try {
    const doc = await TimetableResultModel.findOne({ version: req.params.version });
    if (!doc) return fail(res, "Timetable version not found", 404);
    if (doc.isLatest) return fail(res, "Cannot delete the currently active timetable. Set another version as current first.", 400);
    await TimetableResultModel.deleteOne({ version: req.params.version });
    return ok(res, { success: true });
  } catch (error) {
    return fail(res, "Failed to delete version", 500, error instanceof Error ? error.message : error);
  }
});

// ─── Bulk Reschedule: Available Rooms Helper ─────────────────────────────────
// Returns rooms free at ALL time slots a given course occupies.
// Used by the BR-1 form to populate the room picker.
router.get("/bulk-reschedule/available-rooms", async (req, res) => {
  try {
    const courseCode = req.query.courseCode as string;
    if (!courseCode) return fail(res, "courseCode query param is required", 400);

    // Fetch the latest timetable (draft or published)
    const timetable = await TimetableResultModel.findOne().sort({ generatedAt: -1 });
    if (!timetable) return fail(res, "No timetable found", 404);

    const assignments = timetable.assignments || [];

    // Slots occupied by this course (could be multiple days/times)
    const courseSlots = assignments.filter(
      (a) => a.courseCode === courseCode
    );
    if (courseSlots.length === 0)
      return ok(res, { availableRooms: [], courseSlots: [] });

    // Collect all (day, startTime, endTime) tuples used by this course
    const busySlots = courseSlots.map((a) => ({
      day: a.day,
      startTime: a.startTime,
      endTime: a.endTime,
    }));

    // All distinct rooms in the current timetable
    const allRoomNames = [
      ...new Set(assignments.map((a) => a.roomName).filter(Boolean)),
    ];

    // For each room, check it is free at every slot the course occupies
    const occupiedRoomSlots = new Set(
      assignments
        .filter((a) => a.courseCode !== courseCode)
        .map((a) => `${a.roomName}|${a.day}|${a.startTime}|${a.endTime}`)
    );

    const availableRooms = allRoomNames.filter((roomName) => {
      return busySlots.every(
        (slot) =>
          !occupiedRoomSlots.has(
            `${roomName}|${slot.day}|${slot.startTime}|${slot.endTime}`
          )
      );
    });

    // Return with capacity info from the first assignment that uses each room
    const roomDetails = availableRooms.map((roomName) => {
      const sample = assignments.find((a) => a.roomName === roomName);
      return {
        roomName,
        capacity: sample?.roomCapacity ?? null,
        department: sample?.roomDepartment ?? null,
      };
    });

    return ok(res, { availableRooms: roomDetails, courseSlots });
  } catch (error) {
    return fail(
      res,
      "Failed to fetch available rooms",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

// ─── Bulk Reschedule: Room Courses Helper ────────────────────────────────────
// Returns all assignments currently in a given room.
// Used by the BR-2 form to show what will be evacuated.
router.get("/bulk-reschedule/room-courses", async (req, res) => {
  try {
    const roomName = req.query.roomName as string;
    if (!roomName) return fail(res, "roomName query param is required", 400);

    const timetable = await TimetableResultModel.findOne().sort({ generatedAt: -1 });
    if (!timetable) return fail(res, "No timetable found", 404);

    const assignments = (timetable.assignments || []).filter(
      (a) => a.roomName === roomName
    );
    return ok(res, { assignments, sourceVersion: timetable.version });
  } catch (error) {
    return fail(
      res,
      "Failed to fetch room courses",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

// ─── Bulk Reschedule: Main Engine ───────────────────────────────────────────
/**
 * POST /api/timetable/bulk-reschedule
 *
 * Body:
 *   operationType: "BR-1" | "BR-2" | "BR-4" | "BR-7"
 *   sourceVersion: string          — version to clone / transform
 *   dryRun: boolean                — true → preview only, false → save as new draft
 *   reason?: string                — required when dryRun = false
 *   parameters: object             — operation-specific params (see below)
 *
 * Operation parameter shapes:
 *   BR-1: { courseCode: string, targetRoom: string }
 *   BR-2: { roomName: string }
 *   BR-4: { courseCode: string, targetDay: string, targetStartTime: string, targetEndTime: string }
 *   BR-7: { date: string (ISO), dayOfWeek: string }
 *
 * dryRun:true  → returns { dryRun:true, affectedCount, changes[], hasBlockingConflicts }
 * dryRun:false → clones source, applies changes, saves new draft
 *                → returns { dryRun:false, newVersion, affectedCount, message }
 */
const bulkRescheduleBodySchema = z.object({
  operationType: z.enum(["BR-1", "BR-2", "BR-4", "BR-7"]),
  sourceVersion: z.string().min(1),
  dryRun: z.boolean(),
  reason: z.string().optional(),
  parameters: z.any(),
});

type Assignment = {
  courseCode?: string;
  courseName?: string;
  professorName?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  roomName?: string;
  roomCapacity?: number;
  roomDepartment?: string;
  [key: string]: any;
};

type ChangeItem = {
  courseCode: string;
  courseName: string;
  professorName: string;
  day: string;
  startTime: string;
  endTime: string;
  change: { field: string; from: string | null; to: string | null };
  conflict: { type: "blocking" | "warning"; description: string } | null;
};

/**
 * Detect simple conflicts for a proposed change:
 *  - blocking: another course already occupies (room × day × time)
 *  - warning:  same professor has a clash at that slot
 */
function detectConflict(
  assignments: Assignment[],
  proposedRoom: string | null,
  day: string,
  startTime: string,
  endTime: string,
  selfCourseCode: string,
  proposedProfessor?: string
): ChangeItem["conflict"] {
  if (proposedRoom) {
    const roomClash = assignments.find(
      (a) =>
        a.roomName === proposedRoom &&
        a.day === day &&
        a.startTime === startTime &&
        a.endTime === endTime &&
        a.courseCode !== selfCourseCode
    );
    if (roomClash)
      return {
        type: "blocking",
        description: `${proposedRoom} is already occupied by ${roomClash.courseCode} at ${day} ${startTime}–${endTime}`,
      };
  }
  if (proposedProfessor) {
    const profClash = assignments.find(
      (a) =>
        a.professorName === proposedProfessor &&
        a.day === day &&
        a.startTime === startTime &&
        a.endTime === endTime &&
        a.courseCode !== selfCourseCode
    );
    if (profClash)
      return {
        type: "warning",
        description: `Professor ${proposedProfessor} already teaches ${profClash.courseCode} at this slot`,
      };
  }
  return null;
}

router.post("/bulk-reschedule", async (req, res) => {
  try {
    const body = bulkRescheduleBodySchema.parse(req.body ?? {});
    const { operationType, sourceVersion, dryRun, reason, parameters } = body;

    if (!dryRun && !reason?.trim())
      return fail(res, "reason is required when dryRun is false", 400);

    // Load source document
    const sourceDoc = await TimetableResultModel.findOne({
      version: sourceVersion,
    });
    if (!sourceDoc)
      return fail(res, `Source version '${sourceVersion}' not found`, 404);

    // Deep-clone assignments (work on plain objects)
    let assignments: Assignment[] = sourceDoc.assignments.map((a: any) =>
      a.toObject ? a.toObject() : { ...a }
    );

    const changes: ChangeItem[] = [];

    // ── BR-1: Move Course Room ─────────────────────────────────────────────
    if (operationType === "BR-1") {
      const { courseCode, targetRoom } = parameters as {
        courseCode: string;
        targetRoom: string;
      };
      if (!courseCode || !targetRoom)
        return fail(res, "courseCode and targetRoom are required for BR-1", 400);

      const affected = assignments.filter((a) => a.courseCode === courseCode);
      if (affected.length === 0)
        return fail(res, `Course '${courseCode}' not found in source version`, 404);

      // Find target room metadata from existing assignments to maintain DB integrity
      const targetRoomMeta = assignments.find((a) => a.roomName === targetRoom);

      for (const slot of affected) {
        const conflict = detectConflict(
          assignments,
          targetRoom,
          slot.day!,
          slot.startTime!,
          slot.endTime!,
          courseCode
        );
        changes.push({
          courseCode: slot.courseCode!,
          courseName: slot.courseName!,
          professorName: slot.professorName!,
          day: slot.day!,
          startTime: slot.startTime!,
          endTime: slot.endTime!,
          change: { field: "roomName", from: slot.roomName ?? null, to: targetRoom },
          conflict,
        });
        if (!dryRun) {
          slot.roomName = targetRoom;
          if (targetRoomMeta) {
            slot.roomCapacity = targetRoomMeta.roomCapacity;
            slot.roomDepartment = targetRoomMeta.roomDepartment;
          }
        }
      }
    }

    // ── BR-2: Evacuate Room ────────────────────────────────────────────────
    else if (operationType === "BR-2") {
      const { roomName } = parameters as { roomName: string };
      if (!roomName)
        return fail(res, "roomName is required for BR-2", 400);

      const affected = assignments.filter((a) => a.roomName === roomName);
      if (affected.length === 0)
        return ok(res, {
          dryRun,
          affectedCount: 0,
          changes: [],
          hasBlockingConflicts: false,
          message: `No assignments found in room '${roomName}'`,
        });

      // Collect all rooms (excluding evacuated) and their current load
      const otherRooms = [
        ...new Set(
          assignments
            .filter((a) => a.roomName !== roomName && a.roomName)
            .map((a) => a.roomName)
        ),
      ];

      // For each displaced assignment, try to find the first free alternative room
      for (const slot of affected) {
        // Build occupancy map for this (day, startTime, endTime) trio
        const occupiedAtSlot = new Set(
          assignments
            .filter(
              (a) =>
                a.day === slot.day &&
                a.startTime === slot.startTime &&
                a.endTime === slot.endTime &&
                a.roomName !== roomName
            )
            .map((a) => a.roomName)
        );

        const freeRoom = otherRooms.find((r) => !occupiedAtSlot.has(r));

        changes.push({
          courseCode: slot.courseCode!,
          courseName: slot.courseName!,
          professorName: slot.professorName!,
          day: slot.day!,
          startTime: slot.startTime!,
          endTime: slot.endTime!,
          change: {
            field: "roomName",
            from: slot.roomName ?? null,
            to: freeRoom ?? null,
          },
          conflict: freeRoom
            ? null
            : {
                type: "warning",
                description: "No free alternative room found — will be left unassigned",
              },
        });

        if (!dryRun) {
          if (freeRoom) {
            slot.roomName = freeRoom;
            const meta = assignments.find((a) => a.roomName === freeRoom);
            if (meta) {
              slot.roomCapacity = meta.roomCapacity;
              slot.roomDepartment = meta.roomDepartment;
            }
          } else {
            slot.roomName = undefined;
            slot.roomCapacity = undefined;
            slot.roomDepartment = undefined;
          }
        }
      }
    }

    // ── BR-4: Move Course Time ─────────────────────────────────────────────
    else if (operationType === "BR-4") {
      const { courseCode, targetDay, targetStartTime, targetEndTime } =
        parameters as {
          courseCode: string;
          targetDay: string;
          targetStartTime: string;
          targetEndTime: string;
        };
      if (!courseCode || !targetDay || !targetStartTime || !targetEndTime)
        return fail(
          res,
          "courseCode, targetDay, targetStartTime, targetEndTime are required for BR-4",
          400
        );

      const affected = assignments.filter((a) => a.courseCode === courseCode);
      if (affected.length === 0)
        return fail(res, `Course '${courseCode}' not found in source version`, 404);

      for (const slot of affected) {
        const conflict = detectConflict(
          assignments,
          slot.roomName ?? null,
          targetDay,
          targetStartTime,
          targetEndTime,
          courseCode,
          slot.professorName
        );
        changes.push({
          courseCode: slot.courseCode!,
          courseName: slot.courseName!,
          professorName: slot.professorName!,
          day: slot.day!,
          startTime: slot.startTime!,
          endTime: slot.endTime!,
          change: {
            field: "time",
            from: `${slot.day} ${slot.startTime}–${slot.endTime}`,
            to: `${targetDay} ${targetStartTime}–${targetEndTime}`,
          },
          conflict,
        });
        if (!dryRun) {
          slot.day = targetDay;
          slot.startTime = targetStartTime;
          slot.endTime = targetEndTime;
          slot.slotLabel = undefined; // Clear old label
        }
      }
    }

    // ── BR-7: Cancel a Date ────────────────────────────────────────────────
    else if (operationType === "BR-7") {
      const { dayOfWeek } = parameters as { dayOfWeek: string; date?: string };
      if (!dayOfWeek)
        return fail(res, "dayOfWeek is required for BR-7", 400);

      const normalizedDay = dayOfWeek.trim().toLowerCase();
      const affected = assignments.filter(
        (a) => a.day?.toLowerCase() === normalizedDay
      );
      if (affected.length === 0)
        return ok(res, {
          dryRun,
          affectedCount: 0,
          changes: [],
          hasBlockingConflicts: false,
          message: `No assignments found on '${dayOfWeek}'`,
        });

      for (const slot of affected) {
        changes.push({
          courseCode: slot.courseCode!,
          courseName: slot.courseName!,
          professorName: slot.professorName!,
          day: slot.day!,
          startTime: slot.startTime!,
          endTime: slot.endTime!,
          change: { field: "cancelled", from: "scheduled", to: "cancelled" },
          conflict: null,
        });
      }

      if (!dryRun) {
        // Remove the affected assignments from the clone
        assignments = assignments.filter(
          (a) => a.day?.toLowerCase() !== normalizedDay
        );
      }
    }

    const hasBlockingConflicts = changes.some(
      (c) => c.conflict?.type === "blocking"
    );

    // ── dryRun: true → return preview, write nothing ───────────────────────
    if (dryRun) {
      return ok(res, {
        success: true,
        dryRun: true,
        affectedCount: changes.length,
        changes,
        hasBlockingConflicts,
      });
    }

    // ── dryRun: false → persist as a new draft ─────────────────────────────
    const newVersion = `bulk-${operationType.toLowerCase()}-${Date.now()}`;
    await TimetableResultModel.create({
      version: newVersion,
      status: "draft",
      isLatest: false,
      assignments,
      stats: sourceDoc.stats,
      constraints: sourceDoc.constraints,
      academicYear: sourceDoc.academicYear,
      semester: sourceDoc.semester,
      generatedAt: new Date(),
    });

    return ok(res, {
      success: true,
      dryRun: false,
      newVersion,
      affectedCount: changes.length,
      message: `Saved as draft '${newVersion}' with ${changes.length} change(s). Reason: ${reason}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError)
      return fail(res, "Validation failed", 400, error.flatten());
    return fail(
      res,
      "Bulk reschedule operation failed",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

export default router;
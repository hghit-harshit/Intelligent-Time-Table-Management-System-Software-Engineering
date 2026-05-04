import type { Request, Response } from "express";
import { NoteModel } from "../../database/models/noteModel.js";
import { ok, fail } from "../../shared/response.js";

const GOOGLE_SERVICE_URL = process.env.GOOGLE_SERVICE_URL || "http://localhost:4000/api";

/**
 * POST /api/student/notes/create
 * Body: { courseCode, classDate, sessionId? }
 * Calls port-4000 to find/create the Google Doc, then persists metadata.
 */
export async function createNote(req: Request, res: Response) {
  try {
    const studentId = (req as any).user?.userId;
    const { courseCode, classDate, sessionId = "" } = req.body;

    if (!courseCode || !classDate) {
      return fail(res, "courseCode and classDate are required", 400);
    }

    // Idempotency check
    const existing = await NoteModel.findOne({ studentId, courseCode: courseCode.toUpperCase(), classDate });
    if (existing) {
      return ok(res, {
        id: existing._id,
        googleDocId: existing.googleDocId,
        webViewLink: existing.webViewLink,
        folderId: existing.folderId,
        noteKey: `${courseCode}_${classDate}`,
        alreadyExisted: true,
      });
    }

    // Bridge call to Google service
    const gRes = await fetch(`${GOOGLE_SERVICE_URL}/drive/notes/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseCode, classDate }),
    });

    if (!gRes.ok) {
      const err = await gRes.json().catch(() => ({}));
      return fail(res, (err as any).error || "Google service error", 502);
    }

    const { googleDocId, webViewLink, folderId } = await gRes.json() as any;

    const note = await NoteModel.create({
      studentId,
      sessionId,
      courseCode: courseCode.toUpperCase(),
      classDate,
      googleDocId,
      webViewLink,
      folderId: folderId || "",
    });

    return ok(res, {
      id: note._id,
      googleDocId: note.googleDocId,
      webViewLink: note.webViewLink,
      folderId: note.folderId,
      noteKey: `${courseCode}_${classDate}`,
      alreadyExisted: false,
    }, 201);
  } catch (err: any) {
    // Duplicate key = already exists (race condition)
    if (err.code === 11000) {
      const existing = await NoteModel.findOne({
        studentId: (req as any).user?.userId,
        courseCode: req.body.courseCode?.toUpperCase(),
        classDate: req.body.classDate,
      });
      if (existing) {
        return ok(res, { id: existing._id, googleDocId: existing.googleDocId, webViewLink: existing.webViewLink, folderId: existing.folderId, alreadyExisted: true });
      }
    }
    return fail(res, err.message || "Internal error", 500);
  }
}

/**
 * GET /api/student/notes/:courseCode
 * Returns all notes for the student for a given course.
 */
export async function getNotesByCourse(req: Request, res: Response) {
  try {
    const studentId = (req as any).user?.userId;
    const courseCode = req.params.courseCode.toUpperCase();
    const notes = await NoteModel.find({ studentId, courseCode }).sort({ classDate: -1 });
    return ok(res, { notes });
  } catch (err: any) {
    return fail(res, err.message, 500);
  }
}

/**
 * GET /api/student/notes/check?courseCode=X&classDate=Y
 * Check if a note exists for a given course+date.
 */
export async function checkNote(req: Request, res: Response) {
  try {
    const studentId = (req as any).user?.userId;
    const { courseCode, classDate } = req.query as Record<string, string>;
    if (!courseCode || !classDate) return fail(res, "courseCode and classDate required", 400);
    const note = await NoteModel.findOne({ studentId, courseCode: courseCode.toUpperCase(), classDate });
    if (!note) return ok(res, { exists: false });
    return ok(res, { exists: true, googleDocId: note.googleDocId, webViewLink: note.webViewLink });
  } catch (err: any) {
    return fail(res, err.message, 500);
  }
}

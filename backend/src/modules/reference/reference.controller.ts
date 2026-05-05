import type { Request, Response } from "express";
import { ProfessorReferenceModel } from "../../database/models/professorReferenceModel.js";
import { ok, fail } from "../../shared/response.js";

const DAY_MAP: Record<string, string> = {
  mon: "Monday",
  monday: "Monday",
  tue: "Tuesday",
  tues: "Tuesday",
  tuesday: "Tuesday",
  wed: "Wednesday",
  wednesday: "Wednesday",
  thu: "Thursday",
  thur: "Thursday",
  thurs: "Thursday",
  thursday: "Thursday",
  fri: "Friday",
  friday: "Friday",
  sat: "Saturday",
  saturday: "Saturday",
  sun: "Sunday",
  sunday: "Sunday",
};

const normalizeDay = (value: string) => DAY_MAP[String(value || "").trim().toLowerCase()] || value;

const normalizeTime = (value: string) => {
  const raw = String(value || "").trim();
  const m24 = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m24) return `${String(Number(m24[1])).padStart(2, "0")}:${m24[2]}`;
  const m12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m12) return raw;
  let hh = Number(m12[1]);
  const mm = m12[2];
  const suffix = m12[3].toUpperCase();
  if (suffix === "PM" && hh !== 12) hh += 12;
  if (suffix === "AM" && hh === 12) hh = 0;
  return `${String(hh).padStart(2, "0")}:${mm}`;
};

export async function createProfessorReference(req: Request, res: Response) {
  try {
    const professorId = (req as any).user?.userId;
    const { courseCode, day, startTime, title, url, kind = "general" } = req.body || {};

    if (!professorId) return fail(res, "Authentication required", 401);
    if (!courseCode || !title || !url) {
      return fail(res, "courseCode, title, and url are required", 400);
    }

    const normalizedKind = String(kind || "general").toLowerCase();
    const resolvedDay = normalizedKind === "syllabus" ? "SYLLABUS" : normalizeDay(String(day || ""));
    const resolvedStartTime = normalizedKind === "syllabus" ? "00:00" : normalizeTime(String(startTime || ""));

    if (normalizedKind !== "syllabus" && (!resolvedDay || !resolvedStartTime)) {
      return fail(res, "day and startTime are required for non-syllabus references", 400);
    }

    const created = await ProfessorReferenceModel.create({
      professorId,
      courseCode: String(courseCode).toUpperCase(),
      kind: normalizedKind,
      day: resolvedDay,
      startTime: resolvedStartTime,
      title: String(title).trim(),
      url: String(url).trim(),
    });

    return ok(res, { reference: created }, 201);
  } catch (err: any) {
    return fail(res, err?.message || "Failed to create reference", 500);
  }
}

export async function getClassReferences(req: Request, res: Response) {
  try {
    const { courseCode, day, startTime, kind = "general" } = req.query as Record<string, string>;
    if (!courseCode) {
      return fail(res, "courseCode is required", 400);
    }

    const normalizedKind = String(kind || "general").toLowerCase();
    const query: any = {
      courseCode: String(courseCode).toUpperCase(),
      kind: normalizedKind,
    };
    if (normalizedKind === "syllabus") {
      query.day = "SYLLABUS";
      query.startTime = "00:00";
    } else {
      if (!day || !startTime) return fail(res, "day and startTime are required for non-syllabus references", 400);
      query.day = normalizeDay(String(day));
      query.startTime = normalizeTime(String(startTime));
    }

    const refs = await ProfessorReferenceModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return ok(res, { references: refs });
  } catch (err: any) {
    return fail(res, err?.message || "Failed to fetch references", 500);
  }
}

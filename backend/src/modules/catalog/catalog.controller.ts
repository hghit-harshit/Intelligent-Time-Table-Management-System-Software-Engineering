import type { Request, Response } from "express";
import { CourseModel } from "../../database/models/courseModel.js";
import { ProfessorModel } from "../../database/models/professorModel.js";
import { RoomModel } from "../../database/models/roomModel.js";
import { ok, fail } from "../../shared/response.js";

export async function getCourses(_req: Request, res: Response) {
  try {
    const data = await CourseModel.find().lean();
    return ok(res, { data });
  } catch (error: any) {
    return fail(res, "Failed to fetch courses", 500, { error: error.message });
  }
}

export async function getProfessors(_req: Request, res: Response) {
  try {
    const data = await ProfessorModel.find().lean();
    return ok(res, { data });
  } catch (error: any) {
    return fail(res, "Failed to fetch professors", 500, { error: error.message });
  }
}

export async function getRooms(_req: Request, res: Response) {
  try {
    const data = await RoomModel.find().lean();
    return ok(res, { data });
  } catch (error: any) {
    return fail(res, "Failed to fetch rooms", 500, { error: error.message });
  }
}

export default {
  getCourses,
  getProfessors,
  getRooms,
};

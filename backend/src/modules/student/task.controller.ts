import type { Request, Response } from "express";
import { TaskModel } from "../../database/models/taskModel.js";
import { ok, fail } from "../../shared/response.js";

/**
 * GET /api/student/tasks
 */
export async function getTasks(req: Request, res: Response) {
  try {
    const studentId = (req as any).user?.userId;
    const tasks = await TaskModel.find({ studentId }).sort({ createdAt: -1 });
    return ok(res, { tasks });
  } catch (err: any) {
    return fail(res, err.message, 500);
  }
}

/**
 * POST /api/student/tasks
 * Body: { title, description, category, dueDate, reminder, reminderMinutes, status }
 */
export async function createTask(req: Request, res: Response) {
  try {
    const studentId = (req as any).user?.userId;
    const { title, description, category, dueDate, reminder, reminderMinutes, status } = req.body;
    if (!title?.trim()) return fail(res, "title is required", 400);

    const task = await TaskModel.create({
      studentId,
      title: title.trim(),
      description: description || "",
      courseId: null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: "medium",
      status: status === "completed" ? "completed" : "todo",
      // Store reminder info in description if needed (schema doesn't have reminder fields)
    });

    return ok(res, task, 201);
  } catch (err: any) {
    return fail(res, err.message, 500);
  }
}

/**
 * PATCH /api/student/tasks/:id
 * Body: { status?, title?, description?, dueDate? }
 */
export async function updateTask(req: Request, res: Response) {
  try {
    const studentId = (req as any).user?.userId;
    const { id } = req.params;
    const patch: Record<string, unknown> = {};

    if (req.body.status !== undefined) patch.status = req.body.status;
    if (req.body.title !== undefined) patch.title = req.body.title;
    if (req.body.description !== undefined) patch.description = req.body.description;
    if (req.body.dueDate !== undefined) patch.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    if (req.body.status === "completed") patch.completedAt = new Date();
    if (req.body.status === "todo") patch.completedAt = null;

    const task = await TaskModel.findOneAndUpdate({ _id: id, studentId }, { $set: patch }, { new: true });
    if (!task) return fail(res, "Task not found", 404);
    return ok(res, task);
  } catch (err: any) {
    return fail(res, err.message, 500);
  }
}

/**
 * DELETE /api/student/tasks/:id
 */
export async function deleteTask(req: Request, res: Response) {
  try {
    const studentId = (req as any).user?.userId;
    const result = await TaskModel.findOneAndDelete({ _id: req.params.id, studentId });
    if (!result) return fail(res, "Task not found", 404);
    return ok(res, { success: true });
  } catch (err: any) {
    return fail(res, err.message, 500);
  }
}

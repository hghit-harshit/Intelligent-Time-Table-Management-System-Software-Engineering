import type { Request, Response } from "express";
import { NoteModel } from "../../database/models/noteModel.js";
import { TaskModel } from "../../database/models/taskModel.js";
import { fail, ok } from "../../shared/response.js";

export const getNotes = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Authentication required", 401);
    }

    const notes = await NoteModel.find({ studentId: req.user._id })
      .sort({ pinned: -1, createdAt: -1 })
      .lean();

    return ok(
      res,
      notes.map((note) => ({
        id: String(note._id),
        title: note.title,
        content: note.content,
        courseId: note.courseId ? String(note.courseId) : null,
        tags: note.tags || [],
        color: note.color,
        pinned: note.pinned,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }))
    );
  } catch (error) {
    return fail(res, "Failed to fetch notes", 500, error instanceof Error ? error.message : error);
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Authentication required", 401);
    }

    const { title, content, courseId, tags, color, pinned } = req.body;
    if (!title?.trim()) {
      return fail(res, "Title is required", 400);
    }

    const note = await NoteModel.create({
      studentId: req.user._id,
      title: title.trim(),
      content: content || "",
      courseId: courseId || null,
      tags: tags || [],
      color: color || "#3b82f6",
      pinned: pinned || false,
    });

    return ok(res, {
      id: String(note._id),
      title: note.title,
      content: note.content,
      courseId: note.courseId ? String(note.courseId) : null,
      tags: note.tags,
      color: note.color,
      pinned: note.pinned,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }, 201);
  } catch (error) {
    return fail(res, "Failed to create note", 500, error instanceof Error ? error.message : error);
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Authentication required", 401);
    }

    const note = await NoteModel.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user._id },
      { $set: req.body },
      { new: true }
    ).lean();

    if (!note) {
      return fail(res, "Note not found", 404);
    }

    return ok(res, {
      id: String(note._id),
      title: note.title,
      content: note.content,
      courseId: note.courseId ? String(note.courseId) : null,
      tags: note.tags,
      color: note.color,
      pinned: note.pinned,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    return fail(res, "Failed to update note", 500, error instanceof Error ? error.message : error);
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Authentication required", 401);
    }

    const deleted = await NoteModel.findOneAndDelete({
      _id: req.params.id,
      studentId: req.user._id,
    }).lean();

    if (!deleted) {
      return fail(res, "Note not found", 404);
    }

    return ok(res, { id: String(deleted._id) });
  } catch (error) {
    return fail(res, "Failed to delete note", 500, error instanceof Error ? error.message : error);
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Authentication required", 401);
    }

    const tasks = await TaskModel.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return ok(
      res,
      tasks.map((task) => ({
        id: String(task._id),
        title: task.title,
        description: task.description,
        courseId: task.courseId ? String(task.courseId) : null,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }))
    );
  } catch (error) {
    return fail(res, "Failed to fetch tasks", 500, error instanceof Error ? error.message : error);
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Authentication required", 401);
    }

    const { title, description, courseId, dueDate, priority, status } = req.body;
    if (!title?.trim()) {
      return fail(res, "Title is required", 400);
    }

    const task = await TaskModel.create({
      studentId: req.user._id,
      title: title.trim(),
      description: description || "",
      courseId: courseId || null,
      dueDate: dueDate || null,
      priority: priority || "medium",
      status: status || "todo",
    });

    return ok(res, {
      id: String(task._id),
      title: task.title,
      description: task.description,
      courseId: task.courseId ? String(task.courseId) : null,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }, 201);
  } catch (error) {
    return fail(res, "Failed to create task", 500, error instanceof Error ? error.message : error);
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Authentication required", 401);
    }

    const updateData = { ...req.body };
    if (updateData.status === "completed" && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }
    if (updateData.status !== "completed") {
      updateData.completedAt = null;
    }

    const task = await TaskModel.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user._id },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!task) {
      return fail(res, "Task not found", 404);
    }

    return ok(res, {
      id: String(task._id),
      title: task.title,
      description: task.description,
      courseId: task.courseId ? String(task.courseId) : null,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  } catch (error) {
    return fail(res, "Failed to update task", 500, error instanceof Error ? error.message : error);
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return fail(res, "Authentication required", 401);
    }

    const deleted = await TaskModel.findOneAndDelete({
      _id: req.params.id,
      studentId: req.user._id,
    }).lean();

    if (!deleted) {
      return fail(res, "Task not found", 404);
    }

    return ok(res, { id: String(deleted._id) });
  } catch (error) {
    return fail(res, "Failed to delete task", 500, error instanceof Error ? error.message : error);
  }
};

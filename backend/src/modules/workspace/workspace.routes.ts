import { Router } from "express";
import { requireRole } from "../../middlewares/auth.middleware.js";
import {
  createNote,
  createTask,
  deleteNote,
  deleteTask,
  getNotes,
  getTasks,
  updateNote,
  updateTask,
} from "./workspace.controller.js";

const workspaceRouter = Router();

workspaceRouter.get("/notes", requireRole("student"), getNotes);
workspaceRouter.post("/notes", requireRole("student"), createNote);
workspaceRouter.patch("/notes/:id", requireRole("student"), updateNote);
workspaceRouter.delete("/notes/:id", requireRole("student"), deleteNote);

workspaceRouter.get("/tasks", requireRole("student"), getTasks);
workspaceRouter.post("/tasks", requireRole("student"), createTask);
workspaceRouter.patch("/tasks/:id", requireRole("student"), updateTask);
workspaceRouter.delete("/tasks/:id", requireRole("student"), deleteTask);

export default workspaceRouter;

import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import catalogController from "./catalog.controller.js";

const catalogRouter = Router();

catalogRouter.get("/courses", authMiddleware, catalogController.getCourses);
catalogRouter.get("/professors", authMiddleware, catalogController.getProfessors);
catalogRouter.get("/rooms", authMiddleware, catalogController.getRooms);

export default catalogRouter;

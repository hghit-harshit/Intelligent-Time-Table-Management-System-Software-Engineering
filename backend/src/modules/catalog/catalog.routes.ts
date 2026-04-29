import { Router } from "express";
import catalogController from "./catalog.controller.js";

const catalogRouter = Router();

catalogRouter.get("/courses", catalogController.getCourses);
catalogRouter.get("/professors", catalogController.getProfessors);
catalogRouter.get("/rooms", catalogController.getRooms);

export default catalogRouter;

import { Router } from "express";
import { chatWithAssistant } from "./ai.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const aiRouter = Router();

aiRouter.post("/chat", authMiddleware, chatWithAssistant);

export default aiRouter;

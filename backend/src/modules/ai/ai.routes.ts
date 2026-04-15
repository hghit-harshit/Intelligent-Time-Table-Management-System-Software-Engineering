import { Router } from "express";
import { chatWithAssistant } from "./ai.controller.js";

const aiRouter = Router();

aiRouter.post("/chat", chatWithAssistant);

export default aiRouter;

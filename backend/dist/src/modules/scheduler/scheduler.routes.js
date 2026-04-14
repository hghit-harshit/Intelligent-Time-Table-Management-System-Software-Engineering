import { Router } from "express";
import { assignClassroomsToSlots, generateSchedule } from "./scheduler.controller.js";
const schedulerRouter = Router();
schedulerRouter.post("/generate", generateSchedule);
schedulerRouter.post("/assign-classrooms", assignClassroomsToSlots);
export default schedulerRouter;
//# sourceMappingURL=scheduler.routes.js.map
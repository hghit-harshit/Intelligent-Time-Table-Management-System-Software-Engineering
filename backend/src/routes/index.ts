import { Router } from "express";
import aiRouter from "../modules/ai/ai.routes.js";
import rescheduleRouter from "../modules/reschedule/reschedule.routes.js";
import schedulerRouter from "../modules/scheduler/scheduler.routes.js";
import slotRouter from "../modules/slot/slot.routes.js";

const apiRouter = Router();

apiRouter.use("/slots", slotRouter);
apiRouter.use("/scheduler", schedulerRouter);
apiRouter.use("/requests", rescheduleRouter);
apiRouter.use("/ai", aiRouter);

export default apiRouter;

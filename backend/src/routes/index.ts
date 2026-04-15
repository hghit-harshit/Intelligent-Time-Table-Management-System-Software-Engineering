import { Router } from "express";
import aiRouter from "../modules/ai/ai.routes.js";
import rescheduleRouter from "../modules/reschedule/reschedule.routes.js";
import runsRouter from "../modules/runs/runs.routes.js";
import schedulerRouter from "../modules/scheduler/scheduler.routes.js";
import slotRouter from "../modules/slot/slot.routes.js";
import timetableRouter from "../modules/timetable/timetable.routes.js";

const apiRouter = Router();

apiRouter.use("/ai", aiRouter);
apiRouter.use("/slots", slotRouter);
apiRouter.use("/scheduler", schedulerRouter);
apiRouter.use("/requests", rescheduleRouter);
apiRouter.use("/timetable", timetableRouter);
apiRouter.use("/runs", runsRouter);

export default apiRouter;

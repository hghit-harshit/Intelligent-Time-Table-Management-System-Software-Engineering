import { Router } from "express";
import aiRouter from "../modules/ai/ai.routes.js";
import examRouter from "../modules/exam/exam.routes.js";
import rescheduleRouter from "../modules/reschedule/reschedule.routes.js";
import schedulerRouter from "../modules/scheduler/scheduler.routes.js";
import timetableRouter from "../modules/scheduler/timetable.routes.js";
import slotRouter from "../modules/slot/slot.routes.js";
import catalogRouter from "../modules/catalog/catalog.routes.js";
import studentRouter from "../modules/student/student.routes.js";

const apiRouter = Router();

apiRouter.use("/slots", slotRouter);
apiRouter.use("/scheduler", schedulerRouter);
apiRouter.use("/timetable", timetableRouter);
apiRouter.use("/requests", rescheduleRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/catalog", catalogRouter);
apiRouter.use("/student", studentRouter);
apiRouter.use("/exam", examRouter);

export default apiRouter;


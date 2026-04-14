import { ZodError } from "zod";
import { fail, ok } from "../../shared/response.js";
import { assignClassroomsSchema, generateScheduleSchema } from "./scheduler.schema.js";
import { schedulerService } from "./scheduler.service.js";
const handleError = (res, error, fallbackMessage) => {
    if (error instanceof ZodError) {
        return fail(res, "Validation failed", 400, error.flatten());
    }
    if (error && typeof error === "object" && "statusCode" in error && "message" in error) {
        const known = error;
        return fail(res, known.message, known.statusCode);
    }
    return fail(res, fallbackMessage, 500, error instanceof Error ? error.message : error);
};
export const generateSchedule = async (req, res) => {
    try {
        const payload = generateScheduleSchema.parse(req.body ?? {});
        const result = await schedulerService.generateSchedule(payload.constraints ?? {});
        return ok(res, result);
    }
    catch (error) {
        return handleError(res, error, "Failed to run timetable solver");
    }
};
export const assignClassroomsToSlots = async (req, res) => {
    try {
        const payload = assignClassroomsSchema.parse(req.body ?? {});
        const result = await schedulerService.assignClassrooms(payload.assignments);
        return ok(res, result);
    }
    catch (error) {
        return handleError(res, error, "Failed to assign classrooms");
    }
};
//# sourceMappingURL=scheduler.controller.js.map
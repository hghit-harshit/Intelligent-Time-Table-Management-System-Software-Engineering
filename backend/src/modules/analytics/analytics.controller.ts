import type { Request, Response } from "express";
import { TimetableResultModel } from "../../database/models/timetableResultModel.js";
import { RequestModel } from "../../database/models/requestModel.js";
import { ok, fail } from "../../shared/response.js";

export const getAnalytics = async (_req: Request, res: Response) => {
  try {
    const [timetable, requests] = await Promise.all([
      TimetableResultModel.findOne({ isLatest: true }).lean(),
      RequestModel.find().lean(),
    ]);

    const assignments: any[] = (timetable as any)?.assignments ?? [];
    const conflicts: any[] = (timetable as any)?.conflicts ?? [];

    // ── Room utilization ────────────────────────────────────────
    // Count unique day+time slots per room, divide by total unique slots
    const uniqueSlots = new Set(
      assignments.map((a) => `${a.day}|${a.startTime}`)
    );
    const totalSlots = uniqueSlots.size || 1;

    const roomSlotCounts = new Map<string, Set<string>>();
    for (const a of assignments) {
      if (!a.roomName) continue;
      if (!roomSlotCounts.has(a.roomName)) {
        roomSlotCounts.set(a.roomName, new Set());
      }
      roomSlotCounts.get(a.roomName)!.add(`${a.day}|${a.startTime}`);
    }

    const roomUtilization = Array.from(roomSlotCounts.entries())
      .map(([room, slots]) => ({
        room,
        utilization: Math.round((slots.size / totalSlots) * 100),
      }))
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 10);

    // ── Weekly reschedule request trend ─────────────────────────
    const now = new Date();
    const weeklyRequestTrend = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const count = (requests as any[]).filter((r: any) => {
        const d = new Date(r.createdAt);
        return d >= start && d < end;
      }).length;
      weeklyRequestTrend.push({ week: `W${6 - i}`, count });
    }

    // ── Conflicts by type ───────────────────────────────────────
    const conflictMap: Record<string, number> = {
      room_conflict: 0,
      faculty_conflict: 0,
      student_conflict: 0,
    };
    for (const c of conflicts) {
      if (c.type in conflictMap) conflictMap[c.type]++;
    }
    const conflictsByType = [
      { type: "Room", count: conflictMap.room_conflict },
      { type: "Faculty", count: conflictMap.faculty_conflict },
      { type: "Student", count: conflictMap.student_conflict },
    ];

    // ── Summary stats ───────────────────────────────────────────
    const pendingRequests = (requests as any[]).filter((r: any) => r.status === "pending").length;
    const approvedRequests = (requests as any[]).filter((r: any) => r.status === "approved").length;

    return ok(res, {
      hasTimetable: !!timetable,
      timetableVersion: (timetable as any)?.version ?? null,
      summary: {
        totalAssignments: assignments.length,
        totalRoomsInUse: roomSlotCounts.size,
        totalConflicts: conflicts.length,
        pendingRequests,
        approvedRequests,
      },
      roomUtilization,
      weeklyRequestTrend,
      conflictsByType,
    });
  } catch (error) {
    return fail(res, "Failed to compute analytics", 500, error instanceof Error ? error.message : error);
  }
};

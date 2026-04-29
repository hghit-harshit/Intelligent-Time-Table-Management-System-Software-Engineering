import { httpClient } from "./httpClient";

export interface StudentDashboardPayload {
  semester: {
    name: string;
    period: string;
    status: { text: string; type: string };
  };
  currentDate: {
    day: number;
    month: number;
    year: number;
    dayName: string;
  };
  stats: Array<{ num: string; label: string; sub?: string; onClick?: string }>;
  weekDays: string[];
  weekDates: number[];
  weeklySchedule: Array<{ time: string; classes: Array<any> }>;
  dailySchedules: Record<string, Array<any>>;
  todaysClasses: Array<any>;
  quickActions: Array<{ label: string; onClick: string }>;
  upcomingEvents: Array<{ type: string; title: string; date: string; color: string }>;
  calendar: { monthDaysWithClasses: number[]; timeSlots: string[] };
}

export const fetchStudentDashboard = () => {
  return httpClient.get<StudentDashboardPayload>("/student/dashboard");
};

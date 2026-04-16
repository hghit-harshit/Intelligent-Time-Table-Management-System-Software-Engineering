export interface SchedulerConstraints {
  hc1_enabled?: boolean;
  hc2_enabled?: boolean;
  hc3_enabled?: boolean;
  sc1_enabled?: boolean;
  sc2_enabled?: boolean;
}

export interface SchedulerInputData {
  slots: unknown[];
  courses: unknown[];
  professors: unknown[];
  rooms: unknown[];
  batchCourseRequirements: unknown[];
}

export interface SchedulerResult {
  success: boolean;
  message?: string;
  diagnostics?: unknown;
  stats?: unknown;
  assignments?: unknown[];
  constraints?: SchedulerConstraints;
}

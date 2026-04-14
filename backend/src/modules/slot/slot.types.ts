export type WeekDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface SlotOccurrence {
  _id?: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
}

export interface SlotEntity {
  _id?: string;
  label: string;
  occurrences: SlotOccurrence[];
}

export interface SlotConflict {
  slotId: string;
  label: string;
  occurrenceId?: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
}

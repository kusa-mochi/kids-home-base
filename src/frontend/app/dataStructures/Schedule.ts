export type ScheduleItem = {
  id: number;
  dt: string;
  task: string;
  is_recurring: boolean;
};

export type ScheduleResponse = {
  success: boolean;
  message: string;
  schedules: ScheduleItem[];
};

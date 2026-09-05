export type ScheduleItem = {
  id: number;
  dt: string;
  task: string;
};

export type ScheduleResponse = {
  success: boolean;
  message: string;
  schedules: ScheduleItem[];
};

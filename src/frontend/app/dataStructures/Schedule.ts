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

export type RecurringScheduleItem = {
  id: number;
  recurring_type: string;
  days_of_week: number;
  week_of_month: number;
  schedule_time: string;
  start_date: string;
  end_date: string;
  task: string;
};

export type RecurringScheduleResponse = {
  success: boolean;
  message: string;
  schedules: RecurringScheduleItem[];
};

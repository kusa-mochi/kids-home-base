package datastructures

import "time"

type RecurringScheduleItem struct {
	RecurringType string    `json:"recurring_type"` // "daily", "weekly", "monthly"
	DaysOfWeek    uint8     `json:"days_of_week"`   // 最下位ビットは日曜日、第2ビットは月曜日、・・・、第7ビットは土曜日を表す。
	WeekOfMonth   int       `json:"week_of_month"`  // "monthly" の場合に使用される第N週（1〜5）
	ScheduleTime  time.Time `json:"schedule_time"`
	StartDate     time.Time `json:"start_date"`
	EndDate       time.Time `json:"end_date"`
	Task          string    `json:"task"`
}

type RecurringScheduleItemWithId struct {
	Id            int       `json:"id"`
	RecurringType string    `json:"recurring_type"` // "daily", "weekly", "monthly"
	DaysOfWeek    uint8     `json:"days_of_week"`   // 最下位ビットは日曜日、第2ビットは月曜日、・・・、第7ビットは土曜日を表す。
	WeekOfMonth   int       `json:"week_of_month"`  // "monthly" の場合に使用される第N週（1〜5）
	ScheduleTime  time.Time `json:"schedule_time"`
	StartDate     time.Time `json:"start_date"`
	EndDate       time.Time `json:"end_date"`
	Task          string    `json:"task"`
}

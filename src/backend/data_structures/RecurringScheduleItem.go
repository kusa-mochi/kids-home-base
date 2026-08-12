package datastructures

import "time"

type RecurringScheduleItem struct {
	StartTime time.Time    `json:"start_time"`
	DayOfWeek time.Weekday `json:"day_of_week"`
	StartDate time.Time    `json:"start_date"`
	EndDate   time.Time    `json:"end_date"`
	Task      string       `json:"task"`
}

type RecurringScheduleItemWithId struct {
	Id        int          `json:"id"`
	StartTime time.Time    `json:"start_time"`
	DayOfWeek time.Weekday `json:"day_of_week"`
	StartDate time.Time    `json:"start_date"`
	EndDate   time.Time    `json:"end_date"`
	Task      string       `json:"task"`
}

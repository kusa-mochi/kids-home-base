package datastructures

import "time"

type RecurringScheduleItem struct {
	StartTime time.Time
	DayOfWeek time.Weekday
	StartDate time.Time
	EndDate   time.Time
	Task      string
}

type RecurringScheduleItemWithId struct {
	Id        int
	StartTime time.Time
	DayOfWeek time.Weekday
	StartDate time.Time
	EndDate   time.Time
	Task      string
}

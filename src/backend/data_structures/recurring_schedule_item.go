package datastructures

import "time"

type RecurringScheduleItem struct {
	Id        int
	StartTime time.Time
	DayOfWeek time.Weekday
	StartDate time.Time
	EndDate   time.Time
	Task      string
}

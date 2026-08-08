package datastructures

import "time"

type ScheduleItem struct {
	Dt   time.Time
	Task string
}

type ScheduleItemWithId struct {
	Id   int
	Dt   time.Time
	Task string
}

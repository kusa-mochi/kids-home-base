package datastructures

import "time"

type ScheduleItem struct {
	Id   int
	Dt   time.Time
	Task string
}

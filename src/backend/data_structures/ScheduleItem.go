package datastructures

import "time"

type ScheduleItem struct {
	Dt   time.Time `json:"dt"`
	Task string    `json:"task"`
}

type ScheduleItemWithId struct {
	Id   int       `json:"id"`
	Dt   time.Time `json:"dt"`
	Task string    `json:"task"`
}

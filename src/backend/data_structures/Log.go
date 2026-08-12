package datastructures

import "time"

type LogLevel int

const (
	LogLevel_Dbg LogLevel = iota
	LogLevel_Inf
	LogLevel_Err
)

type Log struct {
	Timestamp time.Time `json:"timestamp"`
	Level     LogLevel  `json:"level"`
	Message   string    `json:"message"`
}

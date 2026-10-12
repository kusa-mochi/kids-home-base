package utils

import (
	"os"
	"time"
)

func Now() time.Time {
	// デバッグ用。環境変数DEBUG_NOWが設定されている場合は、その値を現在時刻として返す。
	if v := os.Getenv("DEBUG_NOW"); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			return t
		}
	}

	// リリース用。環境変数DEBUG_NOWが設定されていない場合は、現在時刻を返す。
	return time.Now()
}

// ある日付が2つの日付の間に含まれるかどうかを判定する関数。2つのどちらかの日付と一致しても含まれるとみなす。
func IsDateInRange(date, startDate, endDate time.Time) bool {
	// 今日の日付（時刻部分を無視）を取得
	today := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	start := time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, startDate.Location())
	end := time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 0, 0, 0, 0, endDate.Location())

	return !today.Before(start) && !today.After(end)
}

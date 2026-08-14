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

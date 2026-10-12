package utils

import (
	datastructures "kids_home_base/data_structures"
	"time"
)

// 定期的な予定のデータから、スケジュールアイテムのリストを生成する関数。
// 入力
//
//	定期的な予定のデータ（[]datastructures.RecurringScheduleItemWithId型）
//	開始日（東京時間、time.Time型）
//	終了日（東京時間、time.Time型）
//
// 出力
//
//	スケジュールアイテムのリスト
//	エラー（発生した場合はerror型、それ以外はnil）
func ConvertRecurringToScheduleItems(items []datastructures.RecurringScheduleItemWithId, startDate, endDate time.Time) ([]datastructures.ScheduleItemWithId, error) {
	schedules := []datastructures.ScheduleItemWithId{}
	tokyoLocation := time.FixedZone("Asia/Tokyo", 9*60*60)
	recurringScheduleItemId := 1

	for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
		dUTC := d.In(time.UTC)
		for _, recurringSchedule := range items {
			// 日付 d が定期的なスケジュールの開始日（東京時間換算）と終了日（東京時間換算）の間（開始日と終了日を含む）に含まれない場合
			if !IsDateInRange(d, recurringSchedule.StartDate.In(tokyoLocation), recurringSchedule.EndDate.In(tokyoLocation)) {
				continue
			}

			// 定期的なスケジュールが毎日のスケジュールの場合
			if recurringSchedule.RecurringType == "daily" {
				// 予定の日時をUTCで生成する。
				scheduleDatetime := time.Date(dUTC.Year(), dUTC.Month(), dUTC.Day(), recurringSchedule.ScheduleTime.Hour(), recurringSchedule.ScheduleTime.Minute(), recurringSchedule.ScheduleTime.Second(), recurringSchedule.ScheduleTime.Nanosecond(), time.UTC)

				// TODO: スケジュール変更・削除の記録がある場合は反映する。

				// 日付 d のスケジュールとして schedules に追加する。
				schedules = append(schedules, datastructures.ScheduleItemWithId{
					Id:   recurringSchedule.Id + (recurringScheduleItemId << datastructures.RecurringScheduleItemIdBaseBit),
					Dt:   scheduleDatetime,
					Task: recurringSchedule.Task,
				})
				recurringScheduleItemId++

				continue
			}

			// 定期的なスケジュールが毎週のスケジュールの場合
			if recurringSchedule.RecurringType == "weekly" {
				// 日付 d の曜日（東京時間）
				var weekday uint8 = uint8(0x01 << d.Weekday())

				// 曜日が定期的なスケジュールの曜日に含まれていない場合はスキップ
				if recurringSchedule.DaysOfWeek&weekday == 0 {
					continue
				}

				// 予定の日時をUTCで生成する。
				scheduleDatetime := time.Date(dUTC.Year(), dUTC.Month(), dUTC.Day(), recurringSchedule.ScheduleTime.Hour(), recurringSchedule.ScheduleTime.Minute(), recurringSchedule.ScheduleTime.Second(), recurringSchedule.ScheduleTime.Nanosecond(), time.UTC)

				// TODO: スケジュール変更・削除の記録がある場合は反映する。

				// 日付 d のスケジュールとして schedules に追加する。
				schedules = append(schedules, datastructures.ScheduleItemWithId{
					Id:   recurringSchedule.Id + (recurringScheduleItemId << datastructures.RecurringScheduleItemIdBaseBit),
					Dt:   scheduleDatetime,
					Task: recurringSchedule.Task,
				})
				recurringScheduleItemId++

				continue
			}

			// 定期的なスケジュールが毎月のスケジュールの場合
			if recurringSchedule.RecurringType == "monthly" {
				// 日付 d の曜日（東京時間）
				var weekday uint8 = uint8(0x01 << d.Weekday())

				// 曜日が定期的なスケジュールの曜日に含まれていない場合はスキップ
				if recurringSchedule.DaysOfWeek&weekday == 0 {
					continue
				}

				// 曜日がその月の第何週に該当するかを計算する。
				weekOfMonth := (d.Day()-1)/7 + 1
				// 第何週に該当するかが定期的なスケジュールの週に含まれていない場合はスキップ
				if recurringSchedule.WeekOfMonth != weekOfMonth {
					continue
				}

				// 予定の日時をUTCで生成する。
				scheduleDatetime := time.Date(dUTC.Year(), dUTC.Month(), dUTC.Day(), recurringSchedule.ScheduleTime.Hour(), recurringSchedule.ScheduleTime.Minute(), recurringSchedule.ScheduleTime.Second(), recurringSchedule.ScheduleTime.Nanosecond(), time.UTC)

				// TODO: スケジュール変更・削除の記録がある場合は反映する。

				// 日付 d のスケジュールとして schedules に追加する。
				schedules = append(schedules, datastructures.ScheduleItemWithId{
					Id:   recurringSchedule.Id + (recurringScheduleItemId << datastructures.RecurringScheduleItemIdBaseBit),
					Dt:   scheduleDatetime,
					Task: recurringSchedule.Task,
				})
				recurringScheduleItemId++

				continue
			}
		}
	}
	return schedules, nil
}

package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
	"kids_home_base/utils"
	"sort"
	"time"
)

type GetUpcomingScheduleCommand struct {
	Response chan GetUpcomingScheduleResponse // レスポンスを返すためのチャネル
}

type GetUpcomingScheduleResponse struct {
	Success   bool                                `json:"success"`   // 成功したかどうか
	Message   string                              `json:"message"`   // メッセージ
	Schedules []datastructures.ScheduleItemWithId `json:"schedules"` // 今後のスケジュール
}

func NewGetUpcomingScheduleCommand() *GetUpcomingScheduleCommand {
	return &GetUpcomingScheduleCommand{
		Response: make(chan GetUpcomingScheduleResponse),
	}
}

func (c *GetUpcomingScheduleCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// DBから近日のスケジュールを取得する。
	schedules, err := dbManager.GetUpcomingSchedulesWithId()

	// 取得に失敗した場合
	if err != nil {
		logger.ErrPrintln("GetUpcomingScheduleCommand.Execute failed:", err.Error())
		c.Response <- GetUpcomingScheduleResponse{
			Success:   false,
			Message:   "今後のスケジュールの取得に失敗しました: " + err.Error(),
			Schedules: []datastructures.ScheduleItemWithId{},
		}
		return
	}

	logger.DbgPrintln("dbManager.GetUpcomingSchedulesWithId succeeded")

	recurringSchedules, err := dbManager.GetUpcomingRecurringScheduleItems()
	if err != nil {
		logger.ErrPrintln("GetUpcomingScheduleCommand.Execute failed to get recurring schedules:", err.Error())
	}

	// 現時刻から1日ずつ3ヶ月先まで、定期的なスケジュールを通常のスケジュールデータに変換して追加する。
	tokyoLocation := time.FixedZone("Asia/Tokyo", 9*60*60)
	today := utils.Now().In(tokyoLocation)
	endDate := today.AddDate(0, 3, 0)

	// 定期的なスケジュールのIDを生成するためのカウンタ
	recurringScheduleItemId := 1

	for d := today; !d.After(endDate); d = d.AddDate(0, 0, 1) {
		dUTC := d.In(time.UTC)
		for _, recurringSchedule := range recurringSchedules {
			// ここで、dの日付に対して recurringSchedule をチェックし、スケジュールを追加する処理を行う。
			// この部分は GetTomorrowScheduleCommand.go の処理を参考に実装する。

			// 日付 d が定期的なスケジュールの開始日（東京時間換算）と終了日（東京時間換算）の間（開始日と終了日を含む）に含まれない場合
			if !utils.IsDateInRange(d, recurringSchedule.StartDate.In(tokyoLocation), recurringSchedule.EndDate.In(tokyoLocation)) {
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

	logger.DbgPrintln("recurring schedule items were added")

	// schedules の要素を、東京時刻における時刻の昇順にソートする。
	sort.Slice(schedules, func(i, j int) bool {
		return schedules[i].Dt.In(tokyoLocation).Before(schedules[j].Dt.In(tokyoLocation))
	})

	logger.InfPrintln("GetUpcomingScheduleCommand.Execute succeeded")
	c.Response <- GetUpcomingScheduleResponse{
		Success:   true,
		Message:   "今後のスケジュールを取得しました",
		Schedules: schedules,
	}
}

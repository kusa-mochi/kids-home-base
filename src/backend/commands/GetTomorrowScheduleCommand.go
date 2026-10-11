package commands

import (
	"fmt"
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
	"kids_home_base/utils"
	"sort"
	"time"
)

type GetTomorrowScheduleCommand struct {
	Response chan GetTomorrowScheduleResponse // レスポンスを返すためのチャネル
}

type GetTomorrowScheduleResponse struct {
	Success   bool                                `json:"success"`   // 成功したかどうか
	Message   string                              `json:"message"`   // メッセージ
	Schedules []datastructures.ScheduleItemWithId `json:"schedules"` // 明日のスケジュール
}

func NewGetTomorrowScheduleCommand() *GetTomorrowScheduleCommand {
	return &GetTomorrowScheduleCommand{
		Response: make(chan GetTomorrowScheduleResponse),
	}
}

func (c *GetTomorrowScheduleCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// DBから明日のスケジュールを取得する。
	schedules, err := dbManager.GetTomorrowScheduleWithId()

	// 取得に失敗した場合
	if err != nil {
		logger.ErrPrintln("GetTomorrowScheduleCommand.Execute failed:", err.Error())
		c.Response <- GetTomorrowScheduleResponse{
			Success:   false,
			Message:   "明日のスケジュールの取得に失敗しました: " + err.Error(),
			Schedules: []datastructures.ScheduleItemWithId{},
		}
		return
	}

	logger.DbgPrintln("dbManager.GetTomorrowScheduleWithId succeeded")

	recurringSchedules, err := dbManager.GetTomorrowRecurringScheduleItems()
	if err != nil {
		logger.ErrPrintln("GetTomorrowScheduleCommand.Execute failed to get recurring schedules:", err.Error())
	}

	tokyoLocation := time.FixedZone("Asia/Tokyo", 9*60*60)
	tomorrow := utils.Now().In(tokyoLocation).AddDate(0, 0, 1)
	tomorrowUTC := tomorrow.In(time.UTC)

	// 明日の（東京時間）の定期的なスケジュールを通常のスケジュールデータに変換する。
	for _, recurringSchedule := range recurringSchedules {

		// 明日の（東京時間）が定期的なスケジュールの開始日（東京時間換算）と終了日（東京時間換算）の間（開始日と終了日を含む）に含まれない場合
		if !utils.IsDateInRange(tomorrow, recurringSchedule.StartDate.In(tokyoLocation), recurringSchedule.EndDate.In(tokyoLocation)) {
			continue
		}

		logger.DbgPrintln(fmt.Sprintf("recurring schedule item:%+v", recurringSchedule))

		// 定期的なスケジュールが毎日のスケジュールの場合
		if recurringSchedule.RecurringType == "daily" {
			// 明日の予定の時刻をUTCで生成する。
			tomorrowScheduleTime := time.Date(tomorrowUTC.Year(), tomorrowUTC.Month(), tomorrowUTC.Day(), recurringSchedule.ScheduleTime.Hour(), recurringSchedule.ScheduleTime.Minute(), recurringSchedule.ScheduleTime.Second(), recurringSchedule.ScheduleTime.Nanosecond(), time.UTC)

			// TODO: スケジュール変更・削除の記録がある場合は反映する。

			// 明日のスケジュールとして追加する。
			schedules = append(schedules, datastructures.ScheduleItemWithId{
				Id:   recurringSchedule.Id + datastructures.RecurringScheduleItemIdBase,
				Dt:   tomorrowScheduleTime,
				Task: recurringSchedule.Task,
			})

			continue
		}

		// 定期的なスケジュールが毎週のスケジュールの場合
		if recurringSchedule.RecurringType == "weekly" {
			// 明日の曜日
			var tomorrowWeekday uint8 = uint8(0x01 << tomorrow.Weekday())

			// 明日の曜日が定期的なスケジュールの曜日に含まれていない場合
			if recurringSchedule.DaysOfWeek&tomorrowWeekday == 0 {
				continue
			}

			// 明日の予定の時刻をUTCで生成する。
			tomorrowScheduleTime := time.Date(tomorrowUTC.Year(), tomorrowUTC.Month(), tomorrowUTC.Day(), recurringSchedule.ScheduleTime.Hour(), recurringSchedule.ScheduleTime.Minute(), recurringSchedule.ScheduleTime.Second(), recurringSchedule.ScheduleTime.Nanosecond(), time.UTC)

			// TODO: スケジュール変更・削除の記録がある場合は反映する。

			// 明日のスケジュールとして追加する。
			schedules = append(schedules, datastructures.ScheduleItemWithId{
				Id:   recurringSchedule.Id + datastructures.RecurringScheduleItemIdBase,
				Dt:   tomorrowScheduleTime,
				Task: recurringSchedule.Task,
			})
			continue
		}

		// 定期的なスケジュールが毎月のスケジュールの場合
		if recurringSchedule.RecurringType == "monthly" {
			// 明日の曜日
			var tomorrowWeekday uint8 = uint8(0x01 << tomorrow.Weekday())

			// 明日の日が定期的なスケジュールの曜日に含まれていない場合
			if recurringSchedule.DaysOfWeek&tomorrowWeekday == 0 {
				continue
			}

			// 明日の日が今月の第何週に該当するかを計算する。
			dayOfMonth := tomorrow.Day()
			weekOfMonth := (dayOfMonth-1)/7 + 1
			// 第何週に該当するかが定期的なスケジュールと一致しない場合
			if recurringSchedule.WeekOfMonth != weekOfMonth {
				continue
			}

			// 明日の予定の時刻をUTCで生成する。
			tomorrowScheduleTime := time.Date(tomorrowUTC.Year(), tomorrowUTC.Month(), tomorrowUTC.Day(), recurringSchedule.ScheduleTime.Hour(), recurringSchedule.ScheduleTime.Minute(), recurringSchedule.ScheduleTime.Second(), recurringSchedule.ScheduleTime.Nanosecond(), time.UTC)

			// TODO: スケジュール変更・削除の記録がある場合は反映する。

			// 明日のスケジュールとして追加する。
			schedules = append(schedules, datastructures.ScheduleItemWithId{
				Id:   recurringSchedule.Id + datastructures.RecurringScheduleItemIdBase,
				Dt:   tomorrowScheduleTime,
				Task: recurringSchedule.Task,
			})
			continue
		}
	}

	logger.DbgPrintln("recurring schedule items were added")

	// schedules の要素を、東京時刻における時刻の昇順にソートする。
	sort.Slice(schedules, func(i, j int) bool {
		return schedules[i].Dt.In(tokyoLocation).Before(schedules[j].Dt.In(tokyoLocation))
	})

	logger.InfPrintln("GetTomorrowScheduleCommand.Execute succeeded")
	c.Response <- GetTomorrowScheduleResponse{
		Success:   true,
		Message:   "明日のスケジュールを取得しました",
		Schedules: schedules,
	}
}

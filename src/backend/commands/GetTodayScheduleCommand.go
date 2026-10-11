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

type GetTodayScheduleCommand struct {
	Response chan GetTodayScheduleResponse // レスポンスを返すためのチャネル
}

type GetTodayScheduleResponse struct {
	Success   bool                                `json:"success"`   // 成功したかどうか
	Message   string                              `json:"message"`   // メッセージ
	Schedules []datastructures.ScheduleItemWithId `json:"schedules"` // 今日のスケジュール
}

func NewGetTodayScheduleCommand() *GetTodayScheduleCommand {
	return &GetTodayScheduleCommand{
		Response: make(chan GetTodayScheduleResponse),
	}
}

func (c *GetTodayScheduleCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// DBから今日のスケジュールを取得する。
	schedules, err := dbManager.GetTodayScheduleWithId()

	// 取得に失敗した場合
	if err != nil {
		logger.ErrPrintln("GetTodayScheduleCommand.Execute failed:", err.Error())
		c.Response <- GetTodayScheduleResponse{
			Success:   false,
			Message:   "今日のスケジュールの取得に失敗しました: " + err.Error(),
			Schedules: []datastructures.ScheduleItemWithId{},
		}
		return
	}

	logger.DbgPrintln("dbManager.GetTodayScheduleWithId succeeded")

	recurringSchedules, err := dbManager.GetTodayRecurringScheduleItems()
	if err != nil {
		logger.ErrPrintln("GetTodayScheduleCommand.Execute failed to get recurring schedules:", err.Error())
	}
	tokyoLocation := time.FixedZone("Asia/Tokyo", 9*60*60)
	today := utils.Now().In(tokyoLocation)
	todayUTC := today.In(time.UTC)
	// 今日（東京時間）の定期的なスケジュールを通常のスケジュールデータに変換する。
	for _, recurringSchedule := range recurringSchedules {

		// 今日（東京時間）が定期的なスケジュールの開始日（東京時間換算）と終了日（東京時間換算）の間（開始日と終了日を含む）に含まれない場合
		if !utils.IsDateInRange(today, recurringSchedule.StartDate.In(tokyoLocation), recurringSchedule.EndDate.In(tokyoLocation)) {
			continue
		}

		logger.DbgPrintln(fmt.Sprintf("recurring schedule item:%+v", recurringSchedule))

		// 定期的なスケジュールが毎日のスケジュールの場合
		if recurringSchedule.RecurringType == "daily" {
			// 今日の予定の時刻をUTCで生成する。
			todayScheduleTime := time.Date(todayUTC.Year(), todayUTC.Month(), todayUTC.Day(), recurringSchedule.ScheduleTime.Hour(), recurringSchedule.ScheduleTime.Minute(), recurringSchedule.ScheduleTime.Second(), recurringSchedule.ScheduleTime.Nanosecond(), time.UTC)

			// TODO: スケジュール変更・削除の記録がある場合は反映する。

			// 今日のスケジュールとして追加する。
			schedules = append(schedules, datastructures.ScheduleItemWithId{
				Id:   recurringSchedule.Id + datastructures.RecurringScheduleItemIdBase,
				Dt:   todayScheduleTime,
				Task: recurringSchedule.Task,
			})

			continue
		}

		// 定期的なスケジュールが毎週のスケジュールの場合
		if recurringSchedule.RecurringType == "weekly" {
			// 今日の曜日
			var todayWeekday uint8 = uint8(0x01 << utils.Now().Weekday())

			// 今日の曜日が定期的なスケジュールの曜日に含まれていない場合
			if recurringSchedule.DaysOfWeek&todayWeekday == 0 {
				continue
			}

			// 今日の予定の時刻をUTCで生成する。
			todayScheduleTime := time.Date(todayUTC.Year(), todayUTC.Month(), todayUTC.Day(), recurringSchedule.ScheduleTime.Hour(), recurringSchedule.ScheduleTime.Minute(), recurringSchedule.ScheduleTime.Second(), recurringSchedule.ScheduleTime.Nanosecond(), time.UTC)

			// TODO: スケジュール変更・削除の記録がある場合は反映する。

			// 今日のスケジュールとして追加する。
			schedules = append(schedules, datastructures.ScheduleItemWithId{
				Id:   recurringSchedule.Id + datastructures.RecurringScheduleItemIdBase,
				Dt:   todayScheduleTime,
				Task: recurringSchedule.Task,
			})
			continue
		}

		// 定期的なスケジュールが毎月のスケジュールの場合
		if recurringSchedule.RecurringType == "monthly" {
			// 今日の曜日
			var todayWeekday uint8 = uint8(0x01 << today.Weekday())

			// 今日の日が定期的なスケジュールの曜日に含まれていない場合
			if recurringSchedule.DaysOfWeek&todayWeekday == 0 {
				continue
			}

			// 今日の曜日が今月の第何週に該当するかを計算する。
			dayOfMonth := utils.Now().Day()
			weekOfMonth := (dayOfMonth-1)/7 + 1
			// 第何週に該当するかが定期的なスケジュールと一致しない場合
			if recurringSchedule.WeekOfMonth != weekOfMonth {
				continue
			}

			// 今日の予定の時刻をUTCで生成する。
			todayScheduleTime := time.Date(todayUTC.Year(), todayUTC.Month(), todayUTC.Day(), recurringSchedule.ScheduleTime.Hour(), recurringSchedule.ScheduleTime.Minute(), recurringSchedule.ScheduleTime.Second(), recurringSchedule.ScheduleTime.Nanosecond(), time.UTC)

			// TODO: スケジュール変更・削除の記録がある場合は反映する。

			// 今日のスケジュールとして追加する。
			schedules = append(schedules, datastructures.ScheduleItemWithId{
				Id:   recurringSchedule.Id + datastructures.RecurringScheduleItemIdBase,
				Dt:   todayScheduleTime,
				Task: recurringSchedule.Task,
			})
			continue
		}
	}

	logger.DbgPrintln("recurring schedule item were added")

	// schedules の要素を、東京時刻における時刻の昇順にソートする。
	sort.Slice(schedules, func(i, j int) bool {
		return schedules[i].Dt.In(tokyoLocation).Before(schedules[j].Dt.In(tokyoLocation))
	})

	logger.DbgPrintln("dbManager.GetTodayRecurringScheduleItems succeeded")

	logger.InfPrintln("GetTodayScheduleCommand.Execute succeeded")
	c.Response <- GetTodayScheduleResponse{
		Success:   true,
		Message:   "今日のスケジュールを取得しました",
		Schedules: schedules,
	}
}

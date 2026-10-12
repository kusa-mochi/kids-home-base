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

	schedulesFromRecurring, err := utils.ConvertRecurringToScheduleItems(recurringSchedules, today, endDate)
	if err != nil {
		logger.ErrPrintln("GetUpcomingScheduleCommand.Execute failed to convert recurring schedules:", err.Error())
	} else {
		schedules = append(schedules, schedulesFromRecurring...)
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

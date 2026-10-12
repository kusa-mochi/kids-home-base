package commands

import (
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

	schedulesFromRecurring, err := utils.ConvertRecurringToScheduleItems(recurringSchedules, tomorrow, tomorrow)
	if err != nil {
		logger.ErrPrintln("GetTomorrowScheduleCommand.Execute failed to convert recurring schedules:", err.Error())
	} else {
		schedules = append(schedules, schedulesFromRecurring...)
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

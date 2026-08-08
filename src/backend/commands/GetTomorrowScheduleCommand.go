package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
)

type GetTomorrowScheduleCommand struct {
	Response chan GetTomorrowScheduleResponse // レスポンスを返すためのチャネル
}

type GetTomorrowScheduleResponse struct {
	Success   bool                                // 成功したかどうか
	Message   string                              // メッセージ
	Schedules []datastructures.ScheduleItemWithId // 明日のスケジュール
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

	logger.InfPrintln("GetTomorrowScheduleCommand.Execute")
	c.Response <- GetTomorrowScheduleResponse{
		Success:   true,
		Message:   "明日のスケジュールを取得しました",
		Schedules: schedules,
	}
}

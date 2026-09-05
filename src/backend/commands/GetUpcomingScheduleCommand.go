package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
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

	logger.InfPrintln("GetUpcomingScheduleCommand.Execute")
	c.Response <- GetUpcomingScheduleResponse{
		Success:   true,
		Message:   "今後のスケジュールを取得しました",
		Schedules: schedules,
	}
}

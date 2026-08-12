package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
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

	logger.InfPrintln("GetTodayScheduleCommand.Execute")
	c.Response <- GetTodayScheduleResponse{
		Success:   true,
		Message:   "今日のスケジュールを取得しました",
		Schedules: schedules,
	}
}

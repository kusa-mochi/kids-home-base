package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
)

type UpdateScheduleItemCommand struct {
	ScheduleItemWithId *datastructures.ScheduleItemWithId // 更新する計画要素
	Response           chan UpdateScheduleItemResponse    // レスポンスを返すためのチャネル
}

type UpdateScheduleItemResponse struct {
	Success bool   // 成功したかどうか
	Message string // メッセージ
}

func NewUpdateScheduleItemCommand(s *datastructures.ScheduleItemWithId) *UpdateScheduleItemCommand {
	return &UpdateScheduleItemCommand{
		ScheduleItemWithId: s,
		Response:           make(chan UpdateScheduleItemResponse),
	}
}

func (c *UpdateScheduleItemCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// DBのスケジュールを更新する。
	err := dbManager.UpdateScheduleItem(c.ScheduleItemWithId)

	// 更新に失敗した場合
	if err != nil {
		logger.ErrPrintln("UpdateScheduleItemCommand.Execute failed:", err.Error())
		c.Response <- UpdateScheduleItemResponse{
			Success: false,
			Message: "スケジュールの更新に失敗しました: " + err.Error(),
		}
		return
	}

	logger.InfPrintln("UpdateScheduleItemCommand.Execute")
	c.Response <- UpdateScheduleItemResponse{
		Success: true,
		Message: "スケジュールを更新しました",
	}
}

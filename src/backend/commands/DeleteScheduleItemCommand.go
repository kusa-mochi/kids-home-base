package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
)

type DeleteScheduleItemCommand struct {
	ScheduleId int                             // 削除する計画要素のID
	Response   chan DeleteScheduleItemResponse // レスポンスを返すためのチャネル
}

type DeleteScheduleItemResponse struct {
	Success bool   // 成功したかどうか
	Message string // メッセージ
}

func NewDeleteScheduleItemCommand(scheduleId int) *DeleteScheduleItemCommand {
	return &DeleteScheduleItemCommand{
		ScheduleId: scheduleId,
		Response:   make(chan DeleteScheduleItemResponse),
	}
}

func (c *DeleteScheduleItemCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// DBからスケジュールを削除する。
	err := dbManager.DeleteScheduleItem(c.ScheduleId)

	// 削除に失敗した場合
	if err != nil {
		logger.ErrPrintln("DeleteScheduleItemCommand.Execute failed:", err.Error())
		c.Response <- DeleteScheduleItemResponse{
			Success: false,
			Message: "スケジュールの削除に失敗しました: " + err.Error(),
		}
		return
	}

	logger.InfPrintln("DeleteScheduleItemCommand.Execute")
	c.Response <- DeleteScheduleItemResponse{
		Success: true,
		Message: "スケジュールを削除しました",
	}
}

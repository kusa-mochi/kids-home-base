package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
)

type DeleteRecurringScheduleItemCommand struct {
	RecurringScheduleItemId int                                      // 削除する定期的な計画要素のID
	Response                chan DeleteRecurringScheduleItemResponse // レスポンスを返すためのチャネル
}

type DeleteRecurringScheduleItemResponse struct {
	Success bool   // 成功したかどうか
	Message string // メッセージ
}

func NewDeleteRecurringScheduleItemCommand(recurringScheduleItemId int) *DeleteRecurringScheduleItemCommand {
	return &DeleteRecurringScheduleItemCommand{
		RecurringScheduleItemId: recurringScheduleItemId,
		Response:                make(chan DeleteRecurringScheduleItemResponse),
	}
}

func (c *DeleteRecurringScheduleItemCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// DBから定期的なスケジュールを削除する。
	err := dbManager.DeleteRecurringScheduleItem(c.RecurringScheduleItemId)

	// 削除に失敗した場合
	if err != nil {
		logger.ErrPrintln("DeleteRecurringScheduleItemCommand.Execute failed:", err.Error())
		c.Response <- DeleteRecurringScheduleItemResponse{
			Success: false,
			Message: "定期的なスケジュールの削除に失敗しました: " + err.Error(),
		}
		return
	}

	logger.InfPrintln("DeleteRecurringScheduleItemCommand.Execute")
	c.Response <- DeleteRecurringScheduleItemResponse{
		Success: true,
		Message: "定期的なスケジュールを削除しました",
	}
}

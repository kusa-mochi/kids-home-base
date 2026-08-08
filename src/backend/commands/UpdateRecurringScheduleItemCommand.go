package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
)

type UpdateRecurringScheduleItemCommand struct {
	RecurringScheduleItemWithId *datastructures.RecurringScheduleItemWithId // 更新する定期的な計画要素
	Response                    chan UpdateRecurringScheduleItemResponse    // レスポンスを返すためのチャネル
}

type UpdateRecurringScheduleItemResponse struct {
	Success bool   // 成功したかどうか
	Message string // メッセージ
}

func NewUpdateRecurringScheduleItemCommand(r *datastructures.RecurringScheduleItemWithId) *UpdateRecurringScheduleItemCommand {
	return &UpdateRecurringScheduleItemCommand{
		RecurringScheduleItemWithId: r,
		Response:                    make(chan UpdateRecurringScheduleItemResponse),
	}
}

func (c *UpdateRecurringScheduleItemCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// DBの定期的なスケジュールを更新する。
	err := dbManager.UpdateRecurringScheduleItem(c.RecurringScheduleItemWithId)

	// 更新に失敗した場合
	if err != nil {
		logger.ErrPrintln("UpdateRecurringScheduleItemCommand.Execute failed:", err.Error())
		c.Response <- UpdateRecurringScheduleItemResponse{
			Success: false,
			Message: "定期的なスケジュールの更新に失敗しました: " + err.Error(),
		}
		return
	}

	logger.InfPrintln("UpdateRecurringScheduleItemCommand.Execute")
	c.Response <- UpdateRecurringScheduleItemResponse{
		Success: true,
		Message: "定期的なスケジュールを更新しました",
	}
}

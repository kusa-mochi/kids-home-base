package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
)

type AddRecurringScheduleItemCommand struct {
	RecurringScheduleItem *datastructures.RecurringScheduleItem // 追加する定期的な計画要素
	Response              chan AddRecurringScheduleItemResponse // レスポンスを返すためのチャネル
}

type AddRecurringScheduleItemResponse struct {
	Success bool   // 成功したかどうか
	Message string // メッセージ
}

func NewAddRecurringScheduleItemCommand(r *datastructures.RecurringScheduleItem) *AddRecurringScheduleItemCommand {
	return &AddRecurringScheduleItemCommand{
		RecurringScheduleItem: r,
		Response:              make(chan AddRecurringScheduleItemResponse),
	}
}

func (c *AddRecurringScheduleItemCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// DBから今日のスケジュールを取得する。
	err := dbManager.AddRecurringScheduleItem(c.RecurringScheduleItem)

	// 取得に失敗した場合
	if err != nil {
		logger.ErrPrintln("AddRecurringScheduleItemCommand.Execute failed:", err.Error())
		c.Response <- AddRecurringScheduleItemResponse{
			Success: false,
			Message: "定期的なスケジュールの追加に失敗しました: " + err.Error(),
		}
		return
	}

	logger.InfPrintln("AddRecurringScheduleItemCommand.Execute")
	c.Response <- AddRecurringScheduleItemResponse{
		Success: true,
		Message: "定期的なスケジュールを追加しました",
	}
}

package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
)

type AddScheduleItemCommand struct {
	ScheduleItem *datastructures.ScheduleItem // 追加する計画要素
	Response     chan AddScheduleItemResponse // レスポンスを返すためのチャネル
}

type AddScheduleItemResponse struct {
	Success bool   `json:"success"` // 成功したかどうか
	Message string `json:"message"` // メッセージ
}

func NewAddScheduleItemCommand(s *datastructures.ScheduleItem) *AddScheduleItemCommand {
	return &AddScheduleItemCommand{
		ScheduleItem: s,
		Response:     make(chan AddScheduleItemResponse),
	}
}

func (c *AddScheduleItemCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// DBにスケジュールを追加する。
	err := dbManager.AddScheduleItem(c.ScheduleItem)

	// 追加に失敗した場合
	if err != nil {
		logger.ErrPrintln("AddScheduleItemCommand.Execute failed:", err.Error())
		c.Response <- AddScheduleItemResponse{
			Success: false,
			Message: "スケジュールの追加に失敗しました: " + err.Error(),
		}
		return
	}

	logger.InfPrintln("AddScheduleItemCommand.Execute")
	c.Response <- AddScheduleItemResponse{
		Success: true,
		Message: "スケジュールを追加しました",
	}
}

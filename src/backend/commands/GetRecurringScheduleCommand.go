package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
)

type GetRecurringScheduleCommand struct {
	Response chan GetRecurringScheduleResponse // レスポンスを返すためのチャネル
}

type GetRecurringScheduleResponse struct {
	Success            bool                                         `json:"success"`             // 成功したかどうか
	Message            string                                       `json:"message"`             // メッセージ
	RecurringSchedules []datastructures.RecurringScheduleItemWithId `json:"recurring_schedules"` // 定期的なスケジュール
}

func NewGetRecurringScheduleCommand() *GetRecurringScheduleCommand {
	return &GetRecurringScheduleCommand{
		Response: make(chan GetRecurringScheduleResponse),
	}
}

func (c *GetRecurringScheduleCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// DBから定期的なスケジュールを取得する。
	recurringSchedules, err := dbManager.GetRecurringSchedulesWithId()

	// 取得に失敗した場合
	if err != nil {
		logger.ErrPrintln("GetRecurringScheduleCommand.Execute failed:", err.Error())
		c.Response <- GetRecurringScheduleResponse{
			Success:            false,
			Message:            "定期的なスケジュールの取得に失敗しました: " + err.Error(),
			RecurringSchedules: []datastructures.RecurringScheduleItemWithId{},
		}
		return
	}

	logger.DbgPrintln("dbManager.GetRecurringSchedulesWithId succeeded")

	c.Response <- GetRecurringScheduleResponse{
		Success:            true,
		Message:            "定期的なスケジュールを取得しました",
		RecurringSchedules: recurringSchedules,
	}
}

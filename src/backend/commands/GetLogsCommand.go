package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
)

type GetLogsCommand struct {
	Response chan GetLogsResponse // レスポンスを返すためのチャネル
}

type GetLogsResponse struct {
	Success bool                 // 成功したかどうか
	Message string               // メッセージ
	Logs    []datastructures.Log // ログ
}

func NewGetLogsCommand() *GetLogsCommand {
	return &GetLogsCommand{
		Response: make(chan GetLogsResponse),
	}
}

func (c *GetLogsCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// DBからログを取得する。
	logs, err := dbManager.GetLogs()

	// 取得に失敗した場合
	if err != nil {
		logger.ErrPrintln("GetLogsCommand.Execute failed:", err.Error())
		c.Response <- GetLogsResponse{
			Success: false,
			Message: "ログの取得に失敗しました: " + err.Error(),
			Logs:    []datastructures.Log{},
		}
		return
	}

	logger.InfPrintln("GetLogsCommand.Execute")
	c.Response <- GetLogsResponse{
		Success: true,
		Message: "ログを取得しました",
		Logs:    logs,
	}
}

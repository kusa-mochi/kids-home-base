package api_handlers

import (
	"kids_home_base/commands"
	"kids_home_base/logger"

	"github.com/gin-gonic/gin"
)

func DeleteScheduleItemHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	// JSONボディから削除するスケジュール要素のIDを取得する。
	var requestBody struct {
		ScheduleItemId int `json:"id"`
	}
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		logger.ErrPrintln("DeleteScheduleItemHandler: Failed to bind JSON:", err.Error())
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	deleteScheduleItemCommand := commands.NewDeleteScheduleItemCommand(requestBody.ScheduleItemId)
	apiRequest <- deleteScheduleItemCommand
	response := <-deleteScheduleItemCommand.Response
	c.JSON(200, response)
}

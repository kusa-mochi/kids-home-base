package api_handlers

import (
	"kids_home_base/commands"

	"github.com/gin-gonic/gin"
)

func DeleteRecurringScheduleItemHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	// JSONボディから削除する定期スケジュール要素のIDを取得する。
	var requestBody struct {
		RecurringScheduleItemId int `json:"id"`
	}
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	deleteRecurringScheduleItemCommand := commands.NewDeleteRecurringScheduleItemCommand(requestBody.RecurringScheduleItemId)
	apiRequest <- deleteRecurringScheduleItemCommand
	response := <-deleteRecurringScheduleItemCommand.Response
	c.JSON(200, response)
}

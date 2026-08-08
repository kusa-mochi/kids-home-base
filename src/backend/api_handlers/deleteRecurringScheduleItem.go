package api_handlers

import (
	"kids_home_base/commands"
	"strconv"

	"github.com/gin-gonic/gin"
)

func DeleteRecurringScheduleItem(c *gin.Context, apiRequest chan commands.ICommand) {
	recurringScheduleItemIdString := c.Param("id")
	recurringScheduleItemId, err := strconv.Atoi(recurringScheduleItemIdString)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid recurring schedule item ID"})
		return
	}

	deleteRecurringScheduleItemCommand := commands.NewDeleteRecurringScheduleItemCommand(recurringScheduleItemId)
	apiRequest <- deleteRecurringScheduleItemCommand
	response := <-deleteRecurringScheduleItemCommand.Response
	c.JSON(200, response)
}

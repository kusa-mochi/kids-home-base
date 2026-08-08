package api_handlers

import (
	"kids_home_base/commands"
	"strconv"

	"github.com/gin-gonic/gin"
)

func DeleteScheduleItemHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	scheduleItemIdString := c.Param("id")
	scheduleItemId, err := strconv.Atoi(scheduleItemIdString)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid schedule item ID"})
		return
	}

	deleteScheduleItemCommand := commands.NewDeleteScheduleItemCommand(scheduleItemId)
	apiRequest <- deleteScheduleItemCommand
	response := <-deleteScheduleItemCommand.Response
	c.JSON(200, response)
}

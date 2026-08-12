package api_handlers

import (
	"kids_home_base/commands"
	datastructures "kids_home_base/data_structures"

	"github.com/gin-gonic/gin"
)

func AddRecurringScheduleItemHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	recurringScheduleItem := &datastructures.RecurringScheduleItem{}
	if err := c.ShouldBindJSON(recurringScheduleItem); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	cmd := commands.NewAddRecurringScheduleItemCommand(recurringScheduleItem)
	apiRequest <- cmd
	response := <-cmd.Response
	c.JSON(200, response)
}

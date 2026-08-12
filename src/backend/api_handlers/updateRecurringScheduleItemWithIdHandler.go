package api_handlers

import (
	"kids_home_base/commands"
	datastructures "kids_home_base/data_structures"

	"github.com/gin-gonic/gin"
)

func UpdateRecurringScheduleItemWithIdHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	s := &datastructures.RecurringScheduleItemWithId{}
	if err := c.ShouldBindJSON(s); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	updateRecurringScheduleItemCommand := commands.NewUpdateRecurringScheduleItemCommand(s)
	apiRequest <- updateRecurringScheduleItemCommand
	response := <-updateRecurringScheduleItemCommand.Response
	c.JSON(200, response)
}

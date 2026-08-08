package api_handlers

import (
	"kids_home_base/commands"
	datastructures "kids_home_base/data_structures"

	"github.com/gin-gonic/gin"
)

func UpdateScheduleItemWithId(c *gin.Context, apiRequest chan commands.ICommand) {
	s := &datastructures.ScheduleItemWithId{}
	if err := c.ShouldBindJSON(s); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	updateScheduleItemCommand := commands.NewUpdateScheduleItemCommand(s)
	apiRequest <- updateScheduleItemCommand
	response := <-updateScheduleItemCommand.Response
	c.JSON(200, response)
}

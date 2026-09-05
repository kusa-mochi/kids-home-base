package api_handlers

import (
	"kids_home_base/commands"
	datastructures "kids_home_base/data_structures"

	"github.com/gin-gonic/gin"
)

func UpdateScheduleItemWithIdHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	s := &datastructures.ScheduleItemWithId{}
	if err := c.ShouldBindJSON(s); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if s.Dt.IsZero() {
		c.JSON(400, gin.H{"error": "dt (UTC datetime) is required"})
		return
	}

	updateScheduleItemCommand := commands.NewUpdateScheduleItemCommand(s)
	apiRequest <- updateScheduleItemCommand
	response := <-updateScheduleItemCommand.Response
	c.JSON(200, response)
}

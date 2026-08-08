package api_handlers

import (
	"kids_home_base/commands"
	datastructures "kids_home_base/data_structures"

	"github.com/gin-gonic/gin"
)

func AddScheduleItemHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	scheduleItem := &datastructures.ScheduleItem{}
	if err := c.ShouldBindJSON(scheduleItem); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	cmd := commands.NewAddScheduleItemCommand(scheduleItem)
	apiRequest <- cmd
	response := <-cmd.Response
	c.JSON(200, response)
}

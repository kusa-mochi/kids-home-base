package api_handlers

import (
	"kids_home_base/commands"

	"github.com/gin-gonic/gin"
)

func GetTomorrowScheduleHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	cmd := commands.NewGetTomorrowScheduleCommand()
	apiRequest <- cmd
	response := <-cmd.Response
	if response.Success {
		c.JSON(200, response)
	} else {
		c.JSON(400, response)
	}
}

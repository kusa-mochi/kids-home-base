package api_handlers

import (
	"kids_home_base/commands"

	"github.com/gin-gonic/gin"
)

func GetLogsHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	getLogsCommand := commands.NewGetLogsCommand()
	apiRequest <- getLogsCommand
	response := <-getLogsCommand.Response
	if response.Success {
		c.JSON(200, response)
	} else {
		c.JSON(400, response)
	}
}

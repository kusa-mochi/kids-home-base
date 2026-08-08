package api_handlers

import (
	"kids_home_base/commands"

	"github.com/gin-gonic/gin"
)

func GetLogs(c *gin.Context, apiRequest chan commands.ICommand) {
	getLogsCommand := commands.NewGetLogsCommand()
	apiRequest <- getLogsCommand
	response := <-getLogsCommand.Response
	c.JSON(200, response)
}

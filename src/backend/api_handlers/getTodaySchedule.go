package api_handlers

import (
	"kids_home_base/commands"

	"github.com/gin-gonic/gin"
)

func GetTodayScheduleHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	cmd := commands.NewGetTodayScheduleCommand()
	apiRequest <- cmd
	response := <-cmd.Response
	c.JSON(200, response)
}

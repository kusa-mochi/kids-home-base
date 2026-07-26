package api_handlers

import (
	"kids_home_base/commands"

	"github.com/gin-gonic/gin"
)

func PingHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	c.JSON(200, gin.H{
		"message": "pong",
	})

	apiRequest <- &commands.TestPingCommand{}
}

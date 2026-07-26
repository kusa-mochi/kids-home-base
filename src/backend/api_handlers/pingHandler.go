package api_handlers

import (
	"kids_home_base/commands"
	"log"

	"github.com/gin-gonic/gin"
)

func PingHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	command := commands.NewTestPingCommand()
	apiRequest <- command
	log.Println("/ping main goroutine response:", <-command.Response)
	c.JSON(200, gin.H{
		"message": "pong",
	})
}

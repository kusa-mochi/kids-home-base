package api_handlers

import (
	"kids_home_base/commands"
	"log"

	"github.com/gin-gonic/gin"
)

func EchoHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	var json map[string]interface{}
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	command := commands.NewTestEchoCommand(json)
	apiRequest <- command
	log.Println("/echo main goroutine response:", <-command.Response)

	c.JSON(200, json)
}

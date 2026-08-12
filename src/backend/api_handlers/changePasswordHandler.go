package api_handlers

import (
	"kids_home_base/commands"

	"github.com/gin-gonic/gin"
)

func ChangePasswordHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	// ユーザーIDと現在のパスワードと新しいパスワードをリクエストボディから取得
	var request struct {
		UserID          string `json:"user_id"`
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	cmd := commands.NewChangePasswordCommand(request.UserID, request.CurrentPassword, request.NewPassword)
	apiRequest <- cmd
	response := <-cmd.Response
	c.JSON(200, response)
}

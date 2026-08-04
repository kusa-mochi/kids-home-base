package api_handlers

import (
	"kids_home_base/commands"

	"github.com/gin-gonic/gin"
)

// ユーザーのログイン処理を行うハンドラー関数。
// クライアントから渡されたユーザーIDとパスワードを検証し、JWTトークンを生成して返す。
func LoginHandler(c *gin.Context, apiRequest chan commands.ICommand) {
	// クライアントから渡されたユーザーIDとパスワードを取得する。
	userID := c.PostForm("user_id")
	password := c.PostForm("password")

	// ユーザーIDとパスワードの組み合わせが問題なければ、JWTトークンを生成して返す。問題があれば、エラーメッセージを返す。
	loginCommand := commands.NewLoginCommand(userID, password)

	// コマンドをAPIリクエストチャンネルに送信する。
	apiRequest <- loginCommand

	// コマンドの実行結果を待つ。
	loginResponse := <-loginCommand.Response

	// レスポンスをクライアントに返す。
	if loginResponse.Success {
		c.JSON(200, gin.H{
			"message":      loginResponse.Message,
			"access_token": loginResponse.AccessToken,
		})
	} else {
		c.JSON(401, gin.H{
			"message": loginResponse.Message,
		})
	}
}

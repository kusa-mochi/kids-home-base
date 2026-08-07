package api_handlers

import "github.com/gin-gonic/gin"

func JwtTestHandler(c *gin.Context) {
	// JWT認証が成功した場合の処理をここに記述します。
	c.JSON(200, gin.H{"message": "JWT認証が成功しました。"})
}

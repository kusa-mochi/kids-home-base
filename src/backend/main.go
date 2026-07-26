package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// まずはテスト用に gin で簡単なGETメソッドAPIとPOSTメソッドAPIを作成します。
	r := gin.Default()

	// CORS設定追加。
	// まずは開発目的で、localhost:3000 からのアクセスを許可する設定を追加します。
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
		log.Println("ping API is called.")
	})

	r.POST("/echo", func(c *gin.Context) {
		var json map[string]interface{}
		if err := c.ShouldBindJSON(&json); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, json)
		log.Println("echo API is called with data:", json)
	})

	if err := r.Run(":21226"); err != nil { // デフォルトで :21226 でリッスンします
		log.Fatal(err)
	}
}

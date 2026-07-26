package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// まずはテスト用に gin で簡単なGETメソッドAPIとPOSTメソッドAPIを作成します。
	r := gin.Default()

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

	r.Run() // デフォルトで :8080 でリッスンします
}

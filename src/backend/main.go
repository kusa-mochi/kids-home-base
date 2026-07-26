package main

import (
	"kids_home_base/api_handlers"
	"kids_home_base/commands"
	"log"

	"github.com/gin-gonic/gin"
)

func RunAPIServerGoroutine(apiRequest chan commands.ICommand) {
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

	//// APIハンドラ登録

	r.GET("/ping", func(c *gin.Context) { api_handlers.PingHandler(c, apiRequest) })
	r.POST("/echo", func(c *gin.Context) { api_handlers.EchoHandler(c, apiRequest) })

	//// サーバー起動

	if err := r.Run(":21226"); err != nil { // デフォルトで :21226 でリッスンします
		log.Fatal(err)
	}
}

func main() {
	// APIハンドラからのリクエストをメインゴルーチンで受け取るためのチャネルを初期化する。
	apiRequest := make(chan commands.ICommand)

	go RunAPIServerGoroutine(apiRequest)

	for {
		c := <-apiRequest
		c.Execute()
	}
}

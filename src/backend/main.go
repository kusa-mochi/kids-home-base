package main

import (
	"kids_home_base/api_handlers"
	"kids_home_base/commands"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
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

	logger.InfPrintln("API server is listening at 21226 port.")

	if err := r.Run(":21226"); err != nil { // デフォルトで :21226 でリッスンします
		log.Fatal(err)
	}
}

func main() {
	// データベースの初期化と接続
	dbManager := dbmanager.NewDBManager()

	// ロガーの初期化
	logger.InitLogger(dbManager)

	logger.DbgPrintln("init fin.")

	// APIハンドラからのリクエストをメインゴルーチンで受け取るためのチャネルを初期化する。
	apiRequest := make(chan commands.ICommand)

	go RunAPIServerGoroutine(apiRequest)

	logger.DbgPrintln("command goroutine is running.")

	for {
		c := <-apiRequest
		c.Execute(dbManager) // データベース接続を渡して Execute を呼び出す
	}
}

package main

import (
	"kids_home_base/api_handlers"
	"kids_home_base/api_middlewares"
	"kids_home_base/commands"
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
	"log"

	"encoding/json"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

// 設定ファイルの読み込みを行う関数。
func LoadConfig() (*datastructures.Config, error) {
	// 設定ファイル conf/backend_conf.json を読み込む。
	file, err := os.Open("conf/backend_conf.json")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	var config datastructures.Config
	if err := decoder.Decode(&config); err != nil {
		return nil, err
	}

	return &config, nil
}

func RunAPIServerGoroutine(apiRequest chan commands.ICommand, jwtSecretKey string) {
	// まずはテスト用に gin で簡単なGETメソッドAPIとPOSTメソッドAPIを作成します。
	r := gin.Default()

	// CORS設定追加。
	// まずは開発目的で、localhost:3000 からのアクセスを許可する設定を追加します。
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	//// APIハンドラ登録

	r.GET("/ping", func(c *gin.Context) { api_handlers.PingHandler(c, apiRequest) })
	r.POST("/echo", func(c *gin.Context) { api_handlers.EchoHandler(c, apiRequest) })
	r.POST("/login", func(c *gin.Context) { api_handlers.LoginHandler(c, apiRequest) })

	//// JWT認証ミドルウェアを使用するAPIグループ
	authGroup := r.Group("/auth")
	authGroup.Use(api_middlewares.JWTMiddleware(jwtSecretKey))
	{
		authGroup.GET("/jwt-test", api_handlers.JwtTestHandler)
	}

	//// サーバー起動

	logger.InfPrintln("API server is listening at 21226 port.")

	if err := r.Run(":21226"); err != nil { // デフォルトで :21226 でリッスンします
		log.Fatal(err)
	}
}

func main() {
	// 設定ファイルの読み込み
	conf, err := LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// データベースの初期化と接続
	dbManager := dbmanager.NewDBManager()

	// ロガーの初期化
	logger.InitLogger(dbManager)

	logger.DbgPrintln("init fin.")

	// APIハンドラからのリクエストをメインゴルーチンで受け取るためのチャネルを初期化する。
	apiRequest := make(chan commands.ICommand)

	go RunAPIServerGoroutine(apiRequest, conf.JWTSecretKey)

	logger.DbgPrintln("command goroutine is running.")

	for {
		c := <-apiRequest
		c.Execute(dbManager, conf) // データベース接続と設定ファイルの値を渡して Execute を呼び出す
	}
}

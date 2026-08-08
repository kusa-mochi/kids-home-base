package main

import (
	"kids_home_base/api_handlers"
	"kids_home_base/api_middlewares"
	"kids_home_base/commands"
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
	"log"
	"time"

	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

func RunAPIServerGoroutine(apiRequest chan commands.ICommand, jwtSecretKey string) {
	// まずはテスト用に gin で簡単なGETメソッドAPIとPOSTメソッドAPIを作成します。
	r := gin.Default()

	// ログ出力ミドルウェアを追加
	r.Use(api_middlewares.LoggerMiddleware())

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
	r.GET("/get-today-schedule", func(c *gin.Context) { api_handlers.GetTodayScheduleHandler(c, apiRequest) })
	r.GET("/get-tomorrow-schedule", func(c *gin.Context) { api_handlers.GetTomorrowScheduleHandler(c, apiRequest) })
	r.POST("/add-schedule-item", func(c *gin.Context) { api_handlers.AddScheduleItemHandler(c, apiRequest) })
	r.POST("/update-schedule-item-with-id", func(c *gin.Context) { api_handlers.UpdateScheduleItemWithIdHandler(c, apiRequest) })
	r.POST("/delete-schedule-item", func(c *gin.Context) { api_handlers.DeleteScheduleItemHandler(c, apiRequest) })
	r.POST("/add-recurring-schedule-item", func(c *gin.Context) { api_handlers.AddRecurringScheduleItemHandler(c, apiRequest) })
	r.POST("/update-recurring-schedule-item-with-id", func(c *gin.Context) { api_handlers.UpdateRecurringScheduleItemWithIdHandler(c, apiRequest) })
	r.POST("/delete-recurring-schedule-item", func(c *gin.Context) { api_handlers.DeleteRecurringScheduleItemHandler(c, apiRequest) })
	r.POST("/login", func(c *gin.Context) { api_handlers.LoginHandler(c, apiRequest) })

	//// JWT認証ミドルウェアを使用するAPIグループ
	authGroup := r.Group("/auth")
	authGroup.Use(api_middlewares.LoggerMiddleware())
	authGroup.Use(api_middlewares.JWTMiddleware(jwtSecretKey))
	{
		authGroup.GET("/jwt-test", api_handlers.JwtTestHandler)
		authGroup.POST("/change-password", func(c *gin.Context) { api_handlers.ChangePasswordHandler(c, apiRequest) })
	}

	//// サーバー起動

	logger.InfPrintln("API server is listening at 21226 port.")

	if err := r.Run(":21226"); err != nil { // デフォルトで :21226 でリッスンします
		log.Fatal(err)
	}
}

func AddTestData(dbManager *dbmanager.DBManager) {
	logger.DbgPrintln("adding test data to DB...")

	// 今日の年・月・日をそれぞれ取得
	year, month, day := time.Now().Date()
	// 今日の予定
	dbManager.AddScheduleItems([]*datastructures.ScheduleItem{
		{Dt: time.Date(year, month, day, 7, 15, 0, 0, time.Local), Task: "オクラに水をやる"},
		{Dt: time.Date(year, month, day, 7, 50, 0, 0, time.Local), Task: "朝ごはんを食べる"},
		{Dt: time.Date(year, month, day, 18, 50, 0, 0, time.Local), Task: "シャワーを浴びる"},
		{Dt: time.Date(year, month, day, 20, 0, 0, 0, time.Local), Task: "夕ごはんを食べる"},
		{Dt: time.Date(year, month, day, 21, 0, 0, 0, time.Local), Task: "歯を磨く"},
		{Dt: time.Date(year, month, day, 21, 30, 0, 0, time.Local), Task: "寝る"},
	})

	logger.DbgPrintln("added today test data")

	// 明日の年・月・日をそれぞれ取得
	tomorrow := time.Now().AddDate(0, 0, 1)
	year, month, day = tomorrow.Date()
	// 明日の予定
	dbManager.AddScheduleItems([]*datastructures.ScheduleItem{
		{Dt: time.Date(year, month, day, 7, 15, 0, 0, time.Local), Task: "オクラに水をやる２"},
		{Dt: time.Date(year, month, day, 7, 50, 0, 0, time.Local), Task: "朝ごはんを食べる２"},
		{Dt: time.Date(year, month, day, 18, 50, 0, 0, time.Local), Task: "シャワーを浴びる２"},
		{Dt: time.Date(year, month, day, 20, 0, 0, 0, time.Local), Task: "夕ごはんを食べる２"},
		{Dt: time.Date(year, month, day, 21, 0, 0, 0, time.Local), Task: "歯を磨く２"},
		{Dt: time.Date(year, month, day, 21, 30, 0, 0, time.Local), Task: "寝る２"},
	})

	logger.DbgPrintln("added tomorrow test data")
}

func main() {
	// 環境変数から初期パスワードハッシュとJWT秘密鍵とソルトを受け取る。
	initialPasswordHash := os.Getenv("INITIAL_PASSWORD_HASH")
	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")
	salt := os.Getenv("SALT")

	// 環境変数が設定されていない場合
	if initialPasswordHash == "" || jwtSecretKey == "" || salt == "" {
		log.Fatal("Environment variables INITIAL_PASSWORD_HASH, JWT_SECRET_KEY, and SALT must be set")
	}

	conf := datastructures.Config{
		InitialPasswordHash: initialPasswordHash,
		JWTSecretKey:        jwtSecretKey,
		Salt:                salt,
	}

	// データベースの初期化と接続
	dbManager := dbmanager.NewDBManager(conf.InitialPasswordHash)

	// デバッグ用。データベースにテスト用データを追加する。
	// 運用時はコメントアウトすること。
	AddTestData(dbManager)

	// ロガーの初期化
	logger.InitLogger(dbManager)

	logger.DbgPrintln("init fin.")

	// APIハンドラからのリクエストをメインゴルーチンで受け取るためのチャネルを初期化する。
	apiRequest := make(chan commands.ICommand)

	go RunAPIServerGoroutine(apiRequest, conf.JWTSecretKey)

	logger.DbgPrintln("command goroutine is running.")

	for {
		c := <-apiRequest
		c.Execute(dbManager, &conf) // データベース接続と設定ファイルの値を渡して Execute を呼び出す
	}
}

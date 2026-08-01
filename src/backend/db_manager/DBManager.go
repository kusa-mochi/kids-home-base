package dbmanager

import (
	"database/sql"
	"log"
	"os"
)

// DBManager は、DB接続、クエリ実行、トランザクション管理などの機能を提供する構造体です。
// この構造体外部には、クエリの具体的な内容や、DBの種類に依存する処理は隠蔽されます。

type DBManager struct {
	db *sql.DB
}

func NewDBManager() *DBManager {
	// SQLiteのデータベースファイル名
	dbFileName := "kids_home_base.db"

	// SQLiteのデータベースファイルが存在しない場合は新規作成する。
	if _, err := os.Stat(dbFileName); os.IsNotExist(err) {
		file, err := os.Create(dbFileName)
		if err != nil {
			log.Fatal(err)
		}
		file.Close()
	}

	// SQLiteのデータベースに接続する。
	db, err := sql.Open("sqlite3", dbFileName)
	if err != nil {
		log.Fatal(err)
	}

	// テーブルの作成
	// 必要なテーブルおよびデータ構造は、 docs/er.puml に記載している。

	// 大人ユーザーID
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id_text TEXT NOT NULL
	);`)
	if err != nil {
		log.Fatal(err)
	}

	// パスワードのハッシュ値
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS passwords (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		password_hash TEXT NOT NULL
	);`)
	if err != nil {
		log.Fatal(err)
	}

	// ログ
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		log_level TEXT NOT NULL,
		log_message TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`)
	if err != nil {
		log.Fatal(err)
	}

	// 計画
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS schedules (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		schedule_datetime DATETIME NOT NULL,
		schedule_task TEXT NOT NULL
	);`)
	if err != nil {
		log.Fatal(err)
	}

	// 定期的な計画
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS recurring_schedules (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		day_of_week TEXT NOT NULL,
		schedule_time TIME NOT NULL,
		end_date DATE NOT NULL,
		schedule_task TEXT NOT NULL
	);`)
	if err != nil {
		log.Fatal(err)
	}

	// 各テーブルにデータが存在しない場合は、初期データを挿入する。

	// 大人ユーザーIDの初期データ（dad, mom）
	_, err = db.Exec(`INSERT INTO users (user_id_text) SELECT 'dad' WHERE NOT EXISTS (SELECT 1 FROM users);`)
	if err != nil {
		log.Fatal(err)
	}
	_, err = db.Exec(`INSERT INTO users (user_id_text) SELECT 'mom' WHERE NOT EXISTS (SELECT 1 FROM users);`)
	if err != nil {
		log.Fatal(err)
	}

	// パスワードの初期データ（ハッシュ値は適切に生成する必要があります。ここでは例として "kenepiyo" のハッシュ値を使用しています。）
	_, err = db.Exec(`INSERT INTO passwords (password_hash) SELECT 'e99a18c428cb38d5f260853678922e03' WHERE NOT EXISTS (SELECT 1 FROM passwords);`)
	if err != nil {
		log.Fatal(err)
	}

	// ログの初期データ（例として1件のログを挿入しています。）
	_, err = db.Exec(`INSERT INTO logs (user_id, log_level, log_message) SELECT 1, 'INF', 'ログテスト' WHERE NOT EXISTS (SELECT 1 FROM logs);`)
	if err != nil {
		log.Fatal(err)
	}

	// 計画の初期データ（例として1件の計画を挿入しています。）
	_, err = db.Exec(`INSERT INTO schedules (schedule_datetime, schedule_task) SELECT '2026-08-02 16:00:00', 'テストタスク' WHERE NOT EXISTS (SELECT 1 FROM schedules);`)
	if err != nil {
		log.Fatal(err)
	}

	// 定期的な計画の初期データ（例として1件の定期的な計画を挿入しています。）
	_, err = db.Exec(`INSERT INTO recurring_schedules (day_of_week, schedule_time, end_date, schedule_task) SELECT 'Monday', '16:00:00', '2026-11-02', '定期タスク' WHERE NOT EXISTS (SELECT 1 FROM recurring_schedules);`)
	if err != nil {
		log.Fatal(err)
	}

	return &DBManager{db: db}
}

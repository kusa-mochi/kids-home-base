package dbmanager

import (
	"database/sql"
	datastructures "kids_home_base/data_structures"
	"log"
	"os"
)

// DBManager は、DB接続、クエリ実行、トランザクション管理などの機能を提供する構造体です。
// この構造体外部には、クエリの具体的な内容や、DBの種類に依存する処理は隠蔽されます。

type DBManager struct {
	db *sql.DB
}

func NewDBManager(initialPasswordHash string) *DBManager {
	// SQLiteのデータベースファイル名
	dbFileName := "kids_home_base.db"

	// SQLiteのデータベースファイルが存在しない場合は新規作成する。
	if _, err := os.Stat(dbFileName); os.IsNotExist(err) {
		file, err := os.Create(dbFileName)
		if err != nil {
			log.Fatal("exec error in NewDBManager: " + err.Error())
		}
		file.Close()
	}

	// SQLiteのデータベースに接続する。
	db, err := sql.Open("sqlite3", dbFileName)
	if err != nil {
		log.Fatal("exec error in NewDBManager: " + err.Error())
	}

	// テーブルの作成
	// 必要なテーブルおよびデータ構造は、 docs/er.puml に記載している。

	// 大人ユーザーID
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id_text TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL
	);`)
	if err != nil {
		log.Fatal("exec error in NewDBManager: " + err.Error())
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
		log.Fatal("exec error in NewDBManager: " + err.Error())
	}

	// 計画
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS schedules (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		schedule_datetime DATETIME NOT NULL,
		schedule_task TEXT NOT NULL
	);`)
	if err != nil {
		log.Fatal("exec error in NewDBManager: " + err.Error())
	}

	// 定期的な計画
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS recurring_schedules (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		day_of_week TEXT NOT NULL,
		schedule_time TIME NOT NULL,
		start_date DATE NOT NULL,
		end_date DATE NOT NULL,
		schedule_task TEXT NOT NULL
	);`)
	if err != nil {
		log.Fatal("exec error in NewDBManager: " + err.Error())
	}

	// 各テーブルにデータが存在しない場合は、初期データを挿入する。

	// 大人ユーザーIDの初期データ（user_id_textが 'dad' および 'mom' のユーザーをそれぞれ作成する）
	_, err = db.Exec(`INSERT OR IGNORE INTO users (user_id_text, password_hash) VALUES 
						('dad', ?),
						('mom', ?);
					`, initialPasswordHash, initialPasswordHash)
	if err != nil {
		log.Fatal("exec error in NewDBManager:", err.Error())
	}

	// ログの初期データ（例として1件のログを挿入しています。）
	_, err = db.Exec(`INSERT INTO logs (user_id, log_level, log_message, created_at) SELECT 1, 'INF', 'ログテスト', CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM logs);`)
	if err != nil {
		log.Fatal("exec error in NewDBManager:", err.Error())
	}

	// 計画の初期データ（例として1件の計画を挿入しています。）
	_, err = db.Exec(`INSERT INTO schedules (schedule_datetime, schedule_task) SELECT '2026-08-02 16:00:00', 'テストタスク' WHERE NOT EXISTS (SELECT 1 FROM schedules);`)
	if err != nil {
		log.Fatal("exec error in NewDBManager:", err.Error())
	}

	// 定期的な計画の初期データ（例として1件の定期的な計画を挿入しています。）
	_, err = db.Exec(`INSERT INTO recurring_schedules (day_of_week, schedule_time, start_date, end_date, schedule_task) SELECT 'Monday', '16:00:00', '2026-08-02', '2026-11-02', '定期タスク' WHERE NOT EXISTS (SELECT 1 FROM recurring_schedules);`)
	if err != nil {
		log.Fatal("exec error in NewDBManager:", err.Error())
	}

	return &DBManager{db: db}
}

// ログをデータベースに追加する関数。
func (m *DBManager) AddLog(userId int, logLevel string, messageToAdd string) error {
	_, err := m.db.Exec(`INSERT INTO logs (user_id, log_level, log_message, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`, userId, logLevel, messageToAdd)

	if err != nil {
		log.Println("exec error in AddLog:", err.Error())
		return err
	}

	return nil
}

// DBから直近1ヶ月間のログを取得する関数。
func (m *DBManager) GetLogs() ([]datastructures.Log, error) {
	rows, err := m.db.Query(`SELECT created_at, log_level, log_message FROM logs WHERE created_at >= DATE('now', '-1 month', 'localtime') ORDER BY created_at DESC`)
	if err != nil {
		log.Println("query error in GetLogs:", err.Error())
		return nil, err
	}
	defer rows.Close()

	var logs []datastructures.Log
	for rows.Next() {
		var l datastructures.Log
		err := rows.Scan(&l.Timestamp, &l.Level, &l.Message)
		if err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}

	if err = rows.Err(); err != nil {
		log.Println("rows error in GetLogs:", err.Error())
		return nil, err
	}

	return logs, nil
}

// DBから今日の日付の計画すべてを取得する関数。
func (m *DBManager) GetTodayScheduleWithId() ([]datastructures.ScheduleItemWithId, error) {
	rows, err := m.db.Query(`SELECT id, schedule_datetime, schedule_task FROM schedules WHERE DATE(schedule_datetime) = DATE('now', 'localtime')`)
	if err != nil {
		log.Println("query error in GetTodayScheduleWithId:", err.Error())
		return nil, err
	}
	defer rows.Close()

	var schedules []datastructures.ScheduleItemWithId
	for rows.Next() {
		var s datastructures.ScheduleItemWithId
		err := rows.Scan(&s.Id, &s.Dt, &s.Task)
		if err != nil {
			return nil, err
		}
		schedules = append(schedules, s)
	}

	if err = rows.Err(); err != nil {
		log.Println("rows error in GetTodayScheduleWithId:", err.Error())
		return nil, err
	}

	return schedules, nil
}

// DBから明日の計画を取得する関数。
func (m *DBManager) GetTomorrowScheduleWithId() ([]datastructures.ScheduleItemWithId, error) {
	rows, err := m.db.Query(`SELECT id, schedule_datetime, schedule_task FROM schedules WHERE DATE(schedule_datetime) = DATE('now', 'localtime', '+1 day')`)
	if err != nil {
		log.Println("query error in GetTomorrowScheduleWithId:", err.Error())
		return nil, err
	}
	defer rows.Close()

	var schedules []datastructures.ScheduleItemWithId
	for rows.Next() {
		var s datastructures.ScheduleItemWithId
		err := rows.Scan(&s.Id, &s.Dt, &s.Task)
		if err != nil {
			return nil, err
		}
		schedules = append(schedules, s)
	}

	if err = rows.Err(); err != nil {
		log.Println("rows error in GetTomorrowScheduleWithId:", err.Error())
		return nil, err
	}

	return schedules, nil
}

// DBに計画要素を追加する関数。
func (m *DBManager) AddScheduleItem(s *datastructures.ScheduleItem) error {
	_, err := m.db.Exec(`INSERT INTO schedules (schedule_datetime, schedule_task) VALUES (?, ?)`, s.Dt, s.Task)

	if err != nil {
		log.Println("exec error in AddScheduleItem:", err.Error())
		return err
	}

	return nil
}

// DBに複数の計画要素を追加する関数。
func (m *DBManager) AddScheduleItems(schedules [](*datastructures.ScheduleItem)) error {
	tx, err := m.db.Begin()
	if err != nil {
		log.Println("begin transaction error in AddScheduleItems:", err.Error())
		return err
	}

	for _, s := range schedules {
		_, err := tx.Exec(`INSERT INTO schedules (schedule_datetime, schedule_task) VALUES (?, ?)`, s.Dt, s.Task)
		if err != nil {
			log.Println("exec error in AddScheduleItems:", err.Error())
			tx.Rollback()
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		log.Println("commit error in AddScheduleItems:", err.Error())
		return err
	}

	return nil
}

// DBの計画要素を更新する関数。
func (m *DBManager) UpdateScheduleItem(s *datastructures.ScheduleItemWithId) error {
	_, err := m.db.Exec(`UPDATE schedules SET schedule_datetime = ?, schedule_task = ? WHERE id = ?`, s.Dt, s.Task, s.Id)

	if err != nil {
		log.Println("exec error in UpdateScheduleItem:", err.Error())
		return err
	}

	return nil
}

// DBの計画要素を削除する関数。
func (m *DBManager) DeleteScheduleItem(id int) error {
	_, err := m.db.Exec(`DELETE FROM schedules WHERE id = ?`, id)

	if err != nil {
		log.Println("exec error in DeleteScheduleItem:", err.Error())
		return err
	}

	return nil
}

// 定期的な計画要素を追加する関数。
func (m *DBManager) AddRecurringScheduleItem(s *datastructures.RecurringScheduleItem) error {
	_, err := m.db.Exec(`INSERT INTO recurring_schedules (day_of_week, schedule_time, start_date, end_date, schedule_task) VALUES (?, ?, ?, ?, ?)`, s.DayOfWeek, s.StartTime, s.StartDate, s.EndDate, s.Task)

	if err != nil {
		log.Println("exec error in AddRecurringScheduleItem:", err.Error())
		return err
	}

	return nil
}

// 定期的な計画要素を更新する関数。
func (m *DBManager) UpdateRecurringScheduleItem(s *datastructures.RecurringScheduleItemWithId) error {
	_, err := m.db.Exec(`UPDATE recurring_schedules SET day_of_week = ?, schedule_time = ?, start_date = ?, end_date = ?, schedule_task = ? WHERE id = ?`, s.DayOfWeek, s.StartTime, s.StartDate, s.EndDate, s.Task, s.Id)

	if err != nil {
		log.Println("exec error in UpdateRecurringScheduleItem:", err.Error())
		return err
	}

	return nil
}

// 定期的な計画要素を削除する関数。
func (m *DBManager) DeleteRecurringScheduleItem(id int) error {
	_, err := m.db.Exec(`DELETE FROM recurring_schedules WHERE id = ?`, id)

	if err != nil {
		log.Println("exec error in DeleteRecurringScheduleItem:", err.Error())
		return err
	}

	return nil
}

// ユーザーIDに基づいてパスワードハッシュを取得する関数。
func (m *DBManager) GetPasswordHashByUserId(userId string) (string, error) {
	var passwordHash string
	err := m.db.QueryRow(`SELECT password_hash FROM users WHERE user_id_text = ?`, userId).Scan(&passwordHash)
	if err != nil {
		log.Println("query row error in GetPasswordHashByUserId(user_id_text =", userId, "):", err.Error())
		return "", err
	}

	return passwordHash, nil
}

// ユーザーIDに基づいてパスワードハッシュを更新する関数。
func (m *DBManager) UpdatePasswordHashByUserId(userId string, newPasswordHash string) error {
	_, err := m.db.Exec(`UPDATE users SET password_hash = ? WHERE user_id_text = ?`, newPasswordHash, userId)

	if err != nil {
		log.Println("exec error in UpdatePasswordHashByUserId(user_id_text =", userId, "):", err.Error())
		return err
	}

	return nil
}

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

func NewDBManager() *DBManager {
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
						('dad', 'd1077b6cbe44cfc005546014971d99b2942f7a587516ff002e48a0624dd8c8cd352891ff878508a15b61b7be4bfa54ab9d18e55f72baf89b6681930bbd9dabc6'),
						('mom', 'd1077b6cbe44cfc005546014971d99b2942f7a587516ff002e48a0624dd8c8cd352891ff878508a15b61b7be4bfa54ab9d18e55f72baf89b6681930bbd9dabc6');
					`)
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

// DBから今日の日付の計画すべてを取得する関数。
func (m *DBManager) GetTodaySchedule() ([]datastructures.ScheduleItem, error) {
	rows, err := m.db.Query(`SELECT * FROM schedules WHERE DATE(schedule_datetime) = DATE('now', 'localtime')`)
	if err != nil {
		log.Println("query error in GetTodaySchedule:", err.Error())
		return nil, err
	}
	defer rows.Close()

	var schedules []datastructures.ScheduleItem
	for rows.Next() {
		var s datastructures.ScheduleItem
		err := rows.Scan(&s.Id, &s.Dt, &s.Task)
		if err != nil {
			return nil, err
		}
		schedules = append(schedules, s)
	}

	if err = rows.Err(); err != nil {
		log.Println("rows error in GetTodaySchedule:", err.Error())
		return nil, err
	}

	return schedules, nil
}

// DBから明日の計画を取得する関数。
func (m *DBManager) GetTomorrowSchedule() ([]datastructures.ScheduleItem, error) {
	rows, err := m.db.Query(`SELECT * FROM schedules WHERE DATE(schedule_datetime) = DATE('now', 'localtime', '+1 day')`)
	if err != nil {
		log.Println("query error in GetTomorrowSchedule:", err.Error())
		return nil, err
	}
	defer rows.Close()

	var schedules []datastructures.ScheduleItem
	for rows.Next() {
		var s datastructures.ScheduleItem
		err := rows.Scan(&s.Id, &s.Dt, &s.Task)
		if err != nil {
			return nil, err
		}
		schedules = append(schedules, s)
	}

	if err = rows.Err(); err != nil {
		log.Println("rows error in GetTomorrowSchedule:", err.Error())
		return nil, err
	}

	return schedules, nil
}

// DBに計画要素を追加する関数。
func (m *DBManager) AddSchedule(s *datastructures.ScheduleItem) error {
	_, err := m.db.Exec(`INSERT INTO schedules (schedule_datetime, schedule_task) VALUES (?, ?)`, s.Dt, s.Task)

	if err != nil {
		log.Println("exec error in AddSchedule:", err.Error())
		return err
	}

	return nil
}

// DBの計画要素を更新する関数。
func (m *DBManager) UpdateSchedule(s *datastructures.ScheduleItem) error {
	_, err := m.db.Exec(`UPDATE schedules SET schedule_datetime = ?, schedule_task = ? WHERE id = ?`, s.Dt, s.Task, s.Id)

	if err != nil {
		log.Println("exec error in UpdateSchedule:", err.Error())
		return err
	}

	return nil
}

// DBの計画要素を削除する関数。
func (m *DBManager) DeleteSchedule(id int) error {
	_, err := m.db.Exec(`DELETE FROM schedules WHERE id = ?`, id)

	if err != nil {
		log.Println("exec error in DeleteSchedule:", err.Error())
		return err
	}

	return nil
}

// 定期的な計画要素を追加する関数。
func (m *DBManager) AddRecurringSchedule(s *datastructures.RecurringScheduleItem) error {
	_, err := m.db.Exec(`INSERT INTO recurring_schedules (day_of_week, schedule_time, start_date, end_date, schedule_task) VALUES (?, ?, ?, ?, ?)`, s.DayOfWeek, s.StartTime, s.StartDate, s.EndDate, s.Task)

	if err != nil {
		log.Println("exec error in AddRecurringSchedule:", err.Error())
		return err
	}

	return nil
}

// 定期的な計画要素を更新する関数。
func (m *DBManager) UpdateRecurringSchedule(s *datastructures.RecurringScheduleItem) error {
	_, err := m.db.Exec(`UPDATE recurring_schedules SET day_of_week = ?, schedule_time = ?, start_date = ?, end_date = ?, schedule_task = ? WHERE id = ?`, s.DayOfWeek, s.StartTime, s.StartDate, s.EndDate, s.Task, s.Id)

	if err != nil {
		log.Println("exec error in UpdateRecurringSchedule:", err.Error())
		return err
	}

	return nil
}

// 定期的な計画要素を削除する関数。
func (m *DBManager) DeleteRecurringSchedule(id int) error {
	_, err := m.db.Exec(`DELETE FROM recurring_schedules WHERE id = ?`, id)

	if err != nil {
		log.Println("exec error in DeleteRecurringSchedule:", err.Error())
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

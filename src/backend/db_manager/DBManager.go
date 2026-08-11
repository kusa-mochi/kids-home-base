package dbmanager

import (
	"database/sql"
	"fmt"
	datastructures "kids_home_base/data_structures"
	"log"
	"os"
	"time"
)

// DBManager は、DB接続、クエリ実行、トランザクション管理などの機能を提供する構造体です。
// この構造体外部には、クエリの具体的な内容や、DBの種類に依存する処理は隠蔽されます。

type DBManager struct {
	db  *sql.DB
	loc *time.Location // ローカルタイムゾーン（Asia/Tokyo）を保持する
}

// 与えられた時間をUTCに変換する。
func (m *DBManager) normalizeUTC(t time.Time) time.Time {
	return t.UTC()
}

// SQLiteのローカル日付修飾子を取得する。
// これは、SQLiteのDATE関数でローカル日付を取得するために使用されます。
// 例えば、Asia/Tokyoの場合、UTCから+9時間のオフセットがあるため、
// "YYYY-MM-DD"形式の日付を取得するには、"+540 minutes"という修飾子を使用します。
func (m *DBManager) sqliteLocalDateModifier(now time.Time) string {
	_, offsetSec := now.In(m.loc).Zone()
	offsetMin := offsetSec / 60
	if offsetMin >= 0 {
		return fmt.Sprintf("+%d minutes", offsetMin)
	}
	return fmt.Sprintf("%d minutes", offsetMin)
}

// 与えられた時間に指定された日数を加算し、ローカル日付を"YYYY-MM-DD"形式の文字列として返す。
func (m *DBManager) localDateString(now time.Time, daysToAdd int) string {
	return now.In(m.loc).AddDate(0, 0, daysToAdd).Format("2006-01-02")
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

	// SQLiteのタイムゾーンを日本時間に設定する。
	loc, err := time.LoadLocation("Asia/Tokyo")
	if err != nil {
		log.Fatal("time zone setting error in NewDBManager: " + err.Error())
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

	// ログの初期データ（UTCで記録）
	_, err = db.Exec(`INSERT INTO logs (user_id, log_level, log_message, created_at) SELECT 1, 'INF', 'ログテスト', ? WHERE NOT EXISTS (SELECT 1 FROM logs);`, time.Now().UTC())
	if err != nil {
		log.Fatal("exec error in NewDBManager:", err.Error())
	}

	// 計画の初期データ（UTCで記録）
	seedScheduleUTC := time.Date(2026, 8, 2, 16, 0, 0, 0, loc).UTC()
	_, err = db.Exec(`INSERT INTO schedules (schedule_datetime, schedule_task) SELECT ?, 'テストタスク' WHERE NOT EXISTS (SELECT 1 FROM schedules);`, seedScheduleUTC)
	if err != nil {
		log.Fatal("exec error in NewDBManager:", err.Error())
	}

	// 定期的な計画の初期データ（UTCで記録）
	seedRecurringStartTimeUTC := time.Date(2026, 8, 2, 16, 0, 0, 0, loc).UTC()
	seedRecurringStartDateUTC := time.Date(2026, 8, 2, 0, 0, 0, 0, loc).UTC()
	seedRecurringEndDateUTC := time.Date(2026, 11, 2, 0, 0, 0, 0, loc).UTC()
	_, err = db.Exec(`INSERT INTO recurring_schedules (day_of_week, schedule_time, start_date, end_date, schedule_task) SELECT 'Monday', ?, ?, ?, '定期タスク' WHERE NOT EXISTS (SELECT 1 FROM recurring_schedules);`, seedRecurringStartTimeUTC, seedRecurringStartDateUTC, seedRecurringEndDateUTC)
	if err != nil {
		log.Fatal("exec error in NewDBManager:", err.Error())
	}

	return &DBManager{db: db, loc: loc}
}

// ログをデータベースに追加する関数。
func (m *DBManager) AddLog(userId int, logLevel string, messageToAdd string) error {
	_, err := m.db.Exec(`INSERT INTO logs (user_id, log_level, log_message, created_at) VALUES (?, ?, ?, ?)`, userId, logLevel, messageToAdd, time.Now().UTC())

	if err != nil {
		log.Println("exec error in AddLog:", err.Error())
		return err
	}

	return nil
}

// DBから直近1ヶ月間のログを取得する関数。
// UTC保存データをローカル日付境界（Asia/Tokyo）で絞り込む。
func (m *DBManager) GetLogs() ([]datastructures.Log, error) {
	modifier := m.sqliteLocalDateModifier(time.Now())
	rows, err := m.db.Query(`SELECT created_at, log_level, log_message FROM logs WHERE DATE(created_at, ?) >= DATE(?, '-1 month') ORDER BY created_at DESC`, modifier, m.localDateString(time.Now(), 0))
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
	now := time.Now()
	modifier := m.sqliteLocalDateModifier(now)
	todayLocal := m.localDateString(now, 0)
	rows, err := m.db.Query(`SELECT id, schedule_datetime, schedule_task FROM schedules WHERE DATE(schedule_datetime, ?) = ?`, modifier, todayLocal)
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
		s.Dt = m.normalizeUTC(s.Dt)
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
	now := time.Now()
	modifier := m.sqliteLocalDateModifier(now)
	tomorrowLocal := m.localDateString(now, 1)
	rows, err := m.db.Query(`SELECT id, schedule_datetime, schedule_task FROM schedules WHERE DATE(schedule_datetime, ?) = ?`, modifier, tomorrowLocal)
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
		s.Dt = m.normalizeUTC(s.Dt)
		schedules = append(schedules, s)
	}

	if err = rows.Err(); err != nil {
		log.Println("rows error in GetTomorrowScheduleWithId:", err.Error())
		return nil, err
	}

	return schedules, nil
}

// DBに計画要素を追加する関数。
// 日時はUTCで記録する。
func (m *DBManager) AddScheduleItem(s *datastructures.ScheduleItem) error {
	_, err := m.db.Exec(`INSERT INTO schedules (schedule_datetime, schedule_task) VALUES (?, ?)`, m.normalizeUTC(s.Dt), s.Task)

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
		_, err := tx.Exec(`INSERT INTO schedules (schedule_datetime, schedule_task) VALUES (?, ?)`, m.normalizeUTC(s.Dt), s.Task)
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
	_, err := m.db.Exec(`UPDATE schedules SET schedule_datetime = ?, schedule_task = ? WHERE id = ?`, m.normalizeUTC(s.Dt), s.Task, s.Id)

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
	_, err := m.db.Exec(`INSERT INTO recurring_schedules (day_of_week, schedule_time, start_date, end_date, schedule_task) VALUES (?, ?, ?, ?, ?)`, s.DayOfWeek, m.normalizeUTC(s.StartTime), m.normalizeUTC(s.StartDate), m.normalizeUTC(s.EndDate), s.Task)

	if err != nil {
		log.Println("exec error in AddRecurringScheduleItem:", err.Error())
		return err
	}

	return nil
}

// 定期的な計画要素を更新する関数。
func (m *DBManager) UpdateRecurringScheduleItem(s *datastructures.RecurringScheduleItemWithId) error {
	_, err := m.db.Exec(`UPDATE recurring_schedules SET day_of_week = ?, schedule_time = ?, start_date = ?, end_date = ?, schedule_task = ? WHERE id = ?`, s.DayOfWeek, m.normalizeUTC(s.StartTime), m.normalizeUTC(s.StartDate), m.normalizeUTC(s.EndDate), s.Task, s.Id)

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

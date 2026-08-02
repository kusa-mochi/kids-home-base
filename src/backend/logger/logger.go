package logger

import (
	"fmt"
	dbmanager "kids_home_base/db_manager"
	"log"
)

type Logger struct {
	dbManager *dbmanager.DBManager
}

var lg *Logger = nil

func InitLogger(dbManager *dbmanager.DBManager) {
	lg = &Logger{
		dbManager: dbManager,
	}
}

func (l *Logger) println(level string, args ...interface{}) error {
	log.Println(append([]interface{}{level}, args...)...)
	// ログをデータベースに保存する。
	l.dbManager.AddLog(1, level, fmt.Sprint(args...)) // ユーザーIDは仮に1としている。必要に応じて変更すること。
	return nil
}

func DbgPrintln(args ...interface{}) {
	if lg == nil {
		log.Println(append([]interface{}{"DBG"}, args...)...)
		return
	}
	lg.println("DBG", args...)
}

func InfPrintln(args ...interface{}) {
	if lg == nil {
		log.Println(append([]interface{}{"INF"}, args...)...)
		return
	}
	lg.println("INF", args...)
}

func ErrPrintln(args ...interface{}) {
	if lg == nil {
		log.Println(append([]interface{}{"ERR"}, args...)...)
		return
	}
	lg.println("ERR", args...)
}

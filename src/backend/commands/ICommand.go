package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
)

type ICommand interface {
	Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) // データベース接続と設定ファイルの値を渡す
}

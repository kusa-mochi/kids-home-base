package commands

import dbmanager "kids_home_base/db_manager"

type ICommand interface {
	Execute(dbManager *dbmanager.DBManager)
}

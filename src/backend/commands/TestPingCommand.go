package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
)

type TestPingCommand struct {
	Response chan error
}

func NewTestPingCommand() *TestPingCommand {
	return &TestPingCommand{
		Response: make(chan error),
	}
}

func (c *TestPingCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	logger.InfPrintln("ping API is called.")
	c.Response <- nil
}

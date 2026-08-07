package commands

import (
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
)

type TestEchoCommand struct {
	data     map[string]interface{}
	Response chan error
}

func NewTestEchoCommand(data map[string]interface{}) *TestEchoCommand {
	return &TestEchoCommand{
		data:     data,
		Response: make(chan error),
	}
}

func (c *TestEchoCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	logger.InfPrintln("echo API is called with data:", c.data)
	c.Response <- nil
}

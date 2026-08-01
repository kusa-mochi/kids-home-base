package commands

import (
	dbmanager "kids_home_base/db_manager"
	"log"
)

type TestPingCommand struct {
	Response chan error
}

func NewTestPingCommand() *TestPingCommand {
	return &TestPingCommand{
		Response: make(chan error),
	}
}

func (c *TestPingCommand) Execute(dbManager *dbmanager.DBManager) {
	log.Println("ping API is called.")
	c.Response <- nil
}

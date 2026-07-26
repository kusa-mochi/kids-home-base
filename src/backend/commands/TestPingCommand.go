package commands

import "log"

type TestPingCommand struct {
	Response chan error
}

func NewTestPingCommand() *TestPingCommand {
	return &TestPingCommand{
		Response: make(chan error),
	}
}

func (c *TestPingCommand) Execute() {
	log.Println("ping API is called.")
	c.Response <- nil
}

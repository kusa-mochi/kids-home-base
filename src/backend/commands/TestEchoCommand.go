package commands

import "log"

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

func (c *TestEchoCommand) Execute() {
	log.Println("echo API is called with data:", c.data)
	c.Response <- nil
}

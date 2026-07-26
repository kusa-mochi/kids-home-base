package commands

import "log"

type TestEchoCommand struct {
	data map[string]interface{}
}

func NewTestEchoCommand(data map[string]interface{}) *TestEchoCommand {
	return &TestEchoCommand{
		data: data,
	}
}

func (c *TestEchoCommand) Execute() error {
	log.Println("echo API is called with data:", c.data)
	return nil
}

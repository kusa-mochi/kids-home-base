package commands

import "log"

type TestPingCommand struct {
}

func (c *TestPingCommand) Execute() error {
	log.Println("ping API is called.")
	return nil
}

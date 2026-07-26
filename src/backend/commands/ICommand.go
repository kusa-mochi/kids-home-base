package commands

type ICommand interface {
	Execute() error
}

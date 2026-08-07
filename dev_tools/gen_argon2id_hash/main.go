package main

import (
	"fmt"
	"os"

	"golang.org/x/crypto/argon2"
)

func main() {
	// 引数からパスワードとソルトを受け取る。
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run main.go <password> <salt>")
		return
	}

	password := os.Args[1]
	salt := os.Args[2]
	passwordHash := fmt.Sprintf("%x", argon2.IDKey([]byte(password), []byte(salt), 1, 64*1024, 4, 32))
	fmt.Println(passwordHash)
}

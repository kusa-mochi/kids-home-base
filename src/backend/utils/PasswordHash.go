package utils

import (
	"fmt"

	"golang.org/x/crypto/argon2"
)

func GenHash(password string, salt string) string {
	// 引数チェック
	if password == "" || salt == "" {
		return ""
	}

	// パスワードをArgon2idを用いてハッシュ化する。
	passwordHash := fmt.Sprintf("%x", argon2.IDKey([]byte(password), []byte(salt), 1, 64*1024, 4, 32))
	return passwordHash
}

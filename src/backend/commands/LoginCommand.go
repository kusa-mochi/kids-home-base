package commands

import (
	"crypto/sha256"
	"fmt"
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
)

type LoginResponse struct {
	Success     bool
	Message     string
	AccessToken string
}

type LoginCommand struct {
	Username string
	Password string
	Response chan LoginResponse
}

func NewLoginCommand(username, password string) *LoginCommand {
	return &LoginCommand{
		Username: username,
		Password: password,
		Response: make(chan LoginResponse),
	}
}

// ユーザー名とパスワードの検証を行い、認証が成功した場合はJWTトークンを生成して返す。
func (c *LoginCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// ユーザーID
	userID := c.Username

	// ユーザーから渡されたパスワード。
	password := c.Password

	// ユーザーから渡されたパスワードと秘密鍵からHS256によりハッシュ値を計算する。
	passwordHash := fmt.Sprintf("%x", sha256.Sum256([]byte(password)))

	// ユーザー名に基づいてデータベースからパスワードハッシュを取得する。
	correctPasswordHash, err := dbManager.GetPasswordHashByUserId(userID)
	if err != nil {
		c.Response <- LoginResponse{
			Success:     false,
			Message:     "User not found",
			AccessToken: "",
		}
		return
	}

	// パスワードハッシュが一致しない場合
	if passwordHash != correctPasswordHash {
		c.Response <- LoginResponse{
			Success:     false,
			Message:     "Invalid password",
			AccessToken: "",
		}
		return
	}

	// 以下、認証が成功した場合の処理。

	// JWTトークンを生成する。有効期間は1時間。
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": userID,
		"exp":      jwt.NewNumericDate(time.Now().Add(1 * time.Hour)), // 1時間後に有効期限が切れる
	})

	tokenString, err := token.SignedString(conf.JWTSecretKey)
	if err != nil {
		c.Response <- LoginResponse{
			Success:     false,
			Message:     "Failed to generate access token",
			AccessToken: "",
		}
		return
	}

	c.Response <- LoginResponse{
		Success:     true,
		Message:     "Login successful",
		AccessToken: tokenString,
	}
}

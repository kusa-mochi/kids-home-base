package commands

import (
	"crypto/subtle"
	datastructures "kids_home_base/data_structures"
	dbmanager "kids_home_base/db_manager"
	"kids_home_base/logger"
	"kids_home_base/utils"
)

type ChangePasswordCommand struct {
	UserID          string                      // ユーザーID
	CurrentPassword string                      // 現在のパスワード
	NewPassword     string                      // 新しいパスワード
	Response        chan ChangePasswordResponse // レスポンスを返すためのチャネル
}

type ChangePasswordResponse struct {
	Success bool   // 成功したかどうか
	Message string // メッセージ
}

func NewChangePasswordCommand(userID string, currentPassword string, newPassword string) *ChangePasswordCommand {
	return &ChangePasswordCommand{
		UserID:          userID,
		CurrentPassword: currentPassword,
		NewPassword:     newPassword,
		Response:        make(chan ChangePasswordResponse),
	}
}

func (c *ChangePasswordCommand) Execute(dbManager *dbmanager.DBManager, conf *datastructures.Config) {
	// クライアントから渡されたユーザーIDと現在のパスワードを検証する。
	passwordHash := utils.GenHash(c.CurrentPassword, conf.Salt)
	correctPasswordHash, err := dbManager.GetPasswordHashByUserId(c.UserID)
	// ユーザーIDが存在しない場合
	if err != nil {
		logger.ErrPrintln("ChangePasswordCommand.Execute user", c.UserID, "not found:", err)
		c.Response <- ChangePasswordResponse{
			Success: false,
			Message: "ユーザーIDまたはパスワードが正しくありません",
		}
		return
	}

	// パスワードハッシュを定数時間で比較する。
	if subtle.ConstantTimeCompare([]byte(passwordHash), []byte(correctPasswordHash)) != 1 {
		logger.ErrPrintln("ChangePasswordCommand.Execute invalid current password")
		c.Response <- ChangePasswordResponse{
			Success: false,
			Message: "ユーザーIDまたはパスワードが正しくありません",
		}
		return
	}

	// ユーザーIDに対応するユーザーのパスワードを変更する。
	err = dbManager.UpdatePasswordHashByUserId(c.UserID, utils.GenHash(c.NewPassword, conf.Salt))

	// 取得に失敗した場合
	if err != nil {
		logger.ErrPrintln("ChangePasswordCommand.Execute failed:", err.Error())
		c.Response <- ChangePasswordResponse{
			Success: false,
			Message: "パスワードの変更に失敗しました: " + err.Error(),
		}
		return
	}

	logger.InfPrintln("ChangePasswordCommand.Execute")
	c.Response <- ChangePasswordResponse{
		Success: true,
		Message: "パスワードを変更しました",
	}
}

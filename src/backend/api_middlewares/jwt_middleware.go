package api_middlewares

import (
	"strings"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

// JWTMiddleware は、JWTトークンの検証を行うミドルウェアです。

// JWTの署名検証や有効期限の確認を行う。
// tokenString: クライアントから送信されたJWTトークン。
// secretKey: JWTトークンの署名検証に使用する秘密鍵。
func validateJWT(tokenString string, secretKey string) (bool, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// 署名アルゴリズムの検証
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(secretKey), nil
	})
	if err != nil {
		return false, err
	}
	return token.Valid, nil
}

func JWTMiddleware(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Authorizationヘッダーからトークンを取得する。
		authHeader := c.GetHeader("Authorization")

		// Authorizationヘッダーが存在しない場合
		if authHeader == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization header is missing"})
			return
		}

		// "Bearer " プレフィックスを削除してトークン部分だけを取得する。
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// トークンが空の場合
		if tokenString == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization token is missing"})
			return
		}

		// secretKey を用いて JWT(tokenString) を検証する。
		validateResult, err := validateJWT(tokenString, secretKey)

		// トークンが無効または期限切れの場合
		if err != nil || !validateResult {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid or expired token"})
			return
		}

		// トークンが有効な場合は、次のハンドラーに処理を渡す。
		c.Next()
	}
}

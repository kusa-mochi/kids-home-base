package api_middlewares

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// JWTMiddleware は、JWTトークンの検証を行うミドルウェアです。

func JWTMiddleware(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// JWTトークンの検証処理。
		// ここでは、JWTトークンが有効であるかどうかを確認し、無効な場合はエラーレスポンスを返す処理を実装します。
		// 例えば、Authorizationヘッダーからトークンを取得し、検証する処理を追加します。
		// トークンが有効であれば、次のハンドラーに処理を渡します。
		// トークンが無効であれば、c.AbortWithStatusJSON() を使用してエラーレスポンスを返します。

		// Authorizationヘッダーからトークンを取得する。
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization header is missing"})
			return
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization token is missing"})
			return
		}
		// ここで、tokenString を検証する処理を追加します。
		// 例えば、JWTトークンの署名を検証し、有効期限を確認する処理を実装します。
		// トークンが有効であれば、次のハンドラーに処理を渡します。
		// トークンが無効であれば、c.AbortWithStatusJSON() を使用してエラーレスポンスを返します。

		c.Next()
	}
}

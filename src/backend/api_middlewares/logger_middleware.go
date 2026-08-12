package api_middlewares

import (
	"kids_home_base/logger"

	"github.com/gin-gonic/gin"
)

func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		logger.InfPrintln("Request:", c.Request.Method, c.Request.URL.Path)
		c.Next()
	}
}

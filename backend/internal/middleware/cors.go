package middleware

import (
	"backend/internal/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// 检查 origin 是否在允许列表中
		allowOrigin := ""
		allowedOrigins := config.AppConfig.CORSAllowOrigins

		if len(allowedOrigins) == 0 {
			// 未配置时，开发环境允许请求来源
			allowOrigin = origin
		} else {
			for _, allowed := range allowedOrigins {
				if allowed == "*" || allowed == origin {
					allowOrigin = origin
					break
				}
			}
		}

		if allowOrigin != "" {
			// Allow-Credentials=true 时不能使用 *，必须指定具体域名
			c.Header("Access-Control-Allow-Origin", allowOrigin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Max-Age", "86400")
		}

		// OPTIONS 预检请求返回 204 No Content
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

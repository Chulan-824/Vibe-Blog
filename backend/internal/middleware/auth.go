package middleware

import (
	"backend/internal/service"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	ContextUserID = "userID"
)

func Auth() gin.HandlerFunc {
	authService := service.NewAuthService()

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code": 401,
				"msg":  "未提供认证信息",
			})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code": 401,
				"msg":  "认证格式错误",
			})
			c.Abort()
			return
		}

		claims, err := authService.ValidateAccessToken(parts[1])
		if err != nil {
			msg := "无效的Token"
			if err == service.ErrTokenExpired {
				msg = "Token已过期"
			}
			c.JSON(http.StatusUnauthorized, gin.H{
				"code": 401,
				"msg":  msg,
			})
			c.Abort()
			return
		}

		userID, err := primitive.ObjectIDFromHex(claims.UserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code": 401,
				"msg":  "无效的用户ID",
			})
			c.Abort()
			return
		}

		c.Set(ContextUserID, userID)
		c.Next()
	}
}

func GetUserID(c *gin.Context) (primitive.ObjectID, bool) {
	userID, exists := c.Get(ContextUserID)
	if !exists {
		return primitive.NilObjectID, false
	}
	return userID.(primitive.ObjectID), true
}

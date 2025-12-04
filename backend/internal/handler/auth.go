package handler

import (
	"backend/internal/service"
	"context"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ========== 常量 ==========

var (
	userRegex = regexp.MustCompile(`^[\w\p{Han}\p{Hangul}\x{0800}-\x{4e00}\-]{2,7}$`)
	pwdRegex  = regexp.MustCompile(`^[\w<>,.?|;':"{}!@#$%^&*()/\-\[\]\\]{6,18}$`)
)

// ========== 类型定义 ==========

type AuthHandler struct {
	authService    service.AuthServiceInterface
	captchaService service.CaptchaServiceInterface
	visitorService service.VisitorServiceInterface
}

type LoginRequest struct {
	UserName string `json:"user_name" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LogoutRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type RegisterRequest struct {
	UserName    string `json:"user_name" binding:"required"`
	Password    string `json:"password" binding:"required"`
	CaptchaCode string `json:"captcha_code" binding:"required"`
	CaptchaID   string `json:"captcha_id" binding:"required"`
}

type CheckCaptchaRequest struct {
	CaptchaCode string `json:"captcha_code" binding:"required"`
	CaptchaID   string `json:"captcha_id" binding:"required"`
}

// ========== 构造函数 ==========

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{
		authService:    service.NewAuthService(),
		captchaService: service.GetCaptchaService(),
		visitorService: service.NewVisitorService(),
	}
}

// NewAuthHandlerWithServices 使用指定的 Service 创建 Handler（用于测试）
func NewAuthHandlerWithServices(
	authSvc service.AuthServiceInterface,
	captchaSvc service.CaptchaServiceInterface,
	visitorSvc service.VisitorServiceInterface,
) *AuthHandler {
	return &AuthHandler{
		authService:    authSvc,
		captchaService: captchaSvc,
		visitorService: visitorSvc,
	}
}

// ========== Handler 方法 ==========

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 1, "数据无效，请检查后再登录")
		return
	}

	if !userRegex.MatchString(req.UserName) || !pwdRegex.MatchString(req.Password) {
		Error(c, 2, "用户名或密码不符合规则")
		return
	}

	user, err := h.authService.Login(c.Request.Context(), req.UserName, req.Password)
	if err != nil {
		if err == service.ErrInvalidCredentials {
			Error(c, 2, "用户名或密码错误")
			return
		}
		ServerError(c)
		return
	}

	tokenPair, err := h.authService.GenerateTokenPair(c.Request.Context(), user.ID)
	if err != nil {
		ServerError(c)
		return
	}

	// 添加到最近访客（使用独立 context，避免请求结束后 context 被取消）
	go func(userID primitive.ObjectID) {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = h.visitorService.RecordVisit(ctx, userID)
	}(user.ID)

	c.JSON(200, gin.H{
		"code":          0,
		"msg":           "登录成功",
		"access_token":  tokenPair.AccessToken,
		"refresh_token": tokenPair.RefreshToken,
		"expires_in":    tokenPair.ExpiresIn,
		"user_info":     user.ToResponse(),
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	var req LogoutRequest
	if err := c.ShouldBindJSON(&req); err == nil && req.RefreshToken != "" {
		_ = h.authService.RevokeRefreshToken(c.Request.Context(), req.RefreshToken)
	}

	c.JSON(200, gin.H{
		"code": 0,
		"msg":  "退出登陆成功",
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 1, "请提供refresh_token")
		return
	}

	tokenPair, err := h.authService.RefreshTokenPair(c.Request.Context(), req.RefreshToken)
	if err != nil {
		Error(c, 2, "Token刷新失败")
		return
	}

	c.JSON(200, gin.H{
		"code":          0,
		"msg":           "刷新成功",
		"access_token":  tokenPair.AccessToken,
		"refresh_token": tokenPair.RefreshToken,
		"expires_in":    tokenPair.ExpiresIn,
	})
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 1, "数据无效，请检查后再注册")
		return
	}

	if !h.captchaService.Verify(req.CaptchaID, req.CaptchaCode) {
		Error(c, 2, "验证码错误")
		return
	}

	if !userRegex.MatchString(req.UserName) || !pwdRegex.MatchString(req.Password) {
		Error(c, 2, "用户名或密码不符合规则")
		return
	}

	_, err := h.authService.Register(c.Request.Context(), req.UserName, req.Password)
	if err != nil {
		if err == service.ErrUserExists {
			Error(c, 3, "用户名已存在")
			return
		}
		ServerError(c)
		return
	}

	SuccessWithMsg(c, "注册成功")
}

func (h *AuthHandler) GetCaptcha(c *gin.Context) {
	result, err := h.captchaService.Generate()
	if err != nil {
		ServerError(c)
		return
	}

	c.JSON(200, gin.H{
		"code":       0,
		"data":       result.Data,
		"captcha_id": result.ID,
		"time":       60000,
	})
}

func (h *AuthHandler) CheckCaptcha(c *gin.Context) {
	var req CheckCaptchaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 1, "验证失败")
		return
	}

	answer := h.captchaService.Get(req.CaptchaID)
	if answer == "" || answer != req.CaptchaCode {
		Error(c, 1, "验证失败")
		return
	}

	SuccessWithMsg(c, "验证成功")
}

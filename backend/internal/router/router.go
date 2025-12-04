package router

import (
	"backend/internal/handler"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func Setup(r *gin.Engine) {
	// 中间件
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.CORS())

	// 静态文件
	r.Static("/img", "./public/img")

	// 初始化handlers
	authHandler := handler.NewAuthHandler()
	articleHandler := handler.NewArticleHandler()
	messageHandler := handler.NewMessageHandler()
	visitorHandler := handler.NewVisitorHandler()
	uploadHandler := handler.NewUploadHandler()

	// 公开路由 - 登录相关
	login := r.Group("/login")
	{
		login.POST("", authHandler.Login)
		login.POST("/logout", authHandler.Logout)
		login.POST("/refresh", authHandler.RefreshToken)
	}

	// 公开路由 - 注册相关
	register := r.Group("/register")
	{
		register.POST("", authHandler.Register)
		register.POST("/captcha", authHandler.GetCaptcha)
		register.POST("/check_captcha", authHandler.CheckCaptcha)
	}

	// 公开路由 - 文章相关
	article := r.Group("/article")
	{
		article.POST("", articleHandler.GetArticle)
		article.POST("/extend", articleHandler.Extend)
		article.POST("/getInfo", articleHandler.GetInfo)
		article.POST("/getHot", articleHandler.GetHot)
		article.POST("/getShow", articleHandler.GetShow)
		article.POST("/search", articleHandler.Search)
	}

	// 公开路由 - 留言列表
	r.POST("/message/getList", messageHandler.GetList)

	// 公开路由 - 访客列表
	r.POST("/visitor", visitorHandler.GetList)

	// 需要认证的路由
	auth := r.Group("")
	auth.Use(middleware.Auth())
	{
		// 留言提交
		auth.POST("/message/commit", messageHandler.Commit)
		auth.POST("/message/reply_commit", messageHandler.ReplyCommit)

		// 头像上传
		auth.POST("/upload/avatar", uploadHandler.Avatar)
	}
}

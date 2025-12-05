package router

import (
	"backend/internal/handler"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func Setup(r *gin.Engine) {
	// CORS 中间件（gin.Default() 已包含 Logger 和 Recovery，无需重复注册）
	r.Use(middleware.CORS())

	// 静态文件
	r.Static("/img", "./public/img")

	// 初始化 handlers
	authHandler := handler.NewAuthHandler()
	articleHandler := handler.NewArticleHandler()
	messageHandler := handler.NewMessageHandler()
	visitorHandler := handler.NewVisitorHandler()
	uploadHandler := handler.NewUploadHandler()

	// API v1 路由组
	v1 := r.Group("/api/v1")
	{
		// 认证相关 - RESTful 风格
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", authHandler.Logout)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/register", authHandler.Register)
			auth.POST("/captcha", authHandler.GetCaptcha)
			auth.POST("/captcha/verify", authHandler.CheckCaptcha)
		}

		// 文章相关 - RESTful 风格
		articles := v1.Group("/articles")
		{
			articles.GET("/:id", articleHandler.GetArticle)        // GET /api/v1/articles/:id
			articles.GET("", articleHandler.GetShow)               // GET /api/v1/articles
			articles.GET("/hot", articleHandler.GetHot)            // GET /api/v1/articles/hot
			articles.GET("/search", articleHandler.Search)         // GET /api/v1/articles/search?q=xxx
			articles.GET("/info", articleHandler.GetInfo)          // GET /api/v1/articles/info
			articles.GET("/extend", articleHandler.Extend)         // GET /api/v1/articles/extend
		}

		// 留言相关 - RESTful 风格
		messages := v1.Group("/messages")
		{
			messages.GET("", messageHandler.GetList) // GET /api/v1/messages
		}

		// 访客相关 - RESTful 风格
		visitors := v1.Group("/visitors")
		{
			visitors.GET("", visitorHandler.GetList) // GET /api/v1/visitors
		}

		// 需要认证的路由
		protected := v1.Group("")
		protected.Use(middleware.Auth())
		{
			// 留言提交
			protected.POST("/messages", messageHandler.Commit)                    // POST /api/v1/messages
			protected.POST("/messages/:id/replies", messageHandler.ReplyCommit)   // POST /api/v1/messages/:id/replies

			// 头像上传
			protected.POST("/upload/avatar", uploadHandler.Avatar) // POST /api/v1/upload/avatar
		}
	}

	// 兼容旧版 API 路由（可选，建议逐步迁移后移除）
	setupLegacyRoutes(r, authHandler, articleHandler, messageHandler, visitorHandler, uploadHandler)
}

// setupLegacyRoutes 设置旧版兼容路由，便于前端逐步迁移
func setupLegacyRoutes(r *gin.Engine, authHandler *handler.AuthHandler, articleHandler *handler.ArticleHandler,
	messageHandler *handler.MessageHandler, visitorHandler *handler.VisitorHandler, uploadHandler *handler.UploadHandler) {

	// 公开路由 - 登录相关（旧版）
	login := r.Group("/login")
	{
		login.POST("", authHandler.Login)
		login.POST("/logout", authHandler.Logout)
		login.POST("/refresh", authHandler.RefreshToken)
	}

	// 公开路由 - 注册相关（旧版）
	register := r.Group("/register")
	{
		register.POST("", authHandler.Register)
		register.POST("/captcha", authHandler.GetCaptcha)
		register.POST("/check_captcha", authHandler.CheckCaptcha)
	}

	// 公开路由 - 文章相关（旧版）
	article := r.Group("/article")
	{
		article.POST("", articleHandler.GetArticleLegacy)
		article.POST("/extend", articleHandler.ExtendLegacy)
		article.POST("/getInfo", articleHandler.GetInfoLegacy)
		article.POST("/getHot", articleHandler.GetHotLegacy)
		article.POST("/getShow", articleHandler.GetShowLegacy)
		article.POST("/search", articleHandler.SearchLegacy)
	}

	// 公开路由 - 留言列表（旧版）
	r.POST("/message/getList", messageHandler.GetListLegacy)

	// 公开路由 - 访客列表（旧版）
	r.POST("/visitor", visitorHandler.GetListLegacy)

	// 需要认证的路由（旧版）
	auth := r.Group("")
	auth.Use(middleware.Auth())
	{
		auth.POST("/message/commit", messageHandler.CommitLegacy)
		auth.POST("/message/reply_commit", messageHandler.ReplyCommitLegacy)
		auth.POST("/upload/avatar", uploadHandler.Avatar)
	}
}

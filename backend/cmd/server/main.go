package main

import (
	"backend/internal/config"
	"backend/internal/logger"
	"backend/internal/router"
	"backend/pkg/database"
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	if err := config.Load(); err != nil {
		panic("加载配置失败: " + err.Error())
	}

	// 初始化日志
	logger.Init(config.AppConfig.GinMode)
	defer logger.Sync()

	// 连接数据库
	if err := database.Connect(config.AppConfig.MongoURI, config.AppConfig.MongoDatabase); err != nil {
		logger.Fatal("数据库连接失败", logger.Err(err))
	}

	// 设置Gin模式
	gin.SetMode(config.AppConfig.GinMode)

	// 创建Gin引擎
	r := gin.Default()

	// 设置路由
	router.Setup(r)

	// 创建自定义 HTTP 服务器
	addr := ":" + config.AppConfig.ServerPort
	srv := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// 在 goroutine 中启动服务器
	go func() {
		logger.Info("服务器启动", logger.String("addr", "http://localhost"+addr))
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Fatal("服务器启动失败", logger.Err(err))
		}
	}()

	// 等待中断信号优雅关闭服务器
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Info("正在关闭服务器...")

	// 设置 10 秒超时的 context
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 优雅关闭服务器
	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("服务器强制关闭", logger.Err(err))
	}

	// 断开数据库连接
	database.Disconnect()
	logger.Info("服务器已退出")
}

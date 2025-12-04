package main

import (
	"backend/internal/config"
	"backend/internal/router"
	"backend/pkg/database"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	if err := config.Load(); err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 连接数据库
	if err := database.Connect(config.AppConfig.MongoURI, config.AppConfig.MongoDatabase); err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}
	defer database.Disconnect()

	// 设置Gin模式
	gin.SetMode(config.AppConfig.GinMode)

	// 创建Gin引擎
	r := gin.Default()

	// 设置路由
	router.Setup(r)

	// 启动服务器
	addr := ":" + config.AppConfig.ServerPort
	log.Printf("服务器启动于 http://localhost%s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}

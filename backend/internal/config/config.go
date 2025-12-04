package config

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI           string
	MongoDatabase      string
	JWTSecret          string
	AccessTokenExpire  time.Duration
	RefreshTokenExpire time.Duration
	ServerPort         string
	GinMode            string
	UploadPath         string
	BaseURL            string
	// CORS 配置
	CORSAllowOrigins []string
	// 上传限制
	MaxUploadSize int64
	// 默认头像路径
	DefaultAvatarPath string
}

// GetDefaultAvatarURL 获取完整的默认头像 URL
func (c *Config) GetDefaultAvatarURL() string {
	return c.BaseURL + c.DefaultAvatarPath
}

var AppConfig *Config

func Load() error {
	_ = godotenv.Load()

	accessExpire, err := time.ParseDuration(getEnv("ACCESS_TOKEN_EXPIRE", "1h"))
	if err != nil {
		accessExpire = time.Hour
	}
	refreshExpire, err := time.ParseDuration(getEnv("REFRESH_TOKEN_EXPIRE", "168h"))
	if err != nil {
		refreshExpire = 168 * time.Hour
	}

	// 解析 CORS 允许的域名列表
	corsOrigins := getEnv("CORS_ALLOW_ORIGINS", "")
	var allowOrigins []string
	if corsOrigins != "" {
		allowOrigins = strings.Split(corsOrigins, ",")
		for i := range allowOrigins {
			allowOrigins[i] = strings.TrimSpace(allowOrigins[i])
		}
	}

	// 解析上传大小限制（默认 5MB）
	maxUploadSize := int64(5 << 20)
	if sizeStr := getEnv("MAX_UPLOAD_SIZE", ""); sizeStr != "" {
		if size, err := strconv.ParseInt(sizeStr, 10, 64); err == nil {
			maxUploadSize = size
		}
	}

	AppConfig = &Config{
		MongoURI:           getEnv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDatabase:      getEnv("MONGO_DATABASE", "blog"),
		JWTSecret:          getEnv("JWT_SECRET", "default-secret-key"),
		AccessTokenExpire:  accessExpire,
		RefreshTokenExpire: refreshExpire,
		ServerPort:         getEnv("SERVER_PORT", "3000"),
		GinMode:            getEnv("GIN_MODE", "debug"),
		UploadPath:         getEnv("UPLOAD_PATH", "./public/img/upload"),
		BaseURL:            getEnv("BASE_URL", "http://localhost:3000"),
		CORSAllowOrigins:   allowOrigins,
		MaxUploadSize:      maxUploadSize,
		DefaultAvatarPath:  getEnv("DEFAULT_AVATAR_PATH", "/img/default_avatar.jpeg"),
	}
	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

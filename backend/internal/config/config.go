package config

import (
	"os"
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
}

var AppConfig *Config

func Load() error {
	_ = godotenv.Load()

	accessExpire, _ := time.ParseDuration(getEnv("ACCESS_TOKEN_EXPIRE", "1h"))
	refreshExpire, _ := time.ParseDuration(getEnv("REFRESH_TOKEN_EXPIRE", "168h"))

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
	}
	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

package logger

import (
	"os"
	"sync"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var (
	Log  *zap.Logger
	once sync.Once
)

// Init 初始化日志
func Init(mode string) {
	once.Do(func() {
		var config zap.Config

		if mode == "release" {
			config = zap.NewProductionConfig()
			config.EncoderConfig.TimeKey = "time"
			config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		} else {
			config = zap.NewDevelopmentConfig()
			config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		}

		config.OutputPaths = []string{"stdout"}
		config.ErrorOutputPaths = []string{"stderr"}

		var err error
		Log, err = config.Build(zap.AddCallerSkip(1))
		if err != nil {
			panic("初始化日志失败: " + err.Error())
		}
	})
}

// Sync 刷新日志缓冲区
func Sync() {
	if Log != nil {
		_ = Log.Sync()
	}
}

// Debug 记录 debug 级别日志
func Debug(msg string, fields ...zap.Field) {
	Log.Debug(msg, fields...)
}

// Info 记录 info 级别日志
func Info(msg string, fields ...zap.Field) {
	Log.Info(msg, fields...)
}

// Warn 记录 warn 级别日志
func Warn(msg string, fields ...zap.Field) {
	Log.Warn(msg, fields...)
}

// Error 记录 error 级别日志
func Error(msg string, fields ...zap.Field) {
	Log.Error(msg, fields...)
}

// Fatal 记录 fatal 级别日志并退出
func Fatal(msg string, fields ...zap.Field) {
	Log.Fatal(msg, fields...)
	os.Exit(1)
}

// With 返回带有附加字段的 Logger
func With(fields ...zap.Field) *zap.Logger {
	return Log.With(fields...)
}

// 便捷字段创建函数
var (
	String  = zap.String
	Int     = zap.Int
	Int64   = zap.Int64
	Float64 = zap.Float64
	Bool    = zap.Bool
	Err     = zap.Error
	Any     = zap.Any
)

package errors

import (
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/mongo"
)

// 业务错误码
const (
	CodeSuccess       = 0
	CodeInvalidParams = 1
	CodeNotFound      = 2
	CodeUnauthorized  = 3
	CodeServerError   = 4
	CodeConflict      = 5
)

// 通用业务错误
var (
	ErrNotFound         = errors.New("资源不存在")
	ErrInvalidParams    = errors.New("参数无效")
	ErrUnauthorized     = errors.New("未授权")
	ErrConflict         = errors.New("资源冲突")
	ErrInternalServer   = errors.New("服务器内部错误")
	ErrDatabaseError    = errors.New("数据库错误")
	ErrOperationTimeout = errors.New("操作超时")
)

// AppError 应用错误，包含错误码和消息
type AppError struct {
	Code    int
	Message string
	Err     error
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%d] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%d] %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error {
	return e.Err
}

// NewAppError 创建应用错误
func NewAppError(code int, message string, err error) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Err:     err,
	}
}

// NotFoundError 创建资源不存在错误
func NotFoundError(resource string) *AppError {
	return &AppError{
		Code:    CodeNotFound,
		Message: fmt.Sprintf("%s不存在", resource),
		Err:     ErrNotFound,
	}
}

// InvalidParamsError 创建参数无效错误
func InvalidParamsError(msg string) *AppError {
	return &AppError{
		Code:    CodeInvalidParams,
		Message: msg,
		Err:     ErrInvalidParams,
	}
}

// UnauthorizedError 创建未授权错误
func UnauthorizedError(msg string) *AppError {
	return &AppError{
		Code:    CodeUnauthorized,
		Message: msg,
		Err:     ErrUnauthorized,
	}
}

// ConflictError 创建资源冲突错误
func ConflictError(msg string) *AppError {
	return &AppError{
		Code:    CodeConflict,
		Message: msg,
		Err:     ErrConflict,
	}
}

// ServerError 创建服务器错误
func ServerError(err error) *AppError {
	return &AppError{
		Code:    CodeServerError,
		Message: "服务器错误",
		Err:     err,
	}
}

// IsNotFound 检查是否为"不存在"错误
func IsNotFound(err error) bool {
	if err == nil {
		return false
	}
	// 检查 MongoDB 的 ErrNoDocuments
	if errors.Is(err, mongo.ErrNoDocuments) {
		return true
	}
	// 检查自定义的 ErrNotFound
	if errors.Is(err, ErrNotFound) {
		return true
	}
	// 检查 AppError
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Code == CodeNotFound
	}
	return false
}

// WrapMongoError 包装 MongoDB 错误为应用错误
func WrapMongoError(err error, resource string) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, mongo.ErrNoDocuments) {
		return NotFoundError(resource)
	}
	return ServerError(err)
}

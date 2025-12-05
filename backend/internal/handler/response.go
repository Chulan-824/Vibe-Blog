package handler

import (
	apperrors "backend/internal/errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response 统一响应结构
type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg,omitempty"`
	Data interface{} `json:"data,omitempty"`
}

// ========== 成功响应（HTTP 200） ==========

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code: apperrors.CodeSuccess,
		Msg:  "请求成功",
		Data: data,
	})
}

func SuccessWithMsg(c *gin.Context, msg string) {
	c.JSON(http.StatusOK, Response{
		Code: apperrors.CodeSuccess,
		Msg:  msg,
	})
}

func SuccessWithData(c *gin.Context, msg string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code: apperrors.CodeSuccess,
		Msg:  msg,
		Data: data,
	})
}

func Created(c *gin.Context, msg string, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Code: apperrors.CodeSuccess,
		Msg:  msg,
		Data: data,
	})
}

// SuccessList 列表类响应 - data 中包含 list 字段
func SuccessList(c *gin.Context, list interface{}) {
	// 确保 list 为 nil 时返回空数组
	if list == nil {
		list = []interface{}{}
	}
	c.JSON(http.StatusOK, Response{
		Code: apperrors.CodeSuccess,
		Msg:  "请求成功",
		Data: gin.H{"list": list},
	})
}

// SuccessListWithMsg 列表类响应带自定义消息
func SuccessListWithMsg(c *gin.Context, msg string, list interface{}) {
	if list == nil {
		list = []interface{}{}
	}
	c.JSON(http.StatusOK, Response{
		Code: apperrors.CodeSuccess,
		Msg:  msg,
		Data: gin.H{"list": list},
	})
}

// SuccessEmpty 空对象响应 - data 返回空对象 {}
func SuccessEmpty(c *gin.Context, msg string) {
	c.JSON(http.StatusOK, Response{
		Code: apperrors.CodeSuccess,
		Msg:  msg,
		Data: gin.H{},
	})
}

// ========== 错误响应（使用正确的 HTTP 状态码） ==========

// BadRequest 400 - 请求参数错误
func BadRequest(c *gin.Context, msg string) {
	c.JSON(http.StatusBadRequest, Response{
		Code: apperrors.CodeInvalidParams,
		Msg:  msg,
	})
}

// Unauthorized 401 - 未认证
func Unauthorized(c *gin.Context, msg string) {
	c.JSON(http.StatusUnauthorized, Response{
		Code: apperrors.CodeUnauthorized,
		Msg:  msg,
	})
}

// NotFound 404 - 资源不存在
func NotFound(c *gin.Context, msg string) {
	c.JSON(http.StatusNotFound, Response{
		Code: apperrors.CodeNotFound,
		Msg:  msg,
	})
}

// Conflict 409 - 资源冲突
func Conflict(c *gin.Context, msg string) {
	c.JSON(http.StatusConflict, Response{
		Code: apperrors.CodeConflict,
		Msg:  msg,
	})
}

// ServerError 500 - 服务器内部错误
func ServerError(c *gin.Context) {
	c.JSON(http.StatusInternalServerError, Response{
		Code: apperrors.CodeServerError,
		Msg:  "服务器错误，请稍后再试",
	})
}

// ========== 旧版兼容（Legacy API 使用，返回 HTTP 200） ==========

// Error 旧版错误响应 - 保持向后兼容，始终返回 HTTP 200
func Error(c *gin.Context, code int, msg string) {
	c.JSON(http.StatusOK, Response{
		Code: code,
		Msg:  msg,
	})
}

// ErrorWithData 旧版错误响应带空数据 - 保持向后兼容
func ErrorWithData(c *gin.Context, code int, msg string) {
	c.JSON(http.StatusOK, gin.H{
		"code": code,
		"msg":  msg,
		"data": []interface{}{},
	})
}

// SuccessLegacy 旧版成功响应 - 只返回 code 和 data
func SuccessLegacy(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"code": apperrors.CodeSuccess,
		"data": data,
	})
}

// ErrorWithStatus 带 HTTP 状态码的错误响应
func ErrorWithStatus(c *gin.Context, httpStatus int, code int, msg string) {
	c.JSON(httpStatus, Response{
		Code: code,
		Msg:  msg,
	})
}

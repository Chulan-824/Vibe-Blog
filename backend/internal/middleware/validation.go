package middleware

import (
	apperrors "backend/internal/errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// ValidationErrorResponse 验证错误响应
type ValidationErrorResponse struct {
	Code   int               `json:"code"`
	Msg    string            `json:"msg"`
	Errors map[string]string `json:"errors,omitempty"`
}

// HandleValidationError 处理 binding 验证错误，返回详细的字段错误信息
func HandleValidationError(c *gin.Context, err error) {
	if validationErrs, ok := err.(validator.ValidationErrors); ok {
		fieldErrors := make(map[string]string)
		for _, fieldErr := range validationErrs {
			fieldErrors[fieldErr.Field()] = getValidationErrorMsg(fieldErr)
		}
		c.JSON(http.StatusBadRequest, ValidationErrorResponse{
			Code:   apperrors.CodeInvalidParams,
			Msg:    "请求参数验证失败",
			Errors: fieldErrors,
		})
		return
	}

	c.JSON(http.StatusBadRequest, ValidationErrorResponse{
		Code: apperrors.CodeInvalidParams,
		Msg:  "请求数据格式错误",
	})
}

// getValidationErrorMsg 获取验证错误的中文提示
func getValidationErrorMsg(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "此字段为必填项"
	case "min":
		return "长度不能少于" + fe.Param() + "个字符"
	case "max":
		return "长度不能超过" + fe.Param() + "个字符"
	case "email":
		return "邮箱格式不正确"
	case "url":
		return "URL格式不正确"
	case "oneof":
		return "值必须是以下之一: " + fe.Param()
	case "gte":
		return "值必须大于或等于" + fe.Param()
	case "lte":
		return "值必须小于或等于" + fe.Param()
	case "gt":
		return "值必须大于" + fe.Param()
	case "lt":
		return "值必须小于" + fe.Param()
	default:
		return "验证失败: " + fe.Tag()
	}
}

// BindAndValidate 通用的绑定和验证辅助函数
// 返回 true 表示验证成功，false 表示验证失败（已发送错误响应）
func BindAndValidate(c *gin.Context, obj interface{}) bool {
	if err := c.ShouldBindJSON(obj); err != nil {
		HandleValidationError(c, err)
		return false
	}
	return true
}

// BindQueryAndValidate 绑定和验证 Query 参数
func BindQueryAndValidate(c *gin.Context, obj interface{}) bool {
	if err := c.ShouldBindQuery(obj); err != nil {
		HandleValidationError(c, err)
		return false
	}
	return true
}

// BindURIAndValidate 绑定和验证 URI 参数
func BindURIAndValidate(c *gin.Context, obj interface{}) bool {
	if err := c.ShouldBindUri(obj); err != nil {
		HandleValidationError(c, err)
		return false
	}
	return true
}

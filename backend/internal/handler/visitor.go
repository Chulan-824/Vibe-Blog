package handler

import (
	apperrors "backend/internal/errors"
	"backend/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type VisitorHandler struct {
	service service.VisitorServiceInterface
}

func NewVisitorHandler() *VisitorHandler {
	return &VisitorHandler{
		service: service.NewVisitorService(),
	}
}

// NewVisitorHandlerWithService 使用指定的 Service 创建 Handler（用于测试）
func NewVisitorHandlerWithService(svc service.VisitorServiceInterface) *VisitorHandler {
	return &VisitorHandler{
		service: svc,
	}
}

// ========== RESTful API (新版) ==========

// GetList GET /api/v1/visitors
func (h *VisitorHandler) GetList(c *gin.Context) {
	visitors, err := h.service.GetListWithUser(c.Request.Context(), 12)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": apperrors.CodeServerError, "msg": "服务器异常", "data": []interface{}{}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": apperrors.CodeSuccess, "msg": "请求成功", "data": visitors})
}

// ========== Legacy API (旧版兼容) ==========

// GetListLegacy POST /visitor (旧版)
func (h *VisitorHandler) GetListLegacy(c *gin.Context) {
	visitors, err := h.service.GetListWithUser(c.Request.Context(), 12)
	if err != nil {
		c.JSON(200, gin.H{"code": 4, "msg": "服务器异常", "data": []interface{}{}})
		return
	}
	SuccessWithData(c, "请求成功", visitors)
}

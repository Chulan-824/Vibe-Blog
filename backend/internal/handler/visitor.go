package handler

import (
	"backend/internal/service"

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
		ServerError(c)
		return
	}
	SuccessList(c, visitors)
}

// ========== Legacy API (旧版兼容) ==========

// GetListLegacy POST /visitor (旧版)
func (h *VisitorHandler) GetListLegacy(c *gin.Context) {
	visitors, err := h.service.GetListWithUser(c.Request.Context(), 12)
	if err != nil {
		ErrorWithData(c, 4, "服务器异常")
		return
	}
	SuccessWithData(c, "请求成功", visitors)
}

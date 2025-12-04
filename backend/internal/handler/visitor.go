package handler

import (
	"backend/internal/dao"

	"github.com/gin-gonic/gin"
)

type VisitorHandler struct {
	dao *dao.VisitorDAO
}

func NewVisitorHandler() *VisitorHandler {
	return &VisitorHandler{
		dao: dao.NewVisitorDAO(),
	}
}

func (h *VisitorHandler) GetList(c *gin.Context) {
	visitors, err := h.dao.FindListWithUser(c.Request.Context(), 12)
	if err != nil {
		c.JSON(200, gin.H{
			"code": 4,
			"msg":  "服务器异常",
			"data": []interface{}{},
		})
		return
	}

	SuccessWithData(c, "请求成功", visitors)
}

package handler

import (
	apperrors "backend/internal/errors"
	"backend/internal/middleware"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ========== 类型定义 ==========

type MessageHandler struct {
	service service.MessageServiceInterface
}

// 请求结构体
type (
	CommitMessageRequest struct {
		Content string `json:"content" binding:"required"`
	}

	ReplyRequest struct {
		Content     string `json:"content" binding:"required"`
		ReplyToUser string `json:"reply_to_user" binding:"required"`
	}

	// Legacy API
	ReplyCommitRequestLegacy struct {
		ParentID    string `json:"parent_id" binding:"required"`
		Content     string `json:"content" binding:"required"`
		ReplyToUser string `json:"reply_to_user" binding:"required"`
	}

	GetListRequestLegacy struct {
		Skip  int64 `json:"skip"`
		Limit int64 `json:"limit"`
	}
)

// ========== 构造函数 ==========

func NewMessageHandler() *MessageHandler {
	return &MessageHandler{
		service: service.NewMessageService(),
	}
}

// NewMessageHandlerWithService 使用指定的 Service 创建 Handler（用于测试）
func NewMessageHandlerWithService(svc service.MessageServiceInterface) *MessageHandler {
	return &MessageHandler{
		service: svc,
	}
}

// ========== RESTful API (新版) ==========

// Commit POST /api/v1/messages
func (h *MessageHandler) Commit(c *gin.Context) {
	var req CommitMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": apperrors.CodeInvalidParams, "msg": "数据格式错误"})
		return
	}

	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": apperrors.CodeUnauthorized, "msg": "请先登录"})
		return
	}

	if err := h.service.Create(c.Request.Context(), userID, req.Content); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": apperrors.CodeServerError, "msg": "服务器错误"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"code": apperrors.CodeSuccess, "msg": "留言成功!"})
}

// ReplyCommit POST /api/v1/messages/:id/replies
func (h *MessageHandler) ReplyCommit(c *gin.Context) {
	var req ReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": apperrors.CodeInvalidParams, "msg": "数据格式错误"})
		return
	}

	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": apperrors.CodeUnauthorized, "msg": "请先登录"})
		return
	}

	parentID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": apperrors.CodeInvalidParams, "msg": "无效的留言ID"})
		return
	}

	parent, err := h.service.GetByID(c.Request.Context(), parentID)
	if err != nil || parent == nil {
		c.JSON(http.StatusNotFound, gin.H{"code": apperrors.CodeNotFound, "msg": "该条留言已删除…"})
		return
	}

	if err := h.service.AddReply(c.Request.Context(), parentID, userID, req.Content, req.ReplyToUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": apperrors.CodeServerError, "msg": "服务器错误"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"code": apperrors.CodeSuccess, "msg": "评论成功！"})
}

// GetList GET /api/v1/messages?skip=0&limit=10
func (h *MessageHandler) GetList(c *gin.Context) {
	skip := int64(0)
	limit := int64(10)

	if s, err := strconv.ParseInt(c.Query("skip"), 10, 64); err == nil {
		skip = s
	}
	if l, err := strconv.ParseInt(c.Query("limit"), 10, 64); err == nil && l > 0 {
		limit = l
	}

	messages, err := h.service.GetListWithUser(c.Request.Context(), skip, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": apperrors.CodeServerError, "msg": "服务器错误", "data": []interface{}{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": apperrors.CodeSuccess, "msg": "请求成功", "data": messages})
}

// ========== Legacy API (旧版兼容) ==========

// CommitLegacy POST /message/commit (旧版)
func (h *MessageHandler) CommitLegacy(c *gin.Context) {
	var req CommitMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 1, "数据格式错误")
		return
	}

	userID, ok := middleware.GetUserID(c)
	if !ok {
		Error(c, 1, "请先登录")
		return
	}

	if err := h.service.Create(c.Request.Context(), userID, req.Content); err != nil {
		ServerError(c)
		return
	}

	SuccessWithMsg(c, "留言成功!")
}

// ReplyCommitLegacy POST /message/reply_commit (旧版)
func (h *MessageHandler) ReplyCommitLegacy(c *gin.Context) {
	var req ReplyCommitRequestLegacy
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 1, "数据格式错误")
		return
	}

	userID, ok := middleware.GetUserID(c)
	if !ok {
		Error(c, 1, "请先登录")
		return
	}

	parentID, err := primitive.ObjectIDFromHex(req.ParentID)
	if err != nil {
		Error(c, 1, "无效的留言ID")
		return
	}

	parent, err := h.service.GetByID(c.Request.Context(), parentID)
	if err != nil || parent == nil {
		Error(c, 2, "该条留言已删除…")
		return
	}

	if err := h.service.AddReply(c.Request.Context(), parentID, userID, req.Content, req.ReplyToUser); err != nil {
		ServerError(c)
		return
	}

	SuccessWithMsg(c, "评论成功！")
}

// GetListLegacy POST /message/getList (旧版)
func (h *MessageHandler) GetListLegacy(c *gin.Context) {
	var req GetListRequestLegacy
	_ = c.ShouldBindJSON(&req)

	if req.Limit <= 0 {
		req.Limit = 10
	}

	messages, err := h.service.GetListWithUser(c.Request.Context(), req.Skip, req.Limit)
	if err != nil {
		c.JSON(200, gin.H{"code": 4, "msg": "服务器错误", "data": []interface{}{}})
		return
	}

	SuccessWithData(c, "请求成功", messages)
}

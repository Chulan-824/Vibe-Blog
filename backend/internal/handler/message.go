package handler

import (
	"backend/internal/dao"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MessageHandler struct {
	dao *dao.MessageDAO
}

func NewMessageHandler() *MessageHandler {
	return &MessageHandler{
		dao: dao.NewMessageDAO(),
	}
}

type CommitMessageRequest struct {
	Content string `json:"content" binding:"required"`
}

func (h *MessageHandler) Commit(c *gin.Context) {
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

	if err := h.dao.Create(c.Request.Context(), userID, req.Content); err != nil {
		ServerError(c)
		return
	}

	SuccessWithMsg(c, "留言成功!")
}

type ReplyCommitRequest struct {
	ParentID    string `json:"parent_id" binding:"required"`
	Content     string `json:"content" binding:"required"`
	ReplyToUser string `json:"reply_to_user" binding:"required"`
}

func (h *MessageHandler) ReplyCommit(c *gin.Context) {
	var req ReplyCommitRequest
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

	// 检查父留言是否存在
	parent, err := h.dao.FindByID(c.Request.Context(), parentID)
	if err != nil || parent == nil {
		Error(c, 2, "该条留言已删除…")
		return
	}

	if err := h.dao.AddReplyMessage(c.Request.Context(), parentID, userID, req.Content, req.ReplyToUser); err != nil {
		ServerError(c)
		return
	}

	SuccessWithMsg(c, "评论成功！")
}

type GetListRequest struct {
	Skip  int64 `json:"skip"`
	Limit int64 `json:"limit"`
}

func (h *MessageHandler) GetList(c *gin.Context) {
	var req GetListRequest
	_ = c.ShouldBindJSON(&req)

	if req.Limit <= 0 {
		req.Limit = 10
	}

	messages, err := h.dao.FindListWithUser(c.Request.Context(), req.Skip, req.Limit)
	if err != nil {
		c.JSON(200, gin.H{
			"code": 4,
			"msg":  "服务器错误",
			"data": []interface{}{},
		})
		return
	}

	SuccessWithData(c, "请求成功", messages)
}

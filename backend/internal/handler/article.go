package handler

import (
	"backend/internal/dao"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ArticleHandler struct {
	dao *dao.ArticleDAO
}

func NewArticleHandler() *ArticleHandler {
	return &ArticleHandler{
		dao: dao.NewArticleDAO(),
	}
}

type GetArticleRequest struct {
	ID string `json:"_id" binding:"required"`
}

func (h *ArticleHandler) GetArticle(c *gin.Context) {
	var req GetArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 2, "请传入要查询的文章id")
		return
	}

	id, err := primitive.ObjectIDFromHex(req.ID)
	if err != nil {
		Error(c, 2, "无效的文章id")
		return
	}

	article, err := h.dao.FindByID(c.Request.Context(), id)
	if err != nil {
		Error(c, 1, "没有对应的文章")
		return
	}

	// 增加浏览量
	go h.dao.IncrementPageViews(c.Request.Context(), id)

	SuccessWithData(c, "查询成功", article)
}

type ExtendRequest struct {
	Tag string `json:"tag"`
}

func (h *ArticleHandler) Extend(c *gin.Context) {
	var req ExtendRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		req.Tag = ""
	}

	articles, err := h.dao.FindExtend(c.Request.Context(), req.Tag, 2)
	if err != nil {
		c.JSON(200, gin.H{
			"code": 4,
			"msg":  "服务器异常~",
			"data": []interface{}{},
		})
		return
	}

	SuccessWithData(c, "查询成功", articles)
}

func (h *ArticleHandler) GetInfo(c *gin.Context) {
	info, err := h.dao.GetInfo(c.Request.Context())
	if err != nil {
		c.JSON(200, gin.H{
			"code": 4,
			"msg":  "服务器错误",
			"data": nil,
		})
		return
	}

	SuccessWithData(c, "请求成功", info)
}

type GetHotRequest struct {
	Limit int64 `json:"limit"`
}

func (h *ArticleHandler) GetHot(c *gin.Context) {
	var req GetHotRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Limit <= 0 {
		req.Limit = 8
	}

	articles, err := h.dao.FindHot(c.Request.Context(), req.Limit)
	if err != nil {
		c.JSON(200, gin.H{
			"code": 4,
			"msg":  "服务器错误",
			"data": nil,
		})
		return
	}

	c.JSON(200, gin.H{
		"code": 0,
		"data": articles,
	})
}

type GetShowRequest struct {
	Skip  int64  `json:"skip"`
	Limit int64  `json:"limit"`
	Tag   string `json:"tag"`
}

func (h *ArticleHandler) GetShow(c *gin.Context) {
	var req GetShowRequest
	_ = c.ShouldBindJSON(&req)

	if req.Limit <= 0 {
		req.Limit = 10
	}

	articles, err := h.dao.FindList(c.Request.Context(), req.Tag, req.Skip, req.Limit)
	if err != nil {
		c.JSON(200, gin.H{
			"code": 4,
			"msg":  "服务器错误",
		})
		return
	}

	c.JSON(200, gin.H{
		"code": 0,
		"data": articles,
	})
}

type SearchRequest struct {
	Keywords string `json:"keywords" binding:"required"`
}

func (h *ArticleHandler) Search(c *gin.Context) {
	var req SearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(200, gin.H{
			"code": 1,
			"msg":  "请传入关键词参数",
			"data": []interface{}{},
		})
		return
	}

	articles, err := h.dao.Search(c.Request.Context(), req.Keywords, 5)
	if err != nil {
		c.JSON(200, gin.H{
			"code": 4,
			"msg":  "服务器异常~",
			"data": []interface{}{},
		})
		return
	}

	SuccessWithData(c, "查询成功", articles)
}

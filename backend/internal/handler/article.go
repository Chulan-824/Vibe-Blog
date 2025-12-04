package handler

import (
	apperrors "backend/internal/errors"
	"backend/internal/service"
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ========== 类型定义 ==========

type ArticleHandler struct {
	service service.ArticleServiceInterface
}

// Legacy API 请求结构体
type (
	GetArticleRequest struct {
		ID string `json:"_id" binding:"required"`
	}

	ExtendRequest struct {
		Tag string `json:"tag"`
	}

	GetHotRequest struct {
		Limit int64 `json:"limit"`
	}

	GetShowRequest struct {
		Skip  int64  `json:"skip"`
		Limit int64  `json:"limit"`
		Tag   string `json:"tag"`
	}

	SearchRequest struct {
		Keywords string `json:"keywords" binding:"required"`
	}
)

// ========== 构造函数 ==========

func NewArticleHandler() *ArticleHandler {
	return &ArticleHandler{
		service: service.NewArticleService(),
	}
}

// NewArticleHandlerWithService 使用指定的 Service 创建 Handler（用于测试）
func NewArticleHandlerWithService(svc service.ArticleServiceInterface) *ArticleHandler {
	return &ArticleHandler{
		service: svc,
	}
}

// ========== RESTful API (新版) ==========

// GetArticle GET /api/v1/articles/:id
func (h *ArticleHandler) GetArticle(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": apperrors.CodeInvalidParams, "msg": "请传入要查询的文章id"})
		return
	}

	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": apperrors.CodeInvalidParams, "msg": "无效的文章id"})
		return
	}

	article, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		if apperrors.IsNotFound(err) {
			c.JSON(http.StatusNotFound, gin.H{"code": apperrors.CodeNotFound, "msg": "没有对应的文章"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": apperrors.CodeServerError, "msg": "服务器错误"})
		return
	}

	// 增加浏览量（使用独立 context）
	go func(articleID primitive.ObjectID) {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		h.service.IncrementPageViews(ctx, articleID)
	}(id)

	c.JSON(http.StatusOK, gin.H{"code": apperrors.CodeSuccess, "msg": "查询成功", "data": article})
}

// Extend GET /api/v1/articles/extend?tag=xxx
func (h *ArticleHandler) Extend(c *gin.Context) {
	tag := c.Query("tag")
	articles, err := h.service.GetExtend(c.Request.Context(), tag, 2)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": apperrors.CodeServerError, "msg": "服务器异常", "data": []interface{}{}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": apperrors.CodeSuccess, "msg": "查询成功", "data": articles})
}

// GetInfo GET /api/v1/articles/info
func (h *ArticleHandler) GetInfo(c *gin.Context) {
	info, err := h.service.GetInfo(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": apperrors.CodeServerError, "msg": "服务器错误", "data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": apperrors.CodeSuccess, "msg": "请求成功", "data": info})
}

// GetHot GET /api/v1/articles/hot?limit=8
func (h *ArticleHandler) GetHot(c *gin.Context) {
	limit := int64(8)
	if l, err := strconv.ParseInt(c.Query("limit"), 10, 64); err == nil && l > 0 {
		limit = l
	}

	articles, err := h.service.GetHot(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": apperrors.CodeServerError, "msg": "服务器错误", "data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": apperrors.CodeSuccess, "data": articles})
}

// GetShow GET /api/v1/articles?skip=0&limit=10&tag=xxx
func (h *ArticleHandler) GetShow(c *gin.Context) {
	skip := int64(0)
	limit := int64(10)
	tag := c.Query("tag")

	if s, err := strconv.ParseInt(c.Query("skip"), 10, 64); err == nil {
		skip = s
	}
	if l, err := strconv.ParseInt(c.Query("limit"), 10, 64); err == nil && l > 0 {
		limit = l
	}

	articles, err := h.service.GetList(c.Request.Context(), tag, skip, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": apperrors.CodeServerError, "msg": "服务器错误"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": apperrors.CodeSuccess, "data": articles})
}

// Search GET /api/v1/articles/search?q=xxx
func (h *ArticleHandler) Search(c *gin.Context) {
	keywords := c.Query("q")
	if keywords == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": apperrors.CodeInvalidParams, "msg": "请传入关键词参数", "data": []interface{}{}})
		return
	}

	articles, err := h.service.Search(c.Request.Context(), keywords, 5)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": apperrors.CodeServerError, "msg": "服务器异常", "data": []interface{}{}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": apperrors.CodeSuccess, "msg": "查询成功", "data": articles})
}

// ========== Legacy API (旧版兼容) ==========

// GetArticleLegacy POST /article (旧版)
func (h *ArticleHandler) GetArticleLegacy(c *gin.Context) {
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

	article, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		Error(c, 1, "没有对应的文章")
		return
	}

	go func(articleID primitive.ObjectID) {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		h.service.IncrementPageViews(ctx, articleID)
	}(id)

	SuccessWithData(c, "查询成功", article)
}

// ExtendLegacy POST /article/extend (旧版)
func (h *ArticleHandler) ExtendLegacy(c *gin.Context) {
	var req ExtendRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		req.Tag = ""
	}

	articles, err := h.service.GetExtend(c.Request.Context(), req.Tag, 2)
	if err != nil {
		c.JSON(200, gin.H{"code": 4, "msg": "服务器异常~", "data": []interface{}{}})
		return
	}
	SuccessWithData(c, "查询成功", articles)
}

// GetInfoLegacy POST /article/getInfo (旧版)
func (h *ArticleHandler) GetInfoLegacy(c *gin.Context) {
	info, err := h.service.GetInfo(c.Request.Context())
	if err != nil {
		c.JSON(200, gin.H{"code": 4, "msg": "服务器错误", "data": nil})
		return
	}
	SuccessWithData(c, "请求成功", info)
}

// GetHotLegacy POST /article/getHot (旧版)
func (h *ArticleHandler) GetHotLegacy(c *gin.Context) {
	var req GetHotRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Limit <= 0 {
		req.Limit = 8
	}

	articles, err := h.service.GetHot(c.Request.Context(), req.Limit)
	if err != nil {
		c.JSON(200, gin.H{"code": 4, "msg": "服务器错误", "data": nil})
		return
	}
	c.JSON(200, gin.H{"code": 0, "data": articles})
}

// GetShowLegacy POST /article/getShow (旧版)
func (h *ArticleHandler) GetShowLegacy(c *gin.Context) {
	var req GetShowRequest
	_ = c.ShouldBindJSON(&req)

	if req.Limit <= 0 {
		req.Limit = 10
	}

	articles, err := h.service.GetList(c.Request.Context(), req.Tag, req.Skip, req.Limit)
	if err != nil {
		c.JSON(200, gin.H{"code": 4, "msg": "服务器错误"})
		return
	}
	c.JSON(200, gin.H{"code": 0, "data": articles})
}

// SearchLegacy POST /article/search (旧版)
func (h *ArticleHandler) SearchLegacy(c *gin.Context) {
	var req SearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(200, gin.H{"code": 1, "msg": "请传入关键词参数", "data": []interface{}{}})
		return
	}

	articles, err := h.service.Search(c.Request.Context(), req.Keywords, 5)
	if err != nil {
		c.JSON(200, gin.H{"code": 4, "msg": "服务器异常~", "data": []interface{}{}})
		return
	}
	SuccessWithData(c, "查询成功", articles)
}

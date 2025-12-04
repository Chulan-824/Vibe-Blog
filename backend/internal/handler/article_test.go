package handler

import (
	"backend/internal/model"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// MockArticleService 是 ArticleServiceInterface 的 mock 实现
type MockArticleService struct {
	// 用于控制返回值的字段
	GetByIDFunc            func(ctx context.Context, id primitive.ObjectID) (*model.Article, error)
	GetHotFunc             func(ctx context.Context, limit int64) ([]model.Article, error)
	GetListFunc            func(ctx context.Context, tag string, skip, limit int64) ([]model.Article, error)
	SearchFunc             func(ctx context.Context, keywords string, limit int64) ([]model.ArticleBrief, error)
	GetExtendFunc          func(ctx context.Context, tag string, limit int64) ([]model.ArticleBrief, error)
	GetInfoFunc            func(ctx context.Context) (*model.ArticleInfo, error)
	IncrementPageViewsFunc func(ctx context.Context, id primitive.ObjectID) error
}

func (m *MockArticleService) GetByID(ctx context.Context, id primitive.ObjectID) (*model.Article, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockArticleService) GetHot(ctx context.Context, limit int64) ([]model.Article, error) {
	if m.GetHotFunc != nil {
		return m.GetHotFunc(ctx, limit)
	}
	return nil, nil
}

func (m *MockArticleService) GetList(ctx context.Context, tag string, skip, limit int64) ([]model.Article, error) {
	if m.GetListFunc != nil {
		return m.GetListFunc(ctx, tag, skip, limit)
	}
	return nil, nil
}

func (m *MockArticleService) Search(ctx context.Context, keywords string, limit int64) ([]model.ArticleBrief, error) {
	if m.SearchFunc != nil {
		return m.SearchFunc(ctx, keywords, limit)
	}
	return nil, nil
}

func (m *MockArticleService) GetExtend(ctx context.Context, tag string, limit int64) ([]model.ArticleBrief, error) {
	if m.GetExtendFunc != nil {
		return m.GetExtendFunc(ctx, tag, limit)
	}
	return nil, nil
}

func (m *MockArticleService) GetInfo(ctx context.Context) (*model.ArticleInfo, error) {
	if m.GetInfoFunc != nil {
		return m.GetInfoFunc(ctx)
	}
	return nil, nil
}

func (m *MockArticleService) IncrementPageViews(ctx context.Context, id primitive.ObjectID) error {
	if m.IncrementPageViewsFunc != nil {
		return m.IncrementPageViewsFunc(ctx, id)
	}
	return nil
}

func TestArticleHandler_GetArticle_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// 准备测试数据
	articleID := primitive.NewObjectID()
	expectedArticle := &model.Article{
		ID:    articleID,
		Title: "测试文章",
		Tag:   "Go",
	}

	// 创建 mock service
	mockService := &MockArticleService{
		GetByIDFunc: func(ctx context.Context, id primitive.ObjectID) (*model.Article, error) {
			if id == articleID {
				return expectedArticle, nil
			}
			return nil, errors.New("not found")
		},
		IncrementPageViewsFunc: func(ctx context.Context, id primitive.ObjectID) error {
			return nil
		},
	}

	// 使用 mock service 创建 handler
	handler := NewArticleHandlerWithService(mockService)

	// 创建测试请求
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = gin.Params{{Key: "id", Value: articleID.Hex()}}
	c.Request, _ = http.NewRequest(http.MethodGet, "/api/v1/articles/"+articleID.Hex(), nil)

	// 执行测试
	handler.GetArticle(c)

	// 验证结果
	if w.Code != http.StatusOK {
		t.Errorf("期望状态码 %d, 实际 %d", http.StatusOK, w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["code"].(float64) != 0 {
		t.Errorf("期望 code=0, 实际 code=%v", response["code"])
	}
}

func TestArticleHandler_GetArticle_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// 创建返回 "not found" 错误的 mock service
	mockService := &MockArticleService{
		GetByIDFunc: func(ctx context.Context, id primitive.ObjectID) (*model.Article, error) {
			return nil, errors.New("资源不存在")
		},
	}

	handler := NewArticleHandlerWithService(mockService)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	articleID := primitive.NewObjectID()
	c.Params = gin.Params{{Key: "id", Value: articleID.Hex()}}
	c.Request, _ = http.NewRequest(http.MethodGet, "/api/v1/articles/"+articleID.Hex(), nil)

	handler.GetArticle(c)

	// 验证返回 500（因为错误不是 apperrors.ErrNotFound 类型）
	if w.Code != http.StatusInternalServerError {
		t.Errorf("期望状态码 %d, 实际 %d", http.StatusInternalServerError, w.Code)
	}
}

func TestArticleHandler_GetHot_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Mock 返回热门文章
	mockService := &MockArticleService{
		GetHotFunc: func(ctx context.Context, limit int64) ([]model.Article, error) {
			return []model.Article{
				{ID: primitive.NewObjectID(), Title: "热门文章1", PageViews: 100},
				{ID: primitive.NewObjectID(), Title: "热门文章2", PageViews: 80},
			}, nil
		},
	}

	handler := NewArticleHandlerWithService(mockService)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest(http.MethodGet, "/api/v1/articles/hot?limit=2", nil)

	handler.GetHot(c)

	if w.Code != http.StatusOK {
		t.Errorf("期望状态码 %d, 实际 %d", http.StatusOK, w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data := response["data"].([]interface{})
	if len(data) != 2 {
		t.Errorf("期望返回 2 篇文章, 实际 %d", len(data))
	}
}

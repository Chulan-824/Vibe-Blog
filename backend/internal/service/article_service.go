package service

import (
	"backend/internal/dao"
	apperrors "backend/internal/errors"
	"backend/internal/model"
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ArticleService 文章服务实现
type ArticleService struct {
	articleDAO *dao.ArticleDAO
}

// NewArticleService 创建文章服务
func NewArticleService() *ArticleService {
	return &ArticleService{
		articleDAO: dao.NewArticleDAO(),
	}
}

// NewArticleServiceWithDAO 使用指定的 DAO 创建文章服务（用于测试）
func NewArticleServiceWithDAO(articleDAO *dao.ArticleDAO) *ArticleService {
	return &ArticleService{
		articleDAO: articleDAO,
	}
}

// GetByID 根据 ID 获取文章
func (s *ArticleService) GetByID(ctx context.Context, id primitive.ObjectID) (*model.Article, error) {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	article, err := s.articleDAO.FindByID(ctx, id)
	if err != nil {
		return nil, apperrors.WrapMongoError(err, "文章")
	}
	return article, nil
}

// GetHot 获取热门文章
func (s *ArticleService) GetHot(ctx context.Context, limit int64) ([]model.Article, error) {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	articles, err := s.articleDAO.FindHot(ctx, limit)
	if err != nil {
		return nil, apperrors.ServerError(err)
	}
	return articles, nil
}

// GetList 获取文章列表
func (s *ArticleService) GetList(ctx context.Context, tag string, skip, limit int64) ([]model.Article, error) {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	articles, err := s.articleDAO.FindList(ctx, tag, skip, limit)
	if err != nil {
		return nil, apperrors.ServerError(err)
	}
	return articles, nil
}

// Search 搜索文章
func (s *ArticleService) Search(ctx context.Context, keywords string, limit int64) ([]model.ArticleBrief, error) {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	articles, err := s.articleDAO.Search(ctx, keywords, limit)
	if err != nil {
		return nil, apperrors.ServerError(err)
	}
	return articles, nil
}

// GetExtend 获取扩展文章
func (s *ArticleService) GetExtend(ctx context.Context, tag string, limit int64) ([]model.ArticleBrief, error) {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	articles, err := s.articleDAO.FindExtend(ctx, tag, limit)
	if err != nil {
		return nil, apperrors.ServerError(err)
	}
	return articles, nil
}

// GetInfo 获取文章统计信息
func (s *ArticleService) GetInfo(ctx context.Context) (*model.ArticleInfo, error) {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	info, err := s.articleDAO.GetInfo(ctx)
	if err != nil {
		return nil, apperrors.WrapMongoError(err, "文章信息")
	}
	return info, nil
}

// IncrementPageViews 增加文章浏览量
func (s *ArticleService) IncrementPageViews(ctx context.Context, id primitive.ObjectID) error {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	return s.articleDAO.IncrementPageViews(ctx, id)
}

// 确保实现接口
var _ ArticleServiceInterface = (*ArticleService)(nil)

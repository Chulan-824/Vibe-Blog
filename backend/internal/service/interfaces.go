package service

import (
	"backend/internal/model"
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AuthServiceInterface 认证服务接口
type AuthServiceInterface interface {
	Login(ctx context.Context, username, password string) (*model.User, error)
	Register(ctx context.Context, username, password string) (*model.User, error)
	GenerateTokenPair(ctx context.Context, userID primitive.ObjectID) (*model.TokenPair, error)
	ValidateAccessToken(tokenString string) (*Claims, error)
	RefreshTokenPair(ctx context.Context, refreshTokenStr string) (*model.TokenPair, error)
	RevokeRefreshToken(ctx context.Context, refreshToken string) error
}

// ArticleServiceInterface 文章服务接口
type ArticleServiceInterface interface {
	GetByID(ctx context.Context, id primitive.ObjectID) (*model.Article, error)
	GetHot(ctx context.Context, limit int64) ([]model.Article, error)
	GetList(ctx context.Context, tag string, skip, limit int64) ([]model.Article, error)
	Search(ctx context.Context, keywords string, limit int64) ([]model.ArticleBrief, error)
	GetExtend(ctx context.Context, tag string, limit int64) ([]model.ArticleBrief, error)
	GetInfo(ctx context.Context) (*model.ArticleInfo, error)
	IncrementPageViews(ctx context.Context, id primitive.ObjectID) error
}

// MessageServiceInterface 留言服务接口
type MessageServiceInterface interface {
	Create(ctx context.Context, userID primitive.ObjectID, content string) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*model.Message, error)
	AddReply(ctx context.Context, parentID, userID primitive.ObjectID, content, replyToUser string) error
	GetListWithUser(ctx context.Context, skip, limit int64) ([]model.MessageWithUser, error)
}

// VisitorServiceInterface 访客服务接口
type VisitorServiceInterface interface {
	RecordVisit(ctx context.Context, userID primitive.ObjectID) error
	GetListWithUser(ctx context.Context, limit int64) ([]model.VisitorWithUser, error)
}

// UserServiceInterface 用户服务接口
type UserServiceInterface interface {
	GetByID(ctx context.Context, id primitive.ObjectID) (*model.User, error)
	UpdateAvatar(ctx context.Context, id primitive.ObjectID, avatarURL string) error
}

// CaptchaServiceInterface 验证码服务接口
type CaptchaServiceInterface interface {
	Generate() (*CaptchaResult, error)
	Verify(id, answer string) bool
	Get(id string) string
}

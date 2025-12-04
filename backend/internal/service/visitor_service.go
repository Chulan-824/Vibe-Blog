package service

import (
	"backend/internal/dao"
	apperrors "backend/internal/errors"
	"backend/internal/model"
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// VisitorService 访客服务实现
type VisitorService struct {
	visitorDAO *dao.VisitorDAO
}

// NewVisitorService 创建访客服务
func NewVisitorService() *VisitorService {
	return &VisitorService{
		visitorDAO: dao.NewVisitorDAO(),
	}
}

// NewVisitorServiceWithDAO 使用指定的 DAO 创建访客服务（用于测试）
func NewVisitorServiceWithDAO(visitorDAO *dao.VisitorDAO) *VisitorService {
	return &VisitorService{
		visitorDAO: visitorDAO,
	}
}

// RecordVisit 记录访问
func (s *VisitorService) RecordVisit(ctx context.Context, userID primitive.ObjectID) error {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	// 删除旧记录
	if err := s.visitorDAO.DeleteByUserID(ctx, userID); err != nil {
		return apperrors.ServerError(err)
	}

	// 创建新记录
	if err := s.visitorDAO.Create(ctx, userID); err != nil {
		return apperrors.ServerError(err)
	}
	return nil
}

// GetListWithUser 获取带用户信息的访客列表
func (s *VisitorService) GetListWithUser(ctx context.Context, limit int64) ([]model.VisitorWithUser, error) {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	visitors, err := s.visitorDAO.FindListWithUser(ctx, limit)
	if err != nil {
		return nil, apperrors.ServerError(err)
	}
	return visitors, nil
}

// 确保实现接口
var _ VisitorServiceInterface = (*VisitorService)(nil)

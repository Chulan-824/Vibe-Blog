package service

import (
	"backend/internal/dao"
	apperrors "backend/internal/errors"
	"backend/internal/model"
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UserService 用户服务实现
type UserService struct {
	userDAO *dao.UserDAO
}

// NewUserService 创建用户服务
func NewUserService() *UserService {
	return &UserService{
		userDAO: dao.NewUserDAO(),
	}
}

// NewUserServiceWithDAO 使用指定的 DAO 创建用户服务（用于测试）
func NewUserServiceWithDAO(userDAO *dao.UserDAO) *UserService {
	return &UserService{
		userDAO: userDAO,
	}
}

// GetByID 根据 ID 获取用户
func (s *UserService) GetByID(ctx context.Context, id primitive.ObjectID) (*model.User, error) {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	user, err := s.userDAO.FindByID(ctx, id)
	if err != nil {
		return nil, apperrors.WrapMongoError(err, "用户")
	}
	return user, nil
}

// UpdateAvatar 更新用户头像
func (s *UserService) UpdateAvatar(ctx context.Context, id primitive.ObjectID, avatarURL string) error {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	if err := s.userDAO.UpdateAvatar(ctx, id, avatarURL); err != nil {
		return apperrors.ServerError(err)
	}
	return nil
}

// 确保实现接口
var _ UserServiceInterface = (*UserService)(nil)

package service

import (
	"backend/internal/dao"
	apperrors "backend/internal/errors"
	"backend/internal/model"
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// MessageService 留言服务实现
type MessageService struct {
	messageDAO *dao.MessageDAO
}

// NewMessageService 创建留言服务
func NewMessageService() *MessageService {
	return &MessageService{
		messageDAO: dao.NewMessageDAO(),
	}
}

// NewMessageServiceWithDAO 使用指定的 DAO 创建留言服务（用于测试）
func NewMessageServiceWithDAO(messageDAO *dao.MessageDAO) *MessageService {
	return &MessageService{
		messageDAO: messageDAO,
	}
}

// Create 创建留言
func (s *MessageService) Create(ctx context.Context, userID primitive.ObjectID, content string) error {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	if err := s.messageDAO.Create(ctx, userID, content); err != nil {
		return apperrors.ServerError(err)
	}
	return nil
}

// GetByID 根据 ID 获取留言
func (s *MessageService) GetByID(ctx context.Context, id primitive.ObjectID) (*model.Message, error) {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	msg, err := s.messageDAO.FindByID(ctx, id)
	if err != nil {
		return nil, apperrors.WrapMongoError(err, "留言")
	}
	return msg, nil
}

// AddReply 添加回复
func (s *MessageService) AddReply(ctx context.Context, parentID, userID primitive.ObjectID, content, replyToUser string) error {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	if err := s.messageDAO.AddReplyMessage(ctx, parentID, userID, content, replyToUser); err != nil {
		return apperrors.ServerError(err)
	}
	return nil
}

// GetListWithUser 获取带用户信息的留言列表
func (s *MessageService) GetListWithUser(ctx context.Context, skip, limit int64) ([]model.MessageWithUser, error) {
	ctx, cancel := dao.WithDefaultTimeout(ctx)
	defer cancel()

	messages, err := s.messageDAO.FindListWithUser(ctx, skip, limit)
	if err != nil {
		return nil, apperrors.ServerError(err)
	}
	return messages, nil
}

// 确保实现接口
var _ MessageServiceInterface = (*MessageService)(nil)

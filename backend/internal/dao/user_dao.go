package dao

import (
	"backend/internal/model"
	"backend/pkg/database"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// ========== 类型定义 ==========

type UserDAO struct {
	collection *mongo.Collection
}

// ========== 构造函数 ==========

func NewUserDAO() *UserDAO {
	return &UserDAO{
		collection: database.Collection("users"),
	}
}

// ========== DAO 方法 ==========

func (ud *UserDAO) FindByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	err := ud.collection.FindOne(ctx, bson.M{"user_name": username}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (ud *UserDAO) FindByID(ctx context.Context, id primitive.ObjectID) (*model.User, error) {
	var user model.User
	err := ud.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (ud *UserDAO) Create(ctx context.Context, user *model.User) (*model.User, error) {
	user.RegisteredAt = time.Now().UnixMilli()
	result, err := ud.collection.InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}
	user.ID = result.InsertedID.(primitive.ObjectID)
	return user, nil
}

func (ud *UserDAO) UpdateAvatar(ctx context.Context, id primitive.ObjectID, avatar string) error {
	_, err := ud.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"avatar": avatar}})
	return err
}

func (ud *UserDAO) ExistsByUsername(ctx context.Context, username string) (bool, error) {
	count, err := ud.collection.CountDocuments(ctx, bson.M{"user_name": username})
	return count > 0, err
}

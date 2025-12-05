package model

import (
	"backend/internal/config"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	UserName     string             `bson:"user_name" json:"user_name"`
	Password     string             `bson:"password" json:"-"`
	RegisteredAt int64              `bson:"registered_at" json:"registered_at"`
	Avatar       string             `bson:"avatar" json:"avatar"`
	IsDisabled   bool               `bson:"is_disabled" json:"is_disabled"`
	IsAdmin      bool               `bson:"is_admin" json:"is_admin"`
}

func NewUser(username, password string) *User {
	return &User{
		UserName:     username,
		Password:     password,
		RegisteredAt: time.Now().UnixMilli(),
		Avatar:       config.AppConfig.GetDefaultAvatarURL(),
		IsDisabled:   false,
		IsAdmin:      false,
	}
}

type UserResponse struct {
	ID           primitive.ObjectID `json:"_id"`
	UserName     string             `json:"user_name"`
	RegisteredAt int64              `json:"registered_at"`
	Avatar       string             `json:"avatar"`
	IsDisabled   bool               `json:"is_disabled"`
	IsAdmin      bool               `json:"is_admin"`
}

func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:           u.ID,
		UserName:     u.UserName,
		RegisteredAt: u.RegisteredAt,
		Avatar:       u.Avatar,
		IsDisabled:   u.IsDisabled,
		IsAdmin:      u.IsAdmin,
	}
}

type UserBrief struct {
	ID       primitive.ObjectID `bson:"_id" json:"_id"`
	UserName string             `bson:"user_name" json:"user_name"`
	Avatar   string             `bson:"avatar" json:"avatar"`
}

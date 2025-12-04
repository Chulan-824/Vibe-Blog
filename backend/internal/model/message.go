package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ReplyMessage struct {
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Content     string             `bson:"content" json:"content"`
	ReplyToUser string             `bson:"reply_to_user" json:"reply_to_user"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}

type Message struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Content   string             `bson:"content" json:"content"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	Replies   []ReplyMessage     `bson:"replies" json:"replies"`
}

type MessageWithUser struct {
	ID        primitive.ObjectID     `bson:"_id" json:"_id"`
	User      *UserBrief             `bson:"user" json:"user"`
	Content   string                 `bson:"content" json:"content"`
	CreatedAt time.Time              `bson:"created_at" json:"created_at"`
	Replies   []ReplyMessageWithUser `bson:"replies" json:"replies"`
}

type ReplyMessageWithUser struct {
	User        *UserBrief `bson:"user" json:"user"`
	Content     string     `bson:"content" json:"content"`
	ReplyToUser string     `bson:"reply_to_user" json:"reply_to_user"`
	CreatedAt   time.Time  `bson:"created_at" json:"created_at"`
}

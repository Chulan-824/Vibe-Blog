package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Visitor struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	VisitedAt time.Time          `bson:"visited_at" json:"visited_at"`
}

type VisitorWithUser struct {
	ID        primitive.ObjectID `bson:"_id" json:"_id"`
	User      *UserBrief         `bson:"user" json:"user"`
	VisitedAt time.Time          `bson:"visited_at" json:"visited_at"`
}

package dao

import (
	"backend/internal/model"
	"backend/pkg/database"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type VisitorDAO struct {
	collection *mongo.Collection
}

func NewVisitorDAO() *VisitorDAO {
	return &VisitorDAO{
		collection: database.Collection("visitors"),
	}
}

func (vd *VisitorDAO) DeleteByUserID(ctx context.Context, userID primitive.ObjectID) error {
	_, err := vd.collection.DeleteMany(ctx, bson.M{"user_id": userID})
	return err
}

func (vd *VisitorDAO) Create(ctx context.Context, userID primitive.ObjectID) error {
	visitor := &model.Visitor{
		UserID:    userID,
		VisitedAt: time.Now(),
	}
	_, err := vd.collection.InsertOne(ctx, visitor)
	return err
}

func (vd *VisitorDAO) FindListWithUser(ctx context.Context, limit int64) ([]model.VisitorWithUser, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$sort", Value: bson.M{"visited_at": -1}}},
		{{Key: "$limit", Value: limit}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "user_id",
			"foreignField": "_id",
			"as":           "user_info",
		}}},
		{{Key: "$unwind", Value: "$user_info"}},
		{{Key: "$project", Value: bson.M{
			"_id":        1,
			"visited_at": 1,
			"user": bson.M{
				"_id":       "$user_info._id",
				"user_name": "$user_info.user_name",
				"avatar":    "$user_info.avatar",
			},
		}}},
	}

	cursor, err := vd.collection.Aggregate(ctx, pipeline, options.Aggregate())
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var visitors []model.VisitorWithUser
	if err = cursor.All(ctx, &visitors); err != nil {
		return nil, err
	}
	return visitors, nil
}

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

type MessageDAO struct {
	collection *mongo.Collection
}

func NewMessageDAO() *MessageDAO {
	return &MessageDAO{
		collection: database.Collection("messages"),
	}
}

func (md *MessageDAO) Create(ctx context.Context, userID primitive.ObjectID, content string) error {
	msg := &model.Message{
		UserID:    userID,
		Content:   content,
		CreatedAt: time.Now(),
		Replies:   []model.ReplyMessage{},
	}
	_, err := md.collection.InsertOne(ctx, msg)
	return err
}

func (md *MessageDAO) FindByID(ctx context.Context, id primitive.ObjectID) (*model.Message, error) {
	var msg model.Message
	err := md.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&msg)
	if err != nil {
		return nil, err
	}
	return &msg, nil
}

func (md *MessageDAO) AddReplyMessage(ctx context.Context, parentID, userID primitive.ObjectID, content, replyToUser string) error {
	reply := model.ReplyMessage{
		UserID:      userID,
		Content:     content,
		ReplyToUser: replyToUser,
		CreatedAt:   time.Now(),
	}
	_, err := md.collection.UpdateOne(
		ctx,
		bson.M{"_id": parentID},
		bson.M{"$push": bson.M{"replies": reply}},
	)
	return err
}

func (md *MessageDAO) FindListWithUser(ctx context.Context, skip, limit int64) ([]model.MessageWithUser, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$sort", Value: bson.M{"created_at": -1}}},
		{{Key: "$skip", Value: skip}},
		{{Key: "$limit", Value: limit}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "user_id",
			"foreignField": "_id",
			"as":           "user_info",
		}}},
		{{Key: "$unwind", Value: "$user_info"}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "replies.user_id",
			"foreignField": "_id",
			"as":           "replies_users",
		}}},
		{{Key: "$project", Value: bson.M{
			"_id":        1,
			"content":    1,
			"created_at": 1,
			"user": bson.M{
				"_id":       "$user_info._id",
				"user_name": "$user_info.user_name",
				"avatar":    "$user_info.avatar",
			},
			"replies": bson.M{
				"$map": bson.M{
					"input": "$replies",
					"as":    "reply",
					"in": bson.M{
						"content":       "$$reply.content",
						"reply_to_user": "$$reply.reply_to_user",
						"created_at":    "$$reply.created_at",
						"user": bson.M{
							"$arrayElemAt": []interface{}{
								bson.M{
									"$filter": bson.M{
										"input": bson.M{
											"$map": bson.M{
												"input": "$replies_users",
												"as":    "ru",
												"in": bson.M{
													"_id":       "$$ru._id",
													"user_name": "$$ru.user_name",
													"avatar":    "$$ru.avatar",
												},
											},
										},
										"as":   "u",
										"cond": bson.M{"$eq": []interface{}{"$$u._id", "$$reply.user_id"}},
									},
								},
								0,
							},
						},
					},
				},
			},
		}}},
	}

	cursor, err := md.collection.Aggregate(ctx, pipeline, options.Aggregate())
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var messages []model.MessageWithUser
	if err = cursor.All(ctx, &messages); err != nil {
		return nil, err
	}
	return messages, nil
}

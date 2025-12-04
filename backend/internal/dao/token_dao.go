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

type TokenDAO struct {
	collection *mongo.Collection
}

func NewTokenDAO() *TokenDAO {
	return &TokenDAO{
		collection: database.Collection("refresh_tokens"),
	}
}

func (d *TokenDAO) Create(ctx context.Context, userID primitive.ObjectID, token string, expiresAt time.Time) error {
	refreshToken := &model.RefreshToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: expiresAt,
		CreatedAt: time.Now(),
		Revoked:   false,
	}
	_, err := d.collection.InsertOne(ctx, refreshToken)
	return err
}

func (d *TokenDAO) FindByToken(ctx context.Context, token string) (*model.RefreshToken, error) {
	var refreshToken model.RefreshToken
	err := d.collection.FindOne(ctx, bson.M{
		"token":   token,
		"revoked": false,
	}).Decode(&refreshToken)
	if err != nil {
		return nil, err
	}
	return &refreshToken, nil
}

func (d *TokenDAO) Revoke(ctx context.Context, token string) error {
	_, err := d.collection.UpdateOne(
		ctx,
		bson.M{"token": token},
		bson.M{"$set": bson.M{"revoked": true}},
	)
	return err
}

func (d *TokenDAO) RevokeAllByUserID(ctx context.Context, userID primitive.ObjectID) error {
	_, err := d.collection.UpdateMany(
		ctx,
		bson.M{"user_id": userID},
		bson.M{"$set": bson.M{"revoked": true}},
	)
	return err
}

func (d *TokenDAO) DeleteExpired(ctx context.Context) error {
	_, err := d.collection.DeleteMany(ctx, bson.M{
		"expires_at": bson.M{"$lt": time.Now()},
	})
	return err
}

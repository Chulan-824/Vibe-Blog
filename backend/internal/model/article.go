package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Article struct {
	ID         primitive.ObjectID   `bson:"_id,omitempty" json:"_id"`
	ArticleType string              `bson:"article_type" json:"article_type"`
	Title      string               `bson:"title" json:"title"`
	Content    string               `bson:"content" json:"content"`
	Tag        string               `bson:"tag" json:"tag"`
	UpdatedAt  time.Time            `bson:"updated_at" json:"updated_at"`
	CreatedAt  time.Time            `bson:"created_at" json:"created_at"`
	CoverImage string               `bson:"cover_image" json:"cover_image"`
	PageViews  int                  `bson:"page_views" json:"page_views"`
	Comments   []primitive.ObjectID `bson:"comments" json:"comments"`
}

type ArticleInfo struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	Tags       []string           `bson:"tags" json:"tags"`
	TotalCount int                `bson:"total_count" json:"total_count"`
}

type ArticleBrief struct {
	ID    primitive.ObjectID `bson:"_id" json:"_id"`
	Title string             `bson:"title" json:"title"`
}

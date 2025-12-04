package dao

import (
	"backend/internal/model"
	"backend/pkg/database"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ArticleDAO struct {
	collection     *mongo.Collection
	infoCollection *mongo.Collection
}

func NewArticleDAO() *ArticleDAO {
	return &ArticleDAO{
		collection:     database.Collection("articles"),
		infoCollection: database.Collection("article_infos"),
	}
}

func (d *ArticleDAO) FindByID(ctx context.Context, id primitive.ObjectID) (*model.Article, error) {
	var article model.Article
	err := d.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&article)
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (d *ArticleDAO) IncrementPageViews(ctx context.Context, id primitive.ObjectID) error {
	_, err := d.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$inc": bson.M{"page_views": 1}})
	return err
}

func (d *ArticleDAO) FindExtend(ctx context.Context, tag string, limit int64) ([]model.ArticleBrief, error) {
	opts := options.Find().
		SetProjection(bson.M{"_id": 1, "title": 1}).
		SetSort(bson.M{"page_views": -1}).
		SetLimit(limit)

	cursor, err := d.collection.Find(ctx, bson.M{"tag": tag}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var articles []model.ArticleBrief
	if err = cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

func (d *ArticleDAO) GetInfo(ctx context.Context) (*model.ArticleInfo, error) {
	var info model.ArticleInfo
	err := d.infoCollection.FindOne(ctx, bson.M{}).Decode(&info)
	if err != nil {
		return nil, err
	}
	return &info, nil
}

func (d *ArticleDAO) FindHot(ctx context.Context, limit int64) ([]model.Article, error) {
	opts := options.Find().
		SetSort(bson.M{"page_views": -1}).
		SetLimit(limit)

	cursor, err := d.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var articles []model.Article
	if err = cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

func (d *ArticleDAO) FindList(ctx context.Context, tag string, skip, limit int64) ([]model.Article, error) {
	filter := bson.M{}
	if tag != "" {
		filter["tag"] = tag
	}

	opts := options.Find().
		SetSort(bson.M{"page_views": -1}).
		SetSkip(skip).
		SetLimit(limit)

	cursor, err := d.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var articles []model.Article
	if err = cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

func (d *ArticleDAO) Search(ctx context.Context, keywords string, limit int64) ([]model.ArticleBrief, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"title": bson.M{"$regex": keywords, "$options": "i"}},
			{"tag": bson.M{"$regex": keywords, "$options": "i"}},
		},
	}

	opts := options.Find().
		SetProjection(bson.M{"_id": 1, "title": 1}).
		SetSort(bson.M{"page_views": -1}).
		SetLimit(limit)

	cursor, err := d.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var articles []model.ArticleBrief
	if err = cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

// MongoDB 索引创建脚本
// 使用方法: mongosh <database_name> scripts/create_indexes.js
// 或者: mongo <database_name> scripts/create_indexes.js

print("开始创建索引...");

// refresh_tokens 集合索引
print("==> 创建 refresh_tokens 索引");

// TTL 索引：自动清理过期 token
db.refresh_tokens.createIndex(
  { "expires_at": 1 },
  { expireAfterSeconds: 0, name: "idx_expires_at_ttl" }
);

// token 查询索引
db.refresh_tokens.createIndex(
  { "token": 1 },
  { unique: true, name: "idx_token_unique" }
);

// user_id 索引（用于查询用户的所有 token）
db.refresh_tokens.createIndex(
  { "user_id": 1 },
  { name: "idx_user_id" }
);

// 复合索引：token + revoked（常用查询条件）
db.refresh_tokens.createIndex(
  { "token": 1, "revoked": 1 },
  { name: "idx_token_revoked" }
);

// messages 集合索引
print("==> 创建 messages 索引");

// user_id 索引
db.messages.createIndex(
  { "user_id": 1 },
  { name: "idx_user_id" }
);

// 创建时间索引（用于分页排序）
db.messages.createIndex(
  { "created_at": -1 },
  { name: "idx_created_at_desc" }
);

// articles 集合索引
print("==> 创建 articles 索引");

// tag + page_views 复合索引（用于分类查询和热度排序）
db.articles.createIndex(
  { "tag": 1, "page_views": -1 },
  { name: "idx_tag_pageviews" }
);

// page_views 索引（用于热门文章查询）
db.articles.createIndex(
  { "page_views": -1 },
  { name: "idx_pageviews_desc" }
);

// 标题文本索引（用于搜索）
db.articles.createIndex(
  { "title": "text", "tag": "text" },
  { name: "idx_title_tag_text", default_language: "none" }
);

// users 集合索引
print("==> 创建 users 索引");

// username 唯一索引
db.users.createIndex(
  { "username": 1 },
  { unique: true, name: "idx_username_unique" }
);

// visitors 集合索引
print("==> 创建 visitors 索引");

// user_id 索引
db.visitors.createIndex(
  { "user_id": 1 },
  { name: "idx_user_id" }
);

// 创建时间索引
db.visitors.createIndex(
  { "created_at": -1 },
  { name: "idx_created_at_desc" }
);

print("索引创建完成!");
print("");
print("索引列表:");
print("==========");

["refresh_tokens", "messages", "articles", "users", "visitors"].forEach(function(coll) {
  print("\n" + coll + ":");
  db[coll].getIndexes().forEach(function(idx) {
    print("  - " + idx.name + ": " + JSON.stringify(idx.key));
  });
});

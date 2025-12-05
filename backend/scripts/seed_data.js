// MongoDB 测试数据初始化脚本
// 使用方式: docker exec mongodb mongosh "mongodb://admin:admin@localhost:27017/blog?authSource=admin" scripts/seed_data.js

// 切换到 blog 数据库
db = db.getSiblingDB('blog');

// 清空现有数据（可选）
db.users.deleteMany({});
db.articles.deleteMany({});
db.article_infos.deleteMany({});
db.visitors.deleteMany({});
db.messages.deleteMany({});

print("已清空现有数据");

// 1. 创建用户数据
// 密码都是 "password123" 的 bcrypt 哈希
const hashedPassword = "$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqE9Bk0e7h6VqKQJ4F3P2L0V5vU9W";

const users = [
  {
    _id: ObjectId(),
    user_name: "admin",
    password: hashedPassword,
    registered_at: NumberLong(Date.now()),
    avatar: "http://localhost:3000/img/default_avatar.jpeg",
    is_disabled: false,
    is_admin: true
  },
  {
    _id: ObjectId(),
    user_name: "test_user",
    password: hashedPassword,
    registered_at: NumberLong(Date.now() - 86400000),
    avatar: "http://localhost:3000/img/default_avatar.jpeg",
    is_disabled: false,
    is_admin: false
  },
  {
    _id: ObjectId(),
    user_name: "visitor1",
    password: hashedPassword,
    registered_at: NumberLong(Date.now() - 172800000),
    avatar: "http://localhost:3000/img/default_avatar.jpeg",
    is_disabled: false,
    is_admin: false
  }
];

db.users.insertMany(users);
print("已创建 " + users.length + " 个用户");

// 获取用户 ID
const adminUser = db.users.findOne({ user_name: "admin" });
const testUser = db.users.findOne({ user_name: "test_user" });
const visitor1 = db.users.findOne({ user_name: "visitor1" });

// 2. 创建文章数据
const tags = ["技术", "生活", "随笔", "教程"];
const articles = [];

for (let i = 1; i <= 10; i++) {
  articles.push({
    _id: ObjectId(),
    article_type: i % 2 === 0 ? "原创" : "转载",
    title: "测试文章标题 " + i,
    content: "# 文章内容 " + i + "\n\n这是测试文章的内容，用于验证博客系统功能。\n\n## 小标题\n\n- 列表项 1\n- 列表项 2\n- 列表项 3\n\n```javascript\nconsole.log('Hello World');\n```",
    tag: tags[i % tags.length],
    updated_at: new Date(Date.now() - i * 3600000),
    created_at: new Date(Date.now() - i * 86400000),
    cover_image: "http://localhost:3000/img/default_cover.jpeg",
    page_views: Math.floor(Math.random() * 1000) + 100,
    comments: []
  });
}

db.articles.insertMany(articles);
print("已创建 " + articles.length + " 篇文章");

// 3. 创建文章统计信息
db.article_infos.insertOne({
  _id: ObjectId(),
  tags: tags,
  total_count: articles.length
});
print("已创建文章统计信息");

// 4. 创建访客记录
const visitors = [
  {
    _id: ObjectId(),
    user_id: testUser._id,
    visited_at: new Date(Date.now() - 3600000)
  },
  {
    _id: ObjectId(),
    user_id: visitor1._id,
    visited_at: new Date(Date.now() - 7200000)
  },
  {
    _id: ObjectId(),
    user_id: adminUser._id,
    visited_at: new Date()
  }
];

db.visitors.insertMany(visitors);
print("已创建 " + visitors.length + " 条访客记录");

// 5. 创建留言数据
const messages = [
  {
    _id: ObjectId(),
    user_id: testUser._id,
    content: "这是一条测试留言，博客做得很棒！",
    created_at: new Date(Date.now() - 86400000),
    replies: [
      {
        user_id: adminUser._id,
        content: "谢谢支持！",
        reply_to_user: testUser.user_name,
        created_at: new Date(Date.now() - 43200000)
      }
    ]
  },
  {
    _id: ObjectId(),
    user_id: visitor1._id,
    content: "第一次来访，留个脚印~",
    created_at: new Date(Date.now() - 172800000),
    replies: []
  },
  {
    _id: ObjectId(),
    user_id: adminUser._id,
    content: "欢迎大家来我的博客！",
    created_at: new Date(Date.now() - 259200000),
    replies: [
      {
        user_id: testUser._id,
        content: "感谢分享！",
        reply_to_user: adminUser.user_name,
        created_at: new Date(Date.now() - 216000000)
      },
      {
        user_id: visitor1._id,
        content: "学到了很多",
        reply_to_user: adminUser.user_name,
        created_at: new Date(Date.now() - 180000000)
      }
    ]
  }
];

db.messages.insertMany(messages);
print("已创建 " + messages.length + " 条留言");

// 创建索引
db.users.createIndex({ user_name: 1 }, { unique: true });
db.articles.createIndex({ tag: 1 });
db.articles.createIndex({ page_views: -1 });
db.articles.createIndex({ title: "text", tag: "text" });
db.visitors.createIndex({ user_id: 1 });
db.visitors.createIndex({ visited_at: -1 });
db.messages.createIndex({ created_at: -1 });
db.refresh_tokens.createIndex({ user_id: 1 });
db.refresh_tokens.createIndex({ token: 1 });
db.refresh_tokens.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

print("已创建索引");
print("\n=== 测试数据初始化完成 ===");
print("用户数: " + db.users.countDocuments());
print("文章数: " + db.articles.countDocuments());
print("访客记录数: " + db.visitors.countDocuments());
print("留言数: " + db.messages.countDocuments());

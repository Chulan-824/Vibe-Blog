// 切换到 blog_go 数据库
use('blog_go');

// 清理旧数据（如果存在）
db.users.drop();
db.articles.drop();
db.article_infos.drop();
db.messages.drop();
db.visitors.drop();
db.refresh_tokens.drop();

print('--- 创建集合和索引 ---');

// 创建用户集合和索引
db.createCollection('users');
db.users.createIndex({ user_name: 1 }, { unique: true });

// 创建文章集合和索引
db.createCollection('articles');
db.articles.createIndex({ tag: 1 });
db.articles.createIndex({ page_views: -1 });
db.articles.createIndex({ title: 'text', tag: 'text' });

// 创建文章信息集合
db.createCollection('article_infos');

// 创建留言集合
db.createCollection('messages');
db.messages.createIndex({ created_at: -1 });

// 创建访客集合
db.createCollection('visitors');
db.visitors.createIndex({ visited_at: -1 });
db.visitors.createIndex({ user_id: 1 });

// 创建刷新令牌集合
db.createCollection('refresh_tokens');
db.refresh_tokens.createIndex({ token: 1 }, { unique: true });
db.refresh_tokens.createIndex({ user_id: 1 });
db.refresh_tokens.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

print('--- 插入测试数据 ---');

// 插入管理员用户 (密码: 123456)
db.users.insertOne({
  user_name: 'admin',
  password: '$2a$10$vLz4tp9uszaGuxsB.qBXKexJsYMVr/TWt8E7hm2eMyry4LcUffbcK',
  registered_at: Date.now(),
  avatar: 'http://localhost:3000/img/default_avatar.jpeg',
  is_disabled: false,
  is_admin: true
});

// 插入普通测试用户
db.users.insertOne({
  user_name: 'test',
  password: '$2a$10$vLz4tp9uszaGuxsB.qBXKexJsYMVr/TWt8E7hm2eMyry4LcUffbcK',
  registered_at: Date.now(),
  avatar: 'http://localhost:3000/img/default_avatar.jpeg',
  is_disabled: false,
  is_admin: false
});

// 插入文章标签配置
db.article_infos.insertOne({
  tags: ['HTML&Css', 'JavaScript', 'Node', 'Vue&React', 'Go', 'Other'],
  total_count: 100
});

// 插入示例文章
const tags = ['HTML&Css', 'JavaScript', 'Node', 'Vue&React', 'Go'];
const types = ['原创', '转载'];

for (let i = 1; i <= 10; i++) {
  db.articles.insertOne({
    article_type: types[Math.floor(Math.random() * 2)],
    title: `示例文章 ${i} - Go + Gin 后端开发`,
    content: `<h2>文章内容</h2><p>这是第 ${i} 篇示例文章的内容。</p><p>本项目使用 Go + Gin 框架重构，数据库使用 MongoDB，认证方式采用 JWT Token。</p><h3>主要特性</h3><ul><li>RESTful API 设计</li><li>JWT Token 认证</li><li>bcrypt 密码加密</li><li>MongoDB 数据存储</li></ul>`,
    tag: tags[Math.floor(Math.random() * tags.length)],
    updated_at: new Date(),
    created_at: new Date(),
    cover_image: 'http://localhost:3000/img/default_cover.jpg',
    page_views: Math.floor(Math.random() * 1000),
    comments: []
  });
}

print('--- 验证数据 ---');
print('用户数量: ' + db.users.countDocuments());
print('文章数量: ' + db.articles.countDocuments());
print('文章配置: ' + db.article_infos.countDocuments());

print('--- 数据库初始化完成 ---');

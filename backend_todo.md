# Backend TODO List

## API 契约与路由
- [x] 为所有 HTTP 接口添加统一前缀与版本（如 `/api/v1`），并将 `POST /article/getHot` 等改为符合 REST 的 `GET /articles/hot` 风格。
- [x] 统一响应结构与错误码，区分 HTTP 状态码与业务码，避免 `200 + code` 的混用，补充错误枚举与中英对照文案。
- [ ] 为接口生成 OpenAPI/Swagger 文档，确保字段命名、请求/响应模型一致。

## 中间件与基础设施
- [x] 在 `cmd/server` 中使用自定义 `http.Server` + 优雅关停（signal.Notify + context）。
- [x] 调整 CORS 中间件逻辑：配置化允许域、当 `Allow-Credentials=true` 时禁止 `*`，并为 `OPTIONS` 返回 204。
- [x] 避免在 `gin.Default()` 后重复注册 Logger/Recovery，必要时自定义 `gin.New()` 并手动添加。

## 分层与依赖注入
- [x] 让 Handler 仅依赖 Service 接口，Service 再组合 DAO，避免 Handler 直接访问 DAO。
- [x] 将数据库客户端、集合及服务依赖通过构造函数注入，便于单元测试与 mock。
- [x] 修复 goroutine 内继续使用 `c.Request.Context()` 的问题，改用 `context.Background()` 或任务队列。

## 配置与错误处理
- [x] 将 `config.AppConfig` 拆分子结构（App/DB/JWT/Upload），对 `time.ParseDuration` 等解析错误做显式处理。
- [x] 增强 Makefile，添加 `lint`、`vet`、`fmt`、`check` 目标。
- [x] 在 DAO 层统一设置 `context.WithTimeout`，封装 `mongo.ErrNoDocuments`，并提供结构化日志输出。

## 认证与安全
- [x] 为 JWT/Refresh Token 引入密钥轮换（kid）、TTL Index、真正的撤销机制，并检查 `Revoke` 的错误返回。
- [x] 上传接口增加大小限制、MIME 校验、随机文件名/目录以及失败回滚，避免覆盖与安全风险。
- [x] CORS、静态资源、BaseURL 等全部外部化为配置项，并为生产/测试区分 `.env`。

## 开发体验与质量保障
- [x] 增加 `golangci-lint`, `go test ./...`, 集成测试脚本，并在 CI 中执行。
- [ ] 为 Service/DAO 编写单元测试，引入 mock（如 `gomock`），确保关键认证与查询逻辑可测。
- [x] 在 Mongo 集合上添加必要索引（如 `refresh_tokens.expires_at` TTL、`messages.user_id`）、并编写迁移脚本。

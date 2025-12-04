.PHONY: dev run build clean test help

# 默认目标
help:
	@echo "可用命令:"
	@echo "  make dev    - 使用 air 热重载开发（需要安装 air）"
	@echo "  make run    - 直接运行服务器"
	@echo "  make build  - 编译二进制文件"
	@echo "  make clean  - 清理编译产物"
	@echo "  make test   - 运行测试"

# 热重载开发（需要安装 air: go install github.com/air-verse/air@latest）
dev:
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "air 未安装，使用 go run 启动..."; \
		go run cmd/server/main.go; \
	fi

# 直接运行
run:
	go run cmd/server/main.go

# 编译
build:
	@mkdir -p bin
	go build -o bin/server cmd/server/main.go

# 清理
clean:
	rm -rf bin/

# 测试
test:
	go test -v ./...

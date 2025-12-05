.PHONY: dev run build clean test lint vet fmt check help

# 默认目标
help:
	@echo "可用命令:"
	@echo "  make dev    - 使用 air 热重载开发（需要安装 air）"
	@echo "  make run    - 直接运行服务器"
	@echo "  make build  - 编译二进制文件"
	@echo "  make clean  - 清理编译产物"
	@echo "  make test   - 运行测试"
	@echo "  make lint   - 运行 golangci-lint 代码检查"
	@echo "  make vet    - 运行 go vet 静态分析"
	@echo "  make fmt    - 格式化代码"
	@echo "  make check  - 运行所有检查（fmt + vet + lint + test）"

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

# 代码格式化
fmt:
	go fmt ./...

# 静态分析
vet:
	go vet ./...

# golangci-lint 代码检查（需要安装: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest）
lint:
	@if command -v golangci-lint > /dev/null; then \
		golangci-lint run ./...; \
	else \
		echo "golangci-lint 未安装，请运行: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; \
		exit 1; \
	fi

# 运行所有检查
check: fmt vet
	@echo "==> 运行测试..."
	go test -v ./...
	@if command -v golangci-lint > /dev/null; then \
		echo "==> 运行 lint..."; \
		golangci-lint run ./...; \
	fi
	@echo "==> 所有检查通过!"

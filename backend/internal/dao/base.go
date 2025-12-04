package dao

import (
	"context"
	"time"
)

// 默认数据库操作超时时间
const DefaultTimeout = 10 * time.Second

// WithTimeout 为 context 添加超时，如果已有超时则使用较短的那个
func WithTimeout(ctx context.Context, timeout time.Duration) (context.Context, context.CancelFunc) {
	// 如果传入的 context 已经有 deadline，检查是否比我们的 timeout 更短
	if deadline, ok := ctx.Deadline(); ok {
		remaining := time.Until(deadline)
		if remaining < timeout {
			// 已有的 deadline 更短，不需要添加新的
			return ctx, func() {}
		}
	}
	return context.WithTimeout(ctx, timeout)
}

// WithDefaultTimeout 使用默认超时时间
func WithDefaultTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	return WithTimeout(ctx, DefaultTimeout)
}

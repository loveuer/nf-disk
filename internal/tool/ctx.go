package tool

import (
	"context"
	"time"
)

func Timeout(seconds ...int) (ctx context.Context) {
	var (
		duration time.Duration
	)

	if len(seconds) > 0 && seconds[0] > 0 {
		duration = time.Duration(seconds[0]) * time.Second
	} else {
		duration = time.Duration(30) * time.Second
	}

	ctx, _ = context.WithTimeout(context.Background(), duration)

	return
}

func TimeoutCtx(ctx context.Context, seconds ...int) context.Context {
	var (
		duration time.Duration
	)

	if len(seconds) > 0 && seconds[0] > 0 {
		duration = time.Duration(seconds[0]) * time.Second
	} else {
		duration = time.Duration(30) * time.Second
	}

	nctx, _ := context.WithTimeout(ctx, duration)

	return nctx
}

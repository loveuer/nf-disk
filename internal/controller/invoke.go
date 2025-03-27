package controller

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/loveuer/nf-disk/internal/api"
	"github.com/loveuer/nf-disk/internal/opt"
	"github.com/loveuer/nf-disk/internal/tool"
	"github.com/loveuer/nf-disk/ndh"
	"github.com/loveuer/nf/nft/log"
)

func handleError(err error) string {
	bs, _ := json.Marshal(map[string]any{
		"err":    err.Error(),
		"msg":    opt.Msg500,
		"status": 500,
	})

	return string(bs)
}

func handleNotFound(path string) string {
	bs, _ := json.Marshal(map[string]any{
		"err":    fmt.Sprintf("path not found, path: %s", path),
		"msg":    opt.Msg500,
		"status": 404,
	})

	return string(bs)
}

type InvokeOption struct {
	Timeout int
}

func (a *App) Invoke(path string, req string, opt InvokeOption) (res string) {
	log.Info("app invoke: path = %s, req = %s", path, req)
	handler, ok := api.Resolve(path)
	if !ok {
		log.Warn("app invoke: path not found, path = %s", path)
		return handleNotFound(path)
	}

	var (
		buf bytes.Buffer
		dx  = context.WithValue(a.ctx, "app", a)
		tx  = tool.TimeoutCtx(dx)
	)

	if opt.Timeout > 0 {
		tx = tool.TimeoutCtx(dx, opt.Timeout)
	} else if opt.Timeout < 0 {
		tx = dx
	}

	ctx := ndh.NewCtx(tx, strings.NewReader(req), &buf)

	if err := handler(ctx); err != nil {
		return handleError(err)
	}

	return buf.String()
}

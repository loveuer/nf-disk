package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/loveuer/nf-disk/internal/api"
	"github.com/loveuer/nf-disk/internal/opt"
	"github.com/loveuer/nf-disk/internal/tool"
	"github.com/loveuer/nf-disk/ndh"
	"github.com/loveuer/nf/nft/log"
	"strings"
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

func (a *App) Invoke(path string, req string) (res string) {
	log.Info("app invoke: path = %s, req = %s", path, req)
	handler, ok := api.Resolve(path)
	if !ok {
		log.Warn("app invoke: path not found, path = %s", path)
		return handleNotFound(path)
	}

	var buf bytes.Buffer
	ctx := ndh.NewCtx(tool.TimeoutCtx(a.ctx), strings.NewReader(req), &buf)

	if err := handler(ctx); err != nil {
		return handleError(err)
	}

	return buf.String()
}

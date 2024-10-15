package ndh

import (
	"context"
	"encoding/json"
	"io"
)

type Ctx struct {
	ctx context.Context
	req io.Reader
	res io.Writer
}

func NewCtx(ctx context.Context, req io.Reader, res io.Writer) *Ctx {
	return &Ctx{
		ctx: ctx,
		req: req,
		res: res,
	}
}

func (c *Ctx) Context() context.Context {
	return c.ctx
}

func (c *Ctx) Write(bs []byte) (int, error) {
	return c.res.Write(bs)
}

func (c *Ctx) ReqParse(req any) error {
	return json.NewDecoder(c.req).Decode(req)
}

func (c *Ctx) Send200(data any, msg ...string) error {
	m := "操作成功"
	if len(msg) > 0 && msg[0] != "" {
		m = msg[0]
	}

	return c.Send(200, m, "", data)
}

func (c *Ctx) Send400(data any, msg ...string) error {
	m := "参数错误"
	if len(msg) > 0 && msg[0] != "" {
		m = msg[0]
	}

	return c.Send(400, m, "", data)
}

func (c *Ctx) Send500(data any, msg ...string) error {
	m := "系统错误"
	if len(msg) > 0 && msg[0] != "" {
		m = msg[0]
	}

	return c.Send(500, m, "", data)
}

func (c *Ctx) Send(status uint32, msg, error string, data any) error {
	value := map[string]any{"status": status, "msg": msg, "err": error, "data": data}
	bs, err := json.Marshal(value)
	if err != nil {
		return err
	}

	_, err = c.Write(bs)

	return err
}

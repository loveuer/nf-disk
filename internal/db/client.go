package db

import (
	"context"
	"github.com/loveuer/nf-disk/internal/opt"
	"github.com/loveuer/nf-disk/internal/tool"
	"io"

	"gorm.io/gorm"
)

var (
	Default *Client
)

type Client struct {
	ctx       context.Context
	cli       *gorm.DB
	ttype     string
	cfgSqlite *cfgSqlite
}

func (c *Client) Type() string {
	return c.ttype
}

func (c *Client) Session(ctxs ...context.Context) *gorm.DB {
	var ctx context.Context
	if len(ctxs) > 0 && ctxs[0] != nil {
		ctx = ctxs[0]
	} else {
		ctx = tool.Timeout(30)
	}

	session := c.cli.Session(&gorm.Session{Context: ctx})

	if opt.Debug {
		session = session.Debug()
	}

	return session
}

func (c *Client) Close() {
	d, _ := c.cli.DB()
	d.Close()
}

// Dump
// Only for sqlite with mem mode to dump data to bytes(io.Reader)
func (c *Client) Dump() (reader io.ReadSeekCloser, ok bool) {
	if c.ttype != "sqlite" {
		return nil, false
	}

	if c.cfgSqlite.fsType != "mem" {
		return nil, false
	}

	return c.cfgSqlite.memDump.Dump(), true
}

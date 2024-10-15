package db

import (
	_ "github.com/loveuer/go-sqlite3/embed"
	"io"
)

type Option func(c *Client)

func OptSqliteByUrl(address string) Option {
	return func(c *Client) {
		c.cfgSqlite.fsType = "url"
	}
}

type SqliteMemDumper interface {
	Dump() io.ReadSeekCloser
}

// 如果传 nil 则表示新生成一个 mem 的 sqlite
// 如果传了一个合法的 reader 则会从这个 reader 初始化 database
func OptSqliteByMem(reader io.ReadCloser) Option {
	return func(c *Client) {
		c.cfgSqlite.memReader = reader
		c.cfgSqlite.fsType = "mem"
	}
}

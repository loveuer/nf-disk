package db

import (
	"fmt"
	"io"
	"time"

	_ "github.com/loveuer/go-sqlite3/embed"
	"github.com/loveuer/go-sqlite3/vfs/memdb"
	"github.com/loveuer/go-sqlite3/vfs/readervfs"
	"github.com/ncruces/go-sqlite3/gormlite"
	"github.com/psanford/httpreadat"
	"gorm.io/gorm"
)

type cfgSqlite struct {
	fsType    string // file, mem(bytes), url
	memDump   *memdb.MemDB
	memReader io.ReadCloser
}

func openSqlite(c *Client, dsn string) error {
	var (
		db  gorm.Dialector
		err error
	)

	switch c.cfgSqlite.fsType {
	case "file":
		db = gormlite.Open("file:" + dsn)
	case "url":
		name := fmt.Sprintf("%d.db", time.Now().UnixNano())
		readervfs.Create(name, httpreadat.New(dsn))
		uri := fmt.Sprintf("file:%s?vfs=reader", name)
		db = gormlite.Open(uri)
	case "mem":
		var (
			bs   []byte
			name = fmt.Sprintf("%d.db", time.Now().UnixNano())
		)

		if c.cfgSqlite.memReader == nil {
			bs = make([]byte, 0)
		} else {
			if bs, err = io.ReadAll(c.cfgSqlite.memReader); err != nil {
				return err
			}
		}

		memDump := memdb.Create(name, bs)
		c.cfgSqlite.memDump = memDump
		uri := fmt.Sprintf("file:/%s?vfs=memdb", name)
		db = gormlite.Open(uri)
	default:
		return fmt.Errorf("unsupported sqlite fs type: %s", c.cfgSqlite.fsType)
	}

	if c.cli, err = gorm.Open(db); err != nil {
		return err
	}

	return nil
}

package db

import (
	"context"
	"fmt"
	"strings"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func New(ctx context.Context, uri string) (*Client, error) {
	strs := strings.Split(uri, "::")

	if len(strs) != 2 {
		return nil, fmt.Errorf("db.Init: opt db uri invalid: %s", uri)
	}

	c := &Client{ttype: strs[0]}

	var (
		err error
		dsn = strs[1]
	)

	switch strs[0] {
	case "sqlite":
		c.cli, err = gorm.Open(sqlite.Open(dsn))
	//case "mysql":
	//	c.cli, err = gorm.Open(mysql.Open(dsn))
	//case "postgres":
	//	c.cli, err = gorm.Open(postgres.Open(dsn))
	default:
		return nil, fmt.Errorf("db type only support: [sqlite, mysql, postgres], unsupported db type: %s", strs[0])
	}

	if err != nil {
		return nil, fmt.Errorf("db.Init: open %s with dsn:%s, err: %w", strs[0], dsn, err)
	}

	return c, nil
}

func Init(ctx context.Context, uri string) (err error) {
	if Default, err = New(ctx, uri); err != nil {
		return err
	}

	return nil
}

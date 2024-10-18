package handler

import (
	"errors"
	"github.com/loveuer/nf-disk/internal/db"
	"github.com/loveuer/nf-disk/internal/manager"
	"github.com/loveuer/nf-disk/internal/model"
	"github.com/loveuer/nf-disk/internal/s3"
	"github.com/loveuer/nf-disk/ndh"
	"github.com/samber/lo"
)

func ConnectionTest(c *ndh.Ctx) error {
	type Req struct {
		Name     string `json:"name"`
		Endpoint string `json:"endpoint"`
		Access   string `json:"access"`
		Key      string `json:"key"`
	}

	var (
		err error
		req = new(Req)
	)

	if err = c.ReqParse(req); err != nil {
		return err
	}

	if req.Endpoint == "" || req.Access == "" || req.Key == "" {
		return c.Send400(nil, "endpoint, secret_access, secret_key 是必填项")
	}

	if _, err = s3.New(c.Context(), req.Endpoint, req.Access, req.Key); err != nil {
		return c.Send500(err.Error(), "连接失败")
	}

	return c.Send200("连接测试成功")
}

func ConnectionCreate(c *ndh.Ctx) error {
	type Req struct {
		Name     string `json:"name"`
		Endpoint string `json:"endpoint"`
		Access   string `json:"access"`
		Key      string `json:"key"`
		Force    bool   `json:"force"`
	}

	var (
		err    error
		req    = new(Req)
		client *s3.Client
	)

	if err = c.ReqParse(req); err != nil {
		return err
	}

	if req.Endpoint == "" || req.Access == "" || req.Key == "" {
		return c.Send400(nil, "endpoint, secret_access, secret_key 是必填项")
	}

	if client, err = s3.New(c.Context(), req.Endpoint, req.Access, req.Key); err != nil {
		return c.Send500(err.Error(), "连接失败")
	}

	if req.Name == "" {
		req.Name = req.Endpoint
	}

	connection := &model.Connection{
		Name:     req.Name,
		Endpoint: req.Endpoint,
		Access:   req.Access,
		Key:      req.Key,
	}

	if err = connection.Create(db.Default.Session()); err != nil {
		return c.Send500(err.Error(), "创建连接失败(1)")
	}

	if err = manager.Manager.Register(connection, client); err != nil {
		return c.Send500(err.Error(), "创建连接失败(2)")
	}

	return c.Send200(connection, "创建连接成功")
}

func ConnectionList(c *ndh.Ctx) error {
	type Req struct {
		Keyword string `json:"keyword"`
	}

	var (
		err  error
		list = make([]*model.Connection, 0)
		req  = new(Req)
	)

	if err = c.ReqParse(req); err != nil {
		return c.Send400(nil, "参数错误")
	}

	if err = db.Default.Session().Model(&model.Connection{}).
		Find(&list).
		Error; err != nil {
		return err
	}

	listMap := lo.SliceToMap(list, func(item *model.Connection) (uint64, *model.Connection) {
		return item.Id, item
	})

	manager.Manager.Map(func(c *model.Connection, s *s3.Client) error {
		if item, ok := listMap[c.Id]; ok {
			item.Active = true
		}

		return nil
	})

	return c.Send200(map[string]any{"list": list})
}

func ConnectionConnect(c *ndh.Ctx) error {
	type Req struct {
		Id uint64 `json:"id"`
	}

	var (
		err    error
		req    = new(Req)
		client *s3.Client
	)

	if err = c.ReqParse(req); err != nil {
		return c.Send400(req)
	}

	conn := &model.Connection{Id: req.Id}
	if err = conn.Get(db.Default.Session(), c); err != nil {
		return err
	}

	if client, err = s3.New(c.Context(), conn.Endpoint, conn.Access, conn.Key); err != nil {
		return c.Send500(err.Error(), "连接失败")
	}

	if err = manager.Manager.Register(conn, client); err != nil {
		return c.Send500(err.Error(), "连接失败")
	}

	return c.Send200(conn, "连接成功")
}

func ConnectionDisconnect(c *ndh.Ctx) error {
	type Req struct {
		Id uint64 `json:"id"`
	}

	var (
		err error
		req = new(Req)
	)

	if err = c.ReqParse(req); err != nil {
		return c.Send400(req)
	}

	conn := &model.Connection{Id: req.Id}
	if err = conn.Get(db.Default.Session(), c); err != nil {
		return err
	}

	if err = manager.Manager.UnRegister(conn.Id); err != nil {
		return c.Send500(err.Error())
	}

	return c.Send200(conn)
}

func ConnectionBuckets(c *ndh.Ctx) error {
	type Req struct {
		Id      uint64 `json:"id"`
		Keyword string `json:"keyword"`
	}

	var (
		err     error
		req     = new(Req)
		client  *s3.Client
		buckets []*s3.ListBucketRes
	)

	if err = c.ReqParse(req); err != nil {
		return c.Send400(nil, "参数错误")
	}

	if _, client, err = manager.Manager.Use(req.Id); err != nil {
		if errors.Is(err, manager.ErrNotFound) {
			return c.Send400(nil, "所选连接未激活")
		}

		return c.Send500(err.Error())
	}

	if buckets, err = client.ListBucket(c.Context()); err != nil {
		return c.Send500(err.Error())
	}

	return c.Send200(map[string]any{"list": buckets})
}

func ConnectionDelete(c *ndh.Ctx) error {
	type Req struct {
		ConnId uint64 `json:"conn_id"`
	}

	var (
		err error
		req = new(Req)
	)

	if err = c.ReqParse(req); err != nil {
		return c.Send400(err.Error())
	}

	if err = db.Default.Session().Delete(&model.Connection{Id: req.ConnId}).Error; err != nil {
		return c.Send500(err.Error())
	}

	_ = manager.Manager.UnRegister(req.ConnId)

	return c.Send200(nil)
}

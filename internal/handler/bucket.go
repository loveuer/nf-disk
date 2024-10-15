package handler

import (
	"github.com/loveuer/nf-disk/internal/manager"
	"github.com/loveuer/nf-disk/internal/s3"
	"github.com/loveuer/nf-disk/ndh"
)

func BucketFiles(c *ndh.Ctx) error {
	type Req struct {
		ConnId uint64 `json:"conn_id"`
		Bucket string `json:"bucket"`
		Prefix string `json:"prefix"`
	}

	var (
		err    error
		req    = new(Req)
		client *s3.Client
		list   []*s3.ListFileRes
	)

	if err = c.ReqParse(req); err != nil {
		return c.Send400(err.Error())
	}

	if req.ConnId == 0 || req.Bucket == "" {
		return c.Send400(req, "缺少参数")
	}

	if _, client, err = manager.Manager.Use(req.ConnId); err != nil {
		return c.Send500(err.Error())
	}

	if list, err = client.ListFile(c.Context(), req.Bucket, req.Prefix); err != nil {
		return c.Send500(err.Error())
	}

	return c.Send200(map[string]any{"list": list})
}

func BucketCreate(c *ndh.Ctx) error {
	type Req struct {
		ConnId          uint64 `json:"conn_id"`
		Name            string `json:"name"`
		PublicRead      bool   `json:"public_read"`
		PublicReadWrite bool   `json:"public_read_write"`
	}

	var (
		err    error
		req    = new(Req)
		client *s3.Client
	)

	if err = c.ReqParse(req); err != nil {
		return c.Send400(err.Error())
	}

	if req.Name == "" {
		return c.Send400(req, "桶名不能为空")
	}

	if _, client, err = manager.Manager.Use(req.ConnId); err != nil {
		return c.Send500(err.Error())
	}

	if err = client.CreateBucket(c.Context(), req.Name, req.PublicRead, req.PublicReadWrite); err != nil {
		return c.Send500(err.Error())
	}

	return c.Send200(map[string]any{"bucket": req.Name})
}

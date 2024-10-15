package handler

import (
	"errors"
	"fmt"
	"github.com/loveuer/nf-disk/internal/manager"
	"github.com/loveuer/nf-disk/internal/s3"
	"github.com/loveuer/nf-disk/ndh"
	"github.com/loveuer/nf/nft/log"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

func FileUpload(c *ndh.Ctx) error {
	type Req struct {
		ConnId            uint64 `json:"conn_id"`
		Bucket            string `json:"bucket"`
		Location          string `json:"location"`
		Name              string `json:"name"`
		PublicRead        bool   `json:"public_read"`
		PublicReadWrite   bool   `json:"public_read_write"`
		DetectContentType bool   `json:"detect_content_type"`
	}

	var (
		err    error
		req    = new(Req)
		client *s3.Client
		reader *os.File
		info   os.FileInfo
	)

	if err = c.ReqParse(req); err != nil {
		return c.Send400(c, err.Error())
	}

	if req.Location == "" {
		return c.Send400(req, "缺少文件位置")
	}

	if req.Name == "" {
		req.Name = filepath.Base(req.Location)
	}

	if _, client, err = manager.Manager.Use(req.ConnId); err != nil {
		return c.Send500(err.Error())
	}

	if reader, err = os.Open(req.Location); err != nil {
		return c.Send400(err.Error(), fmt.Sprintf("文件: %s 打开错误", req.Location))
	}

	if info, err = reader.Stat(); err != nil {
		log.Error("FileUpload: stat file info err = %s", err.Error())
		return c.Send500(err.Error())
	}

	obj := &s3.PutFilesObj{
		Key:             req.Name,
		Reader:          reader,
		ContentLength:   info.Size(),
		ContentType:     "",
		ExpireAt:        0,
		PublicRead:      req.PublicRead,
		PublicReadWrite: req.PublicReadWrite,
	}

	if req.DetectContentType {
		bs := make([]byte, 128)
		if _, err = reader.ReadAt(bs, 0); err != nil {
			if !errors.Is(err, io.EOF) {
				log.Error("FileUpload: read file to detect content_type err = %s", err.Error())
				return c.Send500(err.Error())
			}
		}

		obj.ContentType = http.DetectContentType(bs)
	}

	if err = client.PutFile(c.Context(), req.Bucket, obj); err != nil {
		log.Error("FileUpload: client.PutFile err = %s", err.Error())
		return c.Send500(err.Error())
	}

	return c.Send200(req)
}

func FileInfo(c *ndh.Ctx) error {
	type Req struct {
		ConnId uint64 `json:"conn_id"`
		Bucket string `json:"bucket"`
		Key    string `json:"key"`
	}

	var (
		err    error
		req    = new(Req)
		client *s3.Client
		info   *s3.ObjectInfo
	)

	if err = c.ReqParse(req); err != nil {
		return c.Send400(err.Error())
	}

	if _, client, err = manager.Manager.Use(req.ConnId); err != nil {
		return c.Send500(err.Error())
	}

	if info, err = client.GetObjectInfo(c.Context(), req.Bucket, req.Key); err != nil {
		return c.Send500(err.Error())
	}

	return c.Send200(info)
}

func FileGet(c *ndh.Ctx) error {
	type Req struct {
		ConnId   uint64 `json:"conn_id"`
		Bucket   string `json:"bucket"`
		Key      string `json:"key"`
		Duration int64  `json:"duration"` // seconds, default 60
	}

	var (
		err    error
		req    = new(Req)
		client *s3.Client
		link   *s3.ObjectEntry
	)

	if err = c.ReqParse(req); err != nil {
		return c.Send400(err.Error())
	}

	if _, client, err = manager.Manager.Use(req.ConnId); err != nil {
		return c.Send500(err.Error())
	}

	if req.Duration == 0 {
		req.Duration = 60
	}

	if link, err = client.GetObjectEntry(c.Context(), req.Bucket, req.Key, req.Duration); err != nil {
		return c.Send500(err.Error())
	}

	return c.Send200(link)
}

func FileDownload(c *ndh.Ctx) error {
	type Req struct {
		ConnId   uint64 `json:"conn_id"`
		Bucket   string `json:"bucket"`
		Key      string `json:"key"`
		Location string `json:"location"`
	}

	var (
		err    error
		req    = new(Req)
		client *s3.Client
		obj    *s3.ObjectEntity
		target *os.File
	)

	if err = c.ReqParse(req); err != nil {
		return c.Send400(err.Error())
	}

	if _, client, err = manager.Manager.Use(req.ConnId); err != nil {
		return c.Send500(err.Error())
	}

	if obj, err = client.GetObject(c.Context(), req.Bucket, req.Key); err != nil {
		return c.Send500(err.Error())
	}

	if target, err = os.OpenFile(filepath.Clean(req.Location), os.O_CREATE|os.O_RDWR|os.O_TRUNC, 0644); err != nil {
		return c.Send500(err.Error())
	}

	if _, err = io.Copy(target, obj.Body); err != nil {
		return c.Send500(err.Error())
	}

	return c.Send200(req)
}

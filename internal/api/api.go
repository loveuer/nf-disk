package api

import (
	"context"
	"github.com/loveuer/nf-disk/internal/handler"
	"github.com/loveuer/nf-disk/ndh"
	"github.com/loveuer/nf/nft/log"
	"path/filepath"
	"reflect"
	"runtime"
)

var (
	apis = make(map[string]ndh.Handler)
)

func register(path string, h ndh.Handler) {
	name := runtime.FuncForPC(reflect.ValueOf(h).Pointer()).Name()
	log.Info("app register: path = %s, name = %s", path, filepath.Base(name))
	apis[path] = h
}

func Resolve(path string) (ndh.Handler, bool) {
	h, ok := apis[path]
	return h, ok
}

func Init(ctx context.Context) error {
	register("/runtime/dialog/open", handler.DialogOpen(ctx))
	register("/runtime/dialog/save", handler.DialogSave(ctx))
	register("/api/connection/test", handler.ConnectionTest)
	register("/api/connection/create", handler.ConnectionCreate)
	register("/api/connection/get", handler.ConnectionGet)
	register("/api/connection/update", handler.ConnectionUpdate)
	register("/api/connection/delete", handler.ConnectionDelete)
	register("/api/connection/list", handler.ConnectionList)
	register("/api/connection/connect", handler.ConnectionConnect)
	register("/api/connection/disconnect", handler.ConnectionDisconnect)
	register("/api/connection/buckets", handler.ConnectionBuckets)
	register("/api/bucket/files", handler.BucketFiles)
	register("/api/bucket/create", handler.BucketCreate)
	register("/api/file/upload", handler.FileUpload)
	register("/api/file/info", handler.FileInfo)
	register("/api/file/get", handler.FileGet)
	register("/api/file/content", handler.FileContent)
	register("/api/file/download", handler.FileDownload)
	register("/api/file/delete", handler.FileDelete)

	return nil
}

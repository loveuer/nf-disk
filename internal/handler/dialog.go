package handler

import (
	"context"
	"github.com/loveuer/nf-disk/ndh"
	"github.com/samber/lo"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"path/filepath"
)

func DialogOpen(ctx context.Context) ndh.Handler {
	return func(c *ndh.Ctx) error {
		type Req struct {
			Title   string   `json:"title"`
			Type    string   `json:"type"` // "dir", "multi", ""
			Filters []string `json:"filters"`
		}

		var (
			err error
			req = new(Req)
			opt = runtime.OpenDialogOptions{
				Title: "请选择文件",
			}
			result any
		)

		if err = c.ReqParse(req); err != nil {
			return c.Send400(err.Error())
		}

		if req.Title != "" {
			opt.Title = req.Title
		}

		if len(req.Filters) > 0 {
			opt.Filters = lo.Map(req.Filters, func(item string, index int) runtime.FileFilter {
				return runtime.FileFilter{Pattern: item}
			})
		}

		switch req.Type {
		case "dir":
			result, err = runtime.OpenDirectoryDialog(ctx, opt)
		case "multi":
			result, err = runtime.OpenMultipleFilesDialog(ctx, opt)
		default:
			result, err = runtime.OpenFileDialog(ctx, opt)
		}

		if err != nil {
			return c.Send500(err.Error())
		}

		return c.Send200(map[string]interface{}{"result": result})
	}
}

func DialogSave(ctx context.Context) ndh.Handler {
	return func(c *ndh.Ctx) error {
		type Req struct {
			Title            string   `json:"title"`
			Filters          []string `json:"filters"`
			DefaultDirectory string   `json:"default_directory"`
			DefaultFilename  string   `json:"default_filename"`
		}

		var (
			err error
			req = new(Req)
			opt = runtime.SaveDialogOptions{
				Title: "将文件保存到",
			}
			result any
		)

		if err = c.ReqParse(req); err != nil {
			return c.Send400(err.Error())
		}

		if req.Title != "" {
			opt.Title = req.Title
		}

		if req.DefaultFilename != "" {
			opt.DefaultFilename = req.DefaultFilename
		}

		if req.DefaultDirectory != "" {
			opt.DefaultDirectory = req.DefaultDirectory
		}

		if opt.DefaultDirectory == "" {
			var home string
			if home, err = os.UserHomeDir(); err != nil {
				opt.DefaultDirectory = filepath.Join(home, "Downloads")
			}
		}

		if len(req.Filters) > 0 {
			opt.Filters = lo.Map(req.Filters, func(item string, index int) runtime.FileFilter {
				return runtime.FileFilter{Pattern: item}
			})
		}

		if result, err = runtime.SaveFileDialog(ctx, opt); err != nil {
			return c.Send500(err.Error())
		}

		return c.Send200(map[string]interface{}{"result": result})
	}
}

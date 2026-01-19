package controller

import (
	"context"
	"fmt"
	"github.com/loveuer/nf-disk/internal/api"
	"github.com/loveuer/nf-disk/internal/db"
	"github.com/loveuer/nf-disk/internal/manager"
	"github.com/loveuer/nf-disk/internal/model"
	"github.com/loveuer/nf-disk/internal/opt"
	"github.com/loveuer/nf-disk/internal/tool"
	"github.com/loveuer/nf-disk/ndh"
	"github.com/loveuer/nf/nft/log"
)

var (
	app *App
)

type App struct {
	ctx      context.Context
	handlers map[string]ndh.Handler
}

func NewApp(gctx context.Context) *App {
	app = &App{
		handlers: make(map[string]ndh.Handler),
	}

	go func() {
		<-gctx.Done()
		// Don't call runtime.Quit here, let Wails handle the shutdown naturally
		// runtime.Quit(app.ctx) // This causes the context error
	}()

	return app
}

func (a *App) Startup(ctx context.Context) {
	log.Info("app startup!!!")
	a.ctx = ctx
	tool.Must(opt.Init())
	tool.Must(db.Init(ctx, fmt.Sprintf("sqlite::%s", opt.ConfigFile)))
	tool.Must(model.Init(db.Default.Session()))
	tool.Must(manager.Init(ctx))
	tool.Must(api.Init(ctx))
}

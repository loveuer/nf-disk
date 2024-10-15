package main

import (
	"context"
	"embed"
	"flag"
	"github.com/loveuer/nf-disk/internal/controller"
	"github.com/loveuer/nf-disk/internal/opt"
	"os/signal"
	"syscall"

	"github.com/loveuer/nf/nft/log"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
	defer cancel()

	flag.BoolVar(&opt.Debug, "debug", false, "debug mode")
	flag.Parse()

	if opt.Debug {
		log.SetLogLevel(log.LogLevelDebug)
	}

	app := controller.NewApp(ctx)

	if err := wails.Run(&options.App{
		Title:  "nf-disk",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 223, G: 223, B: 223, A: 1},
		OnStartup:        app.Startup,
		Bind: []interface{}{
			app,
		},
	}); err != nil {
		log.Fatal("wails run err: %s", err.Error())
	}
}

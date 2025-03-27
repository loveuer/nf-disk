package controller

import (
	"github.com/loveuer/nf-disk/internal/model"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) Emit(event model.EmitEvent, data any) {
	runtime.EventsEmit(a.ctx, string(event), data)
}
